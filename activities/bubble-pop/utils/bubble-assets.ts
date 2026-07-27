export const bubbleAssets = {
    // [ADDED]: Default bubble used for Free Pop.
    default: require("../../../assets/images/activities/bubble-pop/bubble.png"),

    white: require("../../../assets/images/activities/bubble-pop/bubble-white.png"),
    red: require("../../../assets/images/activities/bubble-pop/bubble-red.png"),
    blue: require("../../../assets/images/activities/bubble-pop/bubble-blue.png"),
    green: require("../../../assets/images/activities/bubble-pop/bubble-green.png"),
} as const;

export const bubbleSounds = {
    pop: require("../../../assets/sounds/bubble-pop-sound.mp3"),
} as const;

export type BubbleColor = keyof typeof bubbleAssets;