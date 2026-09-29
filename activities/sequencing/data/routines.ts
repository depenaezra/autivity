import { SequencingRoutine } from '../types';

export const SEQUENCING_ROUTINES: SequencingRoutine[] = [
  // 1. Wash Hands (4 Steps)
  {
    routine_id: 'wash_hands',
    title: 'Washing Hands',
    steps: [
      { id: 'wh-1', step_number: 1, label: 'Put soap on hands', asset_key: 'wash_hands_step1' },
      { id: 'wh-2', step_number: 2, label: 'Rub hands with soap', asset_key: 'wash_hands_step2' },
      { id: 'wh-3', step_number: 3, label: 'Rinse hands with water', asset_key: 'wash_hands_step3' },
      { id: 'wh-4', step_number: 4, label: 'Wipe and dry hands', asset_key: 'wash_hands_step4' },
    ],
  },

  // 2. Brush Teeth (4 Steps)
  {
    routine_id: 'brush_teeth',
    title: 'Brushing Teeth',
    steps: [
      { id: 'bt-1', step_number: 1, label: 'Wet your toothbrush', asset_key: 'brush_teeth_step1' },
      { id: 'bt-2', step_number: 2, label: 'Apply toothpaste', asset_key: 'brush_teeth_step2' },
      { id: 'bt-3', step_number: 3, label: 'Brush your teeth', asset_key: 'brush_teeth_step3' },
      { id: 'bt-4', step_number: 4, label: 'Rinse mouth with water', asset_key: 'brush_teeth_step4' },
    ],
  },

  // 3. Wash Dishes (3 Steps)
  {
    routine_id: 'wash_dishes',
    title: 'Washing Dishes',
    steps: [
      { id: 'wd-1', step_number: 1, label: 'Collect dirty dishes', asset_key: 'wash_dishes_step1' },
      { id: 'wd-2', step_number: 2, label: 'Put dishwashing liquid on sponge', asset_key: 'wash_dishes_step2' },
      { id: 'wd-3', step_number: 3, label: 'Wash and rinse the dishes', asset_key: 'wash_dishes_step3' },
    ],
  },

  // 4. Wash Laundry (3 Steps)
  {
    routine_id: 'wash_laundry',
    title: 'Washing Laundry',
    steps: [
      { id: 'wl-1', step_number: 1, label: 'Put soap and clothes in machine', asset_key: 'wash_laundry_step1' },
      { id: 'wl-2', step_number: 2, label: 'Turn on the washing machine', asset_key: 'wash_laundry_step2' },
      { id: 'wl-3', step_number: 3, label: 'Hang clothes to dry', asset_key: 'wash_laundry_step3' },
    ],
  },

  // 5. Getting Dressed (3 Steps)
  {
    routine_id: 'getting_dressed',
    title: 'Getting Dressed',
    steps: [
      { id: 'gd-1', step_number: 1, label: 'Put on shirt', asset_key: 'getting_dressed_step1' },
      { id: 'gd-2', step_number: 2, label: 'Put on pants', asset_key: 'getting_dressed_step2' },
      { id: 'gd-3', step_number: 3, label: 'Put on jacket', asset_key: 'getting_dressed_step3' },
    ],
  },

  // 6. Putting on Shoes (3 Steps)
  {
    routine_id: 'putting_on_shoes',
    title: 'Putting on Shoes',
    steps: [
      { id: 'ps-1', step_number: 1, label: 'Put on socks', asset_key: 'putting_on_shoes_step1' },
      { id: 'ps-2', step_number: 2, label: 'Put feet in shoes', asset_key: 'putting_on_shoes_step2' },
      { id: 'ps-3', step_number: 3, label: 'Tie and fasten shoes', asset_key: 'putting_on_shoes_step3' },
    ],
  },

  // 7. Eating Lunch (3 Steps)
  {
    routine_id: 'eating_lunch',
    title: 'Eating Lunch',
    steps: [
      { id: 'el-1', step_number: 1, label: 'Open lunchbox', asset_key: 'eating_lunch_step1' },
      { id: 'el-2', step_number: 2, label: 'Eat food', asset_key: 'eating_lunch_step2' },
      { id: 'el-3', step_number: 3, label: 'Drink water and pack up', asset_key: 'eating_lunch_step3' },
    ],
  },

  // 8. Making the Bed (3 Steps)
  {
    routine_id: 'making_bed',
    title: 'Making the Bed',
    steps: [
      { id: 'mb-1', step_number: 1, label: 'Straighten bedsheet', asset_key: 'making_bed_step1' },
      { id: 'mb-2', step_number: 2, label: 'Pull up blanket', asset_key: 'making_bed_step2' },
      { id: 'mb-3', step_number: 3, label: 'Place pillow neatly', asset_key: 'making_bed_step3' },
    ],
  },
];
