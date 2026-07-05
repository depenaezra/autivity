import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import React from "react";
import { Dimensions, Image, ImageSourcePropType, ScrollView, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// EXACT MATH: Inactive card (280) + Gap (20) = 300
const SNAP_INTERVAL = 300; 

// --- TYPESCRIPT DEFINITIONS ---
type StudentData = {
  initial: string;
  url: string;
};

type ClassData = {
  id: string;
  title: string;
  level: string;
  people: number;
  image: ImageSourcePropType;
  borderColor: string;
  topBgColor: string;
  textColor: string;
  badgeBgColor: string;
  students: StudentData[];
};

interface ClassCardProps {
  item: ClassData;
  index: number;
  scrollX: SharedValue<number>;
}

// 1. EXTRACTED COMPONENT WITH TYPES
const ClassCard = ({ item, index, scrollX }: ClassCardProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SNAP_INTERVAL,
      index * SNAP_INTERVAL,
      (index + 1) * SNAP_INTERVAL,
    ];

    // Card smoothly expands and shrinks on the Native UI thread
    const width = interpolate(scrollX.value, inputRange, [280, 320.5, 280], Extrapolation.CLAMP);
    const height = interpolate(scrollX.value, inputRange, [210, 240, 210], Extrapolation.CLAMP);
    const borderBottomWidth = interpolate(scrollX.value, inputRange, [3.26, 7.61, 3.26], Extrapolation.CLAMP);
    const scale = interpolate(scrollX.value, inputRange, [0.95, 1, 0.95], Extrapolation.CLAMP);

    return {
      width,
      height,
      borderBottomWidth,
      transform: [{ scale }],
    };
  });

  return (
    // THE FIX: Removed the static wrapper completely. 
    // The Animated.View dynamically dictates the layout size, perfectly preserving the 20px gap.
    <Animated.View
      style={[
        {
          borderRadius: 19.5,
          borderWidth: 3.26,
          borderColor: item.borderColor,
          backgroundColor: "#FFFFFF",
          overflow: "hidden",
        },
        animatedStyle,
      ]}
    >
      <View className="flex-1 overflow-hidden">
        <Image
          source={item.image}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      </View>

      <View className="h-[90px] bg-white p-[16px] justify-between">
        <View className="flex-row justify-between items-center">
          <Text className="text-[#4B5161] font-fredoka-one text-[32px]">
            {item.title}
          </Text>

          <View
            style={{
              display: 'flex',
              paddingVertical: 6.519,
              paddingHorizontal: 8.691,
              justifyContent: 'center',
              alignItems: 'center',
              gap: 12.229,
              borderRadius: 7.338,
              borderWidth: 1.5,
              borderColor: item.borderColor,
              backgroundColor: item.badgeBgColor,
            }}
          >
            <Text
              className="font-quicksand-medium text-[12px]"
              style={{ color: item.textColor }}
            >
              {item.level}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-[8px]">
          <View className="flex-row pl-2">
            {item.students.map((student, idx) => (
              <Avatar
                key={idx}
                alt={`Student ${student.initial}`}
                className="border-background web:border-0 web:ring-2 web:ring-background -ml-2 border-[1.679px]"
                style={{
                  width: 23.503,
                  height: 23.503,
                  borderRadius: 23.503,
                  borderColor: item.borderColor,
                  backgroundColor: item.badgeBgColor
                }}
              >
                <AvatarImage source={{ uri: student.url }} />
                <AvatarFallback>
                  <Text style={{ fontSize: 10, color: item.textColor }}>{student.initial}</Text>
                </AvatarFallback>
              </Avatar>
            ))}
          </View>

          <Text
            className="font-quicksand-medium text-[16px]"
            style={{ color: item.textColor }}
          >
            {item.people} people
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

export default function TeacherHome() {
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const stats = [
    { id: "students", value: "15", label: "STUDENTS", icon: "user-graduate", borderColor: "border-[#98CBF8]", topBgColor: "bg-[#E1F4FF]", accentColor: "#6AA8E4" },
    { id: "lessons", value: "8", label: "LESSONS", icon: "book", borderColor: "border-[#F2D17C]", topBgColor: "bg-[#FFF6D8]", accentColor: "#DDA121" },
    { id: "reports", value: "5", label: "REPORTS", icon: "chart-bar", borderColor: "border-[#F0B4BC]", topBgColor: "bg-[#FFE1E6]", accentColor: "#D9737E" },
  ];

  const classesData: ClassData[] = [
    {
      id: "class_1a",
      title: "Class 1A",
      level: "Level 1",
      people: 4,
      image: require("@/assets/images/class-frog.png"),
      borderColor: "#A6E08B",
      topBgColor: "#E4F7D6",
      textColor: "#78C556",
      badgeBgColor: "#E2FAD7",
      students: [
        { initial: "A", url: "https://github.com/shadcn.png" },
        { initial: "B", url: "https://github.com/leerob.png" },
      ]
    },
    {
      id: "class_1b",
      title: "Class 1B",
      level: "Level 2",
      people: 3,
      image: require("@/assets/images/class-hamster.png"),
      borderColor: "#F2C79D",
      topBgColor: "#FDECE1",
      textColor: "#E29D5C",
      badgeBgColor: "#FDF1E8",
      students: [
        { initial: "C", url: "https://github.com/evilrabbit.png" },
        { initial: "D", url: "https://github.com/mrzachnugent.png" },
      ]
    },
    {
      id: "class_2a",
      title: "Class 2A",
      level: "Level 1",
      people: 5,
      image: require("@/assets/images/class-penguin.png"),
      borderColor: "#FCE77F",
      topBgColor: "#FFF9DB",
      textColor: "#E5C840",
      badgeBgColor: "#FFFBE6",
      students: [
        { initial: "E", url: "https://github.com/shadcn.png" },
        { initial: "F", url: "https://github.com/evilrabbit.png" },
      ]
    }
  ];

  // THE FIX: Exact right bound padding. 
  // SCREEN_WIDTH - (Left Padding 64 + Active Card Width 320.5) = 384.5
  // This guarantees the final active card hits the left alignment perfectly and physically cannot scroll further.
  const EXACT_RIGHT_PADDING = Math.max(0, SCREEN_WIDTH - 384.5);

  return (
    <ScrollView
      className="bg-[#F5F7FA]"
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ================= HEADER SECTION ================= */}
      <View className="flex flex-row justify-between items-start self-stretch px-[64px] pt-[60px]">
        <View className="flex flex-col items-start gap-[8px]">
          <Text className="self-stretch text-[#4B5161] font-fredoka-one text-[48px] leading-[normal]">
            Hi, Teacher Anne!
          </Text>
          <Text className="self-stretch text-[rgba(75,81,97,0.80)] font-quicksand-medium text-[24px] leading-[normal]">
            Manage and start activities
          </Text>
        </View>
        <Image
          source={require("@/assets/images/bear.png")}
          style={{ width: 102, height: 102, borderRadius: 51 }}
          resizeMode="cover"
        />
      </View>

      <View className="h-[55px]" />

      {/* ================= CARDS SECTION ================= */}
      <View className="flex flex-row items-center justify-between self-stretch px-[64px] gap-[18px]">
        {stats.map((stat) => (
          <View key={stat.id} className={`flex flex-1 flex-col items-center self-stretch rounded-[18px] border-[3px] overflow-hidden ${stat.borderColor}`}>
            <View className={`flex flex-row h-[94px] justify-center items-center gap-[20px] self-stretch ${stat.topBgColor}`}>
              <FontAwesome5 name={stat.icon} size={36} color={stat.accentColor} />
              <Text className="font-fredoka-one text-[46px] leading-[normal]" style={{ color: stat.accentColor }}>{stat.value}</Text>
            </View>
            <View className="flex flex-row h-[48px] p-[10px] justify-center items-center gap-[10px] self-stretch bg-[#FEF7F7]">
              <Text className="text-[#4B5161] text-center font-quicksand-medium text-[16px] tracking-widest">{stat.label}</Text>
            </View>
          </View>
        ))}
      </View>

      <View className="h-[55px]" />

      {/* ================= CLASSES SECTION ================= */}
      <View className="flex flex-col self-stretch">
        <Text className="text-[#4B5161] font-fredoka-one text-[40px] px-[64px] mb-[24px]">
          Classes
        </Text>

        <Animated.FlatList
          data={classesData}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToAlignment="start"
          decelerationRate="fast"
          snapToInterval={SNAP_INTERVAL}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          // Only passing left padding and gap to let flex layout handle spacing organically
          contentContainerStyle={{ 
            paddingLeft: 64, 
            gap: 20, 
            alignItems: 'center' 
          }}
          // Re-added the exact right blocker as a ListFooterComponent for strict bounding behavior
          ListFooterComponent={
            <View style={{ width: EXACT_RIGHT_PADDING }} />
          }
          renderItem={({ item, index }) => (
            <ClassCard item={item} index={index} scrollX={scrollX} />
          )}
        />
      </View>

      <View className="h-[55px]" />

      {/* ================= LESSONS SECTION ================= */}
      <View className="flex flex-col self-stretch px-[64px]">
        <Text className="text-[#4B5161] font-fredoka-one text-[40px] mb-[24px]">
          Lessons
        </Text>

        {/* Single Lessons Card with Tailwind */}
        <View className="rounded-[18px] border-[3px] border-b-[7px] border-[#D5D0D2] bg-[#FFFFFF] overflow-hidden">
          
          {/* Top Half: Placeholder Image */}
          <View className="w-full h-[220px] overflow-hidden relative">
            <Image
              source={require("@/assets/images/lessons-header.png")}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>

          {/* Bottom Half: Texts and Icon */}
          <View className="py-[24px] gap-[8px] bg-white">
            
            {/* Title */}
            <Text className="text-[#4B5161] font-quicksand-bold font-bold text-[48px] px-[20px]">
              Lesson Materials
            </Text>

            {/* Subtitle with Icon */}
            <View className="flex-row items-center px-[20px] gap-[8px] self-stretch">
              <FontAwesome5 name="file-alt" size={24} color="rgba(75, 81, 97, 0.60)" />
              <Text className="text-[rgba(75,81,97,0.60)] font-quicksand-medium font-medium text-[24px]">
                5 lessons
              </Text>
            </View>

          </View>
        </View>
      </View>

    </ScrollView>
  );
}