import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { DraxProvider, DraxView } from 'react-native-drax';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { dragDropAssets } from '../utils/assetDictionary';
import { generateDynamicActivityData } from '../utils/shuffler';
import { playCorrectSound } from '@/src/utils/sound';

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

const MATCHING_GUIDING_MESSAGES = [
    "Not quite! Try dragging it to its matching color!",
    "Give it another go! Find the corresponding color!",
    "Almost! Check the color of this item and try again!",
    "Let's try again! Can you find the matching color target?",
];

const COLOR_THEME_MAP: Record<string, { bg: string; border: string; font: string; circle: string }> = {
    Red: {
        bg: '#FFDBD4',
        border: '#FF8870',
        font: '#FF8870',
        circle: '#FF8870',
    },
    Green: {
        bg: '#CBFAC4',
        border: '#179D33',
        font: '#179D33',
        circle: '#179D33',
    },
    Blue: {
        bg: '#BBE8FB',
        border: '#62A9E6',
        font: '#62A9E6',
        circle: '#62A9E6',
    },
    Yellow: {
        bg: '#FFF3C4',
        border: '#FFAE02',
        font: '#FFAE02',
        circle: '#FFAE02',
    },
};

export default function DragDropActivity({ contentData, onComplete, onFeedback, onIncorrectAttempt }: DynamicActivityProps) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    // Store the active runtime layout pairs
    const [activityLayout, setActivityLayout] = useState<{ items: any[]; targets: any[] } | null>(null);
    const [placedItems, setPlacedItems] = useState<Record<string, boolean>>({});
    const [incorrectTrigger, setIncorrectTrigger] = useState<{ type: string; timestamp: number } | null>(null);

    const mistakesRef = useRef(0);
    const lastMessageIndexRef = useRef<number>(-1);

    const startTimeRef = useRef<number>(Date.now());
    const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const getNextGuidingMessage = () => {
        let nextIdx = Math.floor(Math.random() * MATCHING_GUIDING_MESSAGES.length);
        if (nextIdx === lastMessageIndexRef.current) {
            nextIdx = (nextIdx + 1) % MATCHING_GUIDING_MESSAGES.length;
        }
        lastMessageIndexRef.current = nextIdx;
        return MATCHING_GUIDING_MESSAGES[nextIdx];
    };

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

        if (layoutMix.instruction) {
            onFeedback?.(layoutMix.instruction);
        }
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
            playCorrectSound();
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

            // Call feedback bridge with gentle shuffled guiding message
            onFeedback?.(getNextGuidingMessage());

            // Set timeout to revert the message after 3.5 seconds
            feedbackTimeoutRef.current = setTimeout(() => {
                onFeedback?.(activityLayout.instruction || contentData.instruction || "Let's play!");
            }, 3500);
        }
    };

    if (!activityLayout) return null;

    if (!activityLayout) return null;

    const itemCount = activityLayout.targets.length;
    const cardSizes = getDynamicCardSizes(itemCount, isTablet);

    return (
        <DraxProvider>
            <View style={styles.container}>
                {/* COMPONENT DRAGGABLE SOURCE TRAY */}
                <View style={[styles.row, { gap: cardSizes.gap }]}>
                    {activityLayout.items.map((item) => {
                        const isPlaced = placedItems[item.type];

                        if (isPlaced) {
                            return (
                                <View
                                    key={`space-${item.id}`}
                                    style={{
                                        width: cardSizes.cardSize,
                                        height: cardSizes.cardSize,
                                    }}
                                />
                            );
                        }

                        return (
                            <DraggableItem
                                key={`drag-${item.id}`}
                                item={item}
                                incorrectTrigger={incorrectTrigger}
                                cardSizes={cardSizes}
                            />
                        );
                    })}
                </View>

                {/* RECEPTIVE CUTOUT TARGETS */}
                <View style={[styles.row, { gap: cardSizes.gap }]}>
                    {activityLayout.targets.map((target) => {
                        const isPlaced = placedItems[target.type];
                        const theme = COLOR_THEME_MAP[target.type] || {
                            bg: '#F3F4F6',
                            border: '#E5E7EB',
                            font: '#535B74',
                            circle: target.color || '#9CA3AF',
                        };

                        return (
                            <DraxView
                                key={`target-${target.id}`}
                                style={[
                                    styles.receiverCard,
                                    {
                                        width: cardSizes.cardSize,
                                        height: cardSizes.cardSize,
                                        borderRadius: cardSizes.borderRadius,
                                        backgroundColor: theme.bg,
                                        borderColor: theme.border,
                                        borderBottomColor: theme.border,
                                        borderBottomWidth: isPlaced ? 2 : cardSizes.borderBottomWidth,
                                        borderStyle: isPlaced ? 'solid' : 'dashed',
                                    },
                                ]}
                                receivingStyle={styles.receivingActive}
                                onReceiveDragDrop={(event) => {
                                    const payload = event.dragged.payload as string;
                                    handleDrop(payload, target.type);
                                }}
                            >
                                {target.imageSource ? (
                                    isPlaced ? (
                                        <Image
                                            key={`filled-${target.id}`}
                                            source={target.imageSource}
                                            style={{
                                                width: cardSizes.imageSize,
                                                height: cardSizes.imageSize,
                                                resizeMode: 'contain',
                                            }}
                                        />
                                    ) : (
                                        <Image
                                            key={`silhouette-${target.id}`}
                                            source={target.imageSource}
                                            style={[
                                                {
                                                    width: cardSizes.imageSize,
                                                    height: cardSizes.imageSize,
                                                    resizeMode: 'contain',
                                                },
                                                styles.silhouetteMask
                                            ]}
                                        />
                                    )
                                ) : (
                                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                        <View style={{
                                            width: cardSizes.circleSize,
                                            height: cardSizes.circleSize,
                                            borderRadius: 999,
                                            backgroundColor: isPlaced ? theme.border : theme.circle,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}>
                                            {isPlaced && (
                                                <Text style={{ color: '#FFFFFF', fontSize: cardSizes.checkFontSize, fontWeight: 'bold' }}>✓</Text>
                                            )}
                                        </View>
                                        <Text
                                            style={{
                                                fontFamily: 'FredokaOne_400Regular',
                                                color: theme.font,
                                                fontSize: cardSizes.labelFontSize,
                                                marginTop: 4,
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase',
                                                letterSpacing: 0.5,
                                            }}
                                        >
                                            {target.type}
                                        </Text>
                                    </View>
                                )}
                            </DraxView>
                        );
                    })}
                </View>
            </View>
        </DraxProvider>
    );
}

