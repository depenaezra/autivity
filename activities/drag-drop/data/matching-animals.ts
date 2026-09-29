export interface AnimalMatchingItem {
  id: string;
  type: string;
  asset_key: string;
  color: string;
  label: string;
  category?: string;
}

export const ANIMAL_MATCHING_POOL: AnimalMatchingItem[] = [
  {
    id: 'animal-dog',
    type: 'Dog',
    asset_key: 'dog_icon',
    color: '#FFAE02',
    label: 'Dog',
    category: 'animals',
  },
  {
    id: 'animal-cat',
    type: 'Cat',
    asset_key: 'cat_icon',
    color: '#FF8870',
    label: 'Cat',
    category: 'animals',
  },
  {
    id: 'animal-bird',
    type: 'Bird',
    asset_key: 'bird_icon',
    color: '#62A9E6',
    label: 'Bird',
    category: 'animals',
  },
  {
    id: 'animal-fish',
    type: 'Fish',
    asset_key: 'fish_icon',
    color: '#179D33',
    label: 'Fish',
    category: 'animals',
  },
  {
    id: 'animal-cow',
    type: 'Cow',
    asset_key: 'cow_icon',
    color: '#8B5CF6',
    label: 'Cow',
    category: 'animals',
  },
  {
    id: 'animal-duck',
    type: 'Duck',
    asset_key: 'duck_icon',
    color: '#FBBF24',
    label: 'Duck',
    category: 'animals',
  },
  {
    id: 'animal-elephant',
    type: 'Elephant',
    asset_key: 'elephant_icon',
    color: '#64748B',
    label: 'Elephant',
    category: 'animals',
  },
  {
    id: 'animal-lion',
    type: 'Lion',
    asset_key: 'lion_icon',
    color: '#EA580C',
    label: 'Lion',
    category: 'animals',
  },
];
