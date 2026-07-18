import { supabase } from '@/src/lib/supabase';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DraxProvider, DraxView } from 'react-native-drax';

// 1. Strict Local Asset Map Dictionary (No fallbacks)
const dragDropAssets: Record<string, any> = {
    apple_icon: require('../assets/images/activities/drag-drop/apple.png'),
    banana_icon: require('../assets/images/activities/drag-drop/banana.png'),
    orange_icon: require('../assets/images/activities/drag-drop/orange.png'),
    strawberry_icon: require('../assets/images/activities/drag-drop/strawberry.png'),
    grapes_icon: require('../assets/images/activities/drag-drop/grape.png'),
};

// 2. Automated Selection Utilities
function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function generateAutomatedActivityData(pool: any[], assets: Record<string, any>) {
    // Randomly select a layout size from 1 to 3 pairs for this specific round
    const randomCount = Math.floor(Math.random() * 3) + 1;

    // Shuffle the pool of entries to guarantee zero duplicates when we slice
    const randomizedPool = shuffleArray(pool);
    const selectedSubset = randomizedPool.slice(0, Math.min(randomCount, pool.length));

    // Directly map entries to their precise matching local asset file
    const finalItems = selectedSubset.map(item => ({
        id: `${item.id}-item`,
        type: item.type,
        imageSource: assets[item.asset_key],
        color: item.color
    }));

    const finalTargets = selectedSubset.map(item => ({
        id: `${item.id}-target`,
        type: item.type,
        imageSource: assets[item.asset_key],
        color: item.color
    }));

    return {
        items: shuffleArray(finalItems),    // Tray array shuffled completely
        targets: shuffleArray(finalTargets)  // Target array shuffled completely independently
    };
}

export default function DragDropDemoScreen() {
    const [dbPoolData, setDbPoolData] = useState<any[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Runtime Level Variables
    const [activityLayout, setActivityLayout] = useState<{ items: any[]; targets: any[] } | null>(null);
    const [placedItems, setPlacedItems] = useState<Record<string, boolean>>({});
    const startTimeRef = useRef<number>(Date.now());

    // Download your exact live library data pool on initial screen mount
    useEffect(() => {
        const fetchPoolFromDatabase = async () => {
            try {
                const { data, error } = await supabase
                    .from('activities')
                    .select('content_data')
                    .eq('path', 'activity/drag-drop/matching/fruits-3')
                    .single();

                if (error) throw error;

                if (data?.content_data?.pool) {
                    setDbPoolData(data.content_data.pool);
                    initializeAutomatedMix(data.content_data.pool);
                }
            } catch (err) {
                console.error("Database fetch failed:", err);
                Alert.alert("Database Error", "Could not fetch rows from your activities table.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPoolFromDatabase();
    }, []);

    const initializeAutomatedMix = (activePool: any[] = dbPoolData || []) => {
        if (!activePool || activePool.length === 0) return;

        // Generates a fully customized game layout (1, 2, or 3 random objects)
        const dynamicMix = generateAutomatedActivityData(activePool, dragDropAssets);

        setActivityLayout(dynamicMix);
        setPlacedItems({});
        startTimeRef.current = Date.now();
    };

    const handleDrop = (draggedType: string, targetType: string) => {
        if (!activityLayout) return;

        if (draggedType === targetType) {
            const newPlacedItems = { ...placedItems, [draggedType]: true };
            setPlacedItems(newPlacedItems);

            if (Object.keys(newPlacedItems).length === activityLayout.targets.length) {
                const totalSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
                console.log(`Automated set completed in ${totalSeconds} seconds.`);
            }
        } else {
            Alert.alert('Try Again!', `That fruit doesn't match this silhouette shape!`);
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={{ textAlign: 'center', marginTop: 12 }}>Connecting to activities table...</Text>
            </View>
        );
    }

    if (!activityLayout) return null;

    const isComplete = Object.keys(placedItems).length === activityLayout.targets.length;

    return (
        <DraxProvider>
            <View style={styles.container}>
                <Text style={styles.title}>Dynamic Pool Automation</Text>
                <Text style={styles.subtitle}>Matching {activityLayout.targets.length} Random Pairs</Text>

                {isComplete ? (
                    <View style={styles.completionContainer}>
                        <Text style={styles.completionText}>🎉 Spectacular Matching! 🎉</Text>
                        <TouchableOpacity style={styles.resetButton} onPress={() => initializeAutomatedMix()}>
                            <Text style={styles.resetButtonText}>Play Next Mix! 🔄</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {/* ITEM SELECTION TRAY */}
                        <View style={styles.row}>
                            {activityLayout.items.map((item) => {
                                const isPlaced = placedItems[item.type];

                                if (isPlaced) {
                                    return <View key={`space-${item.id}`} style={styles.placeholderSpace} />;
                                }

                                return (
                                    <DraxView
                                        key={`drag-${item.id}`}
                                        style={[styles.draggableCard, { borderColor: item.color }]}
                                        draggingStyle={styles.dragging}
                                        dragReleasedStyle={styles.dragging}
                                        dragPayload={item.type}
                                        longPressDelay={0}
                                    >
                                        <Image source={item.imageSource} style={styles.fruitImage} />
                                    </DraxView>
                                );
                            })}
                        </View>

                        {/* SILHOUETTE HOLES ZONE */}
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
                    </>
                )}
            </View>
        </DraxProvider>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: '#F9FAFB', justifyContent: 'space-evenly' },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#111827' },
    subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: -20 },
    row: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: 12 },
    draggableCard: { width: 95, height: 95, borderRadius: 20, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
    placeholderSpace: { width: 95, height: 95 },
    fruitImage: { width: 70, height: 70, resizeMode: 'contain' },
    silhouetteMask: { tintColor: '#9CA3AF', opacity: 0.55 },
    dragging: { opacity: 0.15 },
    receiverBox: { width: 105, height: 105, backgroundColor: '#F3F4F6', borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#D1D5DB', borderStyle: 'dashed' },
    receivingActive: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF', borderStyle: 'solid' },
    receiverPlaced: { backgroundColor: 'transparent', borderColor: 'transparent', borderStyle: 'solid' },
    completionContainer: { alignItems: 'center', justifyContent: 'center', padding: 40, backgroundColor: '#FFFFFF', borderRadius: 24, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
    completionText: { fontSize: 22, fontWeight: 'bold', color: '#10B981', marginBottom: 24, textAlign: 'center' },
    resetButton: { backgroundColor: '#3B82F6', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 14 },
    resetButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});