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
  Dimensions,
} from 'react-native';

import Svg, {
  Path,
  Circle,
} from 'react-native-svg';

import {
  TurnTakingLevel,
  TurnTakingPlayer,
} from '../types';

interface CurvedPathProps {
  level: TurnTakingLevel;
  player: TurnTakingPlayer;
  showGuide?: boolean;
  onComplete: () => void;
  onMistake?: () => void;
}

type Point = {
  x: number;
  y: number;
};

const { width: SCREEN_WIDTH } =
  Dimensions.get('window');

const GAME_WIDTH = Math.min(
  SCREEN_WIDTH - 36,
  390
);

const GAME_HEIGHT = 500;

const PATH_TOLERANCE = 58;
const MAX_FORWARD_JUMP = 20;
const PENCIL_SIZE = 58;

/* =========================================================
   SMOOTH POINTS
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

  for (
    let i = 0;
    i < points.length - 1;
    i++
  ) {
    const p0 =
      points[i - 1] || points[i];

    const p1 =
      points[i];

    const p2 =
      points[i + 1] || points[i];

    const p3 =
      points[i + 2] ||
      points[i + 1] ||
      points[i];

    for (
      let j = 0;
      j < samplesPerSegment;
      j++
    ) {
      const t =
        j / samplesPerSegment;

      const t2 = t * t;
      const t3 = t2 * t;

      const x =
        0.5 *
        (
          (2 * p1.x) +
          (-p0.x + p2.x) * t +
          (2 * p0.x -
            5 * p1.x +
            4 * p2.x -
            p3.x) *
            t2 +
          (-p0.x +
            3 * p1.x -
            3 * p2.x +
            p3.x) *
            t3
        );

      const y =
        0.5 *
        (
          (2 * p1.y) +
          (-p0.y + p2.y) * t +
          (2 * p0.y -
            5 * p1.y +
            4 * p2.y -
            p3.y) *
            t2 +
          (-p0.y +
            3 * p1.y -
            3 * p2.y +
            p3.y) *
            t3
        );

      result.push({
        x,
        y,
      });
    }
  }

  const lastPoint =
    points[points.length - 1];

  if (lastPoint) {
    result.push(lastPoint);
  }

  return result;
}

/* =========================================================
   SVG PATH
========================================================= */

function pointsToSvgPath(
  points: Point[]
): string {
  if (!points || points.length === 0) {
    return '';
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path =
    `M ${points[0].x} ${points[0].y}`;

  for (
    let i = 1;
    i < points.length - 1;
    i++
  ) {
    const current =
      points[i];

    const next =
      points[i + 1];

    if (!current || !next) {
      continue;
    }

    const middleX =
      (current.x + next.x) / 2;

    const middleY =
      (current.y + next.y) / 2;

    path +=
      ` Q ${current.x} ${current.y} ${middleX} ${middleY}`;
  }

  const last =
    points[points.length - 1];

  const previous =
    points[points.length - 2];

  if (last && previous) {
    path +=
      ` Q ${previous.x} ${previous.y} ${last.x} ${last.y}`;
  }

  return path;
}

/* =========================================================
   DISTANCE
========================================================= */

function distance(
  a: Point,
  b: Point
): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;

  return Math.sqrt(
    dx * dx + dy * dy
  );
}

/* =========================================================
   FIND CLOSEST PATH POINT
========================================================= */

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

  const safeCurrentIndex =
    Math.max(
      0,
      Math.min(
        currentIndex,
        path.length - 1
      )
    );

  const start = Math.max(
    0,
    safeCurrentIndex - 10
  );

  const end = Math.min(
    path.length - 1,
    safeCurrentIndex +
      MAX_FORWARD_JUMP
  );

  let closestIndex =
    safeCurrentIndex;

  let closestDistance =
    Number.MAX_VALUE;

  for (
    let i = start;
    i <= end;
    i++
  ) {
    const point = path[i];

    if (!point) {
      continue;
    }

    const currentDistance =
      distance(
        finger,
        point
      );

    if (
      currentDistance <
      closestDistance
    ) {
      closestDistance =
        currentDistance;

      closestIndex = i;
    }
  }

  return {
    index: closestIndex,
    distance:
      closestDistance,
  };
}

