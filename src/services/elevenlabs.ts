import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';

let currentSound: Audio.Sound | null = null;

/**
 * Simple string hash function to generate cache key for text
 */
const hashText = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
};

/**
 * Convert ArrayBuffer to Base64 safely in 8KB chunks
 * (prevents maximum call stack size exceeded or slow string concatenation in JS)
 */
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    return typeof btoa !== 'undefined'
        ? btoa(binary)
        : (global as any).Buffer.from(binary, 'binary').toString('base64');
};

/**
 * Stop any ongoing ElevenLabs audio playback
 */
export const stopElevenLabsSpeech = async (): Promise<void> => {
    try {
        if (currentSound) {
            const status = await currentSound.getStatusAsync();
            if (status.isLoaded) {
                await currentSound.stopAsync();
                await currentSound.unloadAsync();
            }
            currentSound = null;
        }
    } catch (error) {
        console.warn('[ElevenLabs] Error stopping speech:', error);
        currentSound = null;
    }
};

/**
 * Speaks text using ElevenLabs API with smart local MP3 caching and Data URI fallback.
 */
export const speakElevenLabs = async (
    text: string,
    onDone?: () => void,
    onError?: (err: any) => void
): Promise<boolean> => {
    // TEMPORARILY DISABLED FOR TESTING (to conserve ElevenLabs API credits)
    // Change return to proceed or remove this block to re-enable ElevenLabs:
    const ENABLE_ELEVEN_LABS = false;
    if (!ENABLE_ELEVEN_LABS) {
        return false;
    }

    const apiKey = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;
    const voiceId = process.env.EXPO_PUBLIC_ELEVENLABS_VOICE_ID;

    console.log('[ElevenLabs] Preparing speech for:', text);
    console.log('[ElevenLabs] Key status:', apiKey ? 'FOUND' : 'MISSING', '| Voice ID status:', voiceId ? 'FOUND' : 'MISSING');

    if (!apiKey || !voiceId) {
        console.warn('[ElevenLabs] Missing credentials in EXPO_PUBLIC_ELEVENLABS_API_KEY or EXPO_PUBLIC_ELEVENLABS_VOICE_ID. Falling back to native TTS.');
        return false;
    }

    try {
        await stopElevenLabsSpeech();

        // Ensure Audio mode allows playback on iOS & Android speakers
        await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
        }).catch(() => {});

        const fileHash = `${voiceId}_${hashText(text)}`;
        const cachePath = `${FileSystem.cacheDirectory}tts_${fileHash}.mp3`;

        const fileInfo = await FileSystem.getInfoAsync(cachePath);

        let soundUri = cachePath;

        if (!fileInfo.exists) {
            console.log('[ElevenLabs] Calling API endpoint for Voice ID:', voiceId);
            
            const response = await fetch(
                `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
                {
                    method: 'POST',
                    headers: {
                        'xi-api-key': apiKey,
                        'Content-Type': 'application/json',
                        'Accept': 'audio/mpeg',
                    },
                    body: JSON.stringify({
                        text,
                        model_id: 'eleven_turbo_v2_5',
                        voice_settings: {
                            stability: 0.5,
                            similarity_boost: 0.75,
                        },
                    }),
                }
            );

            console.log('[ElevenLabs] ElevenLabs API Status:', response.status);

            if (!response.ok) {
                const errText = await response.text();
                console.warn('[ElevenLabs] API response error status:', response.status, 'Message:', errText);
                return false;
            }

            const arrayBuffer = await response.arrayBuffer();
            console.log('[ElevenLabs] Audio received, size in bytes:', arrayBuffer.byteLength);

            const base64Data = arrayBufferToBase64(arrayBuffer);

            // Write MP3 file to local disk cache
            try {
                await FileSystem.writeAsStringAsync(cachePath, base64Data, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                console.log('[ElevenLabs] Successfully wrote MP3 to local cache:', cachePath);
                soundUri = cachePath;
            } catch (fsError) {
                console.warn('[ElevenLabs] FileSystem cache write failed, using direct Base64 Data URI:', fsError);
                soundUri = `data:audio/mpeg;base64,${base64Data}`;
            }
        } else {
            console.log('[ElevenLabs] Playing from local disk cache! (0 API credits used)');
        }

        // Load & Play Audio with expo-av
        console.log('[ElevenLabs] Loading audio into expo-av player...');
        const { sound } = await Audio.Sound.createAsync(
            { uri: soundUri },
            { shouldPlay: true, volume: 1.0 }
        );

        currentSound = sound;

        sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
                sound.unloadAsync();
                currentSound = null;
                onDone?.();
            }
        });

        console.log('[ElevenLabs] Audio playing successfully!');
        return true;
    } catch (error) {
        console.warn('[ElevenLabs] Error handling audio:', error);
        stopElevenLabsSpeech().catch(() => {});
        onError?.(error);
        return false;
    }
};
