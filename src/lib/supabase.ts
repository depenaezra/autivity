// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import 'react-native-url-polyfill/auto';

const CHUNK_SIZE = 2000;

const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const mainVal = await SecureStore.getItemAsync(key);
      if (!mainVal) return null;

      if (mainVal.startsWith('___chunked___:')) {
        const numChunks = parseInt(mainVal.split(':')[1], 10);
        let joined = '';
        for (let i = 0; i < numChunks; i++) {
          const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`);
          if (!chunk) return null;
          joined += chunk;
        }
        return joined;
      }
      return mainVal;
    } catch (e) {
      console.error('ExpoSecureStoreAdapter: getItem failed', e);
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (value.length > CHUNK_SIZE) {
        const numChunks = Math.ceil(value.length / CHUNK_SIZE);
        await SecureStore.setItemAsync(key, `___chunked___:${numChunks}`);
        for (let i = 0; i < numChunks; i++) {
          const start = i * CHUNK_SIZE;
          const chunk = value.slice(start, start + CHUNK_SIZE);
          await SecureStore.setItemAsync(`${key}_chunk_${i}`, chunk);
        }
        let i = numChunks;
        while (true) {
          const nextChunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`);
          if (nextChunk) {
            await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
            i++;
          } else {
            break;
          }
        }
      } else {
        await SecureStore.setItemAsync(key, value);
        const oldChunk = await SecureStore.getItemAsync(`${key}_chunk_0`);
        if (oldChunk) {
          let i = 0;
          while (true) {
            const nextChunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`);
            if (nextChunk) {
              await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
              i++;
            } else {
              break;
            }
          }
        }
      }
    } catch (e) {
      console.error('ExpoSecureStoreAdapter: setItem failed', e);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      const mainVal = await SecureStore.getItemAsync(key);
      await SecureStore.deleteItemAsync(key);

      if (mainVal && mainVal.startsWith('___chunked___:')) {
        const numChunks = parseInt(mainVal.split(':')[1], 10);
        for (let i = 0; i < numChunks; i++) {
          await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
        }
      }
    } catch (e) {
      console.error('ExpoSecureStoreAdapter: removeItem failed', e);
    }
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Publishable Key is missing in process.env!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});