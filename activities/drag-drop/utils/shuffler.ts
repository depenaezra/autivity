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

    const isColorMatching = pool.some(i => ['toys', 'school_supplies', 'clothing', 'household_items'].includes(i.category) && ['Red', 'Green', 'Blue', 'Yellow', 'Purple'].includes(i.type));
    const isCategoryMatching = pool.some(i => (typeof i.id === 'string' && i.id.startsWith('cat-')) || ['Animal', 'Vehicle', 'Fruit', 'School Supply', 'Clothing'].includes(i.type));
    const isAnimalMatching = pool.some(i => (typeof i.id === 'string' && i.id.startsWith('animal-')) || (i.category === 'animals' && !isCategoryMatching));
    const isFruitMatching = pool.some(i => (typeof i.id === 'string' && i.id.startsWith('fruit-')));

    // 1. If items have category tags (and not category-sorting mode), pick ONE category per session if it has enough items
    if (!isCategoryMatching) {
        const categories = Array.from(new Set(pool.map(i => i.category).filter(Boolean)));
        if (categories.length > 0) {
            const chosenCategory = categories[Math.floor(Math.random() * categories.length)];
            const categorySubset = pool.filter(i => i.category === chosenCategory);
            if (categorySubset.length >= itemCount) {
                candidatePool = categorySubset;
                categoryName = chosenCategory.replace(/_/g, ' ').replace(/-/g, ' ').toLowerCase();
            }
        }
    }

    // 2. Pick N items randomly from candidatePool (ensuring equal representation of available types)
    const randomizedPool = shuffleArray(candidatePool);
    const availableTypes = shuffleArray(Array.from(new Set<string>(candidatePool.map(i => i.type))));
    const uniqueTypeItems: any[] = [];

    for (const type of availableTypes) {
        const matchingItems = candidatePool.filter(i => i.type === type);
        if (matchingItems.length > 0) {
            const randomItem = matchingItems[Math.floor(Math.random() * matchingItems.length)];
            uniqueTypeItems.push(randomItem);
        }
        if (uniqueTypeItems.length >= itemCount) break;
    }

    let selectedSubset: any[];
    if (uniqueTypeItems.length >= itemCount) {
        selectedSubset = uniqueTypeItems;
    } else {
        const remainingNeeded = itemCount - uniqueTypeItems.length;
        const usedIds = new Set(uniqueTypeItems.map(i => i.id));
        const extraItems = randomizedPool.filter((i: any) => !usedIds.has(i.id)).slice(0, remainingNeeded);
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
    // NOTE: For Color & Category Matching, imageSource is undefined so it renders Label/Badge Target Cards.
    // For Fruit & Animal Silhouette Matching, imageSource renders silhouettes.
    const finalTargets = selectedSubset.map((item, idx) => ({
        id: `${item.id}-target-${idx}`,
        type: item.type,
        imageSource: (isColorMatching || isCategoryMatching)
            ? (item.target_asset_key ? assetDictionary[item.target_asset_key] : undefined)
            : assetDictionary[item.target_asset_key || item.asset_key || item.item_asset_key],
        color: item.color,
        label: item.type
    }));

    let dynamicInstruction = 'Drag the items to their matching targets!';
    if (isCategoryMatching) {
        dynamicInstruction = 'Drag the items to their matching category containers!';
    } else if (isAnimalMatching) {
        dynamicInstruction = 'Drag the animals to their matching shapes!';
    } else if (isFruitMatching) {
        dynamicInstruction = 'Drag the fruits to their matching shapes!';
    } else if (isColorMatching) {
        dynamicInstruction = `What is the color of the ${categoryName}? Drag them to the correct color!`;
    }

    // 5. Shuffle both lists completely independently so the top tray sequence 
    // never mirrors the bottom target sequence!
    return {
        categoryName,
        instruction: dynamicInstruction,
        items: shuffleArray(finalItems),
        targets: shuffleArray(finalTargets)
    };
}