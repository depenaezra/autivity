import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

export default function ProfileScreen() {
  return (
    <View className="flex-1 bg-[#F5F8FA]">
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        bounces={false} // Prevents a white gap at the top when pulling down on iOS
      >
        
        {/* HEADER IMAGE SECTION */}
        <View className="w-full h-[280px]">
          <Image 
            source={require('../../assets/images/profile-header.png')}
            className="w-full h-full"
            resizeMode="cover" // Keeps the aspect ratio without squishing the image
          />
        </View>

        {/* AVATAR & NAME SECTION */}
        <View className="items-center -mt-[100px] px-6">
          <View className="relative">
            {/* Avatar Placeholder */}
            <View className="w-[140px] h-[140px] rounded-full bg-[#D1D5DB] border-[6px] border-white shadow-sm" />
            
            {/* Camera Icon Badge */}
            <Pressable className="absolute bottom-1 right-2 w-10 h-10 bg-[#62A9E6] rounded-full items-center justify-center border-[3.5px] border-white">
              <Feather name="camera" size={16} color="white" />
            </Pressable>
          </View>
          
          <Text className="text-4xl font-extrabold text-[#374151] mt-3">Anne Santos</Text>
        </View>

        {/* MAIN CONTENT WRAPPER */}
        <View className="px-6">
          
          {/* PROFILE SECTION */}
          <View className="mt-8">
            <View className="flex-row items-center mb-3">
              <Text className="text-[#6B7280] font-bold text-sm tracking-widest mr-2">PROFILE</Text>
              <Feather name="edit-2" size={14} color="#62A9E6" />
            </View>

            <View className="bg-white rounded-[20px] p-5 shadow-sm border border-[#F3F4F6]">
              {/* Name Row */}
              <View className="flex-row items-center border-b border-[#F3F4F6] pb-4 mb-4">
                <Text className="w-[100px] text-[#4B5563] text-base">Name</Text>
                <Text className="flex-1 text-[#9CA3AF] text-base">Anne Santos</Text>
              </View>

              {/* Email Row */}
              <View className="flex-row items-center border-b border-[#F3F4F6] pb-4 mb-4">
                <Text className="w-[100px] text-[#4B5563] text-base">Email</Text>
                <Text className="flex-1 text-[#9CA3AF] text-base">annesantos@g.batstate-u.edu.ph</Text>
              </View>

              {/* Password Row */}
              <View className="flex-row items-center border-b border-[#F3F4F6] pb-4 mb-4">
                <Text className="w-[100px] text-[#4B5563] text-base">Password</Text>
                <Text className="flex-1 text-[#D1D5DB] text-xl leading-none mt-1">••••••••</Text>
              </View>

              {/* University Row */}
              <View className="flex-row items-center">
                <Text className="w-[100px] text-[#4B5563] text-base">University</Text>
                <Text className="flex-1 text-[#9CA3AF] text-base">Batangas State University</Text>
              </View>
            </View>
          </View>

          {/* PREFERENCES & CLASSROOM SECTION */}
          <View className="mt-8">
            <View className="flex-row items-center mb-3">
              <Text className="text-[#6B7280] font-bold text-sm tracking-widest mr-2">PREFERENCES & CLASSROOM</Text>
              <Feather name="edit-2" size={14} color="#62A9E6" />
            </View>

            <View className="bg-white rounded-[20px] p-5 shadow-sm border border-[#F3F4F6]">
              {/* Goals Row */}
              <View className="border-b border-[#F3F4F6] pb-4 mb-4">
                <Text className="text-[#4B5563] text-base mb-3">Goals</Text>
                <View className="flex-row flex-wrap gap-2">
                  <View className="bg-[#DCFCE7] border border-[#86EFAC] px-3 py-1.5 rounded-full">
                    <Text className="text-[#15803D] text-xs font-semibold">Classroom-ready activities</Text>
                  </View>
                  <View className="bg-[#FEF9C3] border border-[#FDE047] px-3 py-1.5 rounded-full">
                    <Text className="text-[#A16207] text-xs font-semibold">Reports and assessments</Text>
                  </View>
                </View>
              </View>

              {/* Students Row */}
              <View className="flex-row items-center border-b border-[#F3F4F6] pb-4 mb-4">
                <Text className="w-[100px] text-[#4B5563] text-base">Students</Text>
                <Text className="flex-1 text-[#9CA3AF] text-base">10</Text>
              </View>

              {/* Classes Row */}
              <View className="flex-row items-center">
                <Text className="w-[100px] text-[#4B5563] text-base">Classes</Text>
                <Text className="flex-1 text-[#9CA3AF] text-base">3</Text>
              </View>
            </View>
          </View>

          {/* ACCOUNT SECTION */}
          <View className="mt-8">
            <View className="flex-row items-center mb-3">
              <Text className="text-[#6B7280] font-bold text-sm tracking-widest mr-2">ACCOUNT</Text>
              <Feather name="edit-2" size={14} color="#62A9E6" />
            </View>

            <View className="bg-white rounded-[20px] p-5 shadow-sm border border-[#F3F4F6]">
              
              {/* Reset Password Row */}
              <View className="flex-row items-center justify-between border-b border-[#F3F4F6] pb-4 mb-4">
                <Text className="text-[#4B5563] text-base">Reset Password</Text>
                <Pressable className="flex-row items-center bg-[#E1F0FF] border border-[#9ACBF9] px-3 py-1.5 rounded-full">
                  <Feather name="mail" size={12} color="#0284C7" />
                  <Text className="text-[#0284C7] text-xs font-bold ml-1.5">Send reset link</Text>
                </Pressable>
              </View>

              {/* System Updates Row */}
              <View className="flex-row items-center justify-between border-b border-[#F3F4F6] pb-4 mb-4">
                <Text className="text-[#4B5563] text-base">System Updates</Text>
                <View className="flex-row items-center bg-[#E1F0FF] border border-[#9ACBF9] px-3 py-1.5 rounded-full">
                  <Feather name="bell" size={12} color="#0284C7" />
                  <Text className="text-[#0284C7] text-xs font-bold ml-1.5">ON</Text>
                </View>
              </View>

              {/* Privacy Policy Row */}
              <Pressable className="flex-row items-center justify-between border-b border-[#F3F4F6] pb-4 mb-4">
                <Text className="text-[#4B5563] text-base">Privacy Policy</Text>
                <Feather name="external-link" size={18} color="#62A9E6" />
              </Pressable>

              {/* Terms and Conditions Row */}
              <Pressable className="flex-row items-center justify-between pt-1">
                <View className="w-[80%]">
                  <Text className="text-[#4B5563] text-base leading-5">Terms and Conditions</Text>
                </View>
                <Feather name="external-link" size={18} color="#62A9E6" />
              </Pressable>

            </View>
          </View>

          {/* ACTION BUTTONS */}
          <View className="mt-10 mb-8 gap-y-4">
            {/* Log out Button */}
            <Pressable className="w-full bg-[#FFE4E6] h-[55px] rounded-full items-center justify-center">
              <Text className="text-[#E11D48] text-lg font-semibold">Log out</Text>
            </Pressable>

            {/* Delete Account Button */}
            <Pressable className="w-full bg-[#F43F5E] h-[55px] rounded-full items-center justify-center">
              <Text className="text-white text-lg font-semibold">Delete account</Text>
            </Pressable>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}