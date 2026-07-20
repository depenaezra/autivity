/**
 * Modern Fisher-Yates array shuffling algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * Dynamic selector that picks N random elements from a pool,
 * then generates separated, fully-shuffled item and target configurations.
 */
export function generateDynamicActivityData(pool: any[], itemCount: number, assetDictionary: Record<string, any>) {
    // 1. Pick N unique items randomly from our pool
    const randomizedPool = shuffleArray(pool);
    const selectedSubset = randomizedPool.slice(0, Math.min(itemCount, pool.length));

    // 2. Map items with resolved static require pointers
    const finalItems = selectedSubset.map(item => ({
        id: `${item.id}-item`,
        type: item.type,
        imageSource: assetDictionary[item.asset_key],
        color: item.color
    }));

    // 3. Map targets with resolved static require pointers
    const finalTargets = selectedSubset.map(item => ({
        id: `${item.id}-target`,
        type: item.type,
        imageSource: assetDictionary[item.asset_key],
        color: item.color
    }));

    // 4. Shuffle both lists completely independently so the top tray sequence 
    // never mirrors the bottom silhouette sequence!
    return {
        items: shuffleArray(finalItems),
        targets: shuffleArray(finalTargets)
    };
}