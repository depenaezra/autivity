export type ThemeColor = 'blue' | 'yellow' | 'green' | 'orange';

export type VideoCategoryKey = 'dance' | 'energizer' | 'singalong' | 'calm' | 'morning';

export interface VideoCategoryOption {
  key: VideoCategoryKey;
  label: string;
  badgeText: string;
  themeColor: ThemeColor;
  icon: string;
}

export interface WarmupVideo {
  id: string;
  title: string;
  category: VideoCategoryKey;
  categoryLabel: string;
  youtubeId: string;
  duration: string;
  themeColor: ThemeColor;
  description: string;
  isCustom?: boolean;
  isArchived?: boolean;
}

export const THEME_COLOR_MAP: Record<
  ThemeColor,
  { stroke: string; font: string; bg: string; badgeBg: string }
> = {
  blue: {
    stroke: '#BBE8FB',
    font: '#62A9E6',
    bg: '#F0F9FF',
    badgeBg: '#BBE8FB',
  },
  green: {
    stroke: '#CBFAC4',
    font: '#179D33',
    bg: '#F0FDF4',
    badgeBg: '#CBFAC4',
  },
  orange: {
    stroke: '#FFDBD4',
    font: '#FF8870',
    bg: '#FFF7F5',
    badgeBg: '#FFDBD4',
  },
  yellow: {
    stroke: '#FFF3C4',
    font: '#FFAE02',
    bg: '#FEFCE8',
    badgeBg: '#FFF3C4',
  },
};

export const CATEGORY_OPTIONS: VideoCategoryOption[] = [
  {
    key: 'dance',
    label: 'Dance & Movement',
    badgeText: '🕺 DANCE & MOVEMENT',
    themeColor: 'blue',
    icon: 'body',
  },
  {
    key: 'energizer',
    label: 'Quick Energizer',
    badgeText: '⚡ ENERGIZER',
    themeColor: 'orange',
    icon: 'flash',
  },
  {
    key: 'singalong',
    label: 'Sing-Along',
    badgeText: '⭐ SING-ALONG',
    themeColor: 'yellow',
    icon: 'musical-notes',
  },
  {
    key: 'calm',
    label: 'Calm & Reset',
    badgeText: '🧘 CALM & RESET',
    themeColor: 'green',
    icon: 'leaf',
  },
  {
    key: 'morning',
    label: 'Morning Routine',
    badgeText: '☀️ MORNING ROUTINE',
    themeColor: 'yellow',
    icon: 'sunny',
  },
];

export const DEFAULT_WARMUP_VIDEOS: WarmupVideo[] = [
  {
    id: 'video-1',
    title: 'Head Shoulders Knees & Toes',
    category: 'dance',
    categoryLabel: '🕺 DANCE & MOVEMENT',
    youtubeId: 'h4eueDYPTIg',
    duration: '2:30',
    themeColor: 'blue',
    description: 'Classic body parts identification and gross motor coordination exercise song.',
  },
  {
    id: 'video-2',
    title: 'Sports Day Kids Dance Warm-Up',
    category: 'energizer',
    categoryLabel: '⚡ ENERGIZER',
    youtubeId: 'ATvLdbbFXKI',
    duration: '3:15',
    themeColor: 'orange',
    description: 'High-energy, upbeat exercise warm-up perfect for morning activity or physical play.',
  },
  {
    id: 'video-3',
    title: 'Action Dance & Movement for Kids',
    category: 'dance',
    categoryLabel: '🕺 DANCE & MOVEMENT',
    youtubeId: 'VFRhKGp_YHI',
    duration: '2:50',
    themeColor: 'blue',
    description: 'Rhythmic steps and catchy beats to get students active and engaged.',
  },
  {
    id: 'video-4',
    title: 'Freeze Dance & Fun Exercise',
    category: 'dance',
    categoryLabel: '🕺 DANCE & MOVEMENT',
    youtubeId: 'nzK7Fe9sFVA',
    duration: '3:05',
    themeColor: 'blue',
    description: 'Fun freeze game to train self-regulation, body awareness, and active listening.',
  },
  {
    id: 'video-5',
    title: 'A Ram Sam Sam - Action Song',
    category: 'singalong',
    categoryLabel: '⭐ SING-ALONG',
    youtubeId: 'MU5nBCF5c94',
    duration: '2:40',
    themeColor: 'yellow',
    description: 'Playful rhythm, clapping, and fast-action motions for coordination.',
  },
  {
    id: 'video-6',
    title: 'Kids Movement & Warm-Up Dance',
    category: 'energizer',
    categoryLabel: '⚡ ENERGIZER',
    youtubeId: 'ViZ5S7tacXk',
    duration: '3:10',
    themeColor: 'orange',
    description: 'Quick dynamic warm-up to boost classroom focus and energy.',
  },
  {
    id: 'video-7',
    title: "Tayo'y Mag-ehersisyo (Let's Exercise)",
    category: 'energizer',
    categoryLabel: '⚡ ENERGIZER',
    youtubeId: 'AwyWxM5HyX4',
    duration: '2:45',
    themeColor: 'orange',
    description: "Catchy Philippine classroom exercise song for gross motor warm-ups.",
  },
  {
    id: 'video-8',
    title: 'Charlie Bear Agadoo - Energizer Dance',
    category: 'dance',
    categoryLabel: '🕺 DANCE & MOVEMENT',
    youtubeId: 'VtEcBIn8kRo',
    duration: '3:20',
    themeColor: 'blue',
    description: 'Popular group energizer routine with guided dance steps for the whole class.',
  },
];

/**
 * Extracts a YouTube Video ID from standard URLs or returns the raw ID if valid.
 */
export function extractYoutubeId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // If already 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Handle youtu.be/VIDEO_ID
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  // Handle youtube.com/watch?v=VIDEO_ID
  const longMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (longMatch) return longMatch[1];

  // Handle youtube.com/embed/VIDEO_ID
  const embedMatch = trimmed.match(/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  // Handle youtube.com/shorts/VIDEO_ID
  const shortsMatch = trimmed.match(/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return shortsMatch[1];

  return null;
}
