import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import StudentsIcon from '../../../assets/images/teacher/class/icon-students.svg';

interface StudentItem {
  id: string;
  name: string;
  avatar: string;
}

interface StudentsSectionProps {
  studentsData: StudentItem[];
  isTablet: boolean;
  onPress?: () => void;
}

export function StudentsSection({ studentsData, isTablet, onPress }: StudentsSectionProps) {
  const ChevronContainer = onPress ? Pressable : View;

  return (
    <View className={`w-full ${isTablet ? 'mt-10 mb-8' : 'mt-6 mb-4'}`}>
      {/* Header Title Row */}
      <View className={`flex-row items-center justify-between ${isTablet ? 'px-12' : 'px-6'}`}>
        <View className="flex-row items-center gap-2">
          <StudentsIcon 
            width={isTablet ? 36 : 26} 
            height={isTablet ? 36 : 26} 
          />
          <Text className={`font-fredoka-one text-[#484A4B] ${isTablet ? 'text-[32px]' : 'text-[22px]'}`}>
            Students
          </Text>
        </View>

        <ChevronContainer 
          onPress={onPress}
          className={onPress ? "active:scale-95 transition-transform" : undefined}
        >
          <Entypo name="chevron-right" size={isTablet ? 36 : 28} color="#62A9E6" />
        </ChevronContainer>
      </View>

      {/* Horizontal ScrollView of Students */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingVertical: 12,
          paddingHorizontal: isTablet ? 48 : 24,
          gap: isTablet ? 24 : 16 
        }}
        className="mt-4"
      >
        {studentsData.length === 0 ? (
          <Text className={`font-quicksand-medium text-gray-400 ${isTablet ? 'text-lg' : 'text-sm'}`}>
            No students registered yet.
          </Text>
        ) : (
          studentsData.map((student) => {
            const firstName = student.name ? student.name.split(' ')[0] : 'Student';
            return (
              <View key={student.id} className="items-center justify-center">
                {/* Outer circle with grey border */}
                <View 
                  className={`items-center justify-center border-[#D9D9D9] border-[2px] ${
                    isTablet 
                      ? 'w-[110px] h-[110px] rounded-[55px]' 
                      : 'w-[70px] h-[70px] rounded-[35px]'
                  }`}
                >
                  {/* Inner circle with thick white border */}
                  <View 
                    className="w-full h-full items-center justify-center bg-[#E5E7EB] border-white"
                    style={{
                      borderWidth: isTablet ? 4 : 3,
                      borderRadius: isTablet ? 51 : 32,
                    }}
                  >
                    <Text style={{ fontSize: isTablet ? 48 : 28 }}>
                      {student.avatar || '🙂'}
                    </Text>
                  </View>
                </View>
                {/* First Name */}
                <Text 
                  className={`font-fredoka-one text-[#484A4B] mt-2 text-center ${
                    isTablet ? 'text-lg' : 'text-sm'
                  }`}
                >
                  {firstName}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}


