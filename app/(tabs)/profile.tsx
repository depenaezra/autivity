import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

// services
import { logout } from '../../src/services/auth';
import { getUserProfile } from '../../src/services/profile';
import { supabase } from "../../src/lib/supabase";
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

    router.dismissAll();
    router.replace("/(auth)");
    router.push("/(auth)/login");
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
  // [ADDED] Show a loading spinner while fetching data
  if (loading) {
    return (
      <View className="flex-1 bg-[#F5F8FA] items-center justify-center">
        <ActivityIndicator size="large" color="#62A9E6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F5F8FA]">
      <ScrollView
        contentContainerStyle={{ paddingBottom: isTablet ? 40 : 20 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >

        {/* HEADER IMAGE SECTION */}
        <View className={`w-full ${isTablet ? 'h-[280px]' : 'h-[200px]'}`}>
          <Image
            source={require('../../assets/images/profile-header.png')}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        {/* AVATAR & NAME SECTION */}
        <View className={`items-center px-6 ${isTablet ? '-mt-[100px]' : '-mt-[60px]'}`}>
          <View className="relative">
            {/* Avatar Image Container */}
            <View
              className={`rounded-full border-white shadow-sm overflow-hidden ${isTablet ? 'w-[140px] h-[140px] border-[6px]' : 'w-[100px] h-[100px] border-[4px]'
                }`}
            >
              {/* Profile Picture Image */}
              <Image
                source={require('../../assets/images/bear.png')}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>

            {/* Camera Icon Badge */}
            <Pressable
              className={`absolute bg-[#62A9E6] rounded-full items-center justify-center border-white ${isTablet ? 'w-10 h-10 bottom-1 right-2 border-[3.5px]' : 'w-8 h-8 bottom-0 right-0 border-[2.5px]'
                }`}
            >
              <Feather name="camera" size={isTablet ? 16 : 14} color="white" />
            </Pressable>
          </View>


        </View>

        {/* MAIN CONTENT WRAPPER */}
        <View className="px-6">

        {/* PROFILE SECTION */}
        <View className={isTablet ? "mt-8" : "mt-6"}>
        <View className="flex-row items-center justify-between mb-3">
        <Text className={`text-[#6B7280] font-quicksand-semibold tracking-widest ${
      isTablet ? "text-base" : "text-sm"
    }`}
  >
    PROFILE
  </Text>

  <Pressable
    onPress={() => setIsEditing(!isEditing)}
    className="flex-row items-center bg-[#E1F0FF] border border-[#9ACBF9] rounded-full px-3 py-2"
  >
    <Feather
      name="edit-2"
      size={isTablet ? 18 : 16}
      color="#0284C7"
    />

    <Text
      className={`text-[#0284C7] font-quicksand-bold ml-2 ${
        isTablet ? "text-base" : "text-sm"
      }`}
    >
      {isEditing ? "Done" : "Edit"}
    </Text>
  </Pressable>
</View>

            <View className={`bg-white rounded-[20px] shadow-sm border border-[#F3F4F6] ${isTablet ? 'p-6' : 'p-4'}`}>
              {/* Name Row */}
              <View className={`flex-row items-center border-b border-[#F3F4F6] ${isTablet ? 'pb-4 mb-4' : 'pb-3 mb-3'}`}>
  <Text
    className={`font-quicksand-medium text-[#4B5563] ${
      isTablet ? 'w-[120px] text-lg' : 'w-[90px] text-sm'
    }`}
  >
    Name
  </Text>

  {isEditing ? (
    <View className="flex-1">
      <TextInput
        value={firstName}
        onChangeText={setFirstName}
        placeholder="First Name"
        className="border border-gray-300 rounded-lg px-3 py-2 mb-2"
      />

      <TextInput
        value={lastName}
        onChangeText={setLastName}
        placeholder="Last Name"
        className="border border-gray-300 rounded-lg px-3 py-2"
      />
    </View>
  ) : (
    <Text
      className={`font-quicksand-medium flex-1 text-[#9CA3AF] ${
        isTablet ? 'text-lg' : 'text-sm'
      }`}
    >
      {firstName} {lastName}
    </Text>
  )}
</View>

              {/* Email Row */}
              <View className={`flex-row items-center border-b border-[#F3F4F6] ${isTablet ? 'pb-4 mb-4' : 'pb-3 mb-3'}`}>
  <Text
    className={`font-quicksand-medium text-[#4B5563] ${
      isTablet ? 'w-[120px] text-lg' : 'w-[90px] text-sm'
    }`}
  >
    Email
  </Text>

  {isEditing ? (
    <TextInput
      value={email}
      onChangeText={setEmail}
      placeholder="Email"
      keyboardType="email-address"
      autoCapitalize="none"
      className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
    />
  ) : (
    <Text
      className={`font-quicksand-medium flex-1 text-[#9CA3AF] ${
        isTablet ? 'text-lg' : 'text-sm'
      }`}
    >
      {email}
    </Text>
  )}
</View>

              {/* Password Row */}
              <View className={`flex-row items-center border-b border-[#F3F4F6] ${isTablet ? 'pb-4 mb-4' : 'pb-3 mb-3'}`}>
                <Text className={`font-quicksand-medium text-[#4B5563] ${isTablet ? 'w-[120px] text-lg' : 'w-[90px] text-sm'}`}>Password</Text>
                <Text className={`flex-1 text-[#D1D5DB] leading-none mt-1 ${isTablet ? 'text-2xl' : 'text-lg'}`}>••••••••</Text>
              </View>

              {/* University Row */}
              <View className="flex-row items-center">
  <Text
    className={`font-quicksand-medium text-[#4B5563] ${
      isTablet ? "w-[120px] text-lg" : "w-[90px] text-sm"
    }`}
  >
    University
  </Text>

  {isEditing ? (
    <TextInput
      value={university}
      onChangeText={setUniversity}
      className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
      placeholder="University"
    />
  ) : (
    <Text
      className={`font-quicksand-medium flex-1 text-[#9CA3AF] ${
        isTablet ? "text-lg" : "text-sm"
      }`}
    >
      {profile?.university || "Not set"}
    </Text>
  )}
</View>
            </View>


{isEditing && (
  <View className="flex-row justify-end mt-4 gap-3">
    <Pressable
      onPress={() => {
  setFirstName(profile?.first_name || "");
  setLastName(profile?.last_name || "");
  setEmail(profile?.email || "");
  setUniversity(profile?.university || "");
  setIsEditing(false);
}}
      className="bg-gray-300 rounded-full px-5 py-2"
    >
      <Text>Cancel</Text>
    </Pressable>

    <Pressable
      onPress={handleSaveProfile}
      className="bg-[#62A9E6] rounded-full px-5 py-2"
    >
      <Text className="text-white">Save</Text>
    </Pressable>
  </View>
)}

</View>

{/* PREFERENCES & CLASSROOM SECTION */}

          
          <View className={isTablet ? 'mt-8' : 'mt-6'}>
            <View className="flex-row items-center mb-3">
              <Text className={`text-[#6B7280] font-quicksand-semibold tracking-widest mr-2 ${isTablet ? 'text-base' : 'text-sm'}`}>PREFERENCES & CLASSROOM</Text>
              <Feather name="edit-2" size={isTablet ? 14 : 12} color="#62A9E6" />
            </View>

            <View className={`bg-white rounded-[20px] shadow-sm border border-[#F3F4F6] ${isTablet ? 'p-6' : 'p-4'}`}>
              {/* Goals Row */}
              <View className={`border-b border-[#F3F4F6] ${isTablet ? 'pb-4 mb-4' : 'pb-3 mb-3'}`}>
                <Text className={`font-quicksand-medium text-[#4B5563] ${isTablet ? 'text-lg mb-3' : 'text-sm mb-2'}`}>Goals</Text>
                <View className="flex-row flex-wrap gap-2">
                  {/* [MODIFIED] Map over the dynamic goals array */}
                  {profile?.goals && profile.goals.length > 0 ? (
                    profile.goals.map((goal: string, index: number) => (
                      <View key={index} className={`bg-[#E1F0FF] border border-[#9ACBF9] rounded-full ${isTablet ? 'px-4 py-2' : 'px-3 py-1'}`}>
                        <Text className={`text-[#0284C7] font-quicksand-bold ${isTablet ? 'text-sm' : 'text-[10px]'}`}>{goal}</Text>
                      </View>
                    ))
                  ) : (
                    <Text className={`font-quicksand-medium text-[#9CA3AF] ${isTablet ? 'text-lg' : 'text-sm'}`}>No goals selected</Text>
                  )}
                </View>
              </View>

              {/* Students Row */}
              <View className={`flex-row items-center border-b border-[#F3F4F6] ${isTablet ? 'pb-4 mb-4' : 'pb-3 mb-3'}`}>
                <Text className={`font-quicksand-medium text-[#4B5563] ${isTablet ? 'w-[120px] text-lg' : 'w-[90px] text-sm'}`}>Students</Text>
                <Text className={`font-quicksand-medium flex-1 text-[#9CA3AF] ${isTablet ? 'text-lg' : 'text-sm'}`}>{studentCount}</Text>
              </View>

              {/* Classes Row */}
              <View className="flex-row items-center">
                <Text className={`font-quicksand-medium text-[#4B5563] ${isTablet ? 'w-[120px] text-lg' : 'w-[90px] text-sm'}`}>Classes</Text>
                <Text className={`font-quicksand-medium flex-1 text-[#9CA3AF] ${isTablet ? 'text-lg' : 'text-sm'}`}>{classCount}</Text>
              </View>
            </View>
          </View>

          {/* ACCOUNT SECTION */}
          <View className={isTablet ? 'mt-8' : 'mt-6'}>
            <View className="flex-row items-center mb-3">
              <Text className={`text-[#6B7280] font-quicksand-semibold tracking-widest mr-2 ${isTablet ? 'text-base' : 'text-sm'}`}>ACCOUNT</Text>
              <Feather name="edit-2" size={isTablet ? 14 : 12} color="#62A9E6" />
            </View>

            <View className={`bg-white rounded-[20px] shadow-sm border border-[#F3F4F6] ${isTablet ? 'p-6' : 'p-4'}`}>

              {/* Reset Password Row */}
              <View className={`flex-row items-center justify-between border-b border-[#F3F4F6] ${isTablet ? 'pb-4 mb-4' : 'pb-3 mb-3'}`}>
                <Text className={`font-quicksand-medium text-[#4B5563] ${isTablet ? 'text-lg' : 'text-sm'}`}>Reset Password</Text>
                <Pressable
  onPress={() => router.push("/change-password")}
  className="flex-row items-center bg-[#E1F0FF] border border-[#9ACBF9] rounded-full px-3 py-1.5"
>
  <Feather name="lock" size={12} color="#0284C7" />
  <Text className="text-[#0284C7] font-quicksand-bold ml-1.5">
    Change Password
  </Text>
</Pressable>
              </View>

              {/* System Updates Row */}
              <View className={`flex-row items-center justify-between border-b border-[#F3F4F6] ${isTablet ? 'pb-4 mb-4' : 'pb-3 mb-3'}`}>
                <Text className={`font-quicksand-medium text-[#4B5563] ${isTablet ? 'text-lg' : 'text-sm'}`}>System Updates</Text>
                <View className={`flex-row items-center bg-[#E1F0FF] border border-[#9ACBF9] rounded-full ${isTablet ? 'px-4 py-2' : 'px-3 py-1.5'}`}>
                  <Feather name="bell" size={isTablet ? 14 : 12} color="#0284C7" />
                  <Text className={`text-[#0284C7] font-quicksand-bold ml-1.5 ${isTablet ? 'text-sm' : 'text-xs'}`}>ON</Text>
                </View>
              </View>

              {/* Privacy Policy Row */}
              <Pressable className={`flex-row items-center justify-between border-b border-[#F3F4F6] ${isTablet ? 'pb-4 mb-4' : 'pb-3 mb-3'}`}>
                <Text className={`font-quicksand-medium text-[#4B5563] ${isTablet ? 'text-lg' : 'text-sm'}`}>Privacy Policy</Text>
                <Feather name="external-link" size={isTablet ? 20 : 16} color="#62A9E6" />
              </Pressable>

              {/* Terms and Conditions Row */}
              <Pressable className="flex-row items-center justify-between pt-1">
                <View className="w-[80%]">
                  <Text className={`font-quicksand-medium text-[#4B5563] leading-5 ${isTablet ? 'text-lg' : 'text-sm'}`}>Terms and Conditions</Text>
                </View>
                <Feather name="external-link" size={isTablet ? 20 : 16} color="#62A9E6" />
              </Pressable>

            </View>
          </View>

          {/* ACTION BUTTONS */}
          <View className={`mb-8 ${isTablet ? 'mt-10 gap-y-6' : 'mt-8 gap-y-4'}`}>
            {/* [MODIFIED] Hooked up the logout service to the button */}
            <Pressable onPress={handleLogout} className={`w-full bg-[#FFE4E6] rounded-full items-center justify-center ${isTablet ? 'h-[76px]' : 'h-[55px]'}`}>
              <Text className={`text-[#E11D48] font-fredoka-regular ${isTablet ? 'text-xl' : 'text-lg'}`}>Log out</Text>
            </Pressable>

            {/* Delete Account Button */}
            <Pressable
              onPress={handleDeleteAccount}
              className={`w-full bg-[#F43F5E] rounded-full items-center justify-center ${isTablet ? 'h-[76px]' : 'h-[55px]'}`}>
              <Text className={`text-white font-fredoka-regular ${isTablet ? 'text-xl' : 'text-lg'}`}>Delete account</Text>
            </Pressable>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}