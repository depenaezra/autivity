import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

// services
import { logout, linkParentToLearner } from '@/src/services/auth';
import { getUserProfile } from '@/src/services/profile';
import { getLinkedStudentForParent } from '@/src/services/students';
import { supabase } from "@/src/lib/supabase";

// components
import { ProfileHeader } from './profile-header';
import { ProfileMenuSection } from './profile-menu-section';
import { ProfileActions } from './profile-actions';

export default function ProfileScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  // [ADDED] State to hold the fetched profile data
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [studentCount, setStudentCount] = useState(0);
  const [classCount, setClassCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [university, setUniversity] = useState("");
  // Parent-only state: the child linked via learner code, and re-link controls
  const [linkedStudent, setLinkedStudent] = useState<any>(null);
  const [relinkCode, setRelinkCode] = useState("");
  const [isLinking, setIsLinking] = useState(false);

  // [ADDED] Fetch the profile data as soon as the screen loads
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setProfile(data);
        setFirstName(data?.first_name || "");
        setLastName(data?.last_name || "");
        setUniversity(data?.university || "");
        setEmail(data?.email || "");
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          if (data?.role === 'parent') {
            // Parents don't have classes/students of their own — fetch the child
            // they're linked to instead.
            try {
              const linked = await getLinkedStudentForParent();
              setLinkedStudent(linked);
            } catch {
              setLinkedStudent(null);
            }
          } else {
            // Count students
            const { count: students } = await supabase
              .from("students")
              .select("*", {
                count: "exact",
                head: true,
              })
              .eq("teacher_id", user.id);

            setStudentCount(students ?? 0);

            // Count classes
            const { count: classes } = await supabase
              .from("classes")
              .select("*", {
                count: "exact",
                head: true,
              })
              .eq("teacher_id", user.id);

            setClassCount(classes ?? 0);
          }
        }
      } catch (error: any) {
        Alert.alert("Error loading profile", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to permanently delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: confirmDeleteAccount,
        },
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert("Error", "User not found.");
        return;
      }

      // Delete profile record
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);

      if (error) throw error;

      // Logout
      await supabase.auth.signOut();

      router.dismissAll();
      router.replace("/(auth)");

      Alert.alert(
        "Success",
        "Your account has been deleted."
      );

    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          email: email,
          university: university,
        })
        .eq("id", user.id);

      if (error) throw error;

      setProfile({
        ...profile,
        first_name: firstName,
        last_name: lastName,
        email: email,
        university: university,
      });

      setIsEditing(false);

      Alert.alert("Success", "Profile updated.");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();

      router.replace("/(auth)/login");
    } catch (error: any) {
      Alert.alert("Logout Failed", error.message);
    }
  };

  const handleResetPassword = async () => {
    try {
      if (!profile?.email) {
        Alert.alert("Error", "No email found.");
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(
        profile.email
      );

      if (error) throw error;

      Alert.alert(
        "Success",
        "A password reset link has been sent to your email."
      );
    } catch (error: any) {
      Alert.alert("Reset Password Failed", error.message);
    }
  };

  const handleLinkCode = async () => {
    if (!relinkCode.trim()) {
      Alert.alert("Missing code", "Please enter a learner code.");
      return;
    }
    setIsLinking(true);
    try {
      const result = await linkParentToLearner(relinkCode.trim());
      if (!result.success) {
        Alert.alert("Could not link", result.message || "Please check the code and try again.");
        return;
      }
      const linked = await getLinkedStudentForParent();
      setLinkedStudent(linked);
      setRelinkCode("");
      Alert.alert("Linked!", "Your dashboard is now linked to your child's profile.");
    } catch (error: any) {
      Alert.alert("Error linking code", error.message);
    } finally {
      setIsLinking(false);
    }
  };

  // [ADDED] Show a loading spinner while fetching data
  if (loading) {
    return (
      <View className="flex-1 bg-[#F5F8FA] items-center justify-center">
        <ActivityIndicator size="large" color="#62A9E6" />
      </View>
    );
  }

  // PARENT VIEW — parents don't manage classes/students, so they get a
  // simpler profile: their own info + whichever child they're linked to.
  if (profile?.role === 'parent') {
    return (
      <SafeAreaView className="flex-1 bg-[#F5F8FA]" edges={['top', 'left', 'right']}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: isTablet ? 80 : 60, paddingTop: isTablet ? 32 : 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View className={isTablet ? 'px-12' : 'px-6'}>
            <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-4xl mb-6' : 'text-2xl mb-4'}`}>
              My Profile
            </Text>

            {/* Account info */}
            <View className="bg-white rounded-[20px] shadow-sm border border-[#F3F4F6] p-5 mb-6">
              <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-2xl' : 'text-lg'}`}>
                {firstName} {lastName}
              </Text>
              <Text className={`font-quicksand-medium text-[#9CA3AF] mt-1 ${isTablet ? 'text-lg' : 'text-sm'}`}>
                {email}
              </Text>
              <View className="bg-[#EBF5FF] self-start rounded-full px-3 py-1 mt-3">
                <Text className="font-quicksand-bold text-[#62A9E6] text-xs">PARENT ACCOUNT</Text>
              </View>
            </View>

            {/* Linked child */}
            <Text className={`text-[#6B7280] font-quicksand-semibold tracking-widest mb-3 ${isTablet ? 'text-base' : 'text-sm'}`}>
              LINKED CHILD
            </Text>

            {linkedStudent ? (
              <View className="bg-white rounded-[20px] shadow-sm border border-[#F3F4F6] p-5 mb-6">
                <View className="flex-row items-center gap-3 mb-2">
                  <View className="w-12 h-12 rounded-full bg-[#EBF5FF] items-center justify-center border border-[#9ACBF9]">
                    <Text style={{ fontSize: 22 }}>{linkedStudent.avatar || '🙂'}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-xl' : 'text-base'}`}>
                      {linkedStudent.name}
                    </Text>
                    <Text className={`font-quicksand-medium text-[#9CA3AF] ${isTablet ? 'text-base' : 'text-xs'}`}>
                      Learner Code: {linkedStudent.learner_code}
                    </Text>
                  </View>
                </View>
                {linkedStudent.spectrum_level ? (
                  <Text className="font-quicksand-medium text-[#6B7280] text-xs mt-1">
                    Spectrum Level: <Text className="font-quicksand-bold text-[#4B5563]">{linkedStudent.spectrum_level}</Text>
                  </Text>
                ) : null}
                {linkedStudent.bio ? (
                  <Text className="font-quicksand-medium text-[#9CA3AF] text-xs mt-2 leading-5">
                    {linkedStudent.bio}
                  </Text>
                ) : null}
                <View className="bg-[#DCFCE7] border border-[#86EFAC] rounded-full px-3 py-1 self-start mt-3">
                  <Text className="text-[#15803D] font-quicksand-bold text-xs">Linked</Text>
                </View>
              </View>
            ) : (
              <View className="bg-white rounded-[20px] shadow-sm border border-[#F3F4F6] p-5 mb-6">
                <Text className={`font-quicksand-medium text-[#9CA3AF] mb-3 ${isTablet ? 'text-base' : 'text-sm'}`}>
                  You're not linked to a child yet. Enter the learner code your child's teacher gave you.
                </Text>
                <TextInput
                  value={relinkCode}
                  onChangeText={(t) => setRelinkCode(t.toUpperCase())}
                  placeholder="e.g. AUT-0001"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="characters"
                  className="bg-[#F5F8FA] rounded-xl px-4 py-3 font-quicksand-medium text-[#4B5563] mb-3"
                />
                <Pressable
                  onPress={handleLinkCode}
                  disabled={isLinking}
                  className={`py-3 rounded-xl items-center ${isLinking ? 'bg-[#E5E7EB]' : 'bg-[#62A9E6]'}`}
                >
                  {isLinking ? <ActivityIndicator color="white" /> : (
                    <Text className="text-white font-quicksand-bold">Link Code</Text>
                  )}
                </Pressable>
              </View>
            )}

            <Pressable
              onPress={handleLogout}
              className="w-full bg-white border border-[#FCA5A5] rounded-full items-center justify-center py-4 mb-6"
            >
              <Text className="text-[#DC2626] font-fredoka-regular text-lg">Log Out</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView className="flex-1 bg-[#F5F8FA]" edges={['top', 'left', 'right']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: isTablet ? 80 : 60, paddingTop: isTablet ? 24 : 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* MAIN CONTENT WRAPPER */}
        <View className={isTablet ? 'px-12' : 'px-6'}>
          {/* PROFILE HEADER COMPONENT */}
          <ProfileHeader
            name={`${firstName} ${lastName}`.trim() || 'Teacher'}
            email={email}
            isEditing={isEditing}
            onEditPress={() => setIsEditing(!isEditing)}
            onCameraPress={() => Alert.alert('Upload Photo', 'Photo upload feature coming soon.')}
            isTablet={isTablet}
          />

          {/* MENU SECTION (matching reference photo list style) */}
          <ProfileMenuSection
            isTablet={isTablet}
            firstName={firstName}
            lastName={lastName}
            email={email}
            university={university}
            isEditing={isEditing}
            setFirstName={setFirstName}
            setLastName={setLastName}
            setEmail={setEmail}
            setUniversity={setUniversity}
            onSaveProfile={handleSaveProfile}
            onCancelEdit={() => {
              setFirstName(profile?.first_name || '');
              setLastName(profile?.last_name || '');
              setEmail(profile?.email || '');
              setUniversity(profile?.university || '');
              setIsEditing(false);
            }}
            goals={profile?.goals}
            studentCount={studentCount}
            classCount={classCount}
            onChangePassword={() => router.push('/change-password')}
          />

          {/* RED ACTION BUTTONS (LOG OUT & DELETE ACCOUNT) */}
          <ProfileActions
            isTablet={isTablet}
            onLogout={handleLogout}
            onDeleteAccount={handleDeleteAccount}
          />

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
