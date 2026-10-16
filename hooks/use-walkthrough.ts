import AsyncStorage from '@react-native-async-storage/async-storage';

const TOUR_STORAGE_PREFIX = '@autivity:has_seen_tour_';

/**
 * Checks if a specific user has already seen or completed the welcome tour.
 */
export async function hasSeenTour(userId?: string | null): Promise<boolean> {
  if (!userId) return false;
  try {
    const value = await AsyncStorage.getItem(`${TOUR_STORAGE_PREFIX}${userId}`);
    return value === 'true';
  } catch (err) {
    console.error('Error checking walkthrough status:', err);
    return false;
  }
}

/**
 * Marks the welcome tour as completed for a user.
 */
export async function markTourAsSeen(userId?: string | null): Promise<void> {
  if (!userId) return;
  try {
    await AsyncStorage.setItem(`${TOUR_STORAGE_PREFIX}${userId}`, 'true');
  } catch (err) {
    console.error('Error saving walkthrough status:', err);
  }
}

/**
 * Resets the welcome tour status (useful for testing or profile replay).
 */
export async function resetTourStatus(userId?: string | null): Promise<void> {
  if (!userId) return;
  try {
    await AsyncStorage.removeItem(`${TOUR_STORAGE_PREFIX}${userId}`);
  } catch (err) {
    console.error('Error resetting walkthrough status:', err);
  }
}
