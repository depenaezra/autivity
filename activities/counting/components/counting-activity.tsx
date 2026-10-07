import React, { useEffect, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
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
  CountingItemCategory,
  PlacedCountingItem,
} from '../types';
import { CountingBasket } from './counting-basket';
import { DraggableCountItem } from './draggable-count-item';
import { CountingGuide } from './counting-guide';
import {
  determineAdaptiveNextTarget,
  getRandomInitialCountingTarget,
} from '../data/counting-levels';

const NUMBER_WORDS: Record<number, string> = {
  1: 'One',
  2: 'Two',
  3: 'Three',
  4: 'Four',
  5: 'Five',
  6: 'Six',
  7: 'Seven',
  8: 'Eight',
  9: 'Nine',
  10: 'Ten',
};

interface RoundConfig {
  targetCount: number;
  itemType: string;
  itemName: string;
  shelfCount: number;
  category: CountingItemCategory;
}

const ROUND_ITEMS: Array<{ type: string; name: string; category: CountingItemCategory }> = [
  { type: 'apple', name: 'Apples', category: 'fruits' },
  { type: 'banana', name: 'Bananas', category: 'fruits' },
  { type: 'orange', name: 'Oranges', category: 'fruits' },
  { type: 'strawberry', name: 'Strawberries', category: 'fruits' },
  { type: 'carrot', name: 'Carrots', category: 'veggies' },
  { type: 'tomato', name: 'Tomatoes', category: 'veggies' },
  { type: 'broccoli', name: 'Broccoli', category: 'veggies' },
  { type: 'corn', name: 'Corn', category: 'veggies' },
  { type: 'grape', name: 'Grapes', category: 'fruits' },
  { type: 'toy', name: 'Toys', category: 'items' },
  { type: 'crayon', name: 'Crayons', category: 'items' },
  { type: 'pencil', name: 'Pencils', category: 'items' },
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

  // Session has 3 rounds (3 random activities per session)
  const TOTAL_ROUNDS = 3;
  const [currentRound, setCurrentRound] = useState(1);

  // Round 1 configuration: "random (2,3,4) on first" per user requirement
  const initialTarget =
    contentData?.target_count && [2, 3, 4].includes(Number(contentData.target_count))
      ? Number(contentData.target_count)
      : getRandomInitialCountingTarget();

  const initialItem = ROUND_ITEMS[Math.floor(Math.random() * ROUND_ITEMS.length)];

  const [roundConfig, setRoundConfig] = useState<RoundConfig>({
    targetCount: initialTarget,
    itemType: contentData?.item_type || initialItem.type,
    itemName: contentData?.item_name || initialItem.name,
    shelfCount: Math.max(initialTarget + 3, 6),
    category: contentData?.category_type || initialItem.category,
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

  const containerRef = useRef<View | null>(null);
  const [containerLayout, setContainerLayout] = useState<{
    width: number;
    height: number;
    pageX: number;
    pageY: number;
  }>({
    width: 0,
    height: 0,
    pageX: 0,
    pageY: 0,
  });

  const handleContainerLayout = (e: LayoutChangeEvent) => {
    const { width: cw, height: ch } = e.nativeEvent.layout;
    if (containerRef.current) {
      containerRef.current.measureInWindow((x, y) => {
        setContainerLayout({
          width: cw,
          height: ch,
          pageX: x || 0,
          pageY: y || 0,
        });
      });
    } else {
      setContainerLayout((prev) => ({ ...prev, width: cw, height: ch }));
    }
  };

  const defaultBasketWidth = isTablet ? 320 : 250;
  const defaultBasketHeight = isTablet ? 210 : 165;
  const defaultBasketX = (width - defaultBasketWidth) / 2;
  const defaultBasketY = Math.max(180, (screenHeight - defaultBasketHeight) * 0.52);

  const [basketRect, setBasketRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    pageX: number;
    pageY: number;
  }>({
    x: defaultBasketX,
    y: defaultBasketY,
    width: defaultBasketWidth,
    height: defaultBasketHeight,
    pageX: defaultBasketX,
    pageY: defaultBasketY,
  });

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
  const loadRound = (
    roundNum: number,
    target: number,
    itemIndex: number,
    adaptiveResult?: { aiMessage: string; reasoning: string }
  ) => {
    currentRoundRef.current = roundNum;
    setCurrentRound(roundNum);

    const item = ROUND_ITEMS[itemIndex % ROUND_ITEMS.length];
    const newConfig: RoundConfig = {
      targetCount: Number(target),
      itemType: item.type,
      itemName: item.name,
      shelfCount: Math.max(Number(target) + 3, target <= 4 ? 6 : target + 2),
      category: item.category,
    };

    roundConfigRef.current = newConfig;
    setRoundConfig(newConfig);

    // Create fresh items for the shelf
    const items: CountingItemDef[] = Array.from({ length: newConfig.shelfCount }).map((_, index) => ({
      id: `${item.type}-r${roundNum}-${index}-${Date.now()}`,
      name: item.type,
      category: item.category,
      assetKey: item.type,
      label: item.name,
    }));

    setShelfItems(items);
    placedItemsRef.current = [];
    setPlacedItems([]);
    setIsRoundCompleted(false);
    setShowGuide(roundNum === 1); // Guide appears on the first round of the session
    roundMistakesRef.current = 0;
    roundStartTimeRef.current = Date.now();
    isTransitioningRef.current = false;
    resetForNextQuestion();

    // Announce instruction and adaptive feedback
    const roundInstruction = `Drag ${target} ${item.name.toLowerCase()} into the basket!`;
    if (adaptiveResult) {
      const fullSpeech = `${adaptiveResult.aiMessage} ${roundInstruction}`;
      onFeedback?.(`${adaptiveResult.reasoning}\n${roundInstruction}`);
      speakInstruction(fullSpeech);
    } else {
      onFeedback?.(roundInstruction);
      speakInstruction(roundInstruction);
    }
  };

  // Initialize on mount
  useEffect(() => {
    sessionStartTimeRef.current = Date.now();
    totalMistakesRef.current = 0;
    roundDurationsRef.current = [];
    currentRoundRef.current = 1;
    setCurrentRound(1);
    placedItemsRef.current = [];
    const randomFirstItemIndex = Math.floor(Math.random() * ROUND_ITEMS.length);
    loadRound(1, initialTarget, randomFirstItemIndex);

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
      // The basket empties out, new target number generates, fresh set of items appears on shelf
      transitionTimerRef.current = setTimeout(() => {
        const roundNum = currentRoundRef.current;
        if (roundNum < TOTAL_ROUNDS) {
          const nextRoundNum = roundNum + 1;
          currentRoundRef.current = nextRoundNum;
          setCurrentRound(nextRoundNum);

          // RULE-BASED ADAPTIVE AI:
          // User requirement: "the performnce on first will be rule based AI to determine whether to give more difficult or easy numbers if kid finished it under 1 minute then harder when 1 min above then easier"
          const prevTarget = Number(roundConfigRef.current.targetCount);
          const adaptiveResult = determineAdaptiveNextTarget(
            nextRoundNum,
            roundDuration,
            roundMistakesRef.current,
            prevTarget
          );

          // Pick a different random item from the pool for variety
          const nextItemIndex = Math.floor(Math.random() * ROUND_ITEMS.length);

          // AUTOMATIC RESET: basket empties out, new set of items appears on shelf
          loadRound(nextRoundNum, adaptiveResult.nextTarget, nextItemIndex, adaptiveResult);
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

  const isHighTarget = roundConfig.targetCount > 5;
  const itemSize = isTablet ? (isHighTarget ? 58 : 72) : (isHighTarget ? 44 : 56);

  const containerWidth = containerLayout.width > 0 ? containerLayout.width : width;
  const containerHeight = containerLayout.height > 0 ? containerLayout.height : screenHeight;
  const containerCenterX = containerWidth / 2;

  // Horizontal position: On tablet, guide is strictly centered from middle item to basket center!
  const guideTargetX = isTablet
    ? containerCenterX
    : (basketRect.pageX > 0 && containerLayout.pageX > 0
        ? basketRect.pageX - containerLayout.pageX + basketRect.width / 2
        : containerCenterX);

  const guideStartX = isTablet
    ? containerCenterX
    : (startGuidePos.x > 0 && containerLayout.pageX > 0
        ? startGuidePos.x - containerLayout.pageX
        : (startGuidePos.x > 0 ? startGuidePos.x : containerCenterX));

  // Vertical position: container-relative Y coordinates
  const guideStartY = startGuidePos.y > 0 && containerLayout.pageY > 0
    ? startGuidePos.y - containerLayout.pageY
    : (isTablet ? 78 : 65);

  const guideTargetY = basketRect.pageY > 0 && containerLayout.pageY > 0
    ? (basketRect.pageY - containerLayout.pageY) + basketRect.height * 0.45
    : (containerHeight * 0.58);

  // Guide points to the middle item on the shelf
  const guideItemIndex = Math.floor(shelfItems.length / 2);

  return (
    <View
      ref={containerRef}
      onLayout={handleContainerLayout}
      style={styles.container}
    >
      {/* 1. TOP SHELF: Tray of Draggable Fruits/Veggies/Items */}
      <View style={styles.shelfSection}>
        <View style={styles.shelfHeader}>
          <View style={styles.roundBadge}>
            <Text style={styles.roundText}>Round {currentRound} of {TOTAL_ROUNDS}</Text>
          </View>
          <Text style={styles.shelfSub}>Drag items into the basket</Text>
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
              isGuideItem={index === guideItemIndex}
              onLayoutPos={(pos) => setStartGuidePos(pos)}
            />
          ))}
        </View>
      </View>

      {/* 2. CENTER: Woven Basket with Target Badge, Inside Nest, & Counter Below */}
      <View style={styles.basketSection}>
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
        startX={guideStartX}
        startY={guideStartY}
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
