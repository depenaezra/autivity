import React from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { ScreenLayout } from '../../screen-layout';
import { HeaderButton } from '../../header-button';

// SVGs
import HeaderClassBlue from '../../../assets/images/teacher/class/header-class-blue.svg';
import HeaderElementsClassBlue from '../../../assets/images/teacher/class/header-elements-class-blue.svg';
import HeaderClassGreen from '../../../assets/images/teacher/class/header-class-green.svg';
import HeaderElementsClassGreen from '../../../assets/images/teacher/class/header-elements-class-green.svg';
import HeaderClassOrange from '../../../assets/images/teacher/class/header-class-orange.svg';
import HeaderElementsClassOrange from '../../../assets/images/teacher/class/header-elements-class-orange.svg';
import HeaderClassYellow from '../../../assets/images/teacher/class/header-class-yellow.svg';
import HeaderElementsClassYellow from '../../../assets/images/teacher/class/header-elements-class-yellow.svg';

const headerSvgs: Record<string, { bg: React.FC<any>; elements: React.FC<any> }> = {
  blue: { bg: HeaderClassBlue, elements: HeaderElementsClassBlue },
  green: { bg: HeaderClassGreen, elements: HeaderElementsClassGreen },
  orange: { bg: HeaderClassOrange, elements: HeaderElementsClassOrange },
  yellow: { bg: HeaderClassYellow, elements: HeaderElementsClassYellow },
};

interface ClassScreenLayoutProps {
  title: string;
  level: string;
  schedule?: string;
  themeName?: 'green' | 'orange' | 'yellow' | 'blue';
  onBackPress: () => void;
  onEditPress: () => void;
  children?: React.ReactNode;
  students?: { id: string; name: string; avatar: string }[];
  selectedStudentId?: string | null;
  longPressedStudentId?: string | null;
  onStudentPress?: (studentId: string) => void;
  onStudentLongPress?: (studentId: string, coords: { x: number; y: number; width: number; height: number }) => void;
  scrollable?: boolean;
  stickyHeader?: boolean;
  onAddStudentPress?: () => void;
}

const themeStyles: Record<string, { stroke: string; font: string; fill: string }> = {
  green: {
    stroke: '#CBFAC4',
    font: '#179D33',
    fill: '#CBFAC4',
  },
  orange: {
    stroke: '#FFDBD4',
    font: '#FF8870',
    fill: '#FFDBD4',
  },
  yellow: {
    stroke: '#FFF3C4',
    font: '#FFAE02',
    fill: '#FFF3C4',
  },
  blue: {
    stroke: '#BBE8FB',
    font: '#62A9E6',
    fill: '#BBE8FB',
  },
};

function formatSchedule(scheduleStr: string | undefined): string {
  if (!scheduleStr) return '';
  const dayMap: Record<string, string> = {
    'monday': 'M', 'mon': 'M',
    'tuesday': 'T', 'tue': 'T',
    'wednesday': 'W', 'wed': 'W',
    'thursday': 'Th', 'thu': 'Th',
    'friday': 'F', 'fri': 'F',
    'saturday': 'Sa', 'sat': 'Sa',
    'sunday': 'Su', 'sun': 'Su'
  };

  let formatted = scheduleStr;
  const keys = Object.keys(dayMap).sort((a, b) => b.length - a.length);

  for (const day of keys) {
    const regex = new RegExp(`\\b${day}\\b`, 'gi');
    formatted = formatted.replace(regex, dayMap[day]);
  }

  // Remove "at"
  formatted = formatted.replace(/\bat\b/gi, '');

  // Remove hyphens between letters
  formatted = formatted.replace(/([a-zA-Z])\s*-\s*([a-zA-Z])/g, '$1$2');

  return formatted.replace(/\s+/g, ' ').trim();
}


