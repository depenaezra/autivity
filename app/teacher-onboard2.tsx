import { Image } from "expo-image";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";

export default function TeacherOnboard2() {
  const navigation = useNavigation<any>();

  // list of options array
  const goals = [
    "Classroom-ready activities",
    "Monitor student progress",
    "Create personalized lessons",
    "Manage classes",
    "Reports and assessments",
  ];

  // state to keep track of selected goals
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      // if selected, filter it out to deselect it
      setSelectedGoals(selectedGoals.filter((item) => item !== goal));
    } else {
      // if not selected, add to array
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  return (
    <View className="flex-1 flex-col items-center gap-[49px] bg-[#F5F7FA]">
      {/* button */}
      <TouchableOpacity
        activeOpacity={0.8}
        className="flex h-[80px] pt-[56px] pr-[0] pb-[0] pl-[25px] flex-col items-start gap-[10px] self-stretch"
        onPress={() => navigation.navigate("index")}
      >
        <Entypo name="chevron-left" size={38} color="#4B5161" />
      </TouchableOpacity>

      {/* body */}
      <View className="flex w-[667px] flex-col items-center gap-[68px]">
        {/* title */}
        <View className="flex flex-col items-center gap-[8px] self-stretch">
          <Text className="self-stretch text-[#4B5161] text-center font-fredoka-one text-[54px]">
            What would you like to focus on?
          </Text>
          <Text className="self-stretch text-[#4B5161] text-center font-quicksand-medium text-[32px]">
            Choose one or more goals
          </Text>
        </View>

        {/* buttons */}
        <View className="flex w-[660px] flex-col items-start gap-[20px]">
          {/* map through goals to generate buttons dynamically */}
          {goals.map((goal, index) => {
            // check if the current goal exists in selected array
            const isSelected = selectedGoals.includes(goal);

            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                onPress={() => toggleGoal(goal)}

                // conditional styling
                className={`flex-row items-center justify-center gap-[10px] self-stretch ${
                  isSelected
                    ? // active styling
                      "h-[96px] px-[50px] py-[10px] rounded-[60px] border-[3px] border-b-[7px] border-[#62A9E6] bg-[#E1F4FF]"
                    : // default styling
                      "h-[96px] px-[50px] py-[10px] rounded-[60px] border-[3px] border-[solid] border-[#D9D9D9] bg-[#F5F7FA]"
                }`}
              >
                <Text
                  className={`text-[30px] font-quicksand-medium leading-[normal] ${
                    isSelected
                      ? "text-[#62A9E6]" // active text color
                      : "text-[#4B5161]" // default text color
                  }`}
                >
                  {goal}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ADD BUTTON CONTINUE */}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({});
