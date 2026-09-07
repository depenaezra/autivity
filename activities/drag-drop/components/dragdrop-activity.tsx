import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { DraxProvider, DraxView } from 'react-native-drax';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { dragDropAssets } from '../utils/assetDictionary';
import { generateDynamicActivityData } from '../utils/shuffler';
import { COLOR_MATCHING_POOL } from '../data/matching-colors';
import { playCorrectSound } from '@/src/utils/sound';
import { useActivityHint } from '@/hooks/use-activity-hint';

interface DynamicActivityProps {
    contentData?: {
        item_count?: number;
        instruction?: string;
        pool?: Array<{ id: string; type: string; asset_key: string; color: string; category?: string }>;
    };
    onComplete?: (score: number, timeSpent: number, mistakes: number, hintsUsed?: number) => void;
    onFeedback?: (message: string) => void;
    onIncorrectAttempt?: () => void;
    hintSignal?: number;
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

export default function DragDropActivity({ contentData, onComplete, onFeedback, onIncorrectAttempt, hintSignal }: DynamicActivityProps) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    // Store the active runtime layout pairs
    const [activityLayout, setActivityLayout] = useState<{ items: any[]; targets: any[]; instruction?: string } | null>(null);
    const [placedItemIds, setPlacedItemIds] = useState<Record<string, boolean>>({});
    const [targetMap, setTargetMap] = useState<Record<string, any>>({});
    const [incorrectTrigger, setIncorrectTrigger] = useState<{ itemId: string; timestamp: number } | null>(null);

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

    const { isHintActive, hintLevel, hintsUsed, triggerHint, recordAttempt, resetForNextQuestion } = useActivityHint({
        getClueText: () => {
            if (!activityLayout) return "Drag the items to their matching targets!";
            const firstUnplaced = activityLayout.items.find((item) => !placedItemIds[item.id]);
            if (firstUnplaced) {
                return `Clue: Drag the ${firstUnplaced.type} item to its matching ${firstUnplaced.type} container!`;
            }
            return "Drag the items to their matching targets!";
        },
        onFeedback,
    });

    // Listen to manual hint button from header
    const lastHintSignalRef = useRef(hintSignal);
    useEffect(() => {
        if (hintSignal !== undefined && hintSignal !== lastHintSignalRef.current) {
            lastHintSignalRef.current = hintSignal;
            triggerHint();
        }
    }, [hintSignal, triggerHint]);

    // Setup/Reset a unique randomized puzzle configuration mix
    const initializeActivityMix = () => {
        const pool = contentData?.pool && contentData.pool.length > 0
            ? contentData.pool
            : COLOR_MATCHING_POOL;

        const layoutMix = generateDynamicActivityData(
            pool,
            contentData?.item_count || 3,
            dragDropAssets
        );

        setActivityLayout(layoutMix);
        setPlacedItemIds({});
        setTargetMap({});
        setIncorrectTrigger(null);
        mistakesRef.current = 0;
        startTimeRef.current = Date.now();
        resetForNextQuestion();

        if (layoutMix.instruction) {
            onFeedback?.(layoutMix.instruction);
        }
    };

    const contentDataKey = JSON.stringify(contentData);

    useEffect(() => {
        initializeActivityMix();
        return () => {
            if (feedbackTimeoutRef.current) {
                clearTimeout(feedbackTimeoutRef.current);
            }
        };
    }, [contentDataKey]);

    const handleDrop = (draggedItem: any, target: any) => {
        if (!activityLayout || !draggedItem || !target) return;
        if (targetMap[target.id]) return; // Target slot already filled

        const isCorrect = draggedItem.type === target.type;
        const hintTriggered = recordAttempt(isCorrect);

        if (isCorrect) {
            playCorrectSound();
            const newPlacedItemIds = { ...placedItemIds, [draggedItem.id]: true };
            const newTargetMap = { ...targetMap, [target.id]: draggedItem };
            setPlacedItemIds(newPlacedItemIds);
            setTargetMap(newTargetMap);

            // Revert Activity Bear speech bubble dialogue back to default instructions
            const defaultInstruction = activityLayout.instruction || contentData?.instruction || "Drag the items to their matching targets!";
            onFeedback?.(defaultInstruction);

            // Verification rules evaluate against active runtime layout length
            if (Object.keys(newTargetMap).length === activityLayout.targets.length) {
                if (onComplete) {
                    const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
                    const score = 15; // Each completed drag-drop activity awards 15 stars
                    onComplete(score, durationSeconds, mistakesRef.current, hintsUsed);
                }
            }
        } else {
            setIncorrectTrigger({ itemId: draggedItem.id, timestamp: Date.now() });
            mistakesRef.current += 1;

            onIncorrectAttempt?.();

            // Cancel any pending revert timeout
            if (feedbackTimeoutRef.current) {
                clearTimeout(feedbackTimeoutRef.current);
            }

            // Only set guiding error feedback if a hint was not triggered
            if (!hintTriggered) {
                onFeedback?.(getNextGuidingMessage());

                feedbackTimeoutRef.current = setTimeout(() => {
                    onFeedback?.(activityLayout.instruction || contentData?.instruction || "Let's play!");
                }, 3500);
            }
        }
    };