/* =========================================================
   COMPONENT
========================================================= */

export default function CurvedPath({
  level,
  player,
  showGuide = false,
  onComplete,
  onMistake,
}: CurvedPathProps) {
  /*
   * SAFETY:
   * If the level/path is missing, don't render
   * anything that tries to access undefined points.
   */

  const rawPoints =
    level?.pathPoints || [];

  const smoothPoints =
    useMemo(
      () =>
        createSmoothPoints(
          rawPoints,
          14
        ),
      [rawPoints]
    );

  const svgPath =
    useMemo(
      () =>
        pointsToSvgPath(
          smoothPoints
        ),
      [smoothPoints]
    );

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0);

  const currentIndexRef =
    useRef(0);

  const [
    isDragging,
    setIsDragging,
  ] = useState(false);

  const isDraggingRef =
    useRef(false);

  const [
    finished,
    setFinished,
  ] = useState(false);

  const finishedRef =
    useRef(false);

  const startPoint =
    smoothPoints[0] || {
      x: 30,
      y: 30,
    };

  const [
    pencilPosition,
    setPencilPosition,
  ] = useState<Point>(
    startPoint
  );

  const pencilPositionRef =
    useRef<Point>(
      startPoint
    );

  const completionTriggered =
    useRef(false);

  /* =========================================================
     RESET
  ========================================================= */

  useEffect(() => {
    const start =
      smoothPoints[0] || {
        x: 30,
        y: 30,
      };

    currentIndexRef.current =
      0;

    completionTriggered.current =
      false;

    finishedRef.current =
      false;

    isDraggingRef.current =
      false;

    setCurrentIndex(0);
    setIsDragging(false);
    setFinished(false);

    pencilPositionRef.current =
      start;

    setPencilPosition(start);
  }, [
    level?.id,
    smoothPoints,
  ]);

  /* =========================================================
     COMPLETION
  ========================================================= */

  const checkCompletion = (
    nextIndex: number
  ) => {
    if (
      completionTriggered.current ||
      smoothPoints.length === 0
    ) {
      return;
    }

    const lastIndex =
      smoothPoints.length - 1;

    if (
      nextIndex >=
      Math.max(0, lastIndex - 5)
    ) {
      completionTriggered.current =
        true;

      finishedRef.current =
        true;

      isDraggingRef.current =
        false;

      setFinished(true);
      setIsDragging(false);

      setTimeout(() => {
        onComplete();
      }, 700);
    }
  };

  /* =========================================================
     MOVE PENCIL
  ========================================================= */

  const movePencil = (
    fingerX: number,
    fingerY: number
  ) => {
    if (
      finishedRef.current ||
      smoothPoints.length === 0
    ) {
      return;
    }

    const safeX = Math.max(
      PENCIL_SIZE / 2,
      Math.min(
        GAME_WIDTH -
          PENCIL_SIZE / 2,
        fingerX
      )
    );

    const safeY = Math.max(
      PENCIL_SIZE / 2,
      Math.min(
        GAME_HEIGHT -
          PENCIL_SIZE / 2,
        fingerY
      )
    );

    /*
     * Pencil follows the finger.
     * It does NOT snap onto the path.
     */

    const nextPosition = {
      x: safeX,
      y: safeY,
    };

    pencilPositionRef.current =
      nextPosition;

    setPencilPosition(
      nextPosition
    );

    const result =
      findClosestPathPoint(
        {
          x: safeX,
          y: safeY,
        },
        smoothPoints,
        currentIndexRef.current
      );

    /*
     * Outside the tracing road.
     */

    if (
      result.distance >
      PATH_TOLERANCE
    ) {
      if (onMistake) {
        onMistake();
      }

      return;
    }

    /*
     * Don't move backwards.
     */

    if (
      result.index <=
      currentIndexRef.current
    ) {
      return;
    }

    /*
     * Don't allow shortcuts.
     */

    const maximumAllowed =
      Math.min(
        smoothPoints.length - 1,
        currentIndexRef.current +
          MAX_FORWARD_JUMP
      );

    if (
      result.index >
      maximumAllowed
    ) {
      return;
    }

    currentIndexRef.current =
      result.index;

    setCurrentIndex(
      result.index
    );

    checkCompletion(
      result.index
    );
  };

  /* =========================================================
     PAN RESPONDER
  ========================================================= */

  const panResponder =
    useMemo(
      () =>
        PanResponder.create({
          onStartShouldSetPanResponder:
            () => true,

          onMoveShouldSetPanResponder:
            () => true,

          onPanResponderGrant:
            (event) => {
              if (
                finishedRef.current
              ) {
                return;
              }

              const {
                locationX,
                locationY,
              } =
                event.nativeEvent;

              const touchDistance =
                distance(
                  {
                    x: locationX,
                    y: locationY,
                  },
                  pencilPositionRef.current
                );

              if (
                touchDistance <=
                85
              ) {
                isDraggingRef.current =
                  true;

                setIsDragging(true);
              }
            },

          onPanResponderMove:
            (event) => {
              if (
                finishedRef.current ||
                !isDraggingRef.current
              ) {
                return;
              }

              const {
                locationX,
                locationY,
              } =
                event.nativeEvent;

              movePencil(
                locationX,
                locationY
              );
            },

          onPanResponderRelease:
            () => {
              isDraggingRef.current =
                false;

              setIsDragging(false);
            },

          onPanResponderTerminate:
            () => {
              isDraggingRef.current =
                false;

              setIsDragging(false);
            },
        }),
      []
    );

  /* =========================================================
     GUIDE
  ========================================================= */

  const guideIndex =
    smoothPoints.length > 0
      ? Math.min(
          smoothPoints.length - 1,
          currentIndex + 22
        )
      : 0;

  const guidePoint =
    smoothPoints.length > 0
      ? smoothPoints[guideIndex]
      : undefined;

  const currentPoint =
    smoothPoints.length > 0
      ? smoothPoints[
          Math.min(
            currentIndex,
            smoothPoints.length - 1
          )
        ]
      : undefined;

  let arrowRotation = 0;

  if (
    guidePoint &&
    currentPoint
  ) {
    const dx =
      guidePoint.x -
      currentPoint.x;

    const dy =
      guidePoint.y -
      currentPoint.y;

    arrowRotation =
      Math.atan2(
        dy,
        dx
      ) *
        (180 / Math.PI) +
      90;
  }

  /*
   * SOLID TRACED PATH
   *
   * This is the part that visually fills
   * the road behind the pencil.
   */

  const tracedPath =
    useMemo(() => {
      if (
        !smoothPoints.length
      ) {
        return '';
      }

      const visiblePoints =
        smoothPoints.slice(
          0,
          Math.min(
            currentIndex + 1,
            smoothPoints.length
          )
        );

      return pointsToSvgPath(
        visiblePoints
      );
    }, [
      smoothPoints,
      currentIndex,
    ]);

  /* =========================================================
     NO VALID PATH
  ========================================================= */

  if (
    !level ||
    smoothPoints.length === 0
  ) {
    return (
      <View
        style={styles.emptyContainer}
      >
        <Text
          style={styles.emptyText}
        >
          Loading tracing path...
        </Text>
      </View>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <View
      style={styles.wrapper}
      {...panResponder.panHandlers}
    >
      <View
        style={styles.gameArea}
      >
        <Svg
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          viewBox={`0 0 ${GAME_WIDTH} ${GAME_HEIGHT}`}
          style={styles.svg}
        >
          {/* ================================================= */}
          {/* OUTER ROAD */}
          {/* ================================================= */}

          <Path
            d={svgPath}
            fill="none"
            stroke="#7E858B"
            strokeWidth={68}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* ================================================= */}
          {/* MAIN ROAD */}
          {/* ================================================= */}

          <Path
            d={svgPath}
            fill="none"
            stroke="#AEB3B7"
            strokeWidth={56}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* ================================================= */}
          {/* WHITE CENTER GUIDE */}
          {/* ================================================= */}

          <Path
            d={svgPath}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={5}
            strokeDasharray="14 12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* ================================================= */}
          {/* SOLID TRACED LINE */}
          {/* ================================================= */}

          {tracedPath !== '' && (
            <Path
              d={tracedPath}
              fill="none"
              stroke="#62A9E6"
              strokeWidth={18}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* ================================================= */}
          {/* START */}
          {/* ================================================= */}

          {smoothPoints[0] && (
            <Circle
              cx={
                smoothPoints[0].x
              }
              cy={
                smoothPoints[0].y
              }
              r={25}
              fill="#F8D66D"
            />
          )}

          {/* ================================================= */}
          {/* FINISH */}
          {/* ================================================= */}

          {smoothPoints[
            smoothPoints.length - 1
          ] && (
            <Circle
              cx={
                smoothPoints[
                  smoothPoints.length - 1
                ].x
              }
              cy={
                smoothPoints[
                  smoothPoints.length - 1
                ].y
              }
              r={28}
              fill="#8FD694"
            />
          )}
        </Svg>

        {/* ================================================= */}
        {/* GUIDE ARROW */}
        {/* ================================================= */}

        {showGuide &&
          !finished &&
          guidePoint && (
            <View
              pointerEvents="none"
              style={[
                styles.guideArrow,
                {
                  left:
                    guidePoint.x - 23,
                  top:
                    guidePoint.y - 23,
                  transform: [
                    {
                      rotate: `${arrowRotation}deg`,
                    },
                  ],
                },
              ]}
            >
              <Text
                style={
                  styles.arrowText
                }
              >
                ↑
              </Text>
            </View>
          )}

        {/* ================================================= */}
        {/* PENCIL */}
        {/* ================================================= */}

        <View
          pointerEvents="none"
          style={[
            styles.pencil,
            {
              left:
                pencilPosition.x -
                PENCIL_SIZE / 2,

              top:
                pencilPosition.y -
                PENCIL_SIZE / 2,
            },
          ]}
        >
          <Text
            style={
              styles.pencilEmoji
            }
          >
            ✏️
          </Text>

          {isDragging && (
            <View
              style={
                styles.dragGlow
              }
            />
          )}
        </View>

        {/* ================================================= */}
        {/* LEVEL */}
        {/* ================================================= */}

        <View
          pointerEvents="none"
          style={styles.levelLabel}
        >
          <Text
            style={
              styles.levelLabelText
            }
          >
            {level.name}
          </Text>
        </View>

        {/* ================================================= */}
        {/* DRAG HINT */}
        {/* ================================================= */}

        {!isDragging &&
          !finished && (
            <View
              pointerEvents="none"
              style={styles.dragHint}
            >
              <Text
                style={
                  styles.dragHintText
                }
              >
                Touch the pencil and drag
              </Text>
            </View>
          )}

        {/* ================================================= */}
        {/* COMPLETE */}
        {/* ================================================= */}

        {finished && (
          <View
            pointerEvents="none"
            style={
              styles.completeMessage
            }
          >
            <Text
              style={
                styles.completeText
              }
            >
              Great job! ⭐
            </Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },

  gameArea: {
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    borderRadius: 24,
    backgroundColor: '#EAF6FF',
    borderWidth: 2,
    borderColor: '#D5E8F5',
    overflow: 'hidden',
  },

  svg: {
    position: 'absolute',
    left: 0,
    top: 0,
  },

  /* Pencil */

  pencil: {
    position: 'absolute',
    width: PENCIL_SIZE,
    height: PENCIL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pencilEmoji: {
    fontSize: 46,
  },

  dragGlow: {
    position: 'absolute',
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 3,
    borderColor: '#FACC15',
    opacity: 0.5,
  },

  /* Guide */

  guideArrow: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFF3A6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FACC15',
  },

  arrowText: {
    fontSize: 29,
    fontWeight: '900',
    color: '#D97706',
    lineHeight: 34,
  },

  /* Level */

  levelLabel: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  levelLabelText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },

  /* Hint */

  dragHint: {
    position: 'absolute',
    bottom: 18,
    alignSelf: 'center',
    backgroundColor:
      'rgba(255,255,255,0.94)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
  },

  dragHintText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },

  /* Complete */

  completeMessage: {
    position: 'absolute',
    alignSelf: 'center',
    top: '45%',
    backgroundColor:
      'rgba(255,255,255,0.96)',
    paddingHorizontal: 24,
    paddingVertical: 15,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#BBF7D0',
  },

  completeText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#16A34A',
  },

  /* Empty */

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
});