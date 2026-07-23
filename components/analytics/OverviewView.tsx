import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ClassInfo } from '../../app/(tabs)/analytics';

interface OverviewViewProps {
  classesData: ClassInfo[];
  totalPendingAllClasses: number;
  isTablet: boolean;
  onSelectClass: (classId: string) => void;
}

export default function OverviewView({
  classesData,
  totalPendingAllClasses,
  isTablet,
  onSelectClass,
}: OverviewViewProps) {

  const totalLearners = classesData.reduce(
    (sum, cls) => sum + cls.totalStudents,
    0
  );

  const totalActivities = classesData.reduce(
    (sum, cls) => sum + cls.completedActivities,
    0
  );

  const overallAverage =
    classesData.length > 0
      ? Math.round(
          classesData.reduce((sum, cls) => sum + cls.avgProgress, 0) /
            classesData.length
        )
      : 0;

  return (
    <View className="w-full">

      {/* DASHBOARD CARDS */}

      <View
        className={`${
          isTablet ? 'px-12 mt-7' : 'px-6 mt-5'
        } flex-row flex-wrap justify-between`}
      >

        {/* Progress */}

        <View
          className={`bg-white rounded-[26px] border border-[#E5EEF8] mb-4 ${
            isTablet ? 'w-[48%] p-6' : 'w-[48%] p-4'
          }`}
        >

          <View className="flex-row justify-between items-center">

            <View>

              <Text className="font-quicksand-semibold text-[#8A94A6]">
                Overall Progress
              </Text>

              <Text
                className={`font-fredoka-one text-[#4B5563] ${
                  isTablet ? 'text-5xl' : 'text-3xl'
                }`}
              >
                {overallAverage}%
              </Text>

            </View>

            <View className="w-14 h-14 rounded-full bg-[#EBF6FF] items-center justify-center">

              <Ionicons
                name="stats-chart"
                color="#5FA8E8"
                size={30}
              />

            </View>

          </View>

          <View className="mt-4">

            <View className="h-3 bg-[#EEF2F7] rounded-full overflow-hidden">

              <View
                style={{
                  width: `${overallAverage}%`,
                  backgroundColor: '#62A9E6',
                }}
                className="h-full rounded-full"
              />

            </View>

          </View>

        </View>

        {/* Pending */}

        <View
          className={`bg-white rounded-[26px] border border-[#FFE4CF] mb-4 ${
            isTablet ? 'w-[48%] p-6' : 'w-[48%] p-4'
          }`}
        >

          <View className="flex-row justify-between items-center">

            <View>

              <Text className="font-quicksand-semibold text-[#8A94A6]">
                Pending Reviews
              </Text>

              <Text
                className={`font-fredoka-one text-[#EA580C] ${
                  isTablet ? 'text-5xl' : 'text-3xl'
                }`}
              >
                {totalPendingAllClasses}
              </Text>

            </View>

            <View className="w-14 h-14 rounded-full bg-[#FFF5EC] items-center justify-center">

              <Ionicons
                name="time"
                color="#EA580C"
                size={30}
              />

            </View>

          </View>

          <Text className="mt-3 font-quicksand-medium text-[#A0A7B5]">
            Waiting for teacher validation
          </Text>

        </View>

        {/* Learners */}

        <View
          className={`bg-white rounded-[26px] border border-[#DFF7E8] mb-4 ${
            isTablet ? 'w-[48%] p-6' : 'w-[48%] p-4'
          }`}
        >

          <View className="flex-row justify-between items-center">

            <View>

              <Text className="font-quicksand-semibold text-[#8A94A6]">
                Total Learners
              </Text>

              <Text
                className={`font-fredoka-one text-[#16A34A] ${
                  isTablet ? 'text-5xl' : 'text-3xl'
                }`}
              >
                {totalLearners}
              </Text>

            </View>

            <View className="w-14 h-14 rounded-full bg-[#ECFDF5] items-center justify-center">

              <Ionicons
                name="people"
                color="#16A34A"
                size={30}
              />

            </View>

          </View>

          <Text className="mt-3 font-quicksand-medium text-[#A0A7B5]">
            Across all classes
          </Text>

        </View>

        {/* Activities */}

        <View
          className={`bg-white rounded-[26px] border border-[#E5DDFE] mb-4 ${
            isTablet ? 'w-[48%] p-6' : 'w-[48%] p-4'
          }`}
        >

          <View className="flex-row justify-between items-center">

            <View>

              <Text className="font-quicksand-semibold text-[#8A94A6]">
                Activities
              </Text>

              <Text
                className={`font-fredoka-one text-[#7C3AED] ${
                  isTablet ? 'text-5xl' : 'text-3xl'
                }`}
              >
                {totalActivities}
              </Text>

            </View>

            <View className="w-14 h-14 rounded-full bg-[#F5F3FF] items-center justify-center">

              <MaterialCommunityIcons
                name="clipboard-check"
                color="#7C3AED"
                size={30}
              />

            </View>

          </View>

          <Text className="mt-3 font-quicksand-medium text-[#A0A7B5]">
            Finished learning sessions
          </Text>

        </View>

      </View>

            {/* QUICK INSIGHTS */}

      <View className={isTablet ? "px-12 mt-2" : "px-6 mt-1"}>

        <View className="bg-[#EEF7FF] rounded-[24px] p-5 border border-[#D6ECFF]">

          <View className="flex-row items-center mb-3">

            <Ionicons
              name="bulb"
              size={22}
              color="#F59E0B"
            />

            <Text
              className={`ml-2 font-fredoka-one text-[#4B5563] ${
                isTablet ? "text-2xl" : "text-lg"
              }`}
            >
              Teacher Insights
            </Text>

          </View>

          <Text
            className={`font-quicksand-medium text-[#667085] leading-6 ${
              isTablet ? "text-base" : "text-sm"
            }`}
          >
            {totalPendingAllClasses > 0
              ? `You currently have ${totalPendingAllClasses} learner sessions waiting for validation. Completing feedback will automatically update the Parent Portal.`
              : "Excellent! All learner sessions have already been validated."}
          </Text>

        </View>

      </View>

      {/* CLASS OVERVIEW */}

      <View className={isTablet ? "px-12 mt-8" : "px-6 mt-6"}>

        <View className="flex-row justify-between items-center mb-5">

          <View>

            <Text
              className={`font-fredoka-one text-[#4B5563] ${
                isTablet ? "text-3xl" : "text-xl"
              }`}
            >
              Your Classes
            </Text>

            <Text
              className={`font-quicksand-medium text-[#98A2B3] ${
                isTablet ? "text-base" : "text-xs"
              }`}
            >
              Tap any class to inspect learners
            </Text>

          </View>

          <View className="bg-[#F5F8FC] rounded-full px-4 py-2">

            <Text
              className={`font-quicksand-bold text-[#5FA8E8] ${
                isTablet ? "text-base" : "text-xs"
              }`}
            >
              {classesData.length} Classes
            </Text>

          </View>

        </View>

        {classesData.map((cls) => (

<TouchableOpacity
key={cls.id}
activeOpacity={0.92}
onPress={() => onSelectClass(cls.id)}
className="bg-white rounded-[28px] mb-5 overflow-hidden shadow-sm"
>

<View
className="px-5 py-5"
style={{ backgroundColor: cls.lightBg }}
>

<View className="flex-row justify-between">

<View className="flex-1">

<View className="flex-row items-center">

<Text
className={`font-fredoka-one text-[#4B5563] ${
isTablet ? "text-3xl" : "text-xl"
}`}
>
{cls.name}
</Text>

{cls.pendingFeedback > 0 && (

<View className="ml-2 bg-[#EF4444] rounded-full px-3 py-1">

<Text className="font-quicksand-bold text-white text-[11px]">

{cls.pendingFeedback} Pending

</Text>

</View>

)}

</View>

<Text
className={`mt-1 font-quicksand-medium text-[#7B8794] ${
isTablet ? "text-base" : "text-xs"
}`}
>

{cls.level}

</Text>

</View>

<View
className="w-14 h-14 rounded-full items-center justify-center"
style={{ backgroundColor: cls.themeColor }}
>

<Ionicons
name="school"
size={26}
color="#ffffff"
/>

</View>

</View>

<View className="mt-5">

<View className="flex-row justify-between mb-2">

<Text className="font-quicksand-semibold text-[#667085]">

Average Progress

</Text>

<Text className="font-quicksand-bold text-[#4B5563]">

{cls.avgProgress}%

</Text>

</View>

<View className="h-3 rounded-full bg-white overflow-hidden">

<View

style={{
width: `${cls.avgProgress}%`,
backgroundColor: cls.shadowColor,
}}

className="h-full rounded-full"

/>

</View>

</View>

</View>

<View className="px-5 py-5">

<View className="flex-row justify-between">

<View className="items-center flex-1">

<Text
className={`font-fredoka-one text-[#5FA8E8] ${
isTablet ? "text-3xl" : "text-2xl"
}`}
>

{cls.totalStudents}

</Text>

<Text className="font-quicksand-semibold text-[#98A2B3]">

Learners

</Text>

</View>

<View className="items-center flex-1">

<Text
className={`font-fredoka-one text-[#16A34A] ${
isTablet ? "text-3xl" : "text-2xl"
}`}
>

{cls.completedActivities}

</Text>

<Text className="font-quicksand-semibold text-[#98A2B3]">

Activities

</Text>

</View>

<View className="items-center flex-1">

<Text
className={`font-fredoka-one text-[#EA580C] ${
isTablet ? "text-3xl" : "text-2xl"
}`}
>

{cls.pendingFeedback}

</Text>

<Text className="font-quicksand-semibold text-[#98A2B3]">

Pending

</Text>

</View>

</View>

<TouchableOpacity

onPress={() => onSelectClass(cls.id)}

activeOpacity={0.85}

className="mt-5 bg-[#62A9E6] rounded-2xl py-4 flex-row justify-center items-center"

>

<Text
className={`font-quicksand-bold text-white ${
isTablet ? "text-lg" : "text-base"
}`}
>

Inspect Class

</Text>

<Feather

name="arrow-right"

size={18}

color="white"

style={{ marginLeft: 8 }}

/>

</TouchableOpacity>

</View>

</TouchableOpacity>

))}

        {classesData.length === 0 ? (

          <View className="bg-white rounded-[24px] border border-[#E5E7EB] p-10 items-center justify-center">

            <Ionicons
              name="school-outline"
              size={isTablet ? 80 : 56}
              color="#D1D5DB"
            />

            <Text
              className={`mt-5 font-fredoka-one text-[#6B7280] ${
                isTablet ? "text-2xl" : "text-lg"
              }`}
            >
              No Classes Yet
            </Text>

            <Text
              className={`mt-2 text-center font-quicksand-medium text-[#98A2B3] ${
                isTablet ? "text-base" : "text-sm"
              }`}
            >
              Create your first class to start monitoring learner
              performance and analytics.
            </Text>

          </View>

        ) : (

          <View className="gap-5">

            {classesData.map((cls) => (

              <TouchableOpacity
                key={cls.id}
                activeOpacity={0.92}
                onPress={() => onSelectClass(cls.id)}
                className="bg-white rounded-[30px] overflow-hidden shadow-sm border border-[#EDF2F7]"
              >

                {/* HEADER */}

                <View
                  className="px-6 py-5"
                  style={{ backgroundColor: cls.lightBg }}
                >

                  <View className="flex-row justify-between items-center">

                    <View className="flex-1">

                      <View className="flex-row items-center">

                        <Text
                          className={`font-fredoka-one text-[#4B5563] ${
                            isTablet ? "text-3xl" : "text-xl"
                          }`}
                        >
                          {cls.name}
                        </Text>

                        {cls.pendingFeedback > 0 && (

                          <View className="ml-3 bg-[#EF4444] rounded-full px-3 py-1">

                            <Text className="font-quicksand-bold text-white text-[11px]">

                              {cls.pendingFeedback} Pending

                            </Text>

                          </View>

                        )}

                      </View>

                      <Text
                        className={`mt-1 font-quicksand-medium text-[#7B8794] ${
                          isTablet ? "text-base" : "text-xs"
                        }`}
                      >
                        {cls.level}
                      </Text>

                    </View>

                    <View
                      className="w-16 h-16 rounded-full items-center justify-center"
                      style={{ backgroundColor: cls.themeColor }}
                    >

                      <Ionicons
                        name="school"
                        size={30}
                        color="white"
                      />

                    </View>

                  </View>

                </View>

                {/* BODY */}

                <View className="px-6 py-5">

                  <View className="flex-row justify-between mb-2">

                    <Text className="font-quicksand-semibold text-[#667085]">
                      Class Progress
                    </Text>

                    <Text className="font-quicksand-bold text-[#4B5563]">
                      {cls.avgProgress}%
                    </Text>

                  </View>

                  <View className="h-3 bg-[#EEF2F7] rounded-full overflow-hidden">

                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${cls.avgProgress}%`,
                        backgroundColor: cls.shadowColor,
                      }}
                    />

                  </View>

                  <View className="flex-row justify-between mt-6">

                    <View className="items-center flex-1">

                      <Text
                        className={`font-fredoka-one text-[#5FA8E8] ${
                          isTablet ? "text-3xl" : "text-2xl"
                        }`}
                      >
                        {cls.totalStudents}
                      </Text>

                      <Text className="font-quicksand-semibold text-[#98A2B3]">
                        Learners
                      </Text>

                    </View>

                    <View className="items-center flex-1">

                      <Text
                        className={`font-fredoka-one text-[#22C55E] ${
                          isTablet ? "text-3xl" : "text-2xl"
                        }`}
                      >
                        {cls.completedActivities}
                      </Text>

                      <Text className="font-quicksand-semibold text-[#98A2B3]">
                        Activities
                      </Text>

                    </View>

                    <View className="items-center flex-1">

                      <Text
                        className={`font-fredoka-one text-[#F97316] ${
                          isTablet ? "text-3xl" : "text-2xl"
                        }`}
                      >
                        {cls.pendingFeedback}
                      </Text>

                      <Text className="font-quicksand-semibold text-[#98A2B3]">
                        Pending
                      </Text>

                    </View>

                  </View>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => onSelectClass(cls.id)}
                    className="mt-6 bg-[#62A9E6] rounded-[18px] py-4 flex-row justify-center items-center"
                  >

                    <Text
                      className={`font-quicksand-bold text-white ${
                        isTablet ? "text-lg" : "text-base"
                      }`}
                    >
                      Inspect Class
                    </Text>

                    <Feather
                      name="arrow-right"
                      size={18}
                      color="white"
                      style={{ marginLeft: 8 }}
                    />

                  </TouchableOpacity>

                </View>

              </TouchableOpacity>

            ))}

          </View>

        )}

      </View>

    </View>

  );

}