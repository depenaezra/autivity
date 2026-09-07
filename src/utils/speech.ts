import * as Speech from 'expo-speech';
import { speakElevenLabs, stopElevenLabsSpeech } from '@/src/services/elevenlabs';

/**
 * Strips emojis and special decorative characters from text
 * so Text-to-Speech engines pronounce only meaningful text.
 */
export const cleanTextForSpeech = (text: string): string => {
    if (!text) return '';
    return text
        // Remove common emojis and symbols
        .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
        // Clean double spaces
        .replace(/\s+/g, ' ')
        .trim();
};

let cachedBestVoice: string | undefined = undefined;

/**
 * Searches system voices to pick the highest quality, most natural voice available.
 */
const getBestVoice = async (): Promise<string | undefined> => {
    if (cachedBestVoice !== undefined) return cachedBestVoice;
    try {
        const voices = await Speech.getAvailableVoicesAsync();
        if (!voices || voices.length === 0) return undefined;

        // Filter English voices
        const enVoices = voices.filter(v => v.language && v.language.toLowerCase().startsWith('en'));
        const pool = enVoices.length > 0 ? enVoices : voices;

        // 1. Look for Enhanced / Premium voices
        const premiumVoice = pool.find(v => {
            const q = String(v.quality || '').toLowerCase();
            return (q.includes('enhanced') || q.includes('premium')) && !v.identifier.toLowerCase().includes('compact');
        });
        if (premiumVoice) {
            cachedBestVoice = premiumVoice.identifier;
            return cachedBestVoice;
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
            cachedBestVoice = preferredVoice.identifier;
            return cachedBestVoice;
        }

        cachedBestVoice = pool[0]?.identifier;
        return cachedBestVoice;
    } catch {
        return undefined;
    }
};

// Eagerly pre-warm voice lookup so speech begins instantly without async bridge latency
getBestVoice().catch(() => {});

/**
 * Speaks an instruction text using ElevenLabs API (with local caching),
 * falling back gracefully to native Expo Speech.
 */
export const speakInstruction = async (
    text: string,
    options?: Speech.SpeechOptions & { onDone?: () => void; onError?: (error: any) => void }
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

        // 2. Fallback to native Expo system voice
        const bestVoice = await getBestVoice();

        const speechOptions: Speech.SpeechOptions = {
            language: 'en-US',
            rate: 0.90,  // Natural pacing
            pitch: 1.15, // Slightly higher pitch for a warm, animated character tone
            onDone: options?.onDone,
            onError: options?.onError,
            onStopped: options?.onDone,
            ...options,
        };

        if (bestVoice) {
            speechOptions.voice = bestVoice;
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
