import React from 'react';
import { Image, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

// Images available in the project
export const COUNTING_IMAGE_ASSETS: Record<string, any> = {
  apple: require('@/assets/images/activities/drag-drop/apple.png'),
  banana: require('@/assets/images/activities/drag-drop/banana.png'),
  orange: require('@/assets/images/activities/drag-drop/orange.png'),
  strawberry: require('@/assets/images/activities/drag-drop/strawberry.png'),
  grape: require('@/assets/images/activities/drag-drop/grape.png'),
  toy: require('@/assets/images/activities/drag-drop/colors/toys/toy.png'),
  dinosaur: require('@/assets/images/activities/drag-drop/colors/toys/dinosaur.png'),
  yoyo: require('@/assets/images/activities/drag-drop/colors/toys/yoyo.png'),
  crayon: require('@/assets/images/activities/drag-drop/colors/school-supplies/crayon.png'),
  pencil: require('@/assets/images/activities/drag-drop/colors/school-supplies/pencil.png'),
  book: require('@/assets/images/activities/drag-drop/colors/school-supplies/book.png'),
};

// SVG Vegetable Icons
export function CarrotSvg({ size = 60 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Green Tops */}
      <Path
        d="M50 24 C45 10 32 8 30 18 C35 22 45 25 48 30"
        fill="#22C55E"
        stroke="#15803D"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <Path
        d="M50 24 C50 6 56 6 56 16 C55 22 52 26 50 30"
        fill="#16A34A"
        stroke="#15803D"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <Path
        d="M50 24 C55 10 68 8 70 18 C65 22 55 25 52 30"
        fill="#4ADE80"
        stroke="#15803D"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Orange Carrot Body */}
      <Path
        d="M32 32 C30 27 70 27 68 32 C65 48 54 85 50 92 C46 85 35 48 32 32 Z"
        fill="#FB923C"
        stroke="#EA580C"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Texture ridges */}
      <Path d="M38 42 Q46 44 43 46" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M57 54 Q49 56 52 58" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M42 66 Q48 68 46 70" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
      {/* Shiny highlight */}
      <Path
        d="M36 34 C35 44 42 70 46 80"
        stroke="#FED7AA"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity={0.7}
      />
    </Svg>
  );
}

export function TomatoSvg({ size = 60 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Red Tomato Body */}
      <Ellipse
        cx="50"
        cy="56"
        rx="36"
        ry="32"
        fill="#EF4444"
        stroke="#DC2626"
        strokeWidth="3"
      />
      {/* Highlight sheen */}
      <Ellipse
        cx="40"
        cy="44"
        rx="10"
        ry="6"
        fill="#FCA5A5"
        opacity={0.6}
        transform="rotate(-20 40 44)"
      />
      {/* Green Stem and Calyx leaves */}
      <Path
        d="M50 26 C50 18 56 16 54 26"
        stroke="#15803D"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <Path
        d="M50 26 L42 22 L45 28 L35 30 L44 33 L40 40 L48 34 L50 42 L52 34 L60 40 L56 33 L65 30 L55 28 L58 22 Z"
        fill="#22C55E"
        stroke="#15803D"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function BroccoliSvg({ size = 60 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Stalk */}
      <Path
        d="M42 56 C40 70 38 82 40 88 C44 90 56 90 60 88 C62 82 60 70 58 56"
        fill="#86EFAC"
        stroke="#16A34A"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <Path d="M48 64 Q50 78 48 84" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" />
      {/* Florets */}
      <Circle cx="32" cy="50" r="16" fill="#15803D" stroke="#166534" strokeWidth="2.5" />
      <Circle cx="68" cy="50" r="16" fill="#15803D" stroke="#166534" strokeWidth="2.5" />
      <Circle cx="40" cy="34" r="17" fill="#16A34A" stroke="#166534" strokeWidth="2.5" />
      <Circle cx="60" cy="34" r="17" fill="#16A34A" stroke="#166534" strokeWidth="2.5" />
      <Circle cx="50" cy="24" r="16" fill="#22C55E" stroke="#166534" strokeWidth="2.5" />
      <Circle cx="50" cy="42" r="16" fill="#16A34A" />
      {/* Highlights */}
      <Circle cx="48" cy="22" r="4" fill="#BBF7D0" opacity={0.6} />
      <Circle cx="38" cy="32" r="4" fill="#BBF7D0" opacity={0.6} />
      <Circle cx="58" cy="32" r="4" fill="#BBF7D0" opacity={0.6} />
    </Svg>
  );
}

export function CornSvg({ size = 60 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Corn Cob */}
      <Path
        d="M40 30 C40 18 60 18 60 30 C60 55 58 75 50 82 C42 75 40 55 40 30 Z"
        fill="#FACC15"
        stroke="#CA8A04"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Kernels grid lines */}
      <Path d="M43 32 Q50 34 57 32" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" />
      <Path d="M42 42 Q50 44 58 42" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" />
      <Path d="M43 52 Q50 54 57 52" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" />
      <Path d="M44 62 Q50 64 56 62" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" />
      <Path d="M50 22 L50 74" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" />
      {/* Green Husk leaves */}
      <Path
        d="M36 78 C30 65 28 45 32 38 C35 52 38 70 48 80 Z"
        fill="#4ADE80"
        stroke="#16A34A"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <Path
        d="M64 78 C70 65 72 45 68 38 C65 52 62 70 52 80 Z"
        fill="#22C55E"
        stroke="#16A34A"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

interface CountingItemAssetProps {
  itemType: string;
  size?: number;
}

export function CountingItemAsset({ itemType, size = 64 }: CountingItemAssetProps) {
  const normalized = (itemType || 'apple').toLowerCase().trim();

  // Veggies
  if (normalized.includes('carrot')) {
    return <CarrotSvg size={size} />;
  }
  if (normalized.includes('tomato')) {
    return <TomatoSvg size={size} />;
  }
  if (normalized.includes('broccoli')) {
    return <BroccoliSvg size={size} />;
  }
  if (normalized.includes('corn')) {
    return <CornSvg size={size} />;
  }

  // Fruits & Items from existing assets
  const source = COUNTING_IMAGE_ASSETS[normalized] || COUNTING_IMAGE_ASSETS.apple;

  return (
    <Image
      source={source}
      style={{
        width: size,
        height: size,
      }}
      resizeMode="contain"
    />
  );
}
