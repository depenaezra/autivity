import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  useWindowDimensions,
  LayoutChangeEvent,
} from 'react-native';
import Svg, {
  Path,
  Circle,
} from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import {
  TurnTakingLevel,
  TurnTakingPlayer,
} from '../types';

interface CurvedPathProps {
  level: TurnTakingLevel;
  player: TurnTakingPlayer;
  showGuide?: boolean;
  hintSignal?: number;
  onComplete: () => void;
  onMistake?: () => void;
}

type Point = {
  x: number;
  y: number;
};

const BASE_WIDTH = 360;
const BASE_HEIGHT = 500;
const PATH_TOLERANCE = 62;
const MAX_FORWARD_JUMP = 24;
const PENCIL_SIZE = 58;

/* =========================================================
   SMOOTH POINTS (Catmull-Rom Spline Interpolation)
========================================================= */

function createSmoothPoints(
  points: Point[],
  samplesPerSegment = 14
): Point[] {
  if (!points || points.length === 0) {
    return [];
  }

  if (points.length === 1) {
    return [points[0]];
  }

  const result: Point[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1] || points[i];
    const p3 = points[i + 2] || points[i + 1] || points[i];

    for (let j = 0; j < samplesPerSegment; j++) {
      const t = j / samplesPerSegment;
      const t2 = t * t;
      const t3 = t2 * t;

      const x =
        0.5 *
        (2 * p1.x +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);

      const y =
        0.5 *
        (2 * p1.y +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);

      result.push({ x, y });
    }
  }

  const lastPoint = points[points.length - 1];
  if (lastPoint) {
    result.push(lastPoint);
  }

  return result;
}

/* =========================================================
   SVG PATH GENERATOR
========================================================= */

function pointsToSvgPath(points: Point[]): string {
  if (!points || points.length === 0) {
    return '';
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    if (!current || !next) continue;

    const middleX = (current.x + next.x) / 2;
    const middleY = (current.y + next.y) / 2;

    path += ` Q ${current.x} ${current.y} ${middleX} ${middleY}`;
  }

  const last = points[points.length - 1];
  const previous = points[points.length - 2];

  if (last && previous) {
    path += ` Q ${previous.x} ${previous.y} ${last.x} ${last.y}`;
  }

  return path;
}