    if (!activityLayout) return null;

    const itemCount = activityLayout.targets.length;
    const cardSizes = getDynamicCardSizes(itemCount, isTablet);
    const firstUnplaced = activityLayout.items.find((i: any) => !placedItemIds[i.id]);

    return (
        <DraxProvider>
            <View style={styles.container}>
                {/* COMPONENT DRAGGABLE SOURCE TRAY */}
                <View style={[styles.row, { gap: cardSizes.gap }]}>
                    {activityLayout.items.map((item) => {
                        const isPlaced = !!placedItemIds[item.id];
                        const isHintItem = isHintActive && hintLevel === 2 && firstUnplaced?.id === item.id;

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
                                isHintItem={isHintItem}
                            />
                        );
                    })}
                </View>

                {/* RECEPTIVE CUTOUT TARGETS */}
                <View style={[styles.row, { gap: cardSizes.gap }]}>
                    {activityLayout.targets.map((target: any) => {
                        const theme = COLOR_THEME_MAP[target.type] || {
                            bg: '#F5F7FA',
                            border: '#E2E8F0',
                            font: '#64748B',
                            circle: '#CBD5E1',
                        };

                        const placedItem = targetMap[target.id];
                        const isPlaced = !!placedItem;
                        const isHintTarget = isHintActive && hintLevel === 2 && firstUnplaced && !isPlaced && target.type === firstUnplaced.type;

                        return (
                            <DraxView
                                key={target.id}
                                style={[
                                    styles.receiverCard,
                                    {
                                        width: cardSizes.cardSize,
                                        height: cardSizes.cardSize,
                                        borderRadius: cardSizes.borderRadius,
                                        backgroundColor: isHintTarget ? '#FFF3C4' : (isPlaced ? theme.bg : '#FFFFFF'),
                                        borderColor: isHintTarget ? '#FFAE02' : theme.border,
                                        borderBottomColor: isHintTarget ? '#FF9800' : theme.border,
                                        borderBottomWidth: isPlaced ? 2 : cardSizes.borderBottomWidth,
                                        borderStyle: isHintTarget ? 'solid' : (isPlaced ? 'solid' : 'dashed'),
                                        borderWidth: isHintTarget ? 3 : 2,
                                    },
                                ]}
                                receivingStyle={styles.receivingActive}
                                onReceiveDragDrop={(event) => {
                                    const draggedItem = event.dragged.payload;
                                    handleDrop(draggedItem, target);
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
                                        {isPlaced && placedItem?.imageSource ? (
                                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                                <Image
                                                    source={placedItem.imageSource}
                                                    style={{
                                                        width: cardSizes.imageSize * 0.8,
                                                        height: cardSizes.imageSize * 0.8,
                                                        resizeMode: 'contain',
                                                    }}
                                                />
                                                <View style={{
                                                    position: 'absolute',
                                                    top: -4,
                                                    right: -4,
                                                    width: 22,
                                                    height: 22,
                                                    borderRadius: 11,
                                                    backgroundColor: theme.border,
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}>
                                                    <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
                                                </View>
                                            </View>
                                        ) : (
                                            <>
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
                                            </>
                                        )}
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
    isHintItem = false,
}: {
    item: any;
    incorrectTrigger: { itemId: string; timestamp: number } | null;
    cardSizes: any;
    isHintItem?: boolean;
}) {
    const shakeOffset = useSharedValue(0);

    useEffect(() => {
        if (incorrectTrigger && incorrectTrigger.itemId === item.id) {
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
    }, [incorrectTrigger, item.id, shakeOffset]);

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
                        backgroundColor: isHintItem ? '#FFF3C4' : '#FFFFFF',
                        borderColor: isHintItem ? '#FFAE02' : '#E2E8F0',
                        borderBottomColor: isHintItem ? '#FF9800' : '#CBD5E1',
                        borderWidth: isHintItem ? 3 : 2,
                    }
                ]}
                draggingStyle={styles.dragging}
                dragReleasedStyle={styles.dragging}
                dragPayload={item}
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