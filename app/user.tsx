import Entypo from "@expo/vector-icons/Entypo";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function User() {
  const navigation = useNavigation<any>();
  // single string --> only one user can be selected at a time
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const handleContinue = () => {
    // Prevent navigation if nothing is selected yet
    if (!selectedUser) {
      console.log("Please select a profile first!");
      return;
    }

    // Route based on the selection
    if (selectedUser === "Parent") {
      navigation.navigate("parent-onboard"); // <-- update with parent onboarding screen
    } else if (selectedUser === "Teacher") {
      navigation.navigate("teacher-onboard");
    }
  };

  // users array
  const users = [
    {
      name: "Parent",
      subtitle: "Monitor your child’s progress and achievements as they go on their journey.",
      image: require('../assets/images/polar-bear.png')
    },
    {
      name: "Teacher",
      subtitle: "Manage classroom activities and learner profiles.",
      image: require('../assets/images/bear.png')
    }
  ];

  return (
    <View className="flex-1 flex-col items-center gap-[49px] bg-[#F5F7FA]">
      {/* back button */}
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
            Who are you?
          </Text>
        </View>

        {/* buttons */}
        <View className="flex w-[613px] flex-col items-center gap-[20px]">
          {/* map through users to generate buttons dynamically */}
          {users.map((user, index) => {

            const isSelected = selectedUser === user.name;

            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                onPress={() => setSelectedUser(user.name)}

                // conditional styling for outer wrapper
                className={`flex-row items-center justify-center self-stretch ${isSelected
                  ? "w-[613px] h-[334px] rounded-[36px] border-[3px] border-b-[7px] border-[#62A9E6] bg-[#E1F4FF]"
                  : "w-[613px] h-[334px] rounded-[36px] border-[3px] border-[#D9D9D9] bg-[#F5F7FA]"
                  }`}
              >
                {/* inner content box */}
                <View className="w-[496px] flex-col items-center gap-[8px]">

                  <Image
                    source={user.image}
                    style={{ width: 168, height: 168, borderRadius: 84 }}
                    className="bg-gray-300"
                    resizeMode="cover"
                  />

                  {/* title */}
                  <Text
                    className={`self-stretch text-center font-fredoka-one text-[40px] ${isSelected ? "text-[#62A9E6]" : "text-[#4B5161]"
                      }`}
                  >
                    {user.name}
                  </Text>

                  {/* subtitle */}
                  <Text
                    className={`self-stretch text-center font-quicksand-medium text-[20px] ${isSelected ? "text-[#62A9E6]" : "text-[#4B5161]"
                      }`}
                  >
                    {user.subtitle}
                  </Text>

                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* continue button */}
        <Pressable
          onPress={handleContinue} // function to handle continue button
          disabled={!selectedUser} // disable button if no user is selected
          className="w-full"
        >
          {({ pressed }) => (
            <View
              className={`flex-row h-[84px] p-[10px] justify-center items-center gap-[10px] self-stretch rounded-[55px] ${!selectedUser
                ? "bg-gray-300 border-b-[4px] border-gray-400" // disabled button styling
                : pressed
                  ? "bg-[#5298D4] border-b-0 translate-y-[4px]" // active pressed button styling
                  : "bg-[#62A9E6] border-b-[4px] border-[#5298D4]" // default active button styling
                }`}
            >
              <Text className="text-[#F5F7FA] text-center text-[28px] font-fredoka leading-[normal]">
                Continue
              </Text>
            </View>
          )}
        </Pressable>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({});