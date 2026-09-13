import { ImageSourcePropType } from 'react-native';

export const sequencingAssets: Record<string, ImageSourcePropType> = {
  // Wash Hands Routine
  wash_hands_step1: require('@/assets/images/activities/sequencing/brush teeth/wash hands/1. put soap.png'),
  wash_hands_step2: require('@/assets/images/activities/sequencing/brush teeth/wash hands/2. rub hands with soap.png'),
  wash_hands_step3: require('@/assets/images/activities/sequencing/brush teeth/wash hands/4. rinse hands.png'),
  wash_hands_step4: require('@/assets/images/activities/sequencing/brush teeth/wash hands/4. wipe hands.png'),

  // Brush Teeth Routine
  brush_teeth_step1: require('@/assets/images/activities/sequencing/wash hands/1. wet your toothbrush.png'),
  brush_teeth_step2: require('@/assets/images/activities/sequencing/wash hands/2. apply toothpaste.png'),
  brush_teeth_step3: require('@/assets/images/activities/sequencing/wash hands/3. brush your teeth.png'),
  brush_teeth_step4: require('@/assets/images/activities/sequencing/wash hands/4. rinse.png'),

  // Wash Dishes Routine
  wash_dishes_step1: require('@/assets/images/activities/sequencing/wash dishes/1. collect all dirty dishes.png'),
  wash_dishes_step2: require('@/assets/images/activities/sequencing/wash dishes/2. put dishwashing liquid.png'),
  wash_dishes_step3: require('@/assets/images/activities/sequencing/wash dishes/3. wash the dishes.png'),

  // Wash Laundry Routine
  wash_laundry_step1: require('@/assets/images/activities/sequencing/wash laundry/1. put soap on clothes.png'),
  wash_laundry_step2: require('@/assets/images/activities/sequencing/wash laundry/2. turn on the washing machine.png'),
  wash_laundry_step3: require('@/assets/images/activities/sequencing/wash laundry/3. hang the clothes to dry.png'),

  // Header image
  sequencing_header: require('@/assets/images/activities/sequencing-header.png'),
};

/**
 * Safely resolves a sequencing image asset key
 */
export function getSequencingAsset(assetKey: string): ImageSourcePropType | undefined {
  if (!assetKey) return undefined;
  const key = assetKey.toLowerCase().trim();
  return sequencingAssets[key] || sequencingAssets[assetKey] || undefined;
}
