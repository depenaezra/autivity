export interface CountingActivityItem {
  id: string;
  title: string;
  category: string;
  sub_category: string;
  skill_domain: string[];
  difficulty_level: number;
  path: string;
  content_data: {
    type: 'counting';
    target_count: number;
    item_type: string;
    item_name: string;
    category_type: 'fruits' | 'veggies' | 'items';
    instruction: string;
    shelf_count: number;
  };
}

export const COUNTING_ACTIVITIES_POOL: CountingActivityItem[] = [
  // DIFFICULTY LEVEL 1 (Foundational / Recovery tier)
  {
    id: 'counting-apples-1',
    title: 'Count 1 Apple',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 1,
    path: 'activity/counting/fruits-apples-1',
    content_data: {
      type: 'counting',
      target_count: 1,
      item_type: 'apple',
      item_name: 'Apples',
      category_type: 'fruits',
      instruction: 'Drag 1 apple into the basket!',
      shelf_count: 5,
    },
  },
  {
    id: 'counting-bananas-1',
    title: 'Count 1 Banana',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 1,
    path: 'activity/counting/fruits-bananas-1',
    content_data: {
      type: 'counting',
      target_count: 1,
      item_type: 'banana',
      item_name: 'Bananas',
      category_type: 'fruits',
      instruction: 'Drag 1 banana into the basket!',
      shelf_count: 5,
    },
  },
  {
    id: 'counting-carrots-1',
    title: 'Count 1 Carrot',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 1,
    path: 'activity/counting/veggies-carrots-1',
    content_data: {
      type: 'counting',
      target_count: 1,
      item_type: 'carrot',
      item_name: 'Carrots',
      category_type: 'veggies',
      instruction: 'Drag 1 carrot into the basket!',
      shelf_count: 5,
    },
  },
  {
    id: 'counting-toys-1',
    title: 'Count 1 Toy',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 1,
    path: 'activity/counting/items-toys-1',
    content_data: {
      type: 'counting',
      target_count: 1,
      item_type: 'toy',
      item_name: 'Toys',
      category_type: 'items',
      instruction: 'Drag 1 toy into the basket!',
      shelf_count: 5,
    },
  },

  // DIFFICULTY LEVEL 2 (Initial choice / Gentle tier)
  {
    id: 'counting-bananas-2',
    title: 'Count 2 Bananas',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 2,
    path: 'activity/counting/fruits-bananas-2',
    content_data: {
      type: 'counting',
      target_count: 2,
      item_type: 'banana',
      item_name: 'Bananas',
      category_type: 'fruits',
      instruction: 'Drag 2 bananas into the basket!',
      shelf_count: 5,
    },
  },
  {
    id: 'counting-carrots-2',
    title: 'Count 2 Carrots',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 2,
    path: 'activity/counting/veggies-carrots-2',
    content_data: {
      type: 'counting',
      target_count: 2,
      item_type: 'carrot',
      item_name: 'Carrots',
      category_type: 'veggies',
      instruction: 'Drag 2 carrots into the basket!',
      shelf_count: 5,
    },
  },
  {
    id: 'counting-strawberries-2',
    title: 'Count 2 Strawberries',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 2,
    path: 'activity/counting/fruits-strawberries-2',
    content_data: {
      type: 'counting',
      target_count: 2,
      item_type: 'strawberry',
      item_name: 'Strawberries',
      category_type: 'fruits',
      instruction: 'Drag 2 strawberries into the basket!',
      shelf_count: 5,
    },
  },
  {
    id: 'counting-yoyo-2',
    title: 'Count 2 Yoyos',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 2,
    path: 'activity/counting/items-yoyo-2',
    content_data: {
      type: 'counting',
      target_count: 2,
      item_type: 'yoyo',
      item_name: 'Yoyos',
      category_type: 'items',
      instruction: 'Drag 2 yoyos into the basket!',
      shelf_count: 5,
    },
  },

  // DIFFICULTY LEVEL 3 (Initial choice / Standard tier)
  {
    id: 'counting-apples-3',
    title: 'Count 3 Apples',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 3,
    path: 'activity/counting/fruits-apples-3',
    content_data: {
      type: 'counting',
      target_count: 3,
      item_type: 'apple',
      item_name: 'Apples',
      category_type: 'fruits',
      instruction: 'Drag 3 apples into the basket!',
      shelf_count: 6,
    },
  },
  {
    id: 'counting-oranges-3',
    title: 'Count 3 Oranges',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 3,
    path: 'activity/counting/fruits-oranges-3',
    content_data: {
      type: 'counting',
      target_count: 3,
      item_type: 'orange',
      item_name: 'Oranges',
      category_type: 'fruits',
      instruction: 'Drag 3 oranges into the basket!',
      shelf_count: 6,
    },
  },
  {
    id: 'counting-tomatoes-3',
    title: 'Count 3 Tomatoes',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 3,
    path: 'activity/counting/veggies-tomatoes-3',
    content_data: {
      type: 'counting',
      target_count: 3,
      item_type: 'tomato',
      item_name: 'Tomatoes',
      category_type: 'veggies',
      instruction: 'Drag 3 tomatoes into the basket!',
      shelf_count: 6,
    },
  },
  {
    id: 'counting-crayons-3',
    title: 'Count 3 Crayons',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 3,
    path: 'activity/counting/items-crayons-3',
    content_data: {
      type: 'counting',
      target_count: 3,
      item_type: 'crayon',
      item_name: 'Crayons',
      category_type: 'items',
      instruction: 'Drag 3 crayons into the basket!',
      shelf_count: 6,
    },
  },

  // DIFFICULTY LEVEL 4 (Initial choice / Confident tier)
  {
    id: 'counting-grapes-4',
    title: 'Count 4 Grapes',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 4,
    path: 'activity/counting/fruits-grapes-4',
    content_data: {
      type: 'counting',
      target_count: 4,
      item_type: 'grape',
      item_name: 'Grapes',
      category_type: 'fruits',
      instruction: 'Drag 4 grapes into the basket!',
      shelf_count: 7,
    },
  },
  {
    id: 'counting-broccoli-4',
    title: 'Count 4 Broccoli',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 4,
    path: 'activity/counting/veggies-broccoli-4',
    content_data: {
      type: 'counting',
      target_count: 4,
      item_type: 'broccoli',
      item_name: 'Broccoli',
      category_type: 'veggies',
      instruction: 'Drag 4 broccoli into the basket!',
      shelf_count: 7,
    },
  },
  {
    id: 'counting-toys-4',
    title: 'Count 4 Toys',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 4,
    path: 'activity/counting/items-toys-4',
    content_data: {
      type: 'counting',
      target_count: 4,
      item_type: 'toy',
      item_name: 'Toys',
      category_type: 'items',
      instruction: 'Drag 4 toys into the basket!',
      shelf_count: 7,
    },
  },
  {
    id: 'counting-pencils-4',
    title: 'Count 4 Pencils',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 4,
    path: 'activity/counting/items-pencils-4',
    content_data: {
      type: 'counting',
      target_count: 4,
      item_type: 'pencil',
      item_name: 'Pencils',
      category_type: 'items',
      instruction: 'Drag 4 pencils into the basket!',
      shelf_count: 7,
    },
  },

  // DIFFICULTY LEVEL 5 (Stepped Up tier)
  {
    id: 'counting-carrots-5',
    title: 'Count 5 Carrots',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 5,
    path: 'activity/counting/veggies-carrots-5',
    content_data: {
      type: 'counting',
      target_count: 5,
      item_type: 'carrot',
      item_name: 'Carrots',
      category_type: 'veggies',
      instruction: 'Drag 5 carrots into the basket!',
      shelf_count: 8,
    },
  },
  {
    id: 'counting-apples-5',
    title: 'Count 5 Apples',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 5,
    path: 'activity/counting/fruits-apples-5',
    content_data: {
      type: 'counting',
      target_count: 5,
      item_type: 'apple',
      item_name: 'Apples',
      category_type: 'fruits',
      instruction: 'Drag 5 apples into the basket!',
      shelf_count: 8,
    },
  },
  {
    id: 'counting-corn-5',
    title: 'Count 5 Corn',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 5,
    path: 'activity/counting/veggies-corn-5',
    content_data: {
      type: 'counting',
      target_count: 5,
      item_type: 'corn',
      item_name: 'Corn',
      category_type: 'veggies',
      instruction: 'Drag 5 corn into the basket!',
      shelf_count: 8,
    },
  },
  {
    id: 'counting-books-5',
    title: 'Count 5 Books',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 5,
    path: 'activity/counting/items-books-5',
    content_data: {
      type: 'counting',
      target_count: 5,
      item_type: 'book',
      item_name: 'Books',
      category_type: 'items',
      instruction: 'Drag 5 books into the basket!',
      shelf_count: 8,
    },
  },

  // DIFFICULTY LEVEL 6 (Intermediate Challenge)
  {
    id: 'counting-bananas-6',
    title: 'Count 6 Bananas',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 6,
    path: 'activity/counting/fruits-bananas-6',
    content_data: {
      type: 'counting',
      target_count: 6,
      item_type: 'banana',
      item_name: 'Bananas',
      category_type: 'fruits',
      instruction: 'Drag 6 bananas into the basket!',
      shelf_count: 9,
    },
  },
  {
    id: 'counting-oranges-6',
    title: 'Count 6 Oranges',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 6,
    path: 'activity/counting/fruits-oranges-6',
    content_data: {
      type: 'counting',
      target_count: 6,
      item_type: 'orange',
      item_name: 'Oranges',
      category_type: 'fruits',
      instruction: 'Drag 6 oranges into the basket!',
      shelf_count: 9,
    },
  },
  {
    id: 'counting-strawberries-6',
    title: 'Count 6 Strawberries',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 6,
    path: 'activity/counting/fruits-strawberries-6',
    content_data: {
      type: 'counting',
      target_count: 6,
      item_type: 'strawberry',
      item_name: 'Strawberries',
      category_type: 'fruits',
      instruction: 'Drag 6 strawberries into the basket!',
      shelf_count: 9,
    },
  },
  {
    id: 'counting-dinosaurs-6',
    title: 'Count 6 Dinosaurs',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 6,
    path: 'activity/counting/items-dinosaurs-6',
    content_data: {
      type: 'counting',
      target_count: 6,
      item_type: 'dinosaur',
      item_name: 'Dinosaurs',
      category_type: 'items',
      instruction: 'Drag 6 dinosaurs into the basket!',
      shelf_count: 9,
    },
  },

  // DIFFICULTY LEVEL 7 (Advanced Challenge)
  {
    id: 'counting-carrots-7',
    title: 'Count 7 Carrots',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 7,
    path: 'activity/counting/veggies-carrots-7',
    content_data: {
      type: 'counting',
      target_count: 7,
      item_type: 'carrot',
      item_name: 'Carrots',
      category_type: 'veggies',
      instruction: 'Drag 7 carrots into the basket!',
      shelf_count: 10,
    },
  },
  {
    id: 'counting-grapes-7',
    title: 'Count 7 Grapes',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 7,
    path: 'activity/counting/fruits-grapes-7',
    content_data: {
      type: 'counting',
      target_count: 7,
      item_type: 'grape',
      item_name: 'Grapes',
      category_type: 'fruits',
      instruction: 'Drag 7 grapes into the basket!',
      shelf_count: 10,
    },
  },
  {
    id: 'counting-tomatoes-7',
    title: 'Count 7 Tomatoes',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 7,
    path: 'activity/counting/veggies-tomatoes-7',
    content_data: {
      type: 'counting',
      target_count: 7,
      item_type: 'tomato',
      item_name: 'Tomatoes',
      category_type: 'veggies',
      instruction: 'Drag 7 tomatoes into the basket!',
      shelf_count: 10,
    },
  },
  {
    id: 'counting-toys-7',
    title: 'Count 7 Toys',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 7,
    path: 'activity/counting/items-toys-7',
    content_data: {
      type: 'counting',
      target_count: 7,
      item_type: 'toy',
      item_name: 'Toys',
      category_type: 'items',
      instruction: 'Drag 7 toys into the basket!',
      shelf_count: 10,
    },
  },

  // DIFFICULTY LEVEL 8 (High Mastery tier)
  {
    id: 'counting-apples-8',
    title: 'Count 8 Apples',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 8,
    path: 'activity/counting/fruits-apples-8',
    content_data: {
      type: 'counting',
      target_count: 8,
      item_type: 'apple',
      item_name: 'Apples',
      category_type: 'fruits',
      instruction: 'Drag 8 apples into the basket!',
      shelf_count: 11,
    },
  },
  {
    id: 'counting-broccoli-8',
    title: 'Count 8 Broccoli',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 8,
    path: 'activity/counting/veggies-broccoli-8',
    content_data: {
      type: 'counting',
      target_count: 8,
      item_type: 'broccoli',
      item_name: 'Broccoli',
      category_type: 'veggies',
      instruction: 'Drag 8 broccoli into the basket!',
      shelf_count: 11,
    },
  },
  {
    id: 'counting-crayons-8',
    title: 'Count 8 Crayons',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 8,
    path: 'activity/counting/items-crayons-8',
    content_data: {
      type: 'counting',
      target_count: 8,
      item_type: 'crayon',
      item_name: 'Crayons',
      category_type: 'items',
      instruction: 'Drag 8 crayons into the basket!',
      shelf_count: 11,
    },
  },
  {
    id: 'counting-corn-8',
    title: 'Count 8 Corn',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 8,
    path: 'activity/counting/veggies-corn-8',
    content_data: {
      type: 'counting',
      target_count: 8,
      item_type: 'corn',
      item_name: 'Corn',
      category_type: 'veggies',
      instruction: 'Drag 8 corn into the basket!',
      shelf_count: 11,
    },
  },

  // DIFFICULTY LEVEL 9 (Super Mastery tier)
  {
    id: 'counting-bananas-9',
    title: 'Count 9 Bananas',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 9,
    path: 'activity/counting/fruits-bananas-9',
    content_data: {
      type: 'counting',
      target_count: 9,
      item_type: 'banana',
      item_name: 'Bananas',
      category_type: 'fruits',
      instruction: 'Drag 9 bananas into the basket!',
      shelf_count: 12,
    },
  },
  {
    id: 'counting-corn-9',
    title: 'Count 9 Corn',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 9,
    path: 'activity/counting/veggies-corn-9',
    content_data: {
      type: 'counting',
      target_count: 9,
      item_type: 'corn',
      item_name: 'Corn',
      category_type: 'veggies',
      instruction: 'Drag 9 corn into the basket!',
      shelf_count: 12,
    },
  },
  {
    id: 'counting-strawberries-9',
    title: 'Count 9 Strawberries',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 9,
    path: 'activity/counting/fruits-strawberries-9',
    content_data: {
      type: 'counting',
      target_count: 9,
      item_type: 'strawberry',
      item_name: 'Strawberries',
      category_type: 'fruits',
      instruction: 'Drag 9 strawberries into the basket!',
      shelf_count: 12,
    },
  },
  {
    id: 'counting-pencils-9',
    title: 'Count 9 Pencils',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 9,
    path: 'activity/counting/items-pencils-9',
    content_data: {
      type: 'counting',
      target_count: 9,
      item_type: 'pencil',
      item_name: 'Pencils',
      category_type: 'items',
      instruction: 'Drag 9 pencils into the basket!',
      shelf_count: 12,
    },
  },

  // DIFFICULTY LEVEL 10 (Ultimate Mastery tier)
  {
    id: 'counting-apples-10',
    title: 'Count 10 Apples',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 10,
    path: 'activity/counting/fruits-apples-10',
    content_data: {
      type: 'counting',
      target_count: 10,
      item_type: 'apple',
      item_name: 'Apples',
      category_type: 'fruits',
      instruction: 'Drag 10 apples into the basket!',
      shelf_count: 13,
    },
  },
  {
    id: 'counting-oranges-10',
    title: 'Count 10 Oranges',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 10,
    path: 'activity/counting/fruits-oranges-10',
    content_data: {
      type: 'counting',
      target_count: 10,
      item_type: 'orange',
      item_name: 'Oranges',
      category_type: 'fruits',
      instruction: 'Drag 10 oranges into the basket!',
      shelf_count: 13,
    },
  },
  {
    id: 'counting-carrots-10',
    title: 'Count 10 Carrots',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 10,
    path: 'activity/counting/veggies-carrots-10',
    content_data: {
      type: 'counting',
      target_count: 10,
      item_type: 'carrot',
      item_name: 'Carrots',
      category_type: 'veggies',
      instruction: 'Drag 10 carrots into the basket!',
      shelf_count: 13,
    },
  },
  {
    id: 'counting-toys-10',
    title: 'Count 10 Toys',
    category: 'Counting',
    sub_category: 'Fruit & Veggie Counting',
    skill_domain: ['Cognitive Skills', 'Fine Motor Skills'],
    difficulty_level: 10,
    path: 'activity/counting/items-toys-10',
    content_data: {
      type: 'counting',
      target_count: 10,
      item_type: 'toy',
      item_name: 'Toys',
      category_type: 'items',
      instruction: 'Drag 10 toys into the basket!',
      shelf_count: 13,
    },
  },
];

