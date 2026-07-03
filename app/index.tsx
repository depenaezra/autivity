import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  return (
    // body
    <View className="flex-1 flex-col items-center gap-[49px] bg-[#F5F7FA]">
      {/* image */}
      <Image
        source={require("../assets/images/header.png")}
        className="w-full aspect-[834/506]"
        contentFit="contain"
      />

      <View className="flex pl-[94px] pr-[94px] py-[0] flex-col items-center gap-[154px] self-stretch">
        {/* title + subtitle */}
        <View className="flex flex-col items-center gap-[8px] self-stretch">
          <Text className="self-stretch text-[#4B5161] text-center text-[60px] font-fredoka-one leading-[normal]">
            Welcome to Autivity!
          </Text>
          <Text className="self-stretch text-[#4B5161] text-center text-[32px] font-quicksand-medium leading-[normal]">
            The right education just for you
          </Text>
        </View>

        <View className="flex flex-col items-start gap-[32px] self-stretch">
          {/* agreement section */}
          <View className="flex-row items-start gap-[35px] self-stretch">
            <MaterialCommunityIcons
              name="checkbox-blank-outline"
              size={26}
              color="#4B5161"
            />

            <Text className="text-[#4B5161] text-[20px] font-quicksand-medium leading-[normal]">
              I agree to Autivity's{" "}
              <Text className="text-[#62A9E6] underline">
                Terms and Conditions
              </Text>{" "}
              and acknowledge the{" "}
              <Text className="text-[#62A9E6] underline">Privacy Policy</Text>.
            </Text>
          </View>

          {/* button 1 */}
          <TouchableOpacity
            activeOpacity={0.8}
            className="flex-row h-[84px] p-[10px] justify-center items-center gap-[10px] self-stretch rounded-[55px] bg-[#62A9E6] border-b-[4px] border-[#5298D4]"
            onPress={() => navigation.navigate("user")} // change to onboard 1 later
          >
            <Text className="text-[#F5F7FA] text-center text-[28px] font-fredoka leading-[normal]">
              Get started
            </Text>
          </TouchableOpacity>

          {/* button 2 */}
          <TouchableOpacity
            activeOpacity={0.8}
            className="flex h-[84px] p-[10px] justify-center items-center gap-[10px] self-stretch rounded-[55px] bg-[#FEF7F7] border-b-[4px] border-[#D5D0D2]"
          >
            <Text className="text-[#4B5161] text-center text-[28px] font-fredoka leading-[normal]">
              I already have an account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({});