function distance(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function findClosestPathPoint(
  finger: Point,
  path: Point[],
  currentIndex: number
) {
  if (!path.length) {
    return {
      index: 0,
      distance: Number.MAX_VALUE,
    };
  }

  const safeCurrentIndex = Math.max(0, Math.min(currentIndex, path.length - 1));
  const start = Math.max(0, safeCurrentIndex - 12);
  const end = Math.min(path.length - 1, safeCurrentIndex + MAX_FORWARD_JUMP);

  let closestIndex = safeCurrentIndex;
  let closestDistance = Number.MAX_VALUE;

  for (let i = start; i <= end; i++) {
    const point = path[i];
    if (!point) continue;

    const currentDistance = distance(finger, point);
    if (currentDistance < closestDistance) {
      closestDistance = currentDistance;
      closestIndex = i;
    }
  }

  return {
    index: closestIndex,
    distance: closestDistance,
  };
}

/* =========================================================
   CURVED PATH COMPONENT
========================================================= */

export default function CurvedPath({
  level,
  player,
  showGuide = false,
  hintSignal = 0,
  onComplete,
  onMistake,
}: CurvedPathProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isTablet = windowWidth >= 768;

  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const rawPoints = level?.pathPoints || [];

  const smoothPoints = useMemo(
    () => createSmoothPoints(rawPoints, 14),
    [rawPoints]
  );

  const svgPath = useMemo(
    () => pointsToSvgPath(smoothPoints),
    [smoothPoints]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);

  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);

  const [finished, setFinished] = useState(false);
  const finishedRef = useRef(false);

  const isOutsideBoundaryRef = useRef(false);
  const lastMistakeTimeRef = useRef(0);

  const startPoint = smoothPoints[0] || { x: 165, y: 65 };
  const finishPoint = smoothPoints[smoothPoints.length - 1] || { x: 165, y: 440 };

  const [pencilPosition, setPencilPosition] = useState<Point>(startPoint);
  const pencilPositionRef = useRef<Point>(startPoint);
  const completionTriggered = useRef(false);

  // Responsive sizing & scaling to fit container and center in tablet
  const availableWidth = containerSize.width > 0
    ? containerSize.width - (isTablet ? 32 : 16)
    : Math.min(windowWidth - (isTablet ? 64 : 32), isTablet ? 600 : 360);

  const availableHeight = containerSize.height > 0
    ? containerSize.height - (isTablet ? 24 : 16)
    : (isTablet ? 560 : 480);

  const scale = useMemo(() => {
    if (availableWidth <= 0 || availableHeight <= 0) return isTablet ? 1.2 : 1.0;
    const s = Math.min(
      availableWidth / BASE_WIDTH,
      availableHeight / BASE_HEIGHT,
      isTablet ? 1.35 : 1.05
    );
    return Math.max(0.7, s);
  }, [availableWidth, availableHeight, isTablet]);

  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  const gameWidth = Math.round(BASE_WIDTH * scale);
  const gameHeight = Math.round(BASE_HEIGHT * scale);

  /* Reset state on level or points change */
  useEffect(() => {
    const start = smoothPoints[0] || { x: 165, y: 65 };
    currentIndexRef.current = 0;
    completionTriggered.current = false;
    finishedRef.current = false;
    isDraggingRef.current = false;
    isOutsideBoundaryRef.current = false;
    lastMistakeTimeRef.current = 0;

    setCurrentIndex(0);
    setIsDragging(false);
    setFinished(false);

    pencilPositionRef.current = start;
    setPencilPosition(start);
  }, [level?.id, smoothPoints]);

  const checkCompletion = (nextIndex: number) => {
    if (completionTriggered.current || smoothPoints.length === 0) return;

    const lastIndex = smoothPoints.length - 1;
    if (nextIndex >= Math.max(0, lastIndex - 5)) {
      completionTriggered.current = true;
      finishedRef.current = true;
      isDraggingRef.current = false;
      setFinished(true);
      setIsDragging(false);

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}

      setTimeout(() => {
        onComplete();
      }, 700);
    }
  };

  const movePencil = (fingerX: number, fingerY: number) => {
    if (finishedRef.current || smoothPoints.length === 0) return;

    const safeX = Math.max(
      PENCIL_SIZE / 2,
      Math.min(BASE_WIDTH - PENCIL_SIZE / 2, fingerX)
    );

    const safeY = Math.max(
      PENCIL_SIZE / 2,
      Math.min(BASE_HEIGHT - PENCIL_SIZE / 2, fingerY)
    );

    const nextPosition = { x: safeX, y: safeY };
    pencilPositionRef.current = nextPosition;
    setPencilPosition(nextPosition);

    const result = findClosestPathPoint(
      nextPosition,
      smoothPoints,
      currentIndexRef.current
    );

    if (result.distance > PATH_TOLERANCE) {
      const now = Date.now();
      if (!isOutsideBoundaryRef.current && now - lastMistakeTimeRef.current > 2500) {
        isOutsideBoundaryRef.current = true;
        lastMistakeTimeRef.current = now;
        onMistake?.();
      }
      return;
    }

    isOutsideBoundaryRef.current = false;

    if (result.index <= currentIndexRef.current) return;

    const maximumAllowed = Math.min(
      smoothPoints.length - 1,
      currentIndexRef.current + MAX_FORWARD_JUMP
    );

    if (result.index > maximumAllowed) return;

    currentIndexRef.current = result.index;
    setCurrentIndex(result.index);
    checkCompletion(result.index);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,

        onPanResponderGrant: (event) => {
          if (finishedRef.current) return;
          const { locationX, locationY } = event.nativeEvent;
          const curScale = scaleRef.current || 1;
          const touchDistance = distance(
            { x: locationX / curScale, y: locationY / curScale },
            pencilPositionRef.current
          );

          if (touchDistance <= 90) {
            isDraggingRef.current = true;
            setIsDragging(true);
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } catch {}
          }
        },

        onPanResponderMove: (event) => {
          if (finishedRef.current || !isDraggingRef.current) return;
          const { locationX, locationY } = event.nativeEvent;
          const curScale = scaleRef.current || 1;
          movePencil(locationX / curScale, locationY / curScale);
        },

        onPanResponderRelease: () => {
          isDraggingRef.current = false;
          setIsDragging(false);
          isOutsideBoundaryRef.current = false;
        },

        onPanResponderTerminate: () => {
          isDraggingRef.current = false;
          setIsDragging(false);
          isOutsideBoundaryRef.current = false;
        },
      }),
    []
  );

  const guideIndex =
    smoothPoints.length > 0
      ? Math.min(smoothPoints.length - 1, currentIndex + 22)
      : 0;

  const guidePoint =
    smoothPoints.length > 0 ? smoothPoints[guideIndex] : undefined;

  const currentPoint =
    smoothPoints.length > 0
      ? smoothPoints[Math.min(currentIndex, smoothPoints.length - 1)]
      : undefined;

  let arrowRotation = 0;
  if (guidePoint && currentPoint) {
    const dx = guidePoint.x - currentPoint.x;
    const dy = guidePoint.y - currentPoint.y;
    arrowRotation = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
  }

  const tracedPath = useMemo(() => {
    if (!smoothPoints.length) return '';
    const visiblePoints = smoothPoints.slice(
      0,
      Math.min(currentIndex + 1, smoothPoints.length)
    );
    return pointsToSvgPath(visiblePoints);
  }, [smoothPoints, currentIndex]);

  if (!level || smoothPoints.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Loading tracing path...</Text>
      </View>
    );
  }

  return (
    <View
      style={styles.wrapper}
      onLayout={(e: LayoutChangeEvent) => {
        const { width, height } = e.nativeEvent.layout;
        if (width > 0 && height > 0) {
          setContainerSize({ width, height });
        }
      }}
    >
      <View
        style={[
          styles.gameArea,
          {
            width: gameWidth,
            height: gameHeight,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Svg
          width={gameWidth}
          height={gameHeight}
          viewBox={`0 0 ${BASE_WIDTH} ${BASE_HEIGHT}`}
          style={styles.svg}
        >
          {/* OUTER ROAD BORDER */}
          <Path
            d={svgPath}
            fill="none"
            stroke="#7E858B"
            strokeWidth={68}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* MAIN ROAD ASPHALT */}
          <Path
            d={svgPath}
            fill="none"
            stroke="#9EA8B0"
            strokeWidth={56}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* WHITE CENTER BROKEN / DASHED GUIDE LINE (High Visibility) */}
          <Path
            d={svgPath}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={6}
            strokeDasharray="14 12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* SOLID TRACED LINE FILL (Autivity Theme Blue) */}
          {tracedPath !== '' && (
            <Path
              d={tracedPath}
              fill="none"
              stroke="#62A9E6"
              strokeWidth={22}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* START MARKER */}
          {smoothPoints[0] && (
            <>
              <Circle
                cx={smoothPoints[0].x}
                cy={smoothPoints[0].y}
                r={26}
                fill="#FDE047"
                stroke="#CA8A04"
                strokeWidth={3}
              />
              <Circle
                cx={smoothPoints[0].x}
                cy={smoothPoints[0].y}
                r={10}
                fill="#CA8A04"
              />
            </>
          )}

          {/* FINISH MARKER */}
          {smoothPoints[smoothPoints.length - 1] && (
            <>
              <Circle
                cx={smoothPoints[smoothPoints.length - 1].x}
                cy={smoothPoints[smoothPoints.length - 1].y}
                r={28}
                fill="#86EFAC"
                stroke="#16A34A"
                strokeWidth={3}
              />
              <Circle
                cx={smoothPoints[smoothPoints.length - 1].x}
                cy={smoothPoints[smoothPoints.length - 1].y}
                r={12}
                fill="#16A34A"
              />
            </>
          )}
        </Svg>

        {/* GUIDE ARROW */}
        {(showGuide || hintSignal > 0) && !finished && guidePoint && (
          <View
            pointerEvents="none"
            style={[
              styles.guideArrow,
              {
                width: 44 * scale,
                height: 44 * scale,
                borderRadius: 22 * scale,
                left: guidePoint.x * scale - 22 * scale,
                top: guidePoint.y * scale - 22 * scale,
                transform: [{ rotate: `${arrowRotation}deg` }],
              },
            ]}
          >
            <Text
              style={[
                styles.arrowText,
                {
                  fontSize: Math.round(26 * scale),
                  lineHeight: Math.round(30 * scale),
                },
              ]}
            >
              ↑
            </Text>
          </View>
        )}

        {/* PENCIL */}
        <View
          pointerEvents="none"
          style={[
            styles.pencil,
            {
              width: PENCIL_SIZE * scale,
              height: PENCIL_SIZE * scale,
              left: pencilPosition.x * scale - (PENCIL_SIZE * scale) / 2,
              top: pencilPosition.y * scale - (PENCIL_SIZE * scale) / 2,
            },
          ]}
        >
          <Text style={[styles.pencilEmoji, { fontSize: Math.round(44 * scale) }]}>
            ✏️
          </Text>

          {isDragging && (
            <View
              style={[
                styles.dragGlow,
                {
                  width: 76 * scale,
                  height: 76 * scale,
                  borderRadius: 38 * scale,
                },
              ]}
            />
          )}
        </View>

        {/* LEVEL LABEL */}
        <View pointerEvents="none" style={styles.levelLabel}>
          <Text style={styles.levelLabelText}>{level.name}</Text>
        </View>

        {/* DRAG HINT */}
        {!isDragging && !finished && (
          <View pointerEvents="none" style={styles.dragHint}>
            <Text style={styles.dragHintText}>Touch the pencil and drag</Text>
          </View>
        )}

        {/* COMPLETE CELEBRATION */}
        {finished && (
          <View pointerEvents="none" style={styles.completeMessage}>
            <Text style={styles.completeText}>Great job! ⭐</Text>
          </View>
        )}
      </View>
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  gameArea: {
    borderRadius: 24,
    backgroundColor: '#EAF6FF',
    borderWidth: 2,
    borderColor: '#D5E8F5',
    overflow: 'hidden',
    position: 'relative',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  svg: {
    position: 'absolute',
    left: 0,
    top: 0,
  },

  /* Pencil */
  pencil: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  pencilEmoji: {
    textAlign: 'center',
  },

  dragGlow: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#FACC15',
    opacity: 0.65,
    backgroundColor: 'rgba(250, 204, 21, 0.15)',
  },

  /* Guide */
  guideArrow: {
    position: 'absolute',
    backgroundColor: '#FFF3A6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FACC15',
    zIndex: 8,
  },

  arrowText: {
    fontWeight: '900',
    color: '#D97706',
  },

  /* Level */
  levelLabel: {
    position: 'absolute',
    top: 12,
    left: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    zIndex: 5,
  },

  levelLabelText: {
    fontSize: 12,
    fontFamily: 'FredokaOne-Regular',
    color: '#475569',
  },

  /* Hint */
  dragHint: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 5,
  },

  dragHintText: {
    fontSize: 12,
    fontFamily: 'Quicksand-Bold',
    color: '#64748B',
  },

  /* Complete */
  completeMessage: {
    position: 'absolute',
    alignSelf: 'center',
    top: '42%',
    backgroundColor: 'rgba(255,255,255,0.98)',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 22,
    borderWidth: 2.5,
    borderColor: '#86EFAC',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 20,
  },

  completeText: {
    fontSize: 22,
    fontFamily: 'FredokaOne-Regular',
    color: '#16A34A',
  },

  /* Empty State */
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyText: {
    fontSize: 14,
    fontFamily: 'Quicksand-Medium',
    color: '#64748B',
  },
});