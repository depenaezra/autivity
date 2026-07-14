import { Feather, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

interface ClassItem {
  id: string;
  title: string;
  level: string;
  people: number;
  image?: any;
  themeColor: string;
  shadowColor: string;
  themeName?: string;
}

const classCards: Record<string, any> = {
  green: require('../../assets/images/class-cards/class-frog.png'),
  orange: require('../../assets/images/class-cards/class-hamster.png'),
  yellow: require('../../assets/images/class-cards/class-penguin.png'),
  blue: require('../../assets/images/polar-bear.png'),
};

export default function TeacherHome() {
  const { firstName } = useLocalSearchParams();
  const router = useRouter();

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [activeIndex, setActiveIndex] = useState(0);

  const [classesData, setClassesData] = useState<ClassItem[]>([
    {
      id: '1a',
      title: 'Class 1A',
      level: 'Grade 1',
      people: 4,
      image: require('../../assets/images/class-cards/class-frog.png'),
      themeColor: '#86EFAC',
      shadowColor: '#4ADE80',
      themeName: 'green',
    },
    {
      id: '2b',
      title: 'Class 2B',
      level: 'Grade 2',
      people: 3,
      image: require('../../assets/images/class-cards/class-hamster.png'),
      themeColor: '#FDBA74',
      shadowColor: '#FB923C',
      themeName: 'orange',
    },
    {
      id: '3c',
      title: 'Class 1C',
      level: 'Grade 3',
      people: 5,
      image: require('../../assets/images/class-cards/class-penguin.png'),
      themeColor: '#FDE047',
      shadowColor: '#EAB308',
      themeName: 'yellow',
    }
  ]);

  const [isAddClassModalVisible, setAddClassModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    if (isAddClassModalVisible) {
      slideAnim.setValue(600);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 150,
      }).start();
    }
  }, [isAddClassModalVisible]);

  const [newClassName, setNewClassName] = useState('');
  const [newClassSchedule, setNewClassSchedule] = useState('');
  const [newClassGrade, setNewClassGrade] = useState('Grade 1');
  const [newClassTheme, setNewClassTheme] = useState('#FDBA74'); // Default orange

  const themeColors = [
    { name: 'orange', value: '#FDBA74', shadow: '#FB923C' },
    { name: 'yellow', value: '#FDE047', shadow: '#EAB308' },
    { name: 'blue', value: '#93C5FD', shadow: '#60A5FA' },
    { name: 'green', value: '#86EFAC', shadow: '#4ADE80' },
  ];

  const handleAddClass = () => {
    if (!newClassName.trim()) return;
    const selectedTheme = themeColors.find(c => c.value === newClassTheme) || themeColors[0];

    const newClass: ClassItem = {
      id: Date.now().toString(),
      title: newClassName,
      level: newClassGrade.trim() || 'Grade 1',
      people: 0,
      image: classCards[selectedTheme.name] || require('../../assets/images/polar-bear.png'),
      themeColor: selectedTheme.value,
      shadowColor: selectedTheme.shadow,
      themeName: selectedTheme.name,
    };

    setClassesData([...classesData, newClass]);
    setAddClassModalVisible(false);
    setNewClassName('');
    setNewClassSchedule('');
    setNewClassGrade('Grade 1');
    setNewClassTheme('#FDBA74');
  };

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
              onPress={() => router.push({
                pathname: '/class/[classId]',
                params: {
                  classId: item.id,
                  name: item.title,
                  grade: item.level,
                  themeColor: item.themeColor,
                  themeName: item.themeName || (item.themeColor === '#86EFAC' ? 'green' : item.themeColor === '#FDBA74' ? 'orange' : item.themeColor === '#FDE047' ? 'yellow' : item.themeColor === '#93C5FD' ? 'blue' : 'green')
                }
              } as any)}
            >
              <View
                className={`bg-white overflow-hidden border-[2px] ${isTablet ? 'w-[230px] h-[190px] mr-6 rounded-[24px]' : 'w-[160px] h-[150px] mr-4 rounded-2xl'
                  }`}
                style={{ borderColor: item.themeColor }}
              >
                {/* Image Section (Top half) */}
                <View
                  className="w-full h-[55%] border-b-[2px] overflow-hidden justify-center items-center"
                  style={{ borderBottomColor: item.themeColor, backgroundColor: `${item.themeColor}20` }}
                >
                  {item.image ? (
                    <Image
                      source={item.image}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons name="school" size={48} color={item.themeColor} />
                  )}
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

          {/* Add Class Button */}
          <Pressable onPress={() => setAddClassModalVisible(true)}>
            <View
              className={`bg-[#F9FAFB] overflow-hidden border-[2px] border-dashed border-[#D1D5DB] justify-center items-center ${isTablet ? 'w-[230px] h-[190px] mr-6 rounded-[24px]' : 'w-[160px] h-[150px] mr-4 rounded-2xl'
                }`}
            >
              <View className={`rounded-full bg-[#E5E7EB] items-center justify-center ${isTablet ? 'w-16 h-16 mb-4' : 'w-12 h-12 mb-3'}`}>
                <Feather name="plus" size={isTablet ? 32 : 24} color="#9CA3AF" />
              </View>
              <Text className={`font-quicksand-bold text-[#9CA3AF] ${isTablet ? 'text-xl' : 'text-base'}`}>
                Add Class
              </Text>
            </View>
          </Pressable>
        </ScrollView>
      </View>

      {/* LESSONS SECTION */}
      <View className={`w-full ${isTablet ? 'px-12 mt-10 mb-10' : 'px-6 mt-6 mb-6'}`}>
        <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-3xl mb-6' : 'text-xl mb-4'}`}>
          Lessons
        </Text>

        {/* Lesson Card */}
        <Pressable onPress={() => router.push('/lesson-materials' as any)}>
          <View
            className={`w-full bg-white overflow-hidden ${isTablet ? 'h-[280px] rounded-[18px] border-[3px] border-[#D5D0D2] border-b-[5px]' : 'h-[200px] rounded-[14px] border-[2px] border-[#D5D0D2] border-b-[4px]'
              }`}
          >
            {/* Top Image Container */}
            <View className="w-full h-[65%] overflow-hidden relative">
              <Image
                source={require('../../assets/images/lesson-header.png')}
                className="absolute w-full h-[120%]"
                style={{ top: -10 }}
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
        </Pressable>
      </View>

      {/* ADD CLASS MODAL */}
      <Modal
        visible={isAddClassModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAddClassModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-end bg-black/50"
        >
          <Pressable className="flex-1" onPress={() => setAddClassModalVisible(false)} />
          <Animated.View
            style={{ transform: [{ translateY: slideAnim }] }}
            className={`bg-white rounded-t-3xl p-6 ${isTablet ? 'h-[60%]' : 'h-[70%]'}`}
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="font-fredoka-one text-2xl text-[#4B5563]">Create New Class</Text>
              <Pressable onPress={() => setAddClassModalVisible(false)} className="p-2">
                <Feather name="x" size={24} color="#9CA3AF" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Class Name */}
              <View className="mb-4">
                <Text className="font-quicksand-bold text-[#4B5563] text-base mb-2">Class Name</Text>
                <TextInput
                  value={newClassName}
                  onChangeText={setNewClassName}
                  placeholder="e.g. Class 1A"
                  placeholderTextColor="#9CA3AF"
                  className="bg-[#F5F8FA] rounded-xl px-4 py-3 font-quicksand-medium text-[#4B5563]"
                />
              </View>

              {/* Grade */}
              <View className="mb-4">
                <Text className="font-quicksand-bold text-[#4B5563] text-base mb-2">Grade</Text>
                <View className="flex-row flex-wrap gap-2 mb-2">
                  {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'].map((grade) => (
                    <Pressable
                      key={grade}
                      onPress={() => setNewClassGrade(grade)}
                      className={`px-3 py-1.5 rounded-xl border ${
                        newClassGrade === grade
                          ? 'bg-[#9ACBF9] border-[#9ACBF9]'
                          : 'bg-[#F5F8FA] border-[#E5E7EB]'
                      }`}
                    >
                      <Text
                        className={`font-quicksand-bold text-xs ${
                          newClassGrade === grade ? 'text-white' : 'text-[#4B5563]'
                        }`}
                      >
                        {grade}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <TextInput
                  value={newClassGrade}
                  onChangeText={setNewClassGrade}
                  placeholder="Or type custom grade (ex. Grade 1)"
                  placeholderTextColor="#9CA3AF"
                  className="bg-[#F5F8FA] rounded-xl px-4 py-3 font-quicksand-medium text-[#4B5563]"
                />
              </View>

              {/* Schedule */}
              <View className="mb-4">
                <Text className="font-quicksand-bold text-[#4B5563] text-base mb-2">Schedule</Text>
                <TextInput
                  value={newClassSchedule}
                  onChangeText={setNewClassSchedule}
                  placeholder="e.g. Mon & Wed, 10:00 AM"
                  placeholderTextColor="#9CA3AF"
                  className="bg-[#F5F8FA] rounded-xl px-4 py-3 font-quicksand-medium text-[#4B5563]"
                />
              </View>

              {/* Theme Color */}
              <View className="mb-6">
                <Text className="font-quicksand-bold text-[#4B5563] text-base mb-2">Color Theme</Text>
                <View className="flex-row gap-4">
                  {themeColors.map((color) => (
                    <Pressable
                      key={color.name}
                      onPress={() => setNewClassTheme(color.value)}
                      className={`w-12 h-12 rounded-full justify-center items-center ${newClassTheme === color.value ? 'border-4 border-white' : ''}`}
                      style={[
                        { backgroundColor: color.value },
                        newClassTheme === color.value && {
                          shadowColor: color.shadow,
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.3,
                          shadowRadius: 4,
                          elevation: 5,
                        }
                      ]}
                    >
                      {newClassTheme === color.value && <Feather name="check" size={20} color="white" />}
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Create Button */}
              <Pressable
                onPress={handleAddClass}
                className={`py-4 rounded-xl items-center mb-8 ${newClassName.trim() ? 'bg-[#9ACBF9]' : 'bg-[#E5E7EB]'}`}
                disabled={!newClassName.trim()}
              >
                <Text className="font-quicksand-bold text-white text-lg">Create Class</Text>
              </Pressable>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}