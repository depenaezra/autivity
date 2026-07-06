import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ImageBackground, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Class1Screen() {
    const router = useRouter();
    const [selectedStudent, setSelectedStudent] = React.useState<string | null>(null);

    return (
        <View className="flex-1 bg-[#F9FAFB]">
            {/* HEADER SECTION */}
            <ImageBackground
                source={require('../assets/images/class-screen-frog.png')}
                className="w-full h-[250px] justify-between"
                resizeMode="cover"
            >
                <SafeAreaView className="flex-1 px-8 pt-4">

                    {/* Back Button */}
                    <Pressable
                        onPress={() => router.replace('/(tabs)')}
                        className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-sm"
                    >
                        <Ionicons name="arrow-back" size={24} color="#4B5563" />
                    </Pressable>

                    {/* Text Info */}
                    <View className="mt-4">
                        <View className="bg-white/50 self-start px-3 py-1 rounded-md border border-white mb-3">
                            <Text className="text-[#6B7280] font-bold text-xs uppercase tracking-widest">Level 1</Text>
                        </View>
                        <Text className="text-5xl font-extrabold text-[#4B5563]">Class 1A</Text>
                        <View className="flex-row items-center gap-2 mt-3">
                            <Ionicons name="school" size={16} color="#6B7280" />
                            <Text className="text-[#6B7280] font-medium">4 students</Text>
                        </View>
                    </View>

                </SafeAreaView>
            </ImageBackground>

            {/* CURRENT ACTIVITY SECTION */}
            <View className="px-8 mt-8">
                <Text className="text-2xl font-extrabold text-[#4B5563] mb-4">
                    Current Activity
                </Text>

                {/* Pre-Writing Activities Card */}
                <View className="w-full bg-white p-5 rounded-[20px] border-[2px] border-[#E5E7EB] flex-row items-center">

                    {/* Icon Container */}
                    <View className="w-14 h-14 bg-[#D1FAE5] rounded-full items-center justify-center mr-4">
                        <Ionicons name="pencil" size={24} color="#059669" />
                    </View>

                    {/* Text Content */}
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-[#4B5563]">
                            Pre-Writing Activities
                        </Text>
                        <Text className="text-sm text-[#9CA3AF] mt-1 leading-5">
                            Interactive pre-writing activities to build confidence and writing readiness.
                        </Text>
                    </View>

                </View>
            </View>

            {/* STUDENT GRID SECTION */}
            <View className="px-8 mt-10">
                <View className="flex-row flex-wrap justify-center gap-x-8 gap-y-6">

                    {['Monna', 'Kevin', 'Emman', 'Lisa'].map((name) => (
                        <Pressable
                            key={name}
                            className="items-center w-[40%]"
                            // Logic: if it's already selected, set to null (deselect); otherwise set to name
                            onPress={() => setSelectedStudent(selectedStudent === name ? null : name)}
                        >
                            <View
                                className={`w-28 h-28 rounded-full bg-white border-2 items-center justify-center shadow-sm ${
                                    // Replace with your specific green shade (e.g., #4ADE80)
                                    selectedStudent === name ? 'border-[#4ADE80]' : 'border-[#E5E7EB]'
                                    }`}
                            >
                                <Ionicons
                                    name="person"
                                    size={48}
                                    // Use same color as border
                                    color={selectedStudent === name ? '#4ADE80' : '#D1D5DB'}
                                />
                            </View>
                            <Text className={`mt-3 text-lg font-bold ${selectedStudent === name ? 'text-[#4ADE80]' : 'text-[#4B5563]'
                                }`}>
                                {name}
                            </Text>
                        </Pressable>
                    ))}

                    {/* ADD STUDENT BUTTON */}
                    <Pressable className="items-center w-[40%]">
                        <View className="w-28 h-28 rounded-full bg-[#E5E7EB] border-2 border-dashed border-[#9CA3AF] items-center justify-center">
                            <Ionicons name="add" size={48} color="#6B7280" />
                        </View>
                        <Text className="mt-3 text-lg font-bold text-[#6B7280]">Add Student</Text>
                    </Pressable>

                </View>
            </View>

            {/* START ACTIVITY BUTTON */}
            <View className="px-8 mt-32 mb-10">
                <Pressable
                    className="w-full h-[84px] bg-[#62A9E6] rounded-[55px] flex items-center justify-center border-b-[4px] border-[#5298D4] p-[10px]"
                    onPress={() => {
                        // Your navigation logic here
                        console.log("Starting activity for:", selectedStudent);
                    }}
                >
                    <Text className="text-white text-2xl font-semibold">
                        Start activity
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}