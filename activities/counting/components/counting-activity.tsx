import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { playCorrectSound } from '@/src/utils/sound';
import { speakInstruction } from '@/src/utils/speech';
import { useActivityHint } from '@/hooks/use-activity-hint';
import {
  CountingActivityProps,
  CountingItemDef,
  PlacedCountingItem,
} from '../types';
import { CountingBasket } from './counting-basket';
import { DraggableCountItem } from './draggable-count-item';
import { CountingGuide } from './counting-guide';

const NUMBER_WORDS: Record<number, string> = {
  1: 'One',
  2: 'Two',
  3: 'Three',
  4: 'Four',
  5: 'Five',
  6: 'Six',
  7: 'Seven',
};

interface RoundConfig {
  targetCount: number;
  itemType: string;
  itemName: string;
  shelfCount: number;
}

const ROUND_FRUITS: Array<{ type: string; name: string }> = [
  { type: 'apple', name: 'Apples' },
  { type: 'banana', name: 'Bananas' },
  { type: 'orange', name: 'Oranges' },
  { type: 'strawberry', name: 'Strawberries' },
  { type: 'carrot', name: 'Carrots' },
  { type: 'tomato', name: 'Tomatoes' },
  { type: 'grape', name: 'Grapes' },
];

export default function CountingActivity({
  contentData,
  onComplete,
  onFeedback,
  onIncorrectAttempt,
  hintSignal,
}: CountingActivityProps) {
  const { width, height: screenHeight } = useWindowDimensions();
  const isTablet = width >= 768;

  // Session has 3 rounds (3 numbers per session)
  const TOTAL_ROUNDS = 3;
  const [currentRound, setCurrentRound] = useState(1);

  // Round 1 configuration (defaults to target 3 as specified)
  const initialTarget = Number(contentData?.target_count) || 3;
  const [roundConfig, setRoundConfig] = useState<RoundConfig>({
    targetCount: initialTarget,
    itemType: contentData?.item_type || 'apple',
    itemName: contentData?.item_name || 'Apples',
    shelfCount: Math.max(initialTarget + 2, 6),
  });

  // Keep refs in sync for reliable timer closures
  const currentRoundRef = useRef(1);
  const roundConfigRef = useRef(roundConfig);
  roundConfigRef.current = roundConfig;

  // Runtime items state
  const [shelfItems, setShelfItems] = useState<CountingItemDef[]>([]);
  const [placedItems, setPlacedItems] = useState<PlacedCountingItem[]>([]);
  const placedItemsRef = useRef<PlacedCountingItem[]>([]);
  const [isRoundCompleted, setIsRoundCompleted] = useState(false);

  // Visual Guide State
  const [showGuide, setShowGuide] = useState(true);
  const [startGuidePos, setStartGuidePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [basketRect, setBasketRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    pageX: number;
    pageY: number;
  } | null>(null);

  // Tracking metrics across rounds
  const roundStartTimeRef = useRef<number>(Date.now());
  const sessionStartTimeRef = useRef<number>(Date.now());
  const roundMistakesRef = useRef(0);
  const totalMistakesRef = useRef(0);
  const roundDurationsRef = useRef<number[]>([]);

  const isTransitioningRef = useRef(false);
  const basketRef = useRef<View | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load items for a given round
  const loadRound = (roundNum: number, target: number, fruitIndex: number) => {
    currentRoundRef.current = roundNum;
    setCurrentRound(roundNum);

    const fruit = ROUND_FRUITS[fruitIndex % ROUND_FRUITS.length];
    const newConfig: RoundConfig = {
      targetCount: Number(target),
      itemType: fruit.type,
      itemName: fruit.name,
      shelfCount: Math.max(Number(target) + 3, 6),
    };

    roundConfigRef.current = newConfig;
    setRoundConfig(newConfig);

    // Create fresh items for the shelf
    const items: CountingItemDef[] = Array.from({ length: newConfig.shelfCount }).map((_, index) => ({
      id: `${fruit.type}-r${roundNum}-${index}-${Date.now()}`,
      name: fruit.type,
      category: 'fruits',
      assetKey: fruit.type,
      label: fruit.name,
    }));

    setShelfItems(items);
    placedItemsRef.current = [];
    setPlacedItems([]);
    setIsRoundCompleted(false);
    setShowGuide(roundNum === 1); // Guide appears on the first round of the session
    roundMistakesRef.current = 0;
    roundStartTimeRef.current = Date.now();
    isTransitioningRef.current = false;

    // Announce instruction
    const instruction = `Drag ${target} ${fruit.name.toLowerCase()} into the basket!`;
    onFeedback?.(instruction);
    speakInstruction(instruction);
  };

  // Initialize on mount
  useEffect(() => {
    sessionStartTimeRef.current = Date.now();
    totalMistakesRef.current = 0;
    roundDurationsRef.current = [];
    currentRoundRef.current = 1;
    setCurrentRound(1);
    placedItemsRef.current = [];
    loadRound(1, initialTarget, 0);

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);

  // Activity Hint hook
  const { isHintActive, hintsUsed, triggerHint, resetForNextQuestion } = useActivityHint({
    getClueText: () => {
      const remaining = Number(roundConfigRef.current.targetCount) - placedItemsRef.current.length;
      return `Clue: Drag ${remaining} more ${roundConfigRef.current.itemName.toLowerCase()} into the basket!`;
    },
    onFeedback,
  });

  // Listen for manual Hint button press from SetManager header
  const lastHintSignalRef = useRef(hintSignal);
  useEffect(() => {
    if (hintSignal !== undefined && hintSignal !== lastHintSignalRef.current) {
      lastHintSignalRef.current = hintSignal;
      setShowGuide(true);
      triggerHint();
    }
  }, [hintSignal, triggerHint]);

  // Restart idle timer
  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (!isRoundCompleted && placedItemsRef.current.length < Number(roundConfigRef.current.targetCount)) {
      idleTimerRef.current = setTimeout(() => {
        setShowGuide(true);
      }, 7000);
    }
  };

  const handleDragStart = () => {
    setShowGuide(false);
    resetIdleTimer();
  };

  // Successful item placement into the basket
  const handleDropSuccess = (item: CountingItemDef) => {
    const currentPlaced = placedItemsRef.current;
    const target = Number(roundConfigRef.current.targetCount);

    if (isTransitioningRef.current || currentPlaced.length >= target) return;

    setShowGuide(false);
    resetIdleTimer();

    // Sound chime and haptic feedback
    playCorrectSound();
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    const newCount = currentPlaced.length + 1;
    const newPlacedItem: PlacedCountingItem = {
      ...item,
      countNumber: newCount,
      placedAt: Date.now(),
    };

    // Synchronously update ref and React state
    const updatedPlaced = [...currentPlaced, newPlacedItem];
    placedItemsRef.current = updatedPlaced;
    setPlacedItems(updatedPlaced);
    setShelfItems((prev) => prev.filter((i) => i.id !== item.id));

    const word = NUMBER_WORDS[newCount] || String(newCount);

    // Check if target count for current round is reached
    if (newCount >= target) {
      isTransitioningRef.current = true;
      setIsRoundCompleted(true);

      const roundDuration = Math.max(1, Math.round((Date.now() - roundStartTimeRef.current) / 1000));
      roundDurationsRef.current.push(roundDuration);
      totalMistakesRef.current += roundMistakesRef.current;

      // Real-time speech: Pronounce count and celebrate in one fluid sentence!
      const itemNameLower = roundConfigRef.current.itemName.toLowerCase();
      const praise = `${word}! Good job! You put ${target} ${itemNameLower} in the basket!`;
      onFeedback?.(`Good job! 🌟 ${target} ${itemNameLower} in the basket!`);
      speakInstruction(praise);

      // AUTOMATIC TRANSITION AFTER 2.2 SECONDS:
      // The basket empties out, new target number generates, fresh set of fruits appears on shelf
      transitionTimerRef.current = setTimeout(() => {
        const roundNum = currentRoundRef.current;
        if (roundNum < TOTAL_ROUNDS) {
          const nextRoundNum = roundNum + 1;
          currentRoundRef.current = nextRoundNum;
          setCurrentRound(nextRoundNum);

          // ADAPTIVE DIFFICULTY CALCULATION:
          // User requirement: "in the first one they cannot put 3 fruits inside the basket faster so the next activity will only be 2"
          let nextTarget: number;
          if (nextRoundNum === 2) {
            // Evaluated based on first round performance
            const isSlowOrStruggled = roundDuration > 12 || roundMistakesRef.current > 0;
            if (isSlowOrStruggled) {
              nextTarget = 2; // Downgrade to 2 if slower or struggled
            } else {
              nextTarget = 4; // Upgrade to 4 if fast and accurate
            }
          } else {
            // Round 3 difficulty based on Round 2 performance
            const prevTarget = Number(roundConfigRef.current.targetCount);
            const isRound2Slow = roundDuration > 12 || roundMistakesRef.current > 0;
            if (isRound2Slow) {
              nextTarget = Math.max(2, prevTarget - 1);
            } else {
              nextTarget = Math.min(5, prevTarget + 1);
            }
          }

          // AUTOMATIC RESET: basket empties out, new set of fruits appears on shelf
          loadRound(nextRoundNum, nextTarget, nextRoundNum);
        } else {
          // ALL 3 ROUNDS COMPLETED!
          const totalSessionDuration = Math.max(1, Math.round((Date.now() - sessionStartTimeRef.current) / 1000));
          const totalMistakes = totalMistakesRef.current;

          onFeedback?.('Incredible! You completed all 3 counting activities! 🎉');
          speakInstruction('Incredible! You completed all 3 counting activities! Great work!');

          // Calls SetManager onComplete which displays the teacher evaluation / FeedbackModal!
          onComplete?.(15, totalSessionDuration, totalMistakes, hintsUsed);
        }
      }, 2200);
    } else {
      // Intermediate drop: Real-time speech counting along out loud!
      speakInstruction(word);
      const remaining = target - newCount;
      const itemNameLower = roundConfigRef.current.itemName.toLowerCase();
      onFeedback?.(`${word}! 🍎 ${remaining} more ${itemNameLower} to go!`);
    }
  };

  const handleDropMiss = (item: CountingItemDef) => {
    roundMistakesRef.current += 1;
    onIncorrectAttempt?.();
    resetIdleTimer();
    onFeedback?.(`Drag the ${roundConfig.itemName.toLowerCase()} inside the basket!`);
  };

  const handleBasketLayout = (layout: {
    x: number;
    y: number;
    width: number;
    height: number;
    pageX: number;
    pageY: number;
  }) => {
    setBasketRect(layout);
  };

  const itemSize = isTablet ? 72 : 56;
  const guideTargetX = basketRect ? basketRect.pageX + basketRect.width / 2 : width / 2;
  const guideTargetY = basketRect ? basketRect.pageY + basketRect.height * 0.45 : screenHeight * 0.55;

  return (
    <View style={styles.container}>
      {/* 1. TOP SHELF: Tray of Draggable Fruits/Veggies/Items */}
      <View style={styles.shelfSection}>
        <View style={styles.shelfHeader}>
          <View style={styles.roundBadge}>
            <Text style={styles.roundText}>Round {currentRound} of {TOTAL_ROUNDS}</Text>
          </View>
          <Text style={styles.shelfSub}>Drag or tap to count</Text>
        </View>

        <View style={styles.shelfTray}>
          {shelfItems.map((item, index) => (
            <DraggableCountItem
              key={item.id}
              item={item}
              size={itemSize}
              basketRect={basketRect}
              onDragStart={handleDragStart}
              onDropSuccess={handleDropSuccess}
              onDropMiss={handleDropMiss}
              disabled={isRoundCompleted}
              isFirstItem={index === 0}
              onLayoutPos={(pos) => setStartGuidePos(pos)}
            />
          ))}
        </View>
      </View>

      {/* 2. CENTER: Woven Basket with Target Badge, Inside Nest, & Counter Below */}
      <View
        style={styles.basketSection}
        onLayout={(e) => {
          const l = e.nativeEvent.layout;
          if (l.width > 0 && l.height > 0) {
            setBasketRect((prev) => prev || {
              x: l.x,
              y: l.y,
              width: l.width,
              height: l.height,
              pageX: l.x,
              pageY: l.y,
            });
          }
        }}
      >
        <CountingBasket
          basketRef={basketRef}
          targetCount={roundConfig.targetCount}
          currentCount={placedItems.length}
          placedItems={placedItems}
          isTargetReached={isRoundCompleted}
          onBasketLayout={handleBasketLayout}
        />
      </View>

      {/* 3. GUIDELINE ON FIRST DRAG (Animated dotted curve + finger) */}
      <CountingGuide
        startX={startGuidePos.x}
        startY={startGuidePos.y}
        targetX={guideTargetX}
        targetY={guideTargetY}
        visible={showGuide && !isRoundCompleted && placedItems.length === 0}
        label={`Drag into basket!`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  shelfSection: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  shelfHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 520,
    marginBottom: 6,
    paddingHorizontal: 8,
  },
  roundBadge: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#FCD34D',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  roundText: {
    fontFamily: 'FredokaOne_400Regular',
    fontSize: 12,
    color: '#D97706',
    textTransform: 'uppercase',
  },
  shelfSub: {
    fontFamily: 'Quicksand_600SemiBold',
    fontSize: 12,
    color: '#94A3B8',
  },
  shelfTray: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderBottomWidth: 4,
    borderBottomColor: '#CBD5E1',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 80,
    maxWidth: 540,
    width: '100%',
  },
  basketSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
});
