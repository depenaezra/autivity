import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DraxProvider, DraxView } from 'react-native-drax';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { dragDropAssets } from '../utils/assetDictionary';
import { generateDynamicActivityData } from '../utils/shuffler';

interface DynamicActivityProps {
    contentData: {
        item_count: number;
        instruction?: string;
        pool: Array<{ id: string; type: string; asset_key: string; color: string }>;
    };
    onComplete?: (score: number, timeSpent: number, mistakes: number) => void;
    onFeedback?: (message: string) => void;
    onIncorrectAttempt?: () => void;
}

export default function DragDropActivity({ contentData, onComplete, onFeedback, onIncorrectAttempt }: DynamicActivityProps) {
    // Store the active runtime layout pairs
    const [activityLayout, setActivityLayout] = useState<{ items: any[]; targets: any[] } | null>(null);
    const [placedItems, setPlacedItems] = useState<Record<string, boolean>>({});
    const [incorrectTrigger, setIncorrectTrigger] = useState<{ type: string; timestamp: number } | null>(null);

    const mistakesRef = useRef(0);

    const startTimeRef = useRef<number>(Date.now());
    const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Setup/Reset a unique randomized puzzle configuration mix
    const initializeActivityMix = () => {
        if (!contentData?.pool) return;

        const layoutMix = generateDynamicActivityData(
            contentData.pool,
            contentData.item_count || 3,
            dragDropAssets
        );

        setActivityLayout(layoutMix);
        setPlacedItems({});
        mistakesRef.current = 0;
        startTimeRef.current = Date.now();
    };

    useEffect(() => {
        initializeActivityMix();
        return () => {
            if (feedbackTimeoutRef.current) {
                clearTimeout(feedbackTimeoutRef.current);
            }
        };
    }, [contentData]);

    const handleDrop = (draggedType: string, targetType: string) => {
        if (!activityLayout) return;

        if (draggedType === targetType) {
            const newPlacedItems = { ...placedItems, [draggedType]: true };
            setPlacedItems(newPlacedItems);

            // Verification rules evaluate against active runtime layout length
            if (Object.keys(newPlacedItems).length === activityLayout.targets.length) {
                if (onComplete) {
                    const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
                    const score = 15; // Each completed drag-drop activity awards 15 stars
                    onComplete(score, durationSeconds, mistakesRef.current);
                }
            }
        } else {
            setIncorrectTrigger({ type: draggedType, timestamp: Date.now() });
            mistakesRef.current += 1;

            onIncorrectAttempt?.();

            // Cancel any pending revert timeout
            if (feedbackTimeoutRef.current) {
                clearTimeout(feedbackTimeoutRef.current);
            }

            // Call feedback bridge with error message
            onFeedback?.("That is not the correct fruit! Try again.");

            // Set timeout to revert the message after 3.5 seconds
            feedbackTimeoutRef.current = setTimeout(() => {
                onFeedback?.(contentData.instruction || "Let's play!");
            }, 3500);
        }
    };

    if (!activityLayout) return null;

    const isComplete = Object.keys(placedItems).length === activityLayout.targets.length;

    return (
        <DraxProvider>
            <View style={styles.container}>
                {/* COMPONENT DRAGGABLE SOURCE TRAY */}
                <View style={styles.row}>
                    {activityLayout.items.map((item) => {
                        const isPlaced = placedItems[item.type];

                        if (isPlaced) {
                            return <View key={`space-${item.id}`} style={styles.placeholderSpace} />;
                        }

                        return (
                            <DraggableItem
                                key={`drag-${item.id}`}
                                item={item}
                                incorrectTrigger={incorrectTrigger}
                            />
                        );
                    })}
                </View>

                {/* RECEPTIVE CUTOUT TARGETS */}
                <View style={styles.row}>
                    {activityLayout.targets.map((target) => {
                        const isPlaced = placedItems[target.type];

                        return (
                            <DraxView
                                key={`target-${target.id}`}
                                style={[
                                    styles.receiverBox,
                                    isPlaced && styles.receiverPlaced
                                ]}
                                receivingStyle={styles.receivingActive}
                                onReceiveDragDrop={(event) => {
                                    const payload = event.dragged.payload as string;
                                    handleDrop(payload, target.type);
                                }}
                            >
                                {isPlaced ? (
                                    <Image
                                        key={`filled-${target.id}`}
                                        source={target.imageSource}
                                        style={styles.fruitImage}
                                    />
                                ) : (
                                    <Image
                                        key={`silhouette-${target.id}`}
                                        source={target.imageSource}
                                        style={[styles.fruitImage, styles.silhouetteMask]}
                                    />
                                )}
                            </DraxView>
                        );
                    })}
                </View>
            </View>
        </DraxProvider>
    );
}

function DraggableItem({ item, incorrectTrigger }: { item: any, incorrectTrigger: { type: string, timestamp: number } | null }) {
    const shakeOffset = useSharedValue(0);

    useEffect(() => {
        if (incorrectTrigger && incorrectTrigger.type === item.type) {
            shakeOffset.value = withSequence(
                withTiming(-10, { duration: 60 }),
                withTiming(10, { duration: 60 }),
                withTiming(-10, { duration: 60 }),
                withTiming(10, { duration: 60 }),
                withTiming(-5, { duration: 60 }),
                withTiming(5, { duration: 60 }),
                withTiming(0, { duration: 60 })
            );
        }
    }, [incorrectTrigger, item.type, shakeOffset]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: shakeOffset.value }],
        };
    });

    return (
        <Animated.View style={animatedStyle}>
            <DraxView
                style={[styles.draggableCard, { borderColor: item.color }]}
                draggingStyle={styles.dragging}
                dragReleasedStyle={styles.dragging}
                dragPayload={item.type}
                longPressDelay={0}
            >
                <Image source={item.imageSource} style={styles.fruitImage} />
            </DraxView>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'space-evenly', width: '100%' },
    row: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: 12 },
    draggableCard: { width: 100, height: 100, borderRadius: 20, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
    placeholderSpace: { width: 100, height: 100 },
    fruitImage: { width: 76, height: 76, borderRadius: 12, resizeMode: 'contain' },
    silhouetteMask: { tintColor: '#9CA3AF', opacity: 0.6 },
    dragging: { opacity: 0.15 },
    receiverBox: { width: 110, height: 110, backgroundColor: '#F3F4F6', borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#D1D5DB', borderStyle: 'dashed' },
    receivingActive: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF', borderStyle: 'solid' },
    receiverPlaced: { backgroundColor: 'transparent', borderColor: 'transparent', borderStyle: 'solid' },
});