import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { AnimatedPointer } from './animated-pointer';

// Real SVG icons from existing system
import ClassBlueIcon from '../../assets/images/teacher/class/icon-class-blue.svg';
import ClassIcon from '../../assets/images/teacher/class/icon-class.svg';

// =========================================================================
// TEACHER LESSON 1: CREATING A CLASS
// =========================================================================
export function TeacherClassDemo({ isTablet }: { isTablet: boolean }) {
  const [isCreated, setIsCreated] = useState(false);
  const addScale = useSharedValue(1);

  useEffect(() => {
    let t1: NodeJS.Timeout;
    let t2: NodeJS.Timeout;

    const runCycle = () => {
      addScale.value = withSequence(
        withDelay(850, withTiming(0.92, { duration: 150 })),
        withTiming(1, { duration: 200 })
      );
      t1 = setTimeout(() => setIsCreated(true), 1000);
      t2 = setTimeout(() => setIsCreated(false), 3300);
    };

    runCycle(); // Run immediately for cycle 1!
    const interval = setInterval(runCycle, 3600);

    return () => {
      clearInterval(interval);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [addScale]);

  const animatedAddStyle = useAnimatedStyle(() => ({
    transform: [{ scale: addScale.value }],
  }));

  return (
    <View className="w-full bg-[#F5F8FA] rounded-[24px] p-4 border-[3px] border-[#F1F1F1] relative overflow-hidden">
      <View className="flex-row items-center gap-2 mb-3">
        <ClassIcon width={20} height={20} />
        <Text className="font-fredoka-one text-[#484A4B] text-base">Classes</Text>
      </View>

      {!isCreated ? (
        <Animated.View
          style={[animatedAddStyle]}
          className="w-full bg-white border-[3px] border-dashed border-[#F1F1F1] rounded-[20px] items-center justify-center py-5"
        >
          <View className="w-10 h-10 rounded-[8px] bg-[#D9D9D9] items-center justify-center mb-1.5">
            <Feather name="plus" size={24} color="#FFFFFF" />
          </View>
          <Text className="font-fredoka-one text-[#D9D9D9] text-base">Add Class</Text>
        </Animated.View>
      ) : (
        <Animated.View
          entering={FadeInDown.duration(250)}
          className="w-full bg-white border-[3px] border-[#BBE8FB] rounded-[20px] p-3.5 flex-row justify-between items-center"
          style={styles.tactileShadow}
        >
          <View className="flex-1 pr-2">
            <Text className="font-fredoka-one text-[#484A4B] text-lg" numberOfLines={1}>
              Kinder - Morning
            </Text>

            <View className="flex-row items-center bg-[#BBE8FB] rounded-[6px] px-2 py-0.5 self-start mt-1 gap-1">
              <Ionicons name="document-text" size={11} color="#62A9E6" />
              <Text className="font-fredoka-one text-[#62A9E6] text-[10px] uppercase">
                KINDER
              </Text>
            </View>

            <View className="flex-row items-center gap-1.5 mt-2">
              <View className="flex-row items-center bg-white border-[2px] border-[#BBE8FB] rounded-[6px] px-2 py-0.5 gap-1">
                <Ionicons name="person" size={11} color="#62A9E6" />
                <Text className="font-fredoka-one text-[#62A9E6] text-[10px]">6</Text>
              </View>
              <View className="flex-row items-center bg-white border-[2px] border-[#BBE8FB] rounded-[6px] px-2 py-0.5 gap-1">
                <Ionicons name="calendar" size={11} color="#62A9E6" />
                <Text className="font-fredoka-one text-[#62A9E6] text-[10px]">MWF</Text>
              </View>
            </View>
          </View>

          <View className="w-16 h-16 rounded-[14px] bg-[#BBE8FB] items-center justify-center overflow-hidden">
            <ClassBlueIcon width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
          </View>
        </Animated.View>
      )}

      <AnimatedPointer startX={25} startY={25} targetX={130} targetY={60} />
    </View>
  );
}

// =========================================================================
// TEACHER LESSON 2: LEARNER CODE & PARENT LINKING
// =========================================================================
export function TeacherLearnerCodeDemo({ isTablet }: { isTablet: boolean }) {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    let t1: NodeJS.Timeout;
    let t2: NodeJS.Timeout;

    const runCycle = () => {
      t1 = setTimeout(() => setShowTooltip(true), 1000);
      t2 = setTimeout(() => setShowTooltip(false), 3300);
    };

    runCycle(); // Run immediately for cycle 1!
    const interval = setInterval(runCycle, 3600);

    return () => {
      clearInterval(interval);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <View className="w-full bg-[#F5F8FA] rounded-[24px] p-4 border-[3px] border-[#F1F1F1] relative overflow-hidden">
      <Text className="font-fredoka-one text-[#484A4B] text-sm mb-2.5">
        Student Profile & Learner Code
      </Text>

      <View
        className="w-full bg-white border-[3px] border-[#F1F1F1] rounded-[18px] p-3 flex-row items-center justify-between"
        style={styles.tactileShadow}
      >
        <View className="flex-row items-center gap-3 flex-1">
          <View className="w-11 h-11 rounded-full bg-[#FFF3C4] border border-[#FFAE02] items-center justify-center">
            <Text style={{ fontSize: 22 }}>🐻</Text>
          </View>

          <View className="flex-1">
            <Text className="font-fredoka-one text-[#484A4B] text-base">Lucas Santos</Text>
            <Text className="font-quicksand-medium text-[#9CA3AF] text-xs">
              Level 1 · Requiring Support
            </Text>

            <View className="flex-row items-center gap-1.5 mt-1.5">
              <View className="bg-[#BBE8FB] px-2.5 py-0.5 rounded-[6px]">
                <Text className="font-fredoka-one text-[#62A9E6] text-xs uppercase">
                  # AUT-001
                </Text>
              </View>

              <View className="bg-[#CBFAC4] px-2.5 py-0.5 rounded-[6px] flex-row items-center gap-1">
                <Ionicons name="checkmark-circle" size={11} color="#179D33" />
                <Text className="font-fredoka-one text-[#179D33] text-[10px] uppercase">
                  LINKED
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {showTooltip && (
        <Animated.View
          entering={FadeIn.duration(200)}
          className="mt-2.5 bg-[#EBF5FF] border border-[#BBE8FB] rounded-xl p-2.5 flex-row items-center gap-2"
        >
          <Ionicons name="key" size={16} color="#62A9E6" />
          <Text className="font-quicksand-bold text-[#4B5563] text-xs flex-1">
            Give # AUT-001 to parents. When they enter it in their app, their account links instantly!
          </Text>
        </Animated.View>
      )}

      <AnimatedPointer startX={25} startY={25} targetX={110} targetY={65} />
    </View>
  );
}

// =========================================================================
// TEACHER LESSON 3: ASSIGNING ACTIVITIES TO LEARNERS
// =========================================================================
export function TeacherAssignActivityDemo({ isTablet }: { isTablet: boolean }) {
  const [isAssigned, setIsAssigned] = useState(false);
  const tileScale = useSharedValue(1);

  useEffect(() => {
    let t1: NodeJS.Timeout;
    let t2: NodeJS.Timeout;

    const runCycle = () => {
      tileScale.value = withSequence(
        withDelay(850, withTiming(0.92, { duration: 150 })),
        withTiming(1, { duration: 200 })
      );
      t1 = setTimeout(() => setIsAssigned(true), 1000);
      t2 = setTimeout(() => setIsAssigned(false), 3300);
    };

    runCycle(); // Run immediately for cycle 1!
    const interval = setInterval(runCycle, 3600);

    return () => {
      clearInterval(interval);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [tileScale]);

  const animatedTileStyle = useAnimatedStyle(() => ({
    transform: [{ scale: tileScale.value }],
  }));

  return (
    <View className="w-full bg-[#F5F8FA] rounded-[24px] p-4 border-[3px] border-[#F1F1F1] relative overflow-hidden">
      {/* Modal Mini Header */}
      <View className="flex-row items-center justify-between pb-2 border-b border-[#E5E7EB] mb-2.5">
        <Text className="font-fredoka-one text-[#484A4B] text-sm">Assign Activities</Text>
        <Text className="font-quicksand-bold text-[#62A9E6] text-xs">
          STUDENT: LUCAS
        </Text>
      </View>

      {/* Activity Type Tabs */}
      <View className="flex-row bg-[#F8FAFC] rounded-xl p-1 mb-3 gap-1">
        <View className="px-3 py-1 rounded-lg bg-white border-b-[2px] border-[#62A9E6]">
          <Text className="font-fredoka-one text-[#62A9E6] text-xs">Counting</Text>
        </View>
        <View className="px-3 py-1 rounded-lg">
          <Text className="font-fredoka-one text-[#9CA3AF] text-xs">Tracing</Text>
        </View>
        <View className="px-3 py-1 rounded-lg">
          <Text className="font-fredoka-one text-[#9CA3AF] text-xs">Matching</Text>
        </View>
      </View>

      {/* Activity Grid (Real Subcategory Tiles from AssignActivitiesModal) */}
      <View className="flex-row gap-2.5">
        {/* Tile 1: Fruit Counting (Targeted by Pointer) */}
        <Animated.View
          style={[animatedTileStyle, styles.tactileShadow]}
          className={`flex-1 p-3 rounded-xl border-[2px] items-center justify-center ${
            isAssigned ? 'bg-[#F0F9FF] border-[#BBE8FB]' : 'bg-white border-[#F1F1F1]'
          }`}
        >
          <View
            className={`w-9 h-9 rounded-full items-center justify-center mb-1.5 ${
              isAssigned ? 'bg-[#DBEAFE]' : 'bg-[#F3F4F6]'
            }`}
          >
            <Ionicons
              name="basket-outline"
              size={18}
              color={isAssigned ? '#62A9E6' : '#9CA3AF'}
            />
          </View>
          <Text
            className="font-fredoka-one text-[11px] text-center mb-1"
            style={{ color: isAssigned ? '#62A9E6' : '#4B5563' }}
            numberOfLines={1}
          >
            Fruit Counting
          </Text>
          <View
            className={`px-1.5 py-0.5 rounded-full ${
              isAssigned ? 'bg-[#CBFAC4]' : 'bg-[#F3F4F6]'
            }`}
          >
            <Text
              className="font-fredoka-one text-[8px] uppercase"
              style={{ color: isAssigned ? '#179D33' : '#9CA3AF' }}
            >
              {isAssigned ? '✓ ASSIGNED' : '+ ASSIGN'}
            </Text>
          </View>
        </Animated.View>

        {/* Tile 2: Free Pop */}
        <View
          className="flex-1 p-3 rounded-xl border-[2px] bg-white border-[#F1F1F1] items-center justify-center"
          style={styles.tactileShadow}
        >
          <View className="w-9 h-9 rounded-full items-center justify-center mb-1.5 bg-[#F3F4F6]">
            <Ionicons name="disc-outline" size={18} color="#9CA3AF" />
          </View>
          <Text className="font-fredoka-one text-[11px] text-center text-[#4B5563] mb-1" numberOfLines={1}>
            Free Pop
          </Text>
          <View className="px-1.5 py-0.5 rounded-full bg-[#F3F4F6]">
            <Text className="font-fredoka-one text-[8px] uppercase text-[#9CA3AF]">
              + ASSIGN
            </Text>
          </View>
        </View>
      </View>

      <AnimatedPointer startX={25} startY={25} targetX={65} targetY={85} />
    </View>
  );
}

// =========================================================================
// TEACHER LESSON 3: HOW ANALYTICS & BENCHMARK TIERS WORK (DETAILED TUTORIAL)
// =========================================================================
export function TeacherAnalyticsTutorialDemo({ isTablet }: { isTablet: boolean }) {
  const [selectedKpi, setSelectedKpi] = useState<'none' | 'hints'>('none');
  const cardScale = useSharedValue(1);

  useEffect(() => {
    let t1: NodeJS.Timeout;
    let t2: NodeJS.Timeout;

    const runCycle = () => {
      cardScale.value = withSequence(
        withDelay(850, withTiming(0.92, { duration: 150 })),
        withTiming(1, { duration: 200 })
      );
      t1 = setTimeout(() => setSelectedKpi('hints'), 1000);
      t2 = setTimeout(() => setSelectedKpi('none'), 3300);
    };

    runCycle(); // Run immediately for cycle 1!
    const interval = setInterval(runCycle, 3600);

    return () => {
      clearInterval(interval);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [cardScale]);

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  return (
    <View className="w-full bg-[#F5F8FA] rounded-[24px] p-4 border-[3px] border-[#F1F1F1] relative overflow-hidden">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="font-fredoka-one text-[#484A4B] text-sm">Student KPI Performance</Text>
        <Text className="font-quicksand-bold text-[#62A9E6] text-[10px]">TAP CARD FOR DETAILS</Text>
      </View>

      {/* The 3 Real Student Performance Cards */}
      <View className="flex-row gap-2">
        {/* Card 1: Avg Duration */}
        <View
          className="flex-1 bg-white border-[3px] border-[#BBE8FB] rounded-[16px] p-2 items-center justify-between"
          style={styles.tactileShadow}
        >
          <Text className="font-fredoka-one text-[#62A9E6] text-[10px] text-center">Avg Session</Text>
          <View className="w-6 h-6 rounded-full bg-[#E0F2FE] items-center justify-center my-1">
            <Feather name="clock" size={12} color="#62A9E6" />
          </View>
          <Text className="font-fredoka-one text-[#484A4B] text-sm">4m 12s</Text>
          <View className="bg-[#E0F2FE] px-1.5 py-0.5 rounded-full mt-1">
            <Text className="font-quicksand-bold text-[#0284C7] text-[8px]">ACTIVE</Text>
          </View>
        </View>

        {/* Card 2: Avg Mistakes */}
        <View
          className="flex-1 bg-white border-[3px] border-[#FECDD3] rounded-[16px] p-2 items-center justify-between"
          style={styles.tactileShadow}
        >
          <Text className="font-fredoka-one text-[#F43F5E] text-[10px] text-center">Avg Mistakes</Text>
          <View className="w-6 h-6 rounded-full bg-[#FFF1F2] items-center justify-center my-1">
            <Feather name="alert-circle" size={12} color="#F43F5E" />
          </View>
          <Text className="font-fredoka-one text-[#484A4B] text-sm">1.4</Text>
          <View className="bg-[#DCFCE7] px-1.5 py-0.5 rounded-full mt-1">
            <Text className="font-quicksand-bold text-[#15803D] text-[8px]">MASTERY</Text>
          </View>
        </View>

        {/* Card 3: Avg Hints (Targeted by Pointer) */}
        <Animated.View
          style={[animatedCardStyle, styles.tactileShadow]}
          className="flex-1 bg-white border-[3px] border-[#FDE68A] rounded-[16px] p-2 items-center justify-between"
        >
          <Text className="font-fredoka-one text-[#FFAE02] text-[10px] text-center">Avg Hints</Text>
          <View className="w-6 h-6 rounded-full bg-[#FEF3C7] items-center justify-center my-1">
            <Feather name="help-circle" size={12} color="#FFAE02" />
          </View>
          <Text className="font-fredoka-one text-[#484A4B] text-sm">0.8</Text>
          <View className="bg-[#DCFCE7] px-1.5 py-0.5 rounded-full mt-1">
            <Text className="font-quicksand-bold text-[#15803D] text-[8px]">INDEPENDENT</Text>
          </View>
        </Animated.View>
      </View>

      {/* Real KPI Legend Modal Preview that explains what this means */}
      {selectedKpi === 'hints' && (
        <Animated.View
          entering={FadeIn.duration(200)}
          className="mt-2.5 bg-white border-[2px] border-[#FFAE02] rounded-xl p-2.5"
        >
          <Text className="font-fredoka-one text-[#484A4B] text-xs mb-1">
            Understanding Benchmark Tiers:
          </Text>
          <View className="gap-1">
            <View className="flex-row items-center gap-1.5">
              <View className="w-2 h-2 rounded-full bg-[#15803D]" />
              <Text className="font-quicksand-medium text-[#4B5563] text-[11px]">
                <Text className="font-quicksand-bold">Independent (0-1 hints):</Text> Minimal assistance
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="w-2 h-2 rounded-full bg-[#FFAE02]" />
              <Text className="font-quicksand-medium text-[#4B5563] text-[11px]">
                <Text className="font-quicksand-bold">Prompted (2-3 hints):</Text> Moderate guidance needed
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="w-2 h-2 rounded-full bg-[#F43F5E]" />
              <Text className="font-quicksand-medium text-[#4B5563] text-[11px]">
                <Text className="font-quicksand-bold">Supported (4+ hints):</Text> Direct assistance required
              </Text>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Pointer targeting the Avg Hints Card */}
      <AnimatedPointer startX={25} startY={25} targetX={215} targetY={45} />
    </View>
  );
}

// =========================================================================
// TEACHER LESSON 4: RANGE FILTERING & PDF EXPORT TUTORIAL
// =========================================================================
export function TeacherRangeFilterDemo({ isTablet }: { isTablet: boolean }) {
  const [filterState, setFilterState] = useState<'overall' | '30days'>('overall');
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    let t1: NodeJS.Timeout;
    let t2: NodeJS.Timeout;

    const runCycle = () => {
      buttonScale.value = withSequence(
        withDelay(850, withTiming(0.92, { duration: 150 })),
        withTiming(1, { duration: 200 })
      );
      t1 = setTimeout(() => setFilterState('30days'), 1000);
      t2 = setTimeout(() => setFilterState('overall'), 3300);
    };

    runCycle(); // Run immediately for cycle 1!
    const interval = setInterval(runCycle, 3600);

    return () => {
      clearInterval(interval);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [buttonScale]);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <View className="w-full bg-[#F5F8FA] rounded-[24px] p-4 border-[3px] border-[#F1F1F1] relative overflow-hidden">
      <Text className="font-fredoka-one text-[#484A4B] text-sm mb-2.5">
        Analytics Controls & Reports
      </Text>

      {/* Real Controls Row from Analytics Screen */}
      <View className="gap-2.5">
        {/* Real Range Filter Button */}
        <Animated.View
          style={[animatedButtonStyle, styles.tactileShadow]}
          className="w-full bg-white border-[2px] border-[#BBE8FB] rounded-xl px-3 py-2 flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-2">
            <Feather name="calendar" size={14} color="#62A9E6" />
            <Text className="font-fredoka-one text-[#62A9E6] text-xs uppercase">
              {filterState === 'overall' ? 'OVERALL' : 'LAST 30 DAYS'}
            </Text>
          </View>
          <Feather name="chevron-down" size={14} color="#62A9E6" />
        </Animated.View>

        {/* Real Export Button */}
        <View
          className="w-full bg-white border-[2px] border-[#BBE8FB] rounded-xl px-3 py-2 flex-row items-center justify-center gap-2"
          style={styles.tactileShadow}
        >
          <Feather name="download" size={14} color="#62A9E6" />
          <Text className="font-fredoka-one text-[#62A9E6] text-xs uppercase">
            DOWNLOAD ANALYTICS REPORT (PDF)
          </Text>
        </View>
      </View>

      <AnimatedPointer startX={25} startY={70} targetX={140} targetY={35} />
    </View>
  );
}

// =========================================================================
// PARENT LESSON 1: LINKING LEARNER CODE
// =========================================================================
export function ParentLinkCodeDemo({ isTablet }: { isTablet: boolean }) {
  const [isLinked, setIsLinked] = useState(false);
  const linkScale = useSharedValue(1);

  useEffect(() => {
    let t1: NodeJS.Timeout;
    let t2: NodeJS.Timeout;

    const runCycle = () => {
      linkScale.value = withSequence(
        withDelay(850, withTiming(0.92, { duration: 150 })),
        withTiming(1, { duration: 200 })
      );
      t1 = setTimeout(() => setIsLinked(true), 1000);
      t2 = setTimeout(() => setIsLinked(false), 3300);
    };

    runCycle(); // Run immediately for cycle 1!
    const interval = setInterval(runCycle, 3600);

    return () => {
      clearInterval(interval);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [linkScale]);

  const animatedLinkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: linkScale.value }],
  }));

  return (
    <View className="w-full bg-[#F5F8FA] rounded-[24px] p-4 border-[3px] border-[#F1F1F1] relative overflow-hidden">
      <View
        className="w-full bg-white rounded-[20px] p-4 border-[3px] border-[#F1F1F1]"
        style={styles.tactileShadow}
      >
        <Text className="font-quicksand-medium text-[#9CA3AF] text-xs mb-2.5 leading-4">
          {"Enter the learner code your child's teacher gave you to connect accounts."}
        </Text>

        <View className="bg-[#F5F8FA] rounded-xl px-3 py-2.5 mb-2.5 border border-[#E5E7EB] flex-row items-center justify-between">
          <Text className="font-quicksand-bold text-[#4B5563] text-sm tracking-wider">
            {isLinked ? 'AUT-0001' : 'e.g. AUT-0001'}
          </Text>
          <Ionicons name="key" size={16} color="#9CA3AF" />
        </View>

        <Animated.View
          style={[animatedLinkStyle]}
          className={`py-2.5 rounded-xl items-center ${
            isLinked ? 'bg-[#DCFCE7] border border-[#86EFAC]' : 'bg-[#62A9E6]'
          }`}
        >
          <Text
            className={`font-quicksand-bold text-xs uppercase ${
              isLinked ? 'text-[#15803D]' : 'text-white'
            }`}
          >
            {isLinked ? '✓ LINKED TO LUCAS SANTOS' : 'LINK CODE'}
          </Text>
        </Animated.View>
      </View>

      <AnimatedPointer startX={30} startY={20} targetX={150} targetY={75} />
    </View>
  );
}

// =========================================================================
// PARENT LESSON 2: CHILD OVERVIEW & IEP GOALS (100% MATCH TO PARENT HEADER)
// =========================================================================
export function ParentChildOverviewDemo({ isTablet }: { isTablet: boolean }) {
  const [showIepModal, setShowIepModal] = useState(false);
  const iepScale = useSharedValue(1);

  useEffect(() => {
    let t1: NodeJS.Timeout;
    let t2: NodeJS.Timeout;

    const runCycle = () => {
      iepScale.value = withSequence(
        withDelay(850, withTiming(0.92, { duration: 150 })),
        withTiming(1, { duration: 200 })
      );
      t1 = setTimeout(() => setShowIepModal(true), 1000);
      t2 = setTimeout(() => setShowIepModal(false), 3300);
    };

    runCycle(); // Run immediately for cycle 1!
    const interval = setInterval(runCycle, 3600);

    return () => {
      clearInterval(interval);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [iepScale]);

  const animatedIepStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iepScale.value }],
  }));

  return (
    <View className="w-full bg-[#F5F8FA] rounded-[24px] p-4 border-[3px] border-[#F1F1F1] relative overflow-hidden">
      {/* Real ParentHeader Child Card */}
      <View
        className="w-full bg-white border-[3px] border-[#F1F1F1] rounded-[20px] p-3.5"
        style={styles.tactileShadow}
      >
        {/* Top Row: Avatar, Name & Classroom/Teacher Pills */}
        <View className="flex-row items-center gap-3">
          <View className="w-12 h-12 rounded-full bg-[#EBF5FF] border-2 border-[#62A9E6] items-center justify-center">
            <Text style={{ fontSize: 24 }}>🙂</Text>
          </View>
          <View className="flex-1">
            <Text className="font-fredoka-one text-[#484A4B] text-base">Lucas Santos</Text>
            <View className="flex-row items-center gap-1.5 mt-1 flex-wrap">
              <View className="bg-[#BBE8FB] px-2 py-0.5 rounded-[6px] flex-row items-center gap-1">
                <Ionicons name="book" size={10} color="#62A9E6" />
                <Text className="font-fredoka-one text-[#62A9E6] text-[10px] uppercase">
                  Kinder - Morning
                </Text>
              </View>
              <View className="bg-white border-[2px] border-[#BBE8FB] px-2 py-0.5 rounded-[6px] flex-row items-center gap-1">
                <Ionicons name="person" size={10} color="#62A9E6" />
                <Text className="font-fredoka-one text-[#62A9E6] text-[10px] uppercase">
                  Teacher Sarah
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Row: Exact Tactile Action Buttons from ParentHeader */}
        <View className="flex-row gap-2.5 mt-3 pt-2.5 border-t border-[#F1F1F1]">
          {/* Button 1: IEP GOALS (Targeted by Pointer!) */}
          <Animated.View
            style={[animatedIepStyle, styles.tactileBlueShadow]}
            className="flex-1 bg-white border-[2px] border-[#BBE8FB] py-2 rounded-xl flex-row items-center justify-center gap-1.5"
          >
            <Feather name="clipboard" size={13} color="#62A9E6" />
            <Text className="font-fredoka-one text-[#62A9E6] text-[11px] uppercase">
              IEP Goals
            </Text>
          </Animated.View>

          {/* Button 2: LEARNER INFO */}
          <View
            style={styles.tactileBlueShadow}
            className="flex-1 bg-white border-[2px] border-[#BBE8FB] py-2 rounded-xl flex-row items-center justify-center gap-1.5"
          >
            <Feather name="info" size={13} color="#62A9E6" />
            <Text className="font-fredoka-one text-[#62A9E6] text-[11px] uppercase">
              Learner Info
            </Text>
          </View>
        </View>
      </View>

      {/* Real IEP Goals Modal Preview (Fires on Click!) */}
      {showIepModal && (
        <Animated.View
          entering={FadeIn.duration(200)}
          className="mt-2.5 bg-white border-[2px] border-[#BBE8FB] rounded-2xl p-3"
          style={styles.tactileShadow}
        >
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-1.5">
              <Feather name="clipboard" size={13} color="#62A9E6" />
              <Text className="font-fredoka-one text-[#484A4B] text-xs">IEP Goals · Lucas Santos</Text>
            </View>
            <Text className="font-fredoka-one text-[#62A9E6] text-[10px] uppercase">TARGET PLAN</Text>
          </View>

          {/* Goal Item 1 */}
          <View className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-2 flex-row items-center justify-between mb-1.5">
            <View className="flex-row items-center gap-2 flex-1 pr-1">
              <View className="w-6 h-6 rounded-full bg-[#E6F4EA] items-center justify-center">
                <Ionicons name="checkmark-circle" size={14} color="#179D33" />
              </View>
              <View className="flex-1">
                <Text className="font-fredoka-one text-[#484A4B] text-[11px]">Turn-Taking & Sharing</Text>
                <Text className="font-quicksand-medium text-[#9CA3AF] text-[9px]">Target: Oct. 25, 2026</Text>
              </View>
            </View>
            <View className="bg-[#E6F4EA] border border-[#CBFAC4] px-1.5 py-0.5 rounded-full">
              <Text className="font-fredoka-one text-[#179D33] text-[8px] uppercase">ACHIEVED</Text>
            </View>
          </View>

          {/* Goal Item 2 */}
          <View className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-2 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2 flex-1 pr-1">
              <View className="w-6 h-6 rounded-full bg-[#EBF5FF] items-center justify-center">
                <Ionicons name="flag" size={14} color="#62A9E6" />
              </View>
              <View className="flex-1">
                <Text className="font-fredoka-one text-[#484A4B] text-[11px]">Counting 1 to 10</Text>
                <Text className="font-quicksand-medium text-[#9CA3AF] text-[9px]">Target: Nov. 15, 2026</Text>
              </View>
            </View>
            <View className="bg-[#EBF5FF] border border-[#BBE8FB] px-1.5 py-0.5 rounded-full">
              <Text className="font-fredoka-one text-[#2563EB] text-[8px] uppercase">IN PROGRESS</Text>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Pointer targeting the IEP GOALS button on left */}
      <AnimatedPointer startX={25} startY={25} targetX={65} targetY={115} />
    </View>
  );
}

