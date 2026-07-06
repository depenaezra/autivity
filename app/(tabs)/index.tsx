import { Feather, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Class1() {
  const { firstName } = useLocalSearchParams();
  const router = useRouter();

  // Track which class card is currently "focused" on the left
  const [activeIndex, setActiveIndex] = useState(0);

  // Class Data mapping
  const classesData = [
    {
      id: '1',
      title: 'Class 1A',
      level: 'Level 1',
      people: 4,
      image: require('../../assets/images/class-frog.png'),
      themeColor: '#86EFAC', // Tailwind Green
      shadowColor: '#4ADE80',
    },
    {
      id: '2',
      title: 'Class 1B',
      level: 'Level 2',
      people: 3,
      image: require('../../assets/images/class-hamster.png'),
      themeColor: '#FDBA74', // Tailwind Orange
      shadowColor: '#FB923C',
    },
    {
      id: '3',
      title: 'Class 1C',
      level: 'Level 3',
      people: 5,
      image: require('../../assets/images/class-penguin.png'),
      themeColor: '#FDE047', // Tailwind Yellow
      shadowColor: '#EAB308',
    }
  ];

  // Function to calculate which card is active based on horizontal scroll position
  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    // 250 is roughly the width of a card plus the gap between them
    const index = Math.round(scrollPosition / 250);

    // Prevent index out of bounds
    if (index >= 0 && index < classesData.length) {
      setActiveIndex(index);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F8FA]">

      {/* HEADER SECTION */}
      <View className="w-full px-12 pt-8 flex-row justify-between items-center">
        {/* Left Side: Welcome Text & Subtitle */}
        {/* flex-1 ensures the text wraps properly if the name is very long */}
        <View className="flex-1 mr-4">
          <Text className="text-4xl font-extrabold text-[#4B5563] mb-2">
            Hi, Teacher {firstName || 'Guest'}!
          </Text>
          <Text className="text-xl text-[#9CA3AF]">
            Manage and start activities
          </Text>
        </View>

        {/* Right Side: Avatar */}
        {/* Added justify-end in case the bear needs to sit perfectly flat at the bottom of the circle */}
        <View className="w-24 h-24 rounded-full bg-[#9ACBF9] overflow-hidden items-center justify-end">
          <Image
            source={require('../../assets/images/bear.png')}
            // 1. Made the image take up the entire container
            className="w-full h-full"
            // 2. Changed to 'cover' so it fills the circle entirely without white space
            resizeMode="cover"
          />
        </View>
      </View>

      {/* STATS CARDS ROW */}
      <View className="w-full px-12 mt-10 flex-row justify-between gap-4">

        {/* CARD 1: STUDENTS (Blue) */}
        <View className="flex-1 rounded-[16px] border-[2px] border-[#A3CFF1] bg-white overflow-hidden">
          {/* Top colored half */}
          <View className="bg-[#EBF5FF] flex-row items-center justify-center py-5 gap-3 border-b-[2px] border-b-[#A3CFF1]">
            <Ionicons name="school-outline" size={36} color="#62A9E6" />
            <Text className="text-4xl font-extrabold text-[#62A9E6]">15</Text>
          </View>
          {/* Bottom white half */}
          <View className="bg-white items-center justify-center py-3">
            <Text className="text-[#4B5563] text-sm font-bold tracking-widest">STUDENTS</Text>
          </View>
        </View>

        {/* CARD 2: LESSONS (Yellow) */}
        <View className="flex-1 rounded-[16px] border-[2px] border-[#FDE047] bg-white overflow-hidden">
          {/* Top colored half */}
          <View className="bg-[#FEF9C3] flex-row items-center justify-center py-5 gap-3 border-b-[2px] border-b-[#FDE047]">
            <Ionicons name="book" size={32} color="#EAB308" />
            <Text className="text-4xl font-extrabold text-[#EAB308]">8</Text>
          </View>
          {/* Bottom white half */}
          <View className="bg-white items-center justify-center py-3">
            <Text className="text-[#4B5563] text-sm font-bold tracking-widest">LESSONS</Text>
          </View>
        </View>

        {/* CARD 3: REPORTS (Red/Pink) */}
        <View className="flex-1 rounded-[16px] border-[2px] border-[#FCA5A5] bg-white overflow-hidden">
          {/* Top colored half */}
          <View className="bg-[#FEE2E2] flex-row items-center justify-center py-5 gap-3 border-b-[2px] border-b-[#FCA5A5]">
            <Ionicons name="stats-chart" size={32} color="#F87171" />
            <Text className="text-4xl font-extrabold text-[#F87171]">5</Text>
          </View>
          {/* Bottom white half */}
          <View className="bg-white items-center justify-center py-3">
            <Text className="text-[#4B5563] text-sm font-bold tracking-widest">REPORTS</Text>
          </View>
        </View>
      </View>

      {/* CLASSES SECTION */}
      <View className="w-full mt-10">

        <Text className="text-3xl font-extrabold text-[#4B5563] px-12 mb-6">
          Classes
        </Text>

        <ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={{ paddingHorizontal: 48 }}
>
  {classesData.map((item) => (
    <Pressable 
      key={item.id} 
      onPress={() => router.replace('/class1')}
    >
      <View
        className="mr-6 w-[230px] h-[190px] bg-white rounded-[24px] overflow-hidden border-[2px]"
        style={{
          borderColor: item.themeColor
        }}
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
        <View className="flex-1 px-5 py-4 justify-between bg-white">
          <View className="flex-row justify-between items-center">
            <Text className="text-2xl font-bold text-[#4B5563]">
              {item.title}
            </Text>

            {/* Updated Level Badge */}
            <View
              className="border rounded-md px-2 py-0.5"
              style={{
                borderColor: item.themeColor,
                backgroundColor: `${item.themeColor}33`
              }}
            >
              <Text className="text-xs font-semibold" style={{ color: item.themeColor }}>
                {item.level}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center mt-2">
            <View className="flex-row">
              <View className="w-5 h-5 rounded-full border border-white" style={{ backgroundColor: item.themeColor, opacity: 0.5 }} />
              <View className="w-5 h-5 rounded-full border border-white -ml-2" style={{ backgroundColor: item.themeColor, opacity: 0.8 }} />
            </View>
            <Text className="text-sm font-medium ml-2" style={{ color: item.themeColor }}>
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
      <View className="w-full px-12 mt-10 mb-10">

        <Text className="text-3xl font-extrabold text-[#4B5563] mb-6">
          Lessons
        </Text>

        {/* Lesson Card */}
        <View className="w-full h-[280px] bg-white rounded-[18px] border-[3px] border-[#D5D0D2] border-b-[5px] overflow-hidden">

          {/* Top Image Container */}
          <View className="w-full h-[65%]">
            <Image
              source={require('../../assets/images/lesson-header.png')}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>

          {/* Bottom Text Container */}
          <View className="flex-1 px-6 py-4 justify-center">
            <Text className="text-3xl font-extrabold text-[#4B5563]">
              Lesson Materials
            </Text>
            <View className="flex-row items-center mt-2 gap-2">
              <Feather name="file-text" size={18} color="#9CA3AF" />
              <Text className="text-lg text-[#9CA3AF] font-medium">
                5 lessons
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}