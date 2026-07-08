import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ImageBackground, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const MOCK_CLASSES = {
  '1a': {
    id: '1a',
    name: 'Class 1A',
    level: 'Level 1',
    themeColor: '#4ADE80',       // main color
    darkThemeColor: '#059669',   // icons: darker green
    lightThemeColor: '#D1FAE5',  // icon backgrounds: light green
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
    themeColor: '#A78BFA',       // main color
    darkThemeColor: '#7C3AED',   // icons: darker purple
    lightThemeColor: '#EDE9FE',  // icon backgrounds: light purple
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

  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams();
  const rawId = params.classId || params.id;

  const safeId = Array.isArray(rawId) ? rawId[0] : rawId;

  const classData = MOCK_CLASSES[safeId as keyof typeof MOCK_CLASSES] || MOCK_CLASSES['1a'];

  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  return (
    <View className="flex-1 bg-[#F9FAFB]">

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* HEADER SECTION */}
        <ImageBackground
          source={require('../../assets/images/class-screen-frog.png')}
          className={`w-full ${isTablet ? 'h-[320px]' : 'h-[240px]'}`}
          resizeMode="cover"
        >
          <View
            className={`flex-1 justify-between ${isTablet ? 'px-12 pb-8' : 'px-6 pb-6'}`}
            style={{ paddingTop: insets.top + (isTablet ? 24 : 16) }}
          >
            <Pressable
              onPress={() => router.back()}
              className="mb-auto self-start p-2 -ml-2"
            >
              <Ionicons name="arrow-back" size={isTablet ? 32 : 28} color="#4B5563" />
            </Pressable>

            {/* Title, Level, and Student Count Container */}
            <View>
              <View className="bg-white/50 self-start px-3 py-1 rounded-md border border-white mb-2">
                <Text className={`text-[#16A34A] font-bold uppercase tracking-widest ${isTablet ? 'text-sm' : 'text-xs'}`}>
                  {classData.level}
                </Text>
              </View>
              <Text className={`font-extrabold text-[#4B5563] ${isTablet ? 'text-5xl' : 'text-4xl'}`}>
                {classData.name}
              </Text>
              <View className="flex-row items-center gap-2 mt-2">
                <Ionicons name="school" size={isTablet ? 18 : 14} color="#6B7280" />
                <Text className={`text-[#6B7280] font-medium ${isTablet ? 'text-lg' : 'text-sm'}`}>
                  {classData.students.length} students
                </Text>
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* CURRENT ACTIVITY SECTION */}
        <View className={isTablet ? 'px-12 mt-10' : 'px-6 mt-8'}>
          <Text className={`font-extrabold text-[#4B5563] ${isTablet ? 'text-2xl mb-4' : 'text-xl mb-3'}`}>
            Current Activity
          </Text>
          <View className={`w-full bg-white flex-row items-center border-[#E5E7EB] ${isTablet ? 'p-5 rounded-[20px] border-[2px]' : 'p-4 rounded-2xl border-2'
            }`}>
            <View
              className={`rounded-full items-center justify-center ${isTablet ? 'w-16 h-16 mr-6' : 'w-14 h-14 mr-4'}`}
              style={{ backgroundColor: classData.lightThemeColor }}
            >
              <Ionicons name={classData.activity.icon} size={isTablet ? 28 : 24} color={classData.darkThemeColor} />
            </View>
            <View className="flex-1">
              <Text className={`font-bold text-[#4B5563] ${isTablet ? 'text-xl' : 'text-lg'}`}>
                {classData.activity.title}
              </Text>
              <Text className={`text-[#9CA3AF] leading-5 ${isTablet ? 'text-base mt-2' : 'text-s mt-1'}`}>
                {classData.activity.description}
              </Text>
            </View>
          </View>
        </View>

        {/* STUDENT GRID SECTION */}
        <View className={isTablet ? 'px-12 mt-12 mb-10' : 'px-6 mt-8 mb-6'}>
          <View className={`flex-row flex-wrap justify-center ${isTablet ? 'gap-x-8 gap-y-10' : 'gap-x-4 gap-y-6'}`}>
            {classData.students.map((name) => {
              const isSelected = selectedStudent === name;
              return (
                <Pressable
                  key={name}
                  className={`items-center ${isTablet ? 'w-[30%]' : 'w-[45%]'}`}
                  onPress={() => setSelectedStudent(isSelected ? null : name)}
                >
                  <View
                    className={`bg-white items-center justify-center shadow-sm ${isTablet ? 'w-32 h-32 rounded-full border-[3px]' : 'w-24 h-24 rounded-full border-2'
                      } ${isSelected ? '' : 'border-[#E5E7EB]'}`}
                    style={isSelected ? { borderColor: classData.themeColor } : {}}
                  >
                    <Ionicons name="person" size={isTablet ? 56 : 40} color={isSelected ? classData.themeColor : '#D1D5DB'} />
                  </View>
                  <Text
                    className={`font-bold ${isTablet ? 'text-2xl mt-4' : 'text-xl mt-2'}`}
                    style={{ color: isSelected ? classData.themeColor : '#4B5563' }}
                  >
                    {name}
                  </Text>
                </Pressable>
              );
            })}

            {/* Add Student Button */}
            <Pressable className={`items-center ${isTablet ? 'w-[30%]' : 'w-[45%]'}`}>
              <View className={`bg-[#E5E7EB] border-dashed border-[#9CA3AF] items-center justify-center ${isTablet ? 'w-32 h-32 rounded-full border-[3px]' : 'w-24 h-24 rounded-full border-2'
                }`}>
                <Ionicons name="add" size={isTablet ? 56 : 40} color="#6B7280" />
              </View>
              <Text className={`font-bold text-[#6B7280] ${isTablet ? 'text-xl mt-4' : 'text-base mt-2'}`}>
                Add Student
              </Text>
            </Pressable>

          </View>
        </View>
      </ScrollView>

      <View
        className={`w-full bg-[#F9FAFB] pt-2 ${isTablet ? 'px-12 pb-10' : 'px-6 pb-8'}`}
        style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : (isTablet ? 40 : 24) }}
      >
        <Pressable
          className={`w-full bg-[#62A9E6] flex items-center justify-center border-b-[4px] border-[#5298D4] p-[10px] ${isTablet ? 'h-[84px] rounded-[55px]' : 'h-[60px] rounded-full'
            }`}
        >
          <Text className={`text-white font-semibold ${isTablet ? 'text-2xl' : 'text-lg'}`}>
            Start activity
          </Text>
        </Pressable>
      </View>

    </View>
  );
}