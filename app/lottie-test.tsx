import React, { useState } from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import DragDropActivity from '@/activities/drag-drop/components/dragdrop-activity';
import { COLOR_MATCHING_POOL } from '@/activities/drag-drop/data/matching-colors';
import ActivityBear from '@/assets/images/activity-bear.svg';

export default function ColorMatchingTestScreen() {
    const [instruction, setInstruction] = useState("Drag the items to their matching colors!");

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FBFBFB' }}>
            {/* Header */}
            <View className="flex-row items-center px-6 pt-4 pb-2">
                <Text className="text-2xl font-fredoka-one text-[#535B74]">Match the Colors</Text>
            </View>

            {/* Bear & Instruction */}
            <View className="flex-row items-center px-6 pb-2">
                <ActivityBear width={130} height={130} />
                <View className="flex-1 ml-3 justify-center bg-[#FCF5F5] border-[1.5px] border-[#EAD5D5] rounded-2xl p-4">
                    <Text className="text-[#6D7179] text-base leading-6 font-quicksand-medium">
                        {instruction}
                    </Text>
                </View>
            </View>

            {/* Main Drag Drop Game Area */}
            <View style={{ flex: 1, paddingHorizontal: 16, paddingBottom: 24 }}>
                <DragDropActivity
                    contentData={{
                        item_count: 3,
                        instruction: "Drag the items to their matching colors!",
                        pool: COLOR_MATCHING_POOL,
                    }}
                    onFeedback={(msg) => setInstruction(msg)}
                    onComplete={(score, time, mistakes) => {
                        setInstruction("Awesome job! You matched all colors! 🎉");
                    }}
                />
            </View>
        </SafeAreaView>
    );
}