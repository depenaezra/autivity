import { DragDropItem, DragDropTarget } from '../utils/types';

export const fruitItems: DragDropItem[] = [
    {
        id: 'fruit-apple-item',
        type: 'Apple',
        // Dynamically references your local asset folder
        imageSource: require('../../../assets/images/activities/drag-drop/apple.png'),
        color: '#EF4444',
    },
    {
        id: 'fruit-banana-item',
        type: 'Banana',
        imageSource: require('../../../assets/images/activities/drag-drop/banana.png'),
        color: '#FED330',
    },
    {
        id: 'fruit-orange-item',
        type: 'Orange',
        imageSource: require('../../../assets/images/activities/drag-drop/orange.png'),
        color: '#ED8F20',
    },
    {
        id: 'fruit-grape-item',
        type: 'Grape',
        imageSource: require('../../../assets/images/activities/drag-drop/grape.png'),
        color: '#AA3DC8',
    },
    {
        id: 'fruit-strawberry-item',
        type: 'Strawberry',
        imageSource: require('../../../assets/images/activities/drag-drop/strawberry.png'),
        color: '#FF4848',
    },
    // add more fruits here
];

export const fruitTargets: DragDropTarget[] = [
    {
        id: 'fruit-apple-target',
        type: 'Apple',
        imageSource: require('../../../assets/images/activities/drag-drop/apple.png'),
        color: '#EF4444',
    },
    {
        id: 'fruit-banana-target',
        type: 'Banana',
        imageSource: require('../../../assets/images/activities/drag-drop/banana.png'),
        color: '#FED330',
    },
    {
        id: 'fruit-orange-target',
        type: 'Orange',
        imageSource: require('../../../assets/images/activities/drag-drop/orange.png'),
        color: '#ED8F20',
    },
    {
        id: 'fruit-grape-target',
        type: 'Grape',
        imageSource: require('../../../assets/images/activities/drag-drop/grape.png'),
        color: '#AA3DC8',
    },
    {
        id: 'fruit-strawberry-target',
        type: 'Strawberry',
        imageSource: require('../../../assets/images/activities/drag-drop/strawberry.png'),
        color: '#FF4848',
    },
    // add more fruits here
];