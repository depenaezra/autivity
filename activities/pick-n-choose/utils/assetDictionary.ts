import { ImageSourcePropType } from 'react-native';

export const pickChoiceAssets: Record<string, ImageSourcePropType> = {
    // Existing Fruit Assets
    apple: require('../../../assets/images/activities/drag-drop/apple.png'),
    banana: require('../../../assets/images/activities/drag-drop/banana.png'),
    orange: require('../../../assets/images/activities/drag-drop/orange.png'),
    strawberry: require('../../../assets/images/activities/drag-drop/strawberry.png'),
    grape: require('../../../assets/images/activities/drag-drop/grape.png'),

    // Existing School Supply Assets
    pencil: require('../../../assets/images/activities/drag-drop/colors/school-supplies/pencil.png'),
    book: require('../../../assets/images/activities/drag-drop/colors/school-supplies/book.png'),
    backpack: require('../../../assets/images/activities/drag-drop/colors/school-supplies/backpack.png'),
    scissors: require('../../../assets/images/activities/drag-drop/colors/school-supplies/scissors.png'),
    notebook: require('../../../assets/images/activities/drag-drop/colors/school-supplies/notebook.png'),

    // Existing Household Item Assets
    pillow: require('../../../assets/images/activities/drag-drop/colors/household-items/pillow.png'),
    sofa: require('../../../assets/images/activities/drag-drop/colors/household-items/sofa.png'),
    broom: require('../../../assets/images/activities/drag-drop/colors/household-items/broom.png'),
};

/**
 * Safely resolves an image asset key, falling back to a default if key isn't registered yet.
 */
export function getPickChoiceAsset(assetKey: string): ImageSourcePropType | undefined {
    if (!assetKey) return undefined;
    const key = assetKey.toLowerCase().replace(/[-_\s]+/g, '_');
    return pickChoiceAssets[key] || pickChoiceAssets[assetKey] || undefined;
}