function getDynamicCardSizes(count: number, isTablet: boolean) {
    if (isTablet) {
        if (count >= 5) {
            return {
                cardSize: 125,
                imageSize: 90,
                gap: 16,
                circleSize: 46,
                checkFontSize: 22,
                labelFontSize: 13,
                borderRadius: 22,
                borderBottomWidth: 6,
            };
        }
        if (count === 4) {
            return {
                cardSize: 140,
                imageSize: 105,
                gap: 20,
                circleSize: 52,
                checkFontSize: 24,
                labelFontSize: 14,
                borderRadius: 26,
                borderBottomWidth: 6,
            };
        }
        return {
            cardSize: 155,
            imageSize: 120,
            gap: 24,
            circleSize: 56,
            checkFontSize: 24,
            labelFontSize: 14,
            borderRadius: 28,
            borderBottomWidth: 6,
        };
    }

    // Mobile sizing - Spacious cards with generous gaps
    if (count >= 5) {
        return {
            cardSize: 84,
            imageSize: 58,
            gap: 10,
            circleSize: 32,
            checkFontSize: 15,
            labelFontSize: 9.5,
            borderRadius: 18,
            borderBottomWidth: 4,
        };
    }
    if (count === 4) {
        return {
            cardSize: 92,
            imageSize: 64,
            gap: 12,
            circleSize: 36,
            checkFontSize: 17,
            labelFontSize: 10.5,
            borderRadius: 18,
            borderBottomWidth: 4,
        };
    }
    return {
        cardSize: 100,
        imageSize: 72,
        gap: 14,
        circleSize: 38,
        checkFontSize: 18,
        labelFontSize: 11,
        borderRadius: 20,
        borderBottomWidth: 4,
    };
}

function DraggableItem({
    item,
    incorrectTrigger,
    cardSizes,
}: {
    item: any;
    incorrectTrigger: { type: string; timestamp: number } | null;
    cardSizes: any;
}) {
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
                style={[
                    styles.draggableCard,
                    {
                        width: cardSizes.cardSize,
                        height: cardSizes.cardSize,
                        borderRadius: cardSizes.borderRadius,
                        borderBottomWidth: cardSizes.borderBottomWidth,
                    }
                ]}
                draggingStyle={styles.dragging}
                dragReleasedStyle={styles.dragging}
                dragPayload={item.type}
                longPressDelay={0}
            >
                {item.imageSource ? (
                    <Image
                        source={item.imageSource}
                        style={{
                            width: cardSizes.imageSize,
                            height: cardSizes.imageSize,
                            resizeMode: 'contain',
                        }}
                    />
                ) : (
                    <View style={{
                        width: cardSizes.imageSize,
                        height: cardSizes.imageSize,
                        borderRadius: 999,
                        backgroundColor: item.color,
                    }} />
                )}
            </DraxView>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'space-evenly', width: '100%' },
    row: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%', flexWrap: 'wrap' },
    draggableCard: { backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#E2E8F0', borderBottomColor: '#CBD5E1' },
    silhouetteMask: { tintColor: '#9CA3AF', opacity: 0.6 },
    dragging: { opacity: 0.15 },
    receiverCard: { justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
    receivingActive: { opacity: 0.7, transform: [{ scale: 1.04 }] },
});