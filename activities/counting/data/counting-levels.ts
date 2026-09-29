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
  // DIFFICULTY LEVEL 2 (Easier downgrade tier)
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

  // DIFFICULTY LEVEL 3 (Default starting activity level)
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

  // DIFFICULTY LEVEL 4 (Advanced tier for students who count fast)
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
      shelf_count: 6,
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
      shelf_count: 6,
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
      shelf_count: 6,
    },
  },

  // DIFFICULTY LEVEL 5 (High mastery tier)
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
      shelf_count: 7,
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
      shelf_count: 7,
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
      shelf_count: 7,
    },
  },
];

export const getDefaultCountingPool = (): CountingActivityItem[] => {
  return [...COUNTING_ACTIVITIES_POOL];
};
