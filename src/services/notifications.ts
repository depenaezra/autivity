import { supabase } from '../lib/supabase';

export interface DBNotification {
  id: string;
  user_id: string;
  student_id?: string | null;
  title: string;
  message: string;
  type: 'feedback' | 'activity' | 'achievement' | 'milestone' | 'announcement' | 'alert' | 'general';
  is_read: boolean;
  metadata?: any;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type?: 'feedback' | 'activity' | 'achievement' | 'milestone' | 'announcement' | 'alert' | 'general';
  studentId?: string;
  metadata?: any;
}

/**
 * Format ISO timestamp into human-readable relative time string
 */
export const formatRelativeTime = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  } catch {
    return 'Recently';
  }
};

/**
 * Create one or more notifications in the database.
 * If userId is not provided, it resolves parent_id and/or teacher_id using studentId and targetRole.
 */
export const createNotification = async (params: {
  userId?: string;
  studentId?: string;
  targetRole?: 'parent' | 'teacher' | 'both';
  title: string;
  message: string;
  type: 'feedback' | 'activity' | 'achievement' | 'milestone' | 'announcement' | 'alert' | 'general';
  metadata?: any;
}) => {
  try {
    const targetUserIds: string[] = [];

    if (params.userId) {
      targetUserIds.push(params.userId);
    } else if (params.studentId) {
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('parent_id, teacher_id')
        .eq('id', params.studentId)
        .maybeSingle();

      if (studentError) {
        console.error('[NOTIFICATIONS] Error fetching student info:', studentError.message);
      }

      const role = params.targetRole || 'parent';
      if ((role === 'parent' || role === 'both') && student?.parent_id) {
        targetUserIds.push(student.parent_id);
      }
      if ((role === 'teacher' || role === 'both') && student?.teacher_id) {
        targetUserIds.push(student.teacher_id);
      }
    }

    if (targetUserIds.length === 0) {
      console.warn(
        `[NOTIFICATIONS] Cannot send notification for student (${params.studentId || 'unknown'}): No target user found for role ${params.targetRole || 'parent'}.`
      );
      return null;
    }

    const rows = targetUserIds.map((uid) => ({
      user_id: uid,
      student_id: params.studentId || null,
      title: params.title,
      message: params.message,
      type: params.type,
      metadata: params.metadata || {},
    }));

    const { error } = await supabase.from('notifications').insert(rows);

    if (error) {
      console.error('[NOTIFICATIONS] Supabase insert error:', error.message, error);
      return null;
    }

    return true;
  } catch (err: any) {
    console.error('[NOTIFICATIONS] Exception creating notification:', err?.message || err);
    return null;
  }
};

/**
 * Check and sync upcoming or overdue milestone deadline notifications for a teacher.
 */
export const syncMilestoneDeadlinesForTeacher = async (teacherId: string) => {
  try {
    // 1. Fetch all students belonging to this teacher
    const { data: students, error: stError } = await supabase
      .from('students')
      .select('id, name')
      .eq('teacher_id', teacherId);

    if (stError || !students || students.length === 0) return;

    const studentMap = new Map(students.map((s) => [s.id, s.name]));
    const studentIds = students.map((s) => s.id);

    // 2. Fetch active milestones with a target date
    const { data: milestones, error: msError } = await supabase
      .from('student_milestones')
      .select('id, student_id, title, status, target_date')
      .in('student_id', studentIds)
      .neq('status', 'Achieved')
      .not('target_date', 'is', null);

    if (msError || !milestones || milestones.length === 0) return;

    // 3. Check existing milestone notifications to prevent duplicates
    const { data: existingNotifs } = await supabase
      .from('notifications')
      .select('metadata')
      .eq('user_id', teacherId)
      .eq('type', 'milestone');

    const notifiedMilestoneIds = new Set<string>();
    for (const notif of existingNotifs || []) {
      const meta = typeof notif.metadata === 'string'
        ? (() => { try { return JSON.parse(notif.metadata); } catch { return {}; } })()
        : (notif.metadata || {});
      if (meta?.milestone_id) {
        notifiedMilestoneIds.add(meta.milestone_id);
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const ms of milestones) {
      if (!ms.target_date || notifiedMilestoneIds.has(ms.id)) continue;

      const targetDate = new Date(ms.target_date);
      targetDate.setHours(0, 0, 0, 0);

      const diffTime = targetDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Trigger if due in <= 3 days or overdue within 7 days
      if (diffDays <= 3 && diffDays >= -7) {
        const studentName = studentMap.get(ms.student_id) || 'Student';
        const formattedDate = targetDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });

        const isOverdue = diffDays < 0;
        const title = isOverdue ? 'Milestone Overdue ⚠️' : 'Milestone Due Soon 🎯';
        const dueText = isOverdue
          ? `was due on ${formattedDate}`
          : diffDays === 0
          ? `is due today (${formattedDate})`
          : `is due in ${diffDays} day${diffDays > 1 ? 's' : ''} (${formattedDate})`;

        const message = `Milestone "${ms.title}" for ${studentName} ${dueText}.`;

        await createNotification({
          userId: teacherId,
          studentId: ms.student_id,
          title,
          message,
          type: 'milestone',
          metadata: {
            milestone_id: ms.id,
            student_id: ms.student_id,
            target_date: ms.target_date,
            status: ms.status,
          },
        });
      }
    }
  } catch (err) {
    console.error('[NOTIFICATIONS] Error syncing milestone deadlines for teacher:', err);
  }
};

