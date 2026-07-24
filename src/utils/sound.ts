import { Audio } from 'expo-av';

let backgroundMusicSound: Audio.Sound | null = null;
let globalSfxEnabled: boolean = true;

export const setGlobalSfxEnabled = (enabled: boolean) => {
    globalSfxEnabled = enabled;
};

export const getGlobalSfxEnabled = () => globalSfxEnabled;

export const playCorrectSound = async (enabled?: boolean) => {
    const isEnabled = enabled !== undefined ? enabled : globalSfxEnabled;
    if (!isEnabled) return;
    try {
        const { sound } = await Audio.Sound.createAsync(
            require('../../assets/sounds/correct-answer.mp3'),
            {
                shouldPlay: true,
                volume: 0.40
            }
        );
        sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
                sound.unloadAsync();
            }
        });
    } catch (error) {
        console.warn('Failed to play correct answer sound:', error);
    }
};

export const playBubblePopSound = async (enabled?: boolean) => {
    const isEnabled = enabled !== undefined ? enabled : globalSfxEnabled;
    if (!isEnabled) return;
    try {
        const { sound } = await Audio.Sound.createAsync(
            require('../../assets/sounds/bubble-pop-sound.mp3'),
            {
                shouldPlay: true,
                volume: 0.40
            }
        );
        sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
                sound.unloadAsync();
            }
        });
    } catch (error) {
        console.warn('Failed to play bubble pop sound:', error);
    }
};

export const startBackgroundMusic = async (enabled: boolean = true) => {
    if (!enabled) {
        await stopBackgroundMusic();
        return;
    }
    try {
        if (backgroundMusicSound) {
            const status = await backgroundMusicSound.getStatusAsync();
            if (status.isLoaded && !status.isPlaying) {
                await backgroundMusicSound.playAsync();
            }
            return;
        }

        const { sound } = await Audio.Sound.createAsync(
            require('../../assets/sounds/activity-music.mp3'),
            {
                shouldPlay: true,
                isLooping: true,
                volume: 0.15,
            }
        );

        backgroundMusicSound = sound;
    } catch (error) {
        console.warn('Failed to start background music:', error);
    }
};

export const stopBackgroundMusic = async () => {
    try {
        if (backgroundMusicSound) {
            const status = await backgroundMusicSound.getStatusAsync();
            if (status.isLoaded) {
                await backgroundMusicSound.stopAsync();
                await backgroundMusicSound.unloadAsync();
            }
            backgroundMusicSound = null;
        }
    } catch (error) {
        console.warn('Failed to stop background music:', error);
        backgroundMusicSound = null;
    }
};

export const playAchievementSound = async (enabled?: boolean) => {
    const isEnabled = enabled !== undefined ? enabled : globalSfxEnabled;
    if (!isEnabled) return;
    try {
        const { sound } = await Audio.Sound.createAsync(
            require('../../assets/sounds/achievement.mp3'),
            {
                shouldPlay: true,
                volume: 0.40
            }
        );
        sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
                sound.unloadAsync();
            }
        });
    } catch (error) {
        console.warn('Failed to play achievement sound:', error);
    }
};



