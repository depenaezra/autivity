export type RegulationZoneKey = 'optimal' | 'heightened' | 'low_energy';

export interface EmotionMeta {
  id: string;
  label: string;
  tagalogLabel: string;
  zone: RegulationZoneKey;
  image: any;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface RegulationZoneInfo {
  key: RegulationZoneKey;
  title: string;
  tagline: string;
  color: string;
  bgColor: string;
  borderColor: string;
  trackBg: string;
  emotions: string[];
}

export const REGULATION_ZONES: Record<RegulationZoneKey, RegulationZoneInfo> = {
  optimal: {
    key: 'optimal',
    title: 'Optimal Learning',
    tagline: 'Focused & Ready to Learn',
    color: '#179D33',
    bgColor: '#F0FDF4',
    borderColor: '#CBFAC4',
    trackBg: '#E8FDE4',
    emotions: ['happy', 'calm'],
  },
  heightened: {
    key: 'heightened',
    title: 'Heightened State',
    tagline: 'High Energy or Alert',
    color: '#FF8870',
    bgColor: '#FFF7ED',
    borderColor: '#FFDBD4',
    trackBg: '#FFEFEA',
    emotions: ['excited', 'nervous'],
  },
  low_energy: {
    key: 'low_energy',
    title: 'Low Energy',
    tagline: 'Fatigued or Needs Rest',
    color: '#62A9E6',
    bgColor: '#F0F9FF',
    borderColor: '#BBE8FB',
    trackBg: '#E0F2FE',
    emotions: ['tired', 'sad'],
  },
};

export const EMOTIONS_METADATA: Record<string, EmotionMeta> = {
  happy: {
    id: 'happy',
    label: 'HAPPY',
    tagalogLabel: 'Masaya',
    zone: 'optimal',
    image: require('@/assets/images/student/emotions/happy.gif'),
    color: '#16A34A',
    bgColor: '#F0FDF4',
    borderColor: '#CBFAC4',
  },
  calm: {
    id: 'calm',
    label: 'CALM',
    tagalogLabel: 'Kalmado',
    zone: 'optimal',
    image: require('@/assets/images/student/emotions/calm.gif'),
    color: '#62A9E6',
    bgColor: '#F0F9FF',
    borderColor: '#BBE8FB',
  },
  excited: {
    id: 'excited',
    label: 'EXCITED',
    tagalogLabel: 'Masigla',
    zone: 'heightened',
    image: require('@/assets/images/student/emotions/excited.gif'),
    color: '#FF8870',
    bgColor: '#FFF7ED',
    borderColor: '#FFDBD4',
  },
  tired: {
    id: 'tired',
    label: 'TIRED',
    tagalogLabel: 'Pagod',
    zone: 'low_energy',
    image: require('@/assets/images/student/emotions/tired.gif'),
    color: '#6366F1',
    bgColor: '#EEF2FF',
    borderColor: '#E0E7FF',
  },
  sad: {
    id: 'sad',
    label: 'SAD',
    tagalogLabel: 'Malungkot',
    zone: 'low_energy',
    image: require('@/assets/images/student/emotions/sad.gif'),
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    borderColor: '#DBEAFE',
  },
  nervous: {
    id: 'nervous',
    label: 'NERVOUS',
    tagalogLabel: 'Kinakabahan',
    zone: 'heightened',
    image: require('@/assets/images/student/emotions/nervous.gif'),
    color: '#D97706',
    bgColor: '#FFFBEB',
    borderColor: '#FFF3C4',
  },
};

export const getEmotionZone = (emotionId: string): RegulationZoneKey => {
  const meta = EMOTIONS_METADATA[emotionId?.toLowerCase()];
  return meta ? meta.zone : 'optimal';
};

export const getEmotionMeta = (emotionId: string): EmotionMeta | null => {
  return EMOTIONS_METADATA[emotionId?.toLowerCase()] || null;
};
