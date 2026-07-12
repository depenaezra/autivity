import ActivityRenderer from '@/components/activity-renderer';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

// 1. Import the real tracing data you just built!
import { ShapeActivities } from '@/activities/tracing';

// 2. Define the mock "Database Response" right here
const currentActivityData = {
    id: "lesson-1-task-1",
    type: "tracing", // The magic string the Renderer looks for
    data: ShapeActivities.traceCross // Passing in your actual Cross shape!
};

export default function LessonScreen() {
    // Now TypeScript knows exactly what currentActivityData is!
    const [currentTask, setCurrentTask] = useState(currentActivityData);
    const [isTaskDone, setIsTaskDone] = useState(false);

    const handleTaskComplete = () => {
        setIsTaskDone(true); // Turns the check button green!
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>

            {/* TOP WRAPPER: Progress Bar & Exit Button */}
            <View className="h-20 flex-row items-center px-4 pt-10">
                <Text className="font-bold text-gray-400">X</Text>
                <View className="flex-1 h-4 bg-gray-200 ml-4 rounded-full">
                    {/* Green progress fill goes here later */}
                </View>
            </View>

            {/* THE MIDDLE: The Dynamic Activity */}
            <View style={{ flex: 1 }}>
                <ActivityRenderer
                    activity={currentTask}
                    onComplete={handleTaskComplete}
                />
            </View>

            {/* BOTTOM WRAPPER: The "Next" Button */}
            <View className="p-6 border-t border-gray-200">
                <Pressable
                    disabled={!isTaskDone}
                    // ADD THIS: Route the user back to the teacher/student dashboard
                    onPress={() => router.back()}
                    className={`h-14 rounded-full justify-center items-center ${isTaskDone ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                >
                    <Text className="text-white font-bold text-lg">CHECK</Text>
                </Pressable>
            </View>

        </View>
    );
}