import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_WARMUP_VIDEOS,
  WarmupVideo,
} from '../../constants/warmup-videos';

const STORAGE_KEY_CUSTOM_VIDEOS = '@autivity_custom_warmup_videos';
const STORAGE_KEY_ARCHIVED_IDS = '@autivity_archived_warmup_video_ids';
const STORAGE_KEY_DELETED_IDS = '@autivity_deleted_warmup_video_ids';

export async function getStoredWarmupVideos(): Promise<{
  activeVideos: WarmupVideo[];
  archivedVideos: WarmupVideo[];
}> {
  try {
    const [customJson, archivedIdsJson, deletedIdsJson] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEY_CUSTOM_VIDEOS),
      AsyncStorage.getItem(STORAGE_KEY_ARCHIVED_IDS),
      AsyncStorage.getItem(STORAGE_KEY_DELETED_IDS),
    ]);

    const customVideos: WarmupVideo[] = customJson ? JSON.parse(customJson) : [];
    const archivedIds: string[] = archivedIdsJson ? JSON.parse(archivedIdsJson) : [];
    const deletedIds: string[] = deletedIdsJson ? JSON.parse(deletedIdsJson) : [];

    // Combine custom videos (first) and default videos
    const allVideosMap = new Map<string, WarmupVideo>();

    // Add defaults first
    DEFAULT_WARMUP_VIDEOS.forEach((v) => {
      if (!deletedIds.includes(v.id)) {
        allVideosMap.set(v.id, { ...v, isCustom: false });
      }
    });

    // Add or override with custom/edited videos
    customVideos.forEach((v) => {
      if (!deletedIds.includes(v.id)) {
        allVideosMap.set(v.id, { ...v, isCustom: true });
      }
    });

    const activeVideos: WarmupVideo[] = [];
    const archivedVideos: WarmupVideo[] = [];

    allVideosMap.forEach((video) => {
      if (archivedIds.includes(video.id) || video.isArchived) {
        archivedVideos.push({ ...video, isArchived: true });
      } else {
        activeVideos.push({ ...video, isArchived: false });
      }
    });

    return { activeVideos, archivedVideos };
  } catch (error) {
    console.error('Error loading warmup videos from storage:', error);
    return {
      activeVideos: DEFAULT_WARMUP_VIDEOS,
      archivedVideos: [],
    };
  }
}

export async function saveWarmupVideo(
  videoData: Omit<WarmupVideo, 'id'> & { id?: string }
): Promise<WarmupVideo> {
  const customJson = await AsyncStorage.getItem(STORAGE_KEY_CUSTOM_VIDEOS);
  let customVideos: WarmupVideo[] = customJson ? JSON.parse(customJson) : [];

  const videoId = videoData.id || `custom-video-${Date.now()}`;
  const newVideo: WarmupVideo = {
    ...videoData,
    id: videoId,
    isCustom: true,
    isArchived: false,
  };

  const existingIndex = customVideos.findIndex((v) => v.id === videoId);
  if (existingIndex >= 0) {
    customVideos[existingIndex] = newVideo;
  } else {
    // Put new video at the beginning
    customVideos = [newVideo, ...customVideos];
  }

  await AsyncStorage.setItem(
    STORAGE_KEY_CUSTOM_VIDEOS,
    JSON.stringify(customVideos)
  );

  return newVideo;
}

export async function archiveWarmupVideo(videoId: string): Promise<void> {
  const archivedIdsJson = await AsyncStorage.getItem(STORAGE_KEY_ARCHIVED_IDS);
  const archivedIds: string[] = archivedIdsJson ? JSON.parse(archivedIdsJson) : [];

  if (!archivedIds.includes(videoId)) {
    archivedIds.push(videoId);
    await AsyncStorage.setItem(
      STORAGE_KEY_ARCHIVED_IDS,
      JSON.stringify(archivedIds)
    );
  }
}

export async function unarchiveWarmupVideo(videoId: string): Promise<void> {
  const archivedIdsJson = await AsyncStorage.getItem(STORAGE_KEY_ARCHIVED_IDS);
  let archivedIds: string[] = archivedIdsJson ? JSON.parse(archivedIdsJson) : [];

  archivedIds = archivedIds.filter((id) => id !== videoId);
  await AsyncStorage.setItem(
    STORAGE_KEY_ARCHIVED_IDS,
    JSON.stringify(archivedIds)
  );
}

export async function deleteWarmupVideo(videoId: string): Promise<void> {
  // If in custom videos, remove it
  const customJson = await AsyncStorage.getItem(STORAGE_KEY_CUSTOM_VIDEOS);
  if (customJson) {
    let customVideos: WarmupVideo[] = JSON.parse(customJson);
    customVideos = customVideos.filter((v) => v.id !== videoId);
    await AsyncStorage.setItem(
      STORAGE_KEY_CUSTOM_VIDEOS,
      JSON.stringify(customVideos)
    );
  }

  // Also add to deleted IDs list (so default videos can be hidden if deleted)
  const deletedIdsJson = await AsyncStorage.getItem(STORAGE_KEY_DELETED_IDS);
  const deletedIds: string[] = deletedIdsJson ? JSON.parse(deletedIdsJson) : [];
  if (!deletedIds.includes(videoId)) {
    deletedIds.push(videoId);
    await AsyncStorage.setItem(
      STORAGE_KEY_DELETED_IDS,
      JSON.stringify(deletedIds)
    );
  }
}