// =========================================================================
// PARENT LESSON 3: REAL 3D CIRCULAR MILESTONES (100% MATCH TO PARENT SCREEN)
// =========================================================================
export function ParentMilestonesDemo({ isTablet }: { isTablet: boolean }) {
  const [showDetail, setShowDetail] = useState(false);
  const badgeScale = useSharedValue(1);

  useEffect(() => {
    let t1: NodeJS.Timeout;
    let t2: NodeJS.Timeout;

    const runCycle = () => {
      badgeScale.value = withSequence(
        withDelay(850, withTiming(0.9, { duration: 150 })),
        withTiming(1, { duration: 200 })
      );
      t1 = setTimeout(() => setShowDetail(true), 1000);
      t2 = setTimeout(() => setShowDetail(false), 3300);
    };

    runCycle(); // Run immediately for cycle 1!
    const interval = setInterval(runCycle, 3600);

    return () => {
      clearInterval(interval);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [badgeScale]);

  const animatedBadgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  return (
    <View className="w-full bg-[#F5F8FA] rounded-[24px] p-4 border-[3px] border-[#F1F1F1] relative overflow-hidden">
      {/* Real Section Header from ParentMilestonesSection */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="font-fredoka-one text-[#484A4B] text-base">Learner Milestones</Text>
        <View className="bg-white border-[2px] border-[#BBE8FB] px-2.5 py-0.5 rounded-xl">
          <Text className="font-fredoka-one text-[#62A9E6] text-[10px] uppercase">
            1 / 3 COMPLETED
          </Text>
        </View>
      </View>

      {/* Real Card Container with 3D Circular Badges */}
      <View className="bg-white border-[2px] border-[#F1F1F1] rounded-[20px] p-3 shadow-sm">
        <View className="flex-row justify-between items-start px-1">
          {/* Badge 1: Completed / Achieved (Targeted by Pointer!) */}
          <View className="items-center w-[76px]">
            <Animated.View
              style={[
                animatedBadgeStyle,
                {
                  width: 58,
                  height: 58,
                  borderRadius: 29,
                  backgroundColor: '#F0FDF4',
                  borderWidth: 3,
                  borderBottomWidth: 5,
                  borderColor: '#86EFAC',
                  borderBottomColor: '#86EFAC',
                  elevation: 3,
                },
              ]}
              className="items-center justify-center relative overflow-hidden"
            >
              <View className="absolute top-0 left-0 right-0 h-1/2 bg-white/25 rounded-t-full" />
              <Ionicons name="flag" size={24} color="#15803D" />
            </Animated.View>
            <Text className="font-fredoka-one text-center text-[#374151] text-[11px] mt-1.5" numberOfLines={1}>
              Turn Taking
            </Text>
            <View className="px-1.5 py-0.5 rounded-[5px] mt-1 border border-[#86EFAC] bg-[#DCFCE7]">
              <Text className="font-fredoka-one uppercase text-[8px] text-[#15803D]">
                COMPLETED
              </Text>
            </View>
          </View>

          {/* Badge 2: In Progress */}
          <View className="items-center w-[76px]">
            <View
              style={{
                width: 58,
                height: 58,
                borderRadius: 29,
                backgroundColor: '#EBF5FF',
                borderWidth: 3,
                borderBottomWidth: 5,
                borderColor: '#BBE8FB',
                borderBottomColor: '#BBE8FB',
                elevation: 2,
              }}
              className="items-center justify-center relative overflow-hidden"
            >
              <View className="absolute top-0 left-0 right-0 h-1/2 bg-white/25 rounded-t-full" />
              <Ionicons name="flag" size={24} color="#62A9E6" />
            </View>
            <Text className="font-fredoka-one text-center text-[#374151] text-[11px] mt-1.5" numberOfLines={1}>
              Count 1-10
            </Text>
            <View className="px-1.5 py-0.5 rounded-[5px] mt-1 border border-[#BBE8FB] bg-[#DBEAFE]">
              <Text className="font-fredoka-one uppercase text-[8px] text-[#2563EB]">
                IN PROGRESS
              </Text>
            </View>
          </View>

          {/* Badge 3: Target Set */}
          <View className="items-center w-[76px]">
            <View
              style={{
                width: 58,
                height: 58,
                borderRadius: 29,
                backgroundColor: '#F3F4F6',
                borderWidth: 3,
                borderBottomWidth: 5,
                borderColor: '#D1D5DB',
                borderBottomColor: '#D1D5DB',
                elevation: 1,
              }}
              className="items-center justify-center relative overflow-hidden"
            >
              <View className="absolute top-0 left-0 right-0 h-1/2 bg-white/25 rounded-t-full" />
              <Ionicons name="flag" size={24} color="#9CA3AF" />
            </View>
            <Text className="font-fredoka-one text-center text-[#374151] text-[11px] mt-1.5" numberOfLines={1}>
              Object Focus
            </Text>
            <View className="px-1.5 py-0.5 rounded-[5px] mt-1 border border-[#D1D5DB] bg-[#E5E7EB]">
              <Text className="font-fredoka-one uppercase text-[8px] text-[#6B7280]">
                TARGET SET
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Real ParentMilestoneDetailModal Preview (Fires on Click!) */}
      {showDetail && (
        <Animated.View
          entering={FadeIn.duration(200)}
          className="mt-2.5 bg-white border-[3px] border-[#86EFAC] rounded-2xl p-3 items-center"
          style={styles.tactileShadow}
        >
          <View className="w-11 h-11 rounded-full bg-[#F0FDF4] border-[2px] border-b-[4px] border-[#86EFAC] items-center justify-center relative overflow-hidden mb-1">
            <View className="absolute top-0 left-0 right-0 h-1/2 bg-white/25 rounded-t-full" />
            <Ionicons name="flag" size={18} color="#15803D" />
          </View>
          <Text className="font-fredoka-one text-xs text-[#374151]">
            Turn Taking Milestone
          </Text>
          <View className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-2 mt-1.5">
            <Text className="font-fredoka-one text-[9px] text-[#62A9E6] uppercase text-center mb-0.5">
              MILESTONE DETAILS
            </Text>
            <Text className="font-quicksand-medium text-[10px] text-[#484A4B] text-center leading-4">
              Lucas demonstrated independent sharing & turn-taking during group activities.
            </Text>
          </View>
          <View className="px-2.5 py-0.5 rounded-full bg-[#DCFCE7] border border-[#86EFAC] mt-1.5">
            <Text className="font-fredoka-one text-[9px] uppercase text-[#15803D]">
              COMPLETED · OCT. 25, 2026
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Pointer targeting Badge 1 */}
      <AnimatedPointer startX={25} startY={25} targetX={45} targetY={90} />
    </View>
  );
}

// =========================================================================
// PARENT LESSON 4: REAL TEACHER FEEDBACK & REPORT EXPORT (100% MATCH)
// =========================================================================
export function ParentFeedbackDemo({ isTablet }: { isTablet: boolean }) {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const downloadScale = useSharedValue(1);

  useEffect(() => {
    let t1: NodeJS.Timeout;
    let t2: NodeJS.Timeout;

    const runCycle = () => {
      downloadScale.value = withSequence(
        withDelay(850, withTiming(0.92, { duration: 150 })),
        withTiming(1, { duration: 200 })
      );
      t1 = setTimeout(() => setIsDownloaded(true), 1000);
      t2 = setTimeout(() => setIsDownloaded(false), 3300);
    };

    runCycle(); // Run immediately for cycle 1!
    const interval = setInterval(runCycle, 3600);

    return () => {
      clearInterval(interval);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [downloadScale]);

  const animatedDownloadStyle = useAnimatedStyle(() => ({
    transform: [{ scale: downloadScale.value }],
  }));

  return (
    <View className="w-full bg-[#F5F8FA] rounded-[24px] p-4 border-[3px] border-[#F1F1F1] relative overflow-hidden">
      {/* Real Section Header from ParentTeacherFeedback */}
      <View className="mb-2.5">
        <Text className="font-fredoka-one text-[#484A4B] text-base mb-1.5">Teacher Feedbacks</Text>

        {/* Real Action Buttons Row: Range Filter + Download All */}
        <View className="flex-row items-center gap-2">
          {/* Range Filter Button */}
          <View
            style={styles.tactileBlueShadow}
            className="flex-row items-center justify-center gap-1 bg-white border-[2px] border-[#BBE8FB] px-2.5 h-[30px] rounded-xl"
          >
            <Feather name="calendar" size={11} color="#62A9E6" />
            <Text className="font-fredoka-one text-[#62A9E6] text-[10px] uppercase">
              OVERALL
            </Text>
            <Feather name="chevron-down" size={11} color="#62A9E6" />
          </View>

          {/* Download All Reports Button (Targeted by Pointer!) */}
          <Animated.View
            style={[animatedDownloadStyle, styles.tactileBlueShadow]}
            className={`flex-row items-center justify-center gap-1 border-[2px] px-2.5 h-[30px] rounded-xl ${
              isDownloaded ? 'bg-[#DCFCE7] border-[#86EFAC]' : 'bg-white border-[#BBE8FB]'
            }`}
          >
            <Feather
              name={isDownloaded ? 'check' : 'download'}
              size={11}
              color={isDownloaded ? '#15803D' : '#62A9E6'}
            />
            <Text
              className="font-fredoka-one text-[10px] uppercase"
              style={{ color: isDownloaded ? '#15803D' : '#62A9E6' }}
            >
              {isDownloaded ? '✓ DOWNLOADED' : 'DOWNLOAD ALL'}
            </Text>
          </Animated.View>
        </View>
      </View>

      {/* Real Feedback Row Item (Exact match to FeedbackRowItem) */}
      <View
        className="w-full bg-white border-[2px] border-[#F1F1F1] rounded-[16px] p-3 flex-row items-center justify-between"
        style={styles.tactileShadow}
      >
        <View className="flex-1 pr-2">
          <Text className="font-quicksand-bold text-[#484A4B] text-xs leading-4 mb-1.5">
            {"\"Lucas did a wonderful job with the Bubble Pop activity today! He completed all turns independently.\""}
          </Text>
          <View className="flex-row items-center gap-1.5 flex-wrap">
            <View className="bg-[#F1F1F1] px-2 py-0.5 rounded-[6px]">
              <Text className="font-fredoka-one text-[#62A9E6] uppercase text-[9px]">
                COUNTING
              </Text>
            </View>
            <Text className="font-quicksand-medium text-[#9CA3AF] text-[10px]">
              by Teacher Sarah
            </Text>
          </View>
        </View>

        {/* Date Completed Badge */}
        <View className="flex-row items-center bg-white border-[2px] border-[#BBE8FB] rounded-[6px] px-2 py-0.5 gap-1 shrink-0">
          <Ionicons name="calendar" size={10} color="#62A9E6" />
          <Text className="font-fredoka-one text-[#62A9E6] uppercase text-[9px]">
            OCT 13
          </Text>
        </View>
      </View>

      {/* Download Result Banner */}
      {isDownloaded && (
        <Animated.View
          entering={FadeIn.duration(200)}
          className="mt-2.5 bg-[#DCFCE7] border border-[#86EFAC] rounded-xl p-2 flex-row items-center gap-2"
        >
          <Feather name="file-text" size={14} color="#15803D" />
          <Text className="font-quicksand-bold text-[#15803D] text-[11px] flex-1">
            Official progress PDF saved! Includes rubric breakdown and teacher notes.
          </Text>
        </Animated.View>
      )}

      {/* Pointer targeting the DOWNLOAD ALL button */}
      <AnimatedPointer startX={25} startY={70} targetX={190} targetY={38} />
    </View>
  );
}

const styles = StyleSheet.create({
  tactileShadow: {
    shadowColor: '#F1F1F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  tactileBlueShadow: {
    shadowColor: '#BBE8FB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
});
