import * as Speech from 'expo-speech';
import { speakElevenLabs, stopElevenLabsSpeech } from '@/src/services/elevenlabs';

/**
 * Strips emojis and special decorative characters from text
 * so Text-to-Speech engines pronounce only meaningful text.
 */
export const cleanTextForSpeech = (text: string): string => {
    if (!text) return '';
    return text
        // Remove all common emojis, symbols, and pictographs (e.g. ⭐, 💡, 🎉, ⏰, ⏳, etc.)
        .replace(/[\p{Extended_Pictographic}\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B50}]/gu, '')
        // Clean double spaces
        .replace(/\s+/g, ' ')
        .trim();
};

export const TIME_ALMOST_UP_MESSAGES = [
    "Hurry, time is almost up! You've got this! ⏰",
    "Almost out of time! Keep going, you can do it! ⏳",
    "Just a little time left! Keep it up! ⏰",
    "Only a minute left! Finish strong! 🌟",
];

export const TIME_UP_MESSAGES = [
    "Time is up! Great effort today! 🎉",
    "Time's up! Wonderful job trying your best! 🌟",
];

let cachedBestVoiceEn: string | undefined = undefined;
let cachedBestVoiceTl: string | undefined = undefined;

/**
 * Searches system voices to pick the highest quality, most natural voice available for the language.
 */
const getBestVoice = async (lang: 'en' | 'tl' = 'en'): Promise<string | undefined> => {
    if (lang === 'en' && cachedBestVoiceEn !== undefined) return cachedBestVoiceEn;
    if (lang === 'tl' && cachedBestVoiceTl !== undefined) return cachedBestVoiceTl;

    try {
        const voices = await Speech.getAvailableVoicesAsync();
        if (!voices || voices.length === 0) return undefined;

        if (lang === 'tl') {
            // Filter Tagalog / Filipino voices by language code, name, or identifier
            const tlVoices = voices.filter(v => {
                const l = (v.language || '').toLowerCase();
                const n = (v.name || '').toLowerCase();
                const id = (v.identifier || '').toLowerCase();
                return (
                    l.startsWith('fil') ||
                    l.startsWith('tl') ||
                    l.includes('ph') ||
                    n.includes('filipino') ||
                    n.includes('tagalog') ||
                    n.includes('maja') ||
                    id.includes('fil-ph') ||
                    id.includes('tl-ph') ||
                    id.includes('fil_ph') ||
                    id.includes('tl_ph')
                );
            });

            if (tlVoices.length > 0) {
                // Look for enhanced / premium Filipino voice
                const premium = tlVoices.find(v => {
                    const q = String(v.quality || '').toLowerCase();
                    return q.includes('enhanced') || q.includes('premium') || q.includes('natural');
                });
                cachedBestVoiceTl = premium ? premium.identifier : tlVoices[0].identifier;
                return cachedBestVoiceTl;
            }
            return undefined;
        }

        // Filter English voices
        const enVoices = voices.filter(v => v.language && v.language.toLowerCase().startsWith('en'));
        const pool = enVoices.length > 0 ? enVoices : voices;

        // 1. Look for Enhanced / Premium voices
        const premiumVoice = pool.find(v => {
            const q = String(v.quality || '').toLowerCase();
            return (q.includes('enhanced') || q.includes('premium')) && !v.identifier.toLowerCase().includes('compact');
        });
        if (premiumVoice) {
            cachedBestVoiceEn = premiumVoice.identifier;
            return cachedBestVoiceEn;
        }

        // 2. Look for known high quality voices (Siri, Samantha, Google Neural)
        const preferredVoice = pool.find(v => {
            const id = v.identifier.toLowerCase();
            const name = v.name.toLowerCase();
            return (
                name.includes('samantha') ||
                name.includes('siri') ||
                name.includes('google') ||
                name.includes('natural') ||
                id.includes('enhanced')
            );
        });

        if (preferredVoice) {
            cachedBestVoiceEn = preferredVoice.identifier;
            return cachedBestVoiceEn;
        }

        cachedBestVoiceEn = pool[0]?.identifier;
        return cachedBestVoiceEn;
    } catch {
        return undefined;
    }
};

// Eagerly pre-warm voice lookup so speech begins instantly without async bridge latency
getBestVoice('en').catch(() => {});
getBestVoice('tl').catch(() => {});

/**
 * Speaks an instruction text using ElevenLabs API (with local caching),
 * falling back gracefully to native Expo Speech.
 */
export const speakInstruction = async (
    text: string,
    options?: Speech.SpeechOptions & { 
        language?: string;
        langMode?: 'en' | 'tl';
        onDone?: () => void; 
        onError?: (error: any) => void;
    }
): Promise<void> => {
    try {
        const cleaned = cleanTextForSpeech(text);
        if (!cleaned) return;

        // Stop previous speech if any
        await stopSpeech();

        // 1. Try ElevenLabs express AI voice (cached locally) - Disabled during testing to conserve API credits
        const handledByElevenLabs = await speakElevenLabs(
            cleaned,
            options?.onDone,
            options?.onError
        );

        if (handledByElevenLabs) return;

        // 2. Native Expo system voice
        const isTagalog = options?.langMode === 'tl' || options?.language === 'fil-PH' || options?.language === 'tl-PH' || options?.language === 'fil' || options?.language === 'tl';
        const bestVoice = await getBestVoice(isTagalog ? 'tl' : 'en');

        const speechOptions: Speech.SpeechOptions = {
            rate: isTagalog ? 0.90 : 0.90,  // Natural pacing
            pitch: 1.05, // Child-friendly natural tone
            ...options,
            language: isTagalog ? 'fil-PH' : 'en-US',
            onDone: options?.onDone,
            onError: options?.onError,
            onStopped: options?.onDone,
        };

        if (isTagalog) {
            if (bestVoice) {
                speechOptions.voice = bestVoice;
            } else {
                delete speechOptions.voice;
            }
            speechOptions.language = 'fil-PH';
        } else {
            if (bestVoice) {
                speechOptions.voice = bestVoice;
            }
            speechOptions.language = 'en-US';
        }

        Speech.speak(cleaned, speechOptions);
    } catch (error) {
        console.warn('[Speech] Error speaking instruction:', error);
    }
};

/**
 * Stops any ongoing speech synthesis (ElevenLabs or native).
 */
export const stopSpeech = async (): Promise<void> => {
    try {
        await stopElevenLabsSpeech();
        const isSpeaking = await Speech.isSpeakingAsync();
        if (isSpeaking) {
            await Speech.stop();
        }
    } catch (error) {
        console.warn('[Speech] Error stopping speech:', error);
    }
};

/**
 * Checks if the speech engine is currently speaking.
 */
export const isSpeakingAsync = async (): Promise<boolean> => {
    try {
        return await Speech.isSpeakingAsync();
    } catch {
        return false;
    }
};