/**
 * Returns a random target count for Round 1 from [2, 3, 4]
 * as requested: "random (2,3,4) on first"
 */
export const getRandomInitialCountingTarget = (): number => {
  const initialChoices = [2, 3, 4];
  return initialChoices[Math.floor(Math.random() * initialChoices.length)];
};

/**
 * Rule-Based Adaptive AI:
 * Determines whether to give harder or easier numbers based on student's performance:
 * - If kid finished under 1 minute (< 60s) -> gives HARDER numbers (up to 10)
 * - If kid finished 1 minute or above (>= 60s) or made mistakes -> gives EASIER numbers
 */
export interface AdaptiveTargetResult {
  nextTarget: number;
  isHarder: boolean;
  aiMessage: string;
  reasoning: string;
}

export const determineAdaptiveNextTarget = (
  nextRoundNum: number,
  prevDuration: number,
  prevMistakes: number,
  prevTarget: number
): AdaptiveTargetResult => {
  // Threshold as requested by user: 1 minute (60 seconds)
  const isFastUnder1Minute = prevDuration < 60 && prevMistakes <= 1;

  if (nextRoundNum === 2) {
    if (isFastUnder1Minute) {
      // Under 1 minute -> HARDER
      // Target jumps up to 5, 6, or 7
      let candidateTargets: number[];
      if (prevTarget === 2) candidateTargets = [5, 6];
      else if (prevTarget === 3) candidateTargets = [6, 7];
      else candidateTargets = [7, 8];

      const nextTarget = candidateTargets[Math.floor(Math.random() * candidateTargets.length)];
      return {
        nextTarget,
        isHarder: true,
        aiMessage: `Super fast! You finished in ${prevDuration}s, under 1 minute! Let's try a bigger challenge: ${nextTarget}!`,
        reasoning: `Rule-based AI: Finished in ${prevDuration}s (<60s). Escalated difficulty to ${nextTarget}.`,
      };
    } else {
      // 1 minute or above -> EASIER
      // Target drops to 1, 2, or 3
      let candidateTargets: number[];
      if (prevTarget <= 2) candidateTargets = [1, 2];
      else if (prevTarget === 3) candidateTargets = [1, 2];
      else candidateTargets = [2, 3];

      const nextTarget = candidateTargets[Math.floor(Math.random() * candidateTargets.length)];
      return {
        nextTarget,
        isHarder: false,
        aiMessage: `Good effort! Taking your time is great! Let's practice with an easier number: ${nextTarget}!`,
        reasoning: `Rule-based AI: Took ${prevDuration}s (>=60s). Eased difficulty to ${nextTarget}.`,
      };
    }
  }

  if (nextRoundNum === 3) {
    if (isFastUnder1Minute) {
      // Round 2 completed under 1 minute -> High / Ultimate Challenge
      // If was already high (>=5), push up to 8, 9, or 10!
      let nextTarget: number;
      if (prevTarget >= 6) {
        const topPool = [8, 9, 10];
        nextTarget = topPool[Math.floor(Math.random() * topPool.length)];
      } else if (prevTarget >= 4) {
        const midPool = [6, 7, 8];
        nextTarget = midPool[Math.floor(Math.random() * midPool.length)];
      } else {
        const stepPool = [3, 4, 5];
        nextTarget = stepPool[Math.floor(Math.random() * stepPool.length)];
      }

      return {
        nextTarget,
        isHarder: true,
        aiMessage: `Incredible! Still under 1 minute! Let's try the final challenge: ${nextTarget}!`,
        reasoning: `Rule-based AI: Completed Round 2 in ${prevDuration}s (<60s). Escalated to ${nextTarget}.`,
      };
    } else {
      // Round 2 took 1 min or above -> gentle adjustment or maintain
      let nextTarget: number;
      if (prevTarget >= 6) {
        nextTarget = Math.max(3, prevTarget - 2);
      } else if (prevTarget >= 4) {
        nextTarget = Math.max(2, prevTarget - 1);
      } else {
        nextTarget = Math.max(1, prevTarget);
      }

      return {
        nextTarget,
        isHarder: false,
        aiMessage: `Great focus! Let's finish with a comfortable number: ${nextTarget}!`,
        reasoning: `Rule-based AI: Took ${prevDuration}s (>=60s). Adjusted target to ${nextTarget}.`,
      };
    }
  }

  return {
    nextTarget: Math.min(10, Math.max(1, prevTarget)),
    isHarder: false,
    aiMessage: `Let's count!`,
    reasoning: `Rule-based AI: Maintained level ${prevTarget}.`,
  };
};

export const getDefaultCountingPool = (): CountingActivityItem[] => {
  return [...COUNTING_ACTIVITIES_POOL];
};