export function ClassScreenLayout({
  title,
  level,
  schedule,
  themeName = 'yellow',
  onBackPress,
  onEditPress,
  children,
  students,
  selectedStudentId,
  longPressedStudentId,
  onStudentPress,
  onStudentLongPress,
  scrollable = true,
  stickyHeader = true,
  onAddStudentPress,
}: ClassScreenLayoutProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;
  const styleConfig = themeStyles[themeName] || themeStyles.yellow;
  const formattedSchedule = formatSchedule(schedule);

  // Render the header background containing the SVG gradient and the book illustration on the right
  const renderHeaderBackground = () => {
    const svgs = headerSvgs[themeName] || headerSvgs.yellow;
    const HeaderBg = svgs.bg;
    const HeaderElements = svgs.elements;

    return (
      <View className="flex-1 w-full h-full relative">
        <View className="absolute inset-0">
          <HeaderBg width="100%" height="100%" preserveAspectRatio="xMidYMax slice" />
        </View>
        <View 
          className="absolute right-0 bottom-0 justify-end items-end" 
          style={{ height: '115%', width: isTablet ? '38%' : '52%', bottom: isTablet ? -14 : -6 }}
        >
          <HeaderElements width="100%" height="100%" preserveAspectRatio="xMaxYMax meet" />
        </View>
      </View>
    );
  };

  // Render the dynamic header info pills (Grade & Schedule)
  const renderHeaderContent = () => (
    <View className={`items-start w-full ${isTablet ? 'mt-6' : 'mt-4'}`}>
      <Text className={`font-fredoka-one text-[#484A4B] leading-none ${isTablet ? 'text-[44px]' : 'text-[32px]'}`}>
        {title}
      </Text>
      
      <View className="flex-row items-center gap-2 mt-3">
        {/* Grade/Level Pill */}
        <View 
          className="flex-row items-center rounded-[6px] px-2 py-1 gap-1"
          style={{ backgroundColor: styleConfig.fill }}
        >
          <Ionicons 
            name="document-text" 
            size={isTablet ? 16 : 12} 
            color={styleConfig.font} 
          />
          <Text 
            className={`font-fredoka-one uppercase ${isTablet ? 'text-[14px]' : 'text-[11px]'}`}
            style={{ color: styleConfig.font }}
          >
            {level}
          </Text>
        </View>

        {/* Schedule Pill */}
        {schedule ? (
          <View 
            className="flex-row items-center rounded-[6px] px-2 py-1 gap-1"
            style={{ backgroundColor: styleConfig.fill }}
          >
            <Ionicons 
              name="calendar" 
              size={isTablet ? 16 : 12} 
              color={styleConfig.font} 
            />
            <Text 
              className={`font-fredoka-one uppercase ${isTablet ? 'text-[14px]' : 'text-[11px]'}`}
              style={{ color: styleConfig.font }}
            >
              {formattedSchedule}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Spacer to push card lower and reveal the book vector background */}
      <View className={isTablet ? 'h-6' : 'h-3'} />
    </View>
  );

  return (
    <ScreenLayout
      headerBackground={renderHeaderBackground()}
      leftHeaderButton={
        <HeaderButton
          onPress={onBackPress}
          icon={
            <View style={{ marginLeft: -3, marginTop: -1 }}>
              <Ionicons name="caret-back" size={isTablet ? 30 : 24} color="#62A9E6" />
            </View>
          }
        />
      }
      rightHeaderButton={
        <HeaderButton
          onPress={onEditPress}
          icon={
            <View style={{ marginTop: -1 }}>
              <Ionicons name="pencil" size={isTablet ? 24 : 18} color="#62A9E6" />
            </View>
          }
        />
      }
      headerContent={renderHeaderContent()}
      scrollable={scrollable}
      stickyHeader={stickyHeader}
    >
      {students && (
        <View 
          className={`flex-row flex-wrap justify-center ${
            isTablet ? 'gap-x-8 gap-y-12 p-12' : 'gap-x-4 gap-y-8 p-6'
          }`}
        >
          {students.map((student) => {
            const isSelected = selectedStudentId === student.id;
            return (
              <StudentGridItem
                key={student.id}
                student={student}
                isSelected={isSelected}
                styleConfig={styleConfig}
                isTablet={isTablet}
                onPress={onStudentPress}
                onLongPress={onStudentLongPress}
                longPressedStudentId={longPressedStudentId}
              />
            );
          })}

          {/* Add Student circle button */}
          <Pressable
            onPress={onAddStudentPress}
            className="items-center justify-center active:scale-95 transition-transform" 
            style={{ 
              width: isTablet ? '23%' : '45%', 
              marginHorizontal: '1%',
            }}
          >
            <View 
              className="items-center justify-center bg-white border-[4px] border-dashed border-[#F1F1F1]"
              style={{ 
                width: isTablet ? 140 : 90,
                height: isTablet ? 140 : 90,
                borderRadius: isTablet ? 70 : 45
              }}
            >
              <Feather name="plus" size={isTablet ? 44 : 32} color="#D9D9D9" />
            </View>
            <Text 
              className="font-fredoka-one mt-2 text-center text-[#D9D9D9]" 
              style={{ 
                fontSize: isTablet ? 22 : 16
              }}
              numberOfLines={1}
            >
              Add Student
            </Text>
          </Pressable>
        </View>
      )}
      {children}
    </ScreenLayout>
  );
}

interface StudentGridItemProps {
  student: { id: string; name: string; avatar: string; assigned_activities?: any[] };
  isSelected: boolean;
  styleConfig: { stroke: string; font: string; fill: string };
  isTablet: boolean;
  onPress?: (studentId: string) => void;
  onLongPress?: (studentId: string, coords: { x: number; y: number; width: number; height: number }) => void;
  longPressedStudentId?: string | null;
}

function StudentGridItem({
  student,
  isSelected,
  styleConfig,
  isTablet,
  onPress,
  onLongPress,
  longPressedStudentId,
}: StudentGridItemProps) {
  const itemRef = React.useRef<View>(null);
  const firstName = student.name ? student.name.split(' ')[0] : 'Student';
  const assignedCount = student.assigned_activities?.length || 0;

  const handleLongPress = () => {
    itemRef.current?.measureInWindow((x, y, width, height) => {
      onLongPress?.(student.id, { x, y, width, height });
    });
  };

  const isLongPressed = student.id === longPressedStudentId;

  return (
    <Pressable
      ref={itemRef}
      onPress={() => onPress?.(student.id)}
      onLongPress={handleLongPress}
      delayLongPress={350}
      className="items-center justify-center active:scale-95 transition-transform" 
      style={{ 
        width: isTablet ? '23%' : '45%', 
        marginHorizontal: '1%',
        opacity: isLongPressed ? 0 : 1,
      }}
    >
      {/* Outer circle with grey border (or theme border if selected) */}
      <View 
        className="items-center justify-center border-[4px] relative"
        style={{ 
          borderColor: isSelected ? styleConfig.font : '#D9D9D9',
          width: isTablet ? 140 : 90,
          height: isTablet ? 140 : 90,
          borderRadius: isTablet ? 70 : 45
        }}
      >
        {/* Inner circle with thick white border */}
        <View 
          className="w-full h-full items-center justify-center bg-[#E5E7EB] border-white"
          style={{
            borderWidth: isTablet ? 4 : 3,
            borderRadius: isTablet ? 66 : 42,
          }}
        >
          <Text style={{ fontSize: isTablet ? 64 : 40 }}>
            {student.avatar || '🙂'}
          </Text>
        </View>

        {/* Assigned Activities Badge */}
        {assignedCount > 0 && (
          <View 
            className="absolute -top-1 -right-1 bg-[#62A9E6] border-2 border-white rounded-full px-2 py-0.5 items-center justify-center z-10"
          >
            <Text className="text-white font-fredoka-one text-[11px]">{assignedCount}</Text>
          </View>
        )}
      </View>
      {/* First Name */}
      <Text 
        className="font-fredoka-one mt-2 text-center" 
        style={{ 
          color: isSelected ? styleConfig.font : '#484A4B',
          fontSize: isTablet ? 22 : 16
        }}
        numberOfLines={1}
      >
        {firstName}
      </Text>
    </Pressable>
  );
}


