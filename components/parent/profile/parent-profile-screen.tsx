import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/src/lib/supabase';
import { linkParentToLearner, logout } from '@/src/services/auth';
import { getUserProfile } from '@/src/services/profile';
import { getLinkedStudentForParent } from '@/src/services/students';

import { ParentProfileActions } from './profile-actions';
import { ParentProfileHeader } from './profile-header';
import { ParentProfileMenuSection } from './profile-menu-section';
import { ParentProfileSkeleton } from './parent-profile-skeleton';

export function ParentProfileScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [focusKey, setFocusKey] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  // Parent-only learner link state
  const [linkedStudent, setLinkedStudent] = useState<any>(null);
  const [relinkCode, setRelinkCode] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setFocusKey((prev) => prev + 1);
    }, [])
  );

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getUserProfile().catch(() => null);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const metaFirstName =
        user?.user_metadata?.first_name ||
        (user?.user_metadata?.name ? user.user_metadata.name.split(' ')[0] : '') ||
        (user?.user_metadata?.full_name ? user.user_metadata.full_name.split(' ')[0] : '');

      const metaLastName =
        user?.user_metadata?.last_name ||
        (user?.user_metadata?.full_name ? user.user_metadata.full_name.split(' ').slice(1).join(' ') : '');

      const resolvedFirstName = data?.first_name || metaFirstName || '';
      const resolvedLastName = data?.last_name || metaLastName || '';
      const resolvedEmail = data?.email || user?.email || '';

      setProfile({
        ...data,
        first_name: resolvedFirstName,
        last_name: resolvedLastName,
        email: resolvedEmail,
      });
      setFirstName(resolvedFirstName);
      setLastName(resolvedLastName);
      setEmail(resolvedEmail);

      // Fetch linked student
      try {
        const linked = await getLinkedStudentForParent();
        setLinkedStudent(linked);
      } catch {
        setLinkedStudent(null);
      }
    } catch (error: any) {
      Alert.alert('Error loading profile', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile({
        ...profile,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
      });

      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err: any) {
      Alert.alert('Update failed', err.message);
    }
  };

  const handleCancelEdit = () => {
    setFirstName(profile?.first_name || '');
    setLastName(profile?.last_name || '');
    setEmail(profile?.email || '');
    setIsEditing(false);
  };

  const handleLinkChild = async () => {
    if (!relinkCode.trim()) return;
    setIsLinking(true);
    try {
      await linkParentToLearner(relinkCode.trim());
      Alert.alert('Success', 'Successfully linked to learner!');
      setRelinkCode('');
      fetchProfile();
    } catch (err: any) {
      Alert.alert('Linking Error', err.message || 'Failed to link learner code.');
    } finally {
      setIsLinking(false);
    }
  };

  const handleChangePassword = () => {
    Alert.prompt(
      'Change Password',
      'Enter your new password:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async (newPassword?: string) => {
            if (!newPassword || newPassword.length < 6) {
              Alert.alert('Error', 'Password must be at least 6 characters.');
              return;
            }
            try {
              const { error } = await supabase.auth.updateUser({ password: newPassword });
              if (error) throw error;
              Alert.alert('Success', 'Password updated successfully!');
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ],
      'secure-text'
    );
  };

  const handleLogout = async () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login' as any);
        },
      },
    ]);
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const {
                data: { user },
              } = await supabase.auth.getUser();
              if (user) {
                await supabase.from('profiles').delete().eq('id', user.id);
                await supabase.auth.signOut();
                router.replace('/(auth)/login' as any);
              }
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <ParentProfileSkeleton />;
  }

  const fullName = `${firstName} ${lastName}`.trim() || profile?.name || 'Parent Profile';

  return (
    <SafeAreaView className="flex-1 bg-[#F5F8FA]" edges={['top']}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: isTablet ? 32 : 16,
          paddingTop: isTablet ? 24 : 16,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* PROFILE HEADER */}
        <Animated.View key={`header-${focusKey}`} entering={FadeInRight.delay(50).duration(300)}>
          <ParentProfileHeader
            name={fullName}
            email={email}
            avatarUrl={profile?.avatar_url}
            isEditing={isEditing}
            onEditPress={() => setIsEditing(!isEditing)}
            onCameraPress={() => Alert.alert('Avatar Update', 'Feature coming soon!')}
            isTablet={isTablet}
          />
        </Animated.View>

        {/* PROFILE MENU SECTIONS */}
        <Animated.View key={`menu-${focusKey}`} entering={FadeInRight.delay(100).duration(300)}>
          <ParentProfileMenuSection
            isTablet={isTablet}
            firstName={firstName}
            lastName={lastName}
            email={email}
            isEditing={isEditing}
            setFirstName={setFirstName}
            setLastName={setLastName}
            setEmail={setEmail}
            onSaveProfile={handleSaveProfile}
            onCancelEdit={handleCancelEdit}
            linkedStudent={linkedStudent}
            relinkCode={relinkCode}
            setRelinkCode={setRelinkCode}
            isLinking={isLinking}
            onLinkChild={handleLinkChild}
            onChangePassword={handleChangePassword}
          />
        </Animated.View>

        {/* LOGOUT & DELETE ACTIONS */}
        <Animated.View key={`actions-${focusKey}`} entering={FadeInRight.delay(150).duration(300)}>
          <ParentProfileActions
            isTablet={isTablet}
            onLogout={handleLogout}
            onDeleteAccount={handleDeleteAccount}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default ParentProfileScreen;
