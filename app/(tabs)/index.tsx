import { Feather, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TeacherHome() {
  const { firstName } = useLocalSearchParams();
  const router = useRouter();

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [activeIndex, setActiveIndex] = useState(0);

  const classesData = [
    {
      id: '1a',
      title: 'Class 1A',
      level: 'Level 1',
      people: 4,
      image: require('../../assets/images/class-frog.png'),
      themeColor: '#86EFAC',
      shadowColor: '#4ADE80',
    },
    {
      id: '2b',
      title: 'Class 2B',
      level: 'Level 2',
      people: 3,
      image: require('../../assets/images/class-hamster.png'),
      themeColor: '#FDBA74',
      shadowColor: '#FB923C',
    },
    {
      id: '3c',
      title: 'Class 1C',
      level: 'Level 3',
      people: 5,
      image: require('../../assets/images/class-penguin.png'),
      themeColor: '#FDE047',
      shadowColor: '#EAB308',
    }
  ];

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const cardScrollWidth = isTablet ? 254 : 176;
    const index = Math.round(scrollPosition / cardScrollWidth);

    if (index >= 0 && index < classesData.length) {
      setActiveIndex(index);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F8FA]">

      {/* HEADER SECTION */}
      <View className={`w-full flex-row justify-between items-center ${isTablet ? 'px-12 pt-8' : 'px-6 pt-6'}`}>
        {/* Left Side: Welcome Text & Subtitle */}
        <View className="flex-1 mr-4">
          <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-4xl mb-2' : 'text-2xl mb-1'}`}>
            Hi, Teacher {firstName || 'Guest'}!
          </Text>
          <Text className={`font-quicksand-medium text-[#9CA3AF] ${isTablet ? 'text-xl' : 'text-base'}`}>
            Manage and start activities
          </Text>
        </View>

        {/* Right Side: Avatar */}
        <View className={`rounded-full bg-[#9ACBF9] overflow-hidden items-center justify-end ${isTablet ? 'w-24 h-24' : 'w-16 h-16'}`}>
          <Image
            source={require('../../assets/images/bear.png')}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
      </View>

      {/* STATS CARDS ROW */}
      <View className={`w-full flex-row justify-between ${isTablet ? 'px-12 mt-10 gap-4' : 'px-6 mt-6 gap-2'}`}>

        {/* CARD 1: STUDENTS (Blue) */}
        <View className={`flex-1 border-[2px] border-[#A3CFF1] bg-white overflow-hidden ${isTablet ? 'rounded-[16px]' : 'rounded-xl'}`}>
          <View className={`bg-[#EBF5FF] flex-row items-center justify-center border-b-[2px] border-b-[#A3CFF1] ${isTablet ? 'py-5 gap-3' : 'py-3 gap-1'}`}>
            <Ionicons name="school-outline" size={isTablet ? 36 : 24} color="#62A9E6" />
            <Text className={`font-quicksand-semibold text-[#62A9E6] ${isTablet ? 'text-4xl' : 'text-2xl'}`}>15</Text>
          </View>
          <View className={`bg-white items-center justify-center ${isTablet ? 'py-3' : 'py-2'}`}>
            <Text className={`text-[#4B5563] font-quicksand-semibold tracking-widest ${isTablet ? 'text-sm' : 'text-[10px]'}`}>STUDENTS</Text>
          </View>
        </View>

        {/* CARD 2: LESSONS (Yellow) */}
        <View className={`flex-1 border-[2px] border-[#FDE047] bg-white overflow-hidden ${isTablet ? 'rounded-[16px]' : 'rounded-xl'}`}>
          <View className={`bg-[#FEF9C3] flex-row items-center justify-center border-b-[2px] border-b-[#FDE047] ${isTablet ? 'py-5 gap-3' : 'py-3 gap-1'}`}>
            <Ionicons name="book" size={isTablet ? 32 : 20} color="#EAB308" />
            <Text className={`font-quicksand-semibold text-[#EAB308] ${isTablet ? 'text-4xl' : 'text-2xl'}`}>8</Text>
          </View>
          <View className={`bg-white items-center justify-center ${isTablet ? 'py-3' : 'py-2'}`}>
            <Text className={`text-[#4B5563] font-quicksand-semibold tracking-widest ${isTablet ? 'text-sm' : 'text-[10px]'}`}>LESSONS</Text>
          </View>
        </View>

        {/* CARD 3: REPORTS (Red/Pink) */}
        <View className={`flex-1 border-[2px] border-[#FCA5A5] bg-white overflow-hidden ${isTablet ? 'rounded-[16px]' : 'rounded-xl'}`}>
          <View className={`bg-[#FEE2E2] flex-row items-center justify-center border-b-[2px] border-b-[#FCA5A5] ${isTablet ? 'py-5 gap-3' : 'py-3 gap-1'}`}>
            <Ionicons name="stats-chart" size={isTablet ? 32 : 20} color="#F87171" />
            <Text className={`font-quicksand-semibold text-[#F87171] ${isTablet ? 'text-4xl' : 'text-2xl'}`}>5</Text>
          </View>
          <View className={`bg-white items-center justify-center ${isTablet ? 'py-3' : 'py-2'}`}>
            <Text className={`text-[#4B5563] font-quicksand-semibold tracking-widest ${isTablet ? 'text-sm' : 'text-[10px]'}`}>REPORTS</Text>
          </View>
        </View>
      </View>

      {/* CLASSES SECTION */}
      <View className={`w-full ${isTablet ? 'mt-10' : 'mt-6'}`}>
        <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-3xl px-12 mb-6' : 'text-xl px-6 mb-4'}`}>
          Classes
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: isTablet ? 48 : 24 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {classesData.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => router.push(`/class/${item.id}` as any)}
            >
              <View
                className={`bg-white overflow-hidden border-[2px] ${isTablet ? 'w-[230px] h-[190px] mr-6 rounded-[24px]' : 'w-[160px] h-[150px] mr-4 rounded-2xl'
                  }`}
                style={{ borderColor: item.themeColor }}
              >
                {/* Image Section (Top half) */}
                <View
                  className="w-full h-[55%] border-b-[2px]"
                  style={{ borderBottomColor: item.themeColor }}
                >
                  <Image
                    source={item.image}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>

                {/* Info Section (Bottom half) */}
                <View className="flex-1 px-4 py-3 justify-between bg-white">
                  <View className="flex-row justify-between items-center">
                    <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-2xl' : 'text-lg'}`}>
                      {item.title}
                    </Text>

                    <View
                      className="border rounded-md px-2 py-0.5"
                      style={{
                        borderColor: item.themeColor,
                        backgroundColor: `${item.themeColor}33`
                      }}
                    >
                      <Text className={`font-quicksand-bold ${isTablet ? 'text-xs' : 'text-[10px]'}`} style={{ color: item.themeColor }}>
                        {item.level}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center mt-1">
                    <View className="flex-row">
                      <View className={`rounded-full border border-white ${isTablet ? 'w-5 h-5' : 'w-4 h-4'}`} style={{ backgroundColor: item.themeColor, opacity: 0.5 }} />
                      <View className={`rounded-full border border-white ${isTablet ? 'w-5 h-5 -ml-2' : 'w-4 h-4 -ml-1'}`} style={{ backgroundColor: item.themeColor, opacity: 0.8 }} />
                    </View>
                    <Text className={`font-quicksand-medium ${isTablet ? 'text-sm ml-2' : 'text-xs ml-1'}`} style={{ color: item.themeColor }}>
                      {item.people} people
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* LESSONS SECTION */}
      <View className={`w-full ${isTablet ? 'px-12 mt-10 mb-10' : 'px-6 mt-6 mb-6'}`}>
        <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-3xl mb-6' : 'text-xl mb-4'}`}>
          Lessons
        </Text>

        {/* Lesson Card */}
        <View
          className={`w-full bg-white overflow-hidden ${isTablet ? 'h-[280px] rounded-[18px] border-[3px] border-[#D5D0D2] border-b-[5px]' : 'h-[200px] rounded-[14px] border-[2px] border-[#D5D0D2] border-b-[4px]'
            }`}
        >
          {/* Top Image Container */}
          <View className="w-full h-[65%]">
            <Image
              source={require('../../assets/images/lesson-header.png')}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>

          {/* Bottom Text Container */}
          <View className="flex-1 px-6 justify-center">
            <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-3xl' : 'text-xl'}`}>
              Lesson Materials
            </Text>
            <View className={`flex-row items-center gap-2 ${isTablet ? 'mt-2' : 'mt-1'}`}>
              <Feather name="file-text" size={isTablet ? 18 : 14} color="#9CA3AF" />
              <Text className={`text-[#9CA3AF] font-quicksand-medium ${isTablet ? 'text-lg' : 'text-sm'}`}>
                5 lessons
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}