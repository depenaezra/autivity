import { DragDropItem, DragDropTarget } from '../utils/types';

export const FRUIT_MATCHING_POOL = [
    {
        id: 'fruit-apple',
        type: 'Apple',
        asset_key: 'apple_icon',
        color: '#EF4444',
        label: 'Apple',
    },
    {
        id: 'fruit-banana',
        type: 'Banana',
        asset_key: 'banana_icon',
        color: '#FED330',
        label: 'Banana',
    },
    {
        id: 'fruit-orange',
        type: 'Orange',
        asset_key: 'orange_icon',
        color: '#ED8F20',
        label: 'Orange',
    },
    {
        id: 'fruit-grape',
        type: 'Grape',
        asset_key: 'grape_icon',
        color: '#AA3DC8',
        label: 'Grape',
    },
    {
        id: 'fruit-strawberry',
        type: 'Strawberry',
        asset_key: 'strawberry_icon',
        color: '#FF4848',
        label: 'Strawberry',
    },
];

export const fruitItems: DragDropItem[] = FRUIT_MATCHING_POOL.map((item) => ({
    id: `${item.id}-item`,
    type: item.type,
    imageSource: require('../../../assets/images/activities/drag-drop/' + item.type.toLowerCase() + '.png'),
    color: item.color,
}));

export const fruitTargets: DragDropTarget[] = FRUIT_MATCHING_POOL.map((item) => ({
    id: `${item.id}-target`,
    type: item.type,
    imageSource: require('../../../assets/images/activities/drag-drop/' + item.type.toLowerCase() + '.png'),
    color: item.color,
}));
