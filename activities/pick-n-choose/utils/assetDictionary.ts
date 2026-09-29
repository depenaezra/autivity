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

    // New Animals Assets
    bird: require('../../../assets/images/activities/pick-n-choose/animals/bird.png'),
    cat: require('../../../assets/images/activities/pick-n-choose/animals/cat.png'),
    cow: require('../../../assets/images/activities/pick-n-choose/animals/cow.png'),
    dog: require('../../../assets/images/activities/pick-n-choose/animals/dog.png'),
    duck: require('../../../assets/images/activities/pick-n-choose/animals/duck.png'),
    elephant: require('../../../assets/images/activities/pick-n-choose/animals/elephant.png'),
    fish: require('../../../assets/images/activities/pick-n-choose/animals/fish.png'),
    lion: require('../../../assets/images/activities/pick-n-choose/animals/lion.png'),

    // New Body Parts Assets
    ear: require('../../../assets/images/activities/pick-n-choose/body parts/ear.png'),
    eye: require('../../../assets/images/activities/pick-n-choose/body parts/eye.png'),
    feet: require('../../../assets/images/activities/pick-n-choose/body parts/feet.png'),
    hand: require('../../../assets/images/activities/pick-n-choose/body parts/hand.png'),

    // New Emotions Assets
    angry: require('../../../assets/images/activities/pick-n-choose/emotions/angry.png'),
    happy: require('../../../assets/images/activities/pick-n-choose/emotions/happy.png'),
    sad: require('../../../assets/images/activities/pick-n-choose/emotions/sad.png'),

    // New Vehicles Assets
    bicycle: require('../../../assets/images/activities/pick-n-choose/vehicles/bicycle.png'),
    bus: require('../../../assets/images/activities/pick-n-choose/vehicles/bus.png'),
    car: require('../../../assets/images/activities/pick-n-choose/vehicles/car.png'),
    plane: require('../../../assets/images/activities/pick-n-choose/vehicles/plane.png'),
    train: require('../../../assets/images/activities/pick-n-choose/vehicles/train.png'),
};

/**
 * Safely resolves an image asset key, falling back to a default if key isn't registered yet.
 */
export function getPickChoiceAsset(assetKey: string): ImageSourcePropType | undefined {
    if (!assetKey) return undefined;
    const key = assetKey.toLowerCase().replace(/[-_\s]+/g, '_');
    return pickChoiceAssets[key] || pickChoiceAssets[assetKey] || undefined;
}
