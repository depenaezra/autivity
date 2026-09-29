export interface CategoryMatchingItem {
  id: string;
  category: 'animals' | 'vehicles' | 'fruits' | 'school_supplies' | 'clothing';
  type: string; // The category name used for drop target matching
  asset_key: string;
  color: string;
  label: string; // The individual item name
}

export const CATEGORY_MATCHING_POOL: CategoryMatchingItem[] = [
  // ANIMALS (Target: Animal)
  {
    id: 'cat-dog',
    category: 'animals',
    type: 'Animal',
    asset_key: 'dog_icon',
    color: '#FFAE02',
    label: 'Dog',
  },
  {
    id: 'cat-cat',
    category: 'animals',
    type: 'Animal',
    asset_key: 'cat_icon',
    color: '#FFAE02',
    label: 'Cat',
  },
  {
    id: 'cat-bird',
    category: 'animals',
    type: 'Animal',
    asset_key: 'bird_icon',
    color: '#FFAE02',
    label: 'Bird',
  },
  {
    id: 'cat-fish',
    category: 'animals',
    type: 'Animal',
    asset_key: 'fish_icon',
    color: '#FFAE02',
    label: 'Fish',
  },
  {
    id: 'cat-duck',
    category: 'animals',
    type: 'Animal',
    asset_key: 'duck_icon',
    color: '#FFAE02',
    label: 'Duck',
  },
  {
    id: 'cat-cow',
    category: 'animals',
    type: 'Animal',
    asset_key: 'cow_icon',
    color: '#FFAE02',
    label: 'Cow',
  },

  // VEHICLES (Target: Vehicle)
  {
    id: 'cat-car',
    category: 'vehicles',
    type: 'Vehicle',
    asset_key: 'car_icon',
    color: '#62A9E6',
    label: 'Car',
  },
  {
    id: 'cat-bus',
    category: 'vehicles',
    type: 'Vehicle',
    asset_key: 'bus_icon',
    color: '#62A9E6',
    label: 'Bus',
  },
  {
    id: 'cat-bicycle',
    category: 'vehicles',
    type: 'Vehicle',
    asset_key: 'bicycle_icon',
    color: '#62A9E6',
    label: 'Bicycle',
  },
  {
    id: 'cat-plane',
    category: 'vehicles',
    type: 'Vehicle',
    asset_key: 'plane_icon',
    color: '#62A9E6',
    label: 'Airplane',
  },
  {
    id: 'cat-train',
    category: 'vehicles',
    type: 'Vehicle',
    asset_key: 'train_icon',
    color: '#62A9E6',
    label: 'Train',
  },

  // FRUITS (Target: Fruit)
  {
    id: 'cat-apple',
    category: 'fruits',
    type: 'Fruit',
    asset_key: 'apple_icon',
    color: '#179D33',
    label: 'Apple',
  },
  {
    id: 'cat-banana',
    category: 'fruits',
    type: 'Fruit',
    asset_key: 'banana_icon',
    color: '#179D33',
    label: 'Banana',
  },
  {
    id: 'cat-orange',
    category: 'fruits',
    type: 'Fruit',
    asset_key: 'orange_icon',
    color: '#179D33',
    label: 'Orange',
  },
  {
    id: 'cat-strawberry',
    category: 'fruits',
    type: 'Fruit',
    asset_key: 'strawberry_icon',
    color: '#179D33',
    label: 'Strawberry',
  },
  {
    id: 'cat-grape',
    category: 'fruits',
    type: 'Fruit',
    asset_key: 'grape_icon',
    color: '#179D33',
    label: 'Grape',
  },

  // SCHOOL SUPPLIES (Target: School Supply)
  {
    id: 'cat-book',
    category: 'school_supplies',
    type: 'School Supply',
    asset_key: 'red_book',
    color: '#FF8870',
    label: 'Book',
  },
  {
    id: 'cat-pencil',
    category: 'school_supplies',
    type: 'School Supply',
    asset_key: 'yellow_pencil',
    color: '#FF8870',
    label: 'Pencil',
  },
  {
    id: 'cat-backpack',
    category: 'school_supplies',
    type: 'School Supply',
    asset_key: 'green_backpack',
    color: '#FF8870',
    label: 'Backpack',
  },
  {
    id: 'cat-scissors',
    category: 'school_supplies',
    type: 'School Supply',
    asset_key: 'red_scissors',
    color: '#FF8870',
    label: 'Scissors',
  },

  // CLOTHING (Target: Clothing)
  {
    id: 'cat-cap',
    category: 'clothing',
    type: 'Clothing',
    asset_key: 'blue_cap',
    color: '#A855F7',
    label: 'Cap',
  },
  {
    id: 'cat-scarf',
    category: 'clothing',
    type: 'Clothing',
    asset_key: 'red_scarf',
    color: '#A855F7',
    label: 'Scarf',
  },
  {
    id: 'cat-sock',
    category: 'clothing',
    type: 'Clothing',
    asset_key: 'yellow_sock',
    color: '#A855F7',
    label: 'Sock',
  },
  {
    id: 'cat-polo',
    category: 'clothing',
    type: 'Clothing',
    asset_key: 'red_polo',
    color: '#A855F7',
    label: 'Polo Shirt',
  },
];
