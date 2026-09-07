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
 * Create a new notification.
 * If userId is not provided, it looks up student.parent_id using studentId.
 */
export const createNotification = async (params: {
  userId?: string;
  studentId?: string;
  title: string;
  message: string;
  type: 'feedback' | 'activity' | 'achievement' | 'milestone' | 'announcement' | 'alert' | 'general';
  metadata?: any;
}) => {
  try {
    let targetUserId = params.userId;

    // If userId not explicitly provided, look up parent_id from student record
    if (!targetUserId && params.studentId) {
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('parent_id')
        .eq('id', params.studentId)
        .maybeSingle();

      if (studentError) {
        console.error('[NOTIFICATIONS] Error fetching student parent_id:', studentError.message);
      }

      if (student?.parent_id) {
        targetUserId = student.parent_id;
      }
    }

    if (!targetUserId) {
      console.warn(
        `[NOTIFICATIONS] Cannot send notification for student (${params.studentId || 'unknown'}): No parent is linked to this student (parent_id is null). Please link a parent using learner code.`
      );
      return null;
    }

    const { error } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: targetUserId,
          student_id: params.studentId || null,
          title: params.title,
          message: params.message,
          type: params.type,
          metadata: params.metadata || {},
        },
      ]);

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
