import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ImageBackground, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const MOCK_CLASSES = {
    '1a': {
      id: '1a',
      name: 'Class 1A',
      level: 'Level 1',
      themeColor: '#4ADE80',       // Main Green
      darkThemeColor: '#059669',   // Darker Green for icons
      lightThemeColor: '#D1FAE5',  // Very light Green for icon backgrounds
      students: ['Monna', 'Kevin', 'Emman', 'Lisa'],
      activity: {
        title: 'Pre-Writing Activities',
        description: 'Interactive pre-writing activities to build confidence and writing readiness.',
        icon: 'pencil' as const,
      }
    },
    '2b': {
      id: '2b',
      name: 'Class 2B',
      level: 'Level 2',
      themeColor: '#A78BFA',       // Main Purple
      darkThemeColor: '#7C3AED',   // Darker Purple for icons
      lightThemeColor: '#EDE9FE',  // Very light Purple for icon backgrounds
      students: ['Alex', 'Sarah', 'John'],
      activity: {
        title: 'Letter Tracing',
        description: 'Practice tracing uppercase and lowercase letters with guided strokes.',
        icon: 'text' as const,
      }
    }
  };

export default function ClassScreen() {
    const router = useRouter();
    
    // Grab EVERYTHING being passed to the route
    const params = useLocalSearchParams();
  
    // Extract the ID safely (change 'classId' to 'id' here if your file is named [id].tsx)
    const rawId = params.classId || params.id; 
    
    // Ensure it's a string (fixes the array bug if Expo Router gets confused)
    const safeId = Array.isArray(rawId) ? rawId[0] : rawId;

    // Fetch the specific class data using our safe string
    const classData = MOCK_CLASSES[safeId as keyof typeof MOCK_CLASSES] || MOCK_CLASSES['1a'];

    const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  
    return (
      <View className="flex-1 bg-[#F9FAFB]">
        {/* HEADER SECTION */}
        <ImageBackground 
          source={require('../../assets/images/class-screen-frog.png')} 
          className="w-full h-[250px] justify-between"
          resizeMode="cover"
        >
          <SafeAreaView className="flex-1 px-8 pt-4">
            <Pressable 
              // Changed to router.back() to pop the stack naturally
              onPress={() => router.back()}
              className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-sm"
            >
              <Ionicons name="arrow-back" size={24} color="#4B5563" />
            </Pressable>
  
            <View className="mt-4">
              <View className="bg-white/50 self-start px-3 py-1 rounded-md border border-white mb-3">
                <Text className="text-[#6B7280] font-bold text-xs uppercase tracking-widest">{classData.level}</Text>
              </View>
              <Text className="text-4xl font-extrabold text-[#4B5563]">{classData.name}</Text>
              <View className="flex-row items-center gap-2 mt-3">
                <Ionicons name="school" size={16} color="#6B7280" />
                <Text className="text-[#6B7280] font-medium">{classData.students.length} students</Text>
              </View>
            </View>
          </SafeAreaView>
        </ImageBackground>
  
        {/* CURRENT ACTIVITY SECTION */}
        <View className="px-8 mt-8">
          <Text className="text-2xl font-extrabold text-[#4B5563] mb-4">Current Activity</Text>
          <View className="w-full bg-white p-5 rounded-[20px] border-[2px] border-[#E5E7EB] flex-row items-center">
            {/* Dynamic background color */}
            <View 
              className="w-14 h-14 rounded-full items-center justify-center mr-4"
              style={{ backgroundColor: classData.lightThemeColor }}
            >
              {/* Dynamic icon and icon color */}
              <Ionicons name={classData.activity.icon} size={24} color={classData.darkThemeColor} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-[#4B5563]">{classData.activity.title}</Text>
              <Text className="text-sm text-[#9CA3AF] mt-1 leading-5">{classData.activity.description}</Text>
            </View>
          </View>
        </View>
  
        {/* STUDENT GRID SECTION */}
        <View className="px-8 mt-10">
          <View className="flex-row flex-wrap justify-center gap-x-8 gap-y-6">
            {/* Dynamic mapping of students */}
            {classData.students.map((name) => {
              const isSelected = selectedStudent === name;
              return (
                <Pressable 
                  key={name} 
                  className="items-center w-[40%]"
                  onPress={() => setSelectedStudent(isSelected ? null : name)}
                >
                  <View 
                    className={`w-28 h-28 rounded-full bg-white border-2 items-center justify-center shadow-sm ${
                      isSelected ? '' : 'border-[#E5E7EB]'
                    }`}
                    // Inline style used here because Tailwind arbitrary colors (e.g. border-[${color}]) don't always compile dynamically in React Native
                    style={isSelected ? { borderColor: classData.themeColor } : {}}
                  >
                    <Ionicons name="person" size={48} color={isSelected ? classData.themeColor : '#D1D5DB'} />
                  </View>
                  <Text 
                    className="mt-3 text-lg font-bold"
                    style={{ color: isSelected ? classData.themeColor : '#4B5563' }}
                  >
                    {name}
                  </Text>
                </Pressable>
              );
            })}
  
            <Pressable className="items-center w-[40%]">
              <View className="w-28 h-28 rounded-full bg-[#E5E7EB] border-2 border-dashed border-[#9CA3AF] items-center justify-center">
                <Ionicons name="add" size={48} color="#6B7280" />
              </View>
              <Text className="mt-3 text-lg font-bold text-[#6B7280]">Add Student</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }