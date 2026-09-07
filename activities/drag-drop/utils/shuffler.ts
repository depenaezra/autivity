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
    let candidatePool = pool;
    let categoryName = 'items';

    const isColorMatching = pool.some(i => ['toys', 'school_supplies', 'clothing', 'household_items'].includes(i.category));

    // 1. If items have category tags, pick ONE category per session so items belong to the same theme!
    // 1. If items have category tags, pick ONE category per session if it has enough items for itemCount!
    const categories = Array.from(new Set(pool.map(i => i.category).filter(Boolean)));
    if (categories.length > 0) {
        const chosenCategory = categories[Math.floor(Math.random() * categories.length)];
        const categorySubset = pool.filter(i => i.category === chosenCategory);
        if (categorySubset.length >= itemCount) {
            candidatePool = categorySubset;
            categoryName = chosenCategory.replace(/_/g, ' ').replace(/-/g, ' ').toLowerCase();
        }
    }

    // 2. Pick N items randomly from candidatePool (preferring distinct types when possible)
    const randomizedPool = shuffleArray(candidatePool);
    
    const uniqueTypeItems: any[] = [];
    const usedTypes = new Set<string>();

    for (const item of randomizedPool) {
        if (!usedTypes.has(item.type)) {
            usedTypes.add(item.type);
            uniqueTypeItems.push(item);
        }
        if (uniqueTypeItems.length >= itemCount) break;
    }

    let selectedSubset: any[];
    if (uniqueTypeItems.length >= itemCount) {
        selectedSubset = uniqueTypeItems;
    } else {
        // If candidate pool has fewer distinct types than itemCount (e.g. 5 items needed but 4 colors exist),
        // take all distinct types first, then fill remaining slots with additional items from randomizedPool
        const remainingNeeded = itemCount - uniqueTypeItems.length;
        const usedIds = new Set(uniqueTypeItems.map(i => i.id));
        const extraItems = randomizedPool.filter(i => !usedIds.has(i.id)).slice(0, remainingNeeded);
        selectedSubset = [...uniqueTypeItems, ...extraItems];
    }

    // Ensure subset length matches itemCount if pool has enough items
    selectedSubset = selectedSubset.slice(0, Math.min(itemCount, candidatePool.length));

    // 3. Map draggable items with unique runtime item IDs
    const finalItems = selectedSubset.map((item, idx) => ({
        id: `${item.id}-item-${idx}`,
        type: item.type,
        imageSource: assetDictionary[item.item_asset_key || item.asset_key],
        color: item.color,
        label: item.label || item.type
    }));

    // 4. Map targets with unique runtime target IDs
    // NOTE: For Color Matching, imageSource is undefined so it renders Color Target Cards (badge + label).
    // For Fruit Matching / Silhouette Matching, imageSource is set to the fruit asset pointer to render silhouettes.
    const finalTargets = selectedSubset.map((item, idx) => ({
        id: `${item.id}-target-${idx}`,
        type: item.type,
        imageSource: isColorMatching 
            ? (item.target_asset_key ? assetDictionary[item.target_asset_key] : undefined)
            : assetDictionary[item.target_asset_key || item.asset_key || item.item_asset_key],
        color: item.color,
        label: item.type
    }));

    const dynamicInstruction = isColorMatching
        ? `What is the color of the ${categoryName}? Drag them to the correct color!`
        : `Drag the fruits to their matching shapes!`;

    // 5. Shuffle both lists completely independently so the top tray sequence 
    // never mirrors the bottom target sequence!
    return {
        categoryName,
        instruction: dynamicInstruction,
        items: shuffleArray(finalItems),
        targets: shuffleArray(finalTargets)
    };
}