/**
 * Get all notifications for the logged in user or a specified user_id.
 */
export const getNotificationsForUser = async (userId?: string): Promise<NotificationItem[]> => {
  try {
    let resolvedUserId = userId;

    if (!resolvedUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      resolvedUserId = user.id;
    }

    if (resolvedUserId) {
      // Best-effort background check for teacher milestone deadlines
      syncMilestoneDeadlinesForTeacher(resolvedUserId).catch(() => {});
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', resolvedUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[NOTIFICATIONS] Error fetching notifications:', error.message);
      return [];
    }

    // Deduplicate feedback notifications for the same session_id, keeping only the latest one
    const seenSessionIds = new Set<string>();
    const obsoleteNotifIds: string[] = [];
    const filteredData: DBNotification[] = [];

    for (const item of data || []) {
      const meta = typeof item.metadata === 'string'
        ? (() => { try { return JSON.parse(item.metadata); } catch { return {}; } })()
        : (item.metadata || {});

      const sessionId = meta?.session_id;

      if (item.type === 'feedback' && sessionId) {
        if (seenSessionIds.has(sessionId)) {
          // This is an older superseded feedback notification for the same session
          obsoleteNotifIds.push(item.id);
          continue;
        }
        seenSessionIds.add(sessionId);
      }

      filteredData.push(item);
    }

    // Clean up obsolete superseded notification rows in the background
    if (obsoleteNotifIds.length > 0) {
      supabase
        .from('notifications')
        .delete()
        .in('id', obsoleteNotifIds)
        .then(({ error: delErr }) => {
          if (delErr) {
            console.warn('[NOTIFICATIONS] Minor warning cleaning obsolete notifications:', delErr.message);
          }
        });
    }

    return filteredData.map((item: DBNotification) => ({
      id: item.id,
      title: item.title,
      message: item.message,
      timestamp: formatRelativeTime(item.created_at),
      isRead: item.is_read,
      type: item.type,
      studentId: item.student_id || undefined,
      metadata: item.metadata,
    }));
  } catch (err: any) {
    console.error('[NOTIFICATIONS] Exception fetching notifications:', err?.message || err);
    return [];
  }
};

/**
 * Get count of unread notifications for logged in user.
 */
export const getUnreadNotificationCount = async (userId?: string): Promise<number> => {
  try {
    let resolvedUserId = userId;

    if (!resolvedUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;
      resolvedUserId = user.id;
    }

    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', resolvedUserId)
      .eq('is_read', false);

    if (error) {
      console.error('[NOTIFICATIONS] Error fetching unread count:', error.message);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error('[NOTIFICATIONS] Exception fetching unread count:', err);
    return 0;
  }
};

/**
 * Mark a single notification as read.
 */
export const markNotificationRead = async (notificationId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('[NOTIFICATIONS] Error marking notification read:', error.message);
  }
};

/**
 * Mark a single notification as unread.
 */
export const markNotificationUnread = async (notificationId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: false })
    .eq('id', notificationId);

  if (error) {
    console.error('[NOTIFICATIONS] Error marking notification unread:', error.message);
  }
};

/**
 * Delete a single notification.
 */
export const deleteNotification = async (notificationId: string) => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) {
    console.error('[NOTIFICATIONS] Error deleting notification:', error.message);
  }
};

/**
 * Clear all notifications for current user.
 */
export const clearAllNotifications = async (userId?: string) => {
  try {
    let resolvedUserId = userId;
    if (!resolvedUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      resolvedUserId = user.id;
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', resolvedUserId);

    if (error) {
      console.error('[NOTIFICATIONS] Error clearing notifications:', error.message);
    }
  } catch (err) {
    console.error('[NOTIFICATIONS] Exception clearing notifications:', err);
  }
};
