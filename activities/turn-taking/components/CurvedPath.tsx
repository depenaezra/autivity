import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  GestureResponderEvent,
  LayoutChangeEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TurnTakingLevel, TurnTakingPlayer } from '../types';

interface CurvedPathProps {
  level: TurnTakingLevel;
  player: TurnTakingPlayer;
  onComplete: () => void;
}

type Point = {
  x: number;
  y: number;
};

const BALL_SIZE = 34;
const PATH_WIDTH = 48;
const HIT_DISTANCE = 45;

export default function CurvedPath({
  level,
  player,
  onComplete,
}: CurvedPathProps) {
  const [ballPosition, setBallPosition] = useState<Point>(
    level.pathPoints[0]
  );

  const [progress, setProgress] = useState(0);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [gameAreaSize, setGameAreaSize] = useState({
    width: 0,
    height: 0,
  });

  const currentIndex = useRef(0);
  const completedRef = useRef(false);

  /*
   * Levels are authored on a 350 × 450 canvas. Scale them into the
   * available play area so every level remains reachable on a small phone
   * as well as a tablet.
   */
  const pathPoints = useMemo(() => {
    if (!gameAreaSize.width || !gameAreaSize.height) {
      return level.pathPoints;
    }

    const scaleX = Math.min(1, (gameAreaSize.width - 40) / 350);
    const scaleY = Math.min(1, (gameAreaSize.height - 54) / 450);

    return level.pathPoints.map((point) => ({
      x: 20 + point.x * scaleX,
      y: 28 + point.y * scaleY,
    }));
  }, [gameAreaSize, level.pathPoints]);

  useEffect(() => {
    if (!started) {
      setBallPosition(pathPoints[0]);
    }
  }, [pathPoints, started]);

  /*
   * Calculate the total length of the path.
   * This lets us display progress as a percentage.
   */
  const totalPathLength = useMemo(() => {
    let length = 0;

    for (let i = 1; i < pathPoints.length; i++) {
      const dx = pathPoints[i].x - pathPoints[i - 1].x;
      const dy = pathPoints[i].y - pathPoints[i - 1].y;

      length += Math.sqrt(dx * dx + dy * dy);
    }

    return length;
  }, [pathPoints]);

  /*
   * Find the closest point on the activity path
   * to the student's finger.
   */
  const findClosestPathPoint = (x: number, y: number) => {
    let closestIndex = currentIndex.current;
    let closestDistance = Number.MAX_VALUE;

    /*
     * Only allow the student to move forward.
     * This encourages following the path from START to FINISH.
     */
    const startIndex = currentIndex.current;

    for (let i = startIndex; i < pathPoints.length; i++) {
      const point = pathPoints[i];

      const dx = x - point.x;
      const dy = y - point.y;

      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    }

    return {
      index: closestIndex,
      distance: closestDistance,
    };
  };

  /*
   * Calculate how far along the path the student is.
   */
  const calculateProgress = (index: number) => {
    if (index <= 0) return 0;

    let traveled = 0;

    for (let i = 1; i <= index; i++) {
      const dx = pathPoints[i].x - pathPoints[i - 1].x;
      const dy = pathPoints[i].y - pathPoints[i - 1].y;

      traveled += Math.sqrt(dx * dx + dy * dy);
    }

    return Math.min(
      100,
      Math.round((traveled / totalPathLength) * 100)
    );
  };

  const handleMove = (event: GestureResponderEvent) => {
    if (completedRef.current) return;

    const { locationX, locationY } = event.nativeEvent;

    const result = findClosestPathPoint(
      locationX,
      locationY
    );

    /*
     * If the finger is too far away from the path,
     * don't move the ball.
     */
    if (result.distance > HIT_DISTANCE) {
      return;
    }

    setStarted(true);

    if (result.index >= currentIndex.current) {
      currentIndex.current = result.index;

      const newPosition = pathPoints[result.index];

      setBallPosition(newPosition);

      const newProgress = calculateProgress(result.index);

      setProgress(newProgress);

      /*
       * Reaching the final point completes the turn.
       */
      if (
        result.index === pathPoints.length - 1 &&
        !completedRef.current
      ) {
        completedRef.current = true;
        setCompleted(true);
        setProgress(100);

        setTimeout(() => {
          onComplete();
        }, 900);
      }
    }
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !completedRef.current,

        onMoveShouldSetPanResponder: () => !completedRef.current,

        onPanResponderGrant: (event) => {
          handleMove(event);
        },

        onPanResponderMove: (event) => {
          handleMove(event);
        },

        onPanResponderRelease: () => {
          // The student can lift their finger and continue again.
        },

        onPanResponderTerminate: () => {
          // Allow the activity to continue normally.
        },
      }),
    [pathPoints, totalPathLength]
  );

  /*
   * Create visual line segments between each path point.
   * No external SVG library is required.
   */
  const pathSegments = useMemo(() => {
    return pathPoints.slice(1).map((point, index) => {
      const previous = pathPoints[index];

      const dx = point.x - previous.x;
      const dy = point.y - previous.y;

      const length = Math.sqrt(dx * dx + dy * dy);

      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      return {
        key: `${index}-${point.x}-${point.y}`,
        x: previous.x,
        y: previous.y,
        length,
        angle,
      };
    });
  }, [pathPoints]);

  const startPoint = pathPoints[0];
  const finishPoint = pathPoints[pathPoints.length - 1];

  const handleGameAreaLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setGameAreaSize((current) =>
      current.width === width && current.height === height
        ? current
        : { width, height }
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.playerBadge}>
          <Ionicons
            name="person"
            size={18}
            color="#3B82F6"
          />

          <Text style={styles.playerName}>
            {player.name}
          </Text>
        </View>

        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>
            Level {level.id}
          </Text>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionCard}>
        <Ionicons
          name="hand-left-outline"
          size={22}
          color="#3B82F6"
        />

        <Text style={styles.instructionText}>
          {completed
            ? 'Great job! You completed your turn!'
            : started
            ? 'Keep dragging the ball along the path!'
            : 'Drag the ball from START to FINISH.'}
        </Text>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>
            Progress
          </Text>

          <Text style={styles.progressValue}>
            {progress}%
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* Game Area */}
      <View
        style={styles.gameArea}
        onLayout={handleGameAreaLayout}
        {...panResponder.panHandlers}
      >
        {/* Decorative background circles */}
        <View style={styles.backgroundCircleOne} />
        <View style={styles.backgroundCircleTwo} />

        {/* Path shadow/base */}
        {pathSegments.map((segment) => (
          <View
            key={`base-${segment.key}`}
            style={[
              styles.pathBase,
              {
                left: segment.x,
                top: segment.y - PATH_WIDTH / 2,
                width: segment.length,
                transform: [
                  {
                    rotate: `${segment.angle}deg`,
                  },
                ],
              },
            ]}
          />
        ))}

        {/* Inner path */}
        {pathSegments.map((segment, index) => (
          <View
            key={`path-${segment.key}`}
            style={[
              styles.pathInner,
              {
                left: segment.x,
                top: segment.y - (PATH_WIDTH - 8) / 2,
                width: segment.length,
                transform: [
                  {
                    rotate: `${segment.angle}deg`,
                  },
                ],
              },
            ]}
          >
            {/* Path dots */}
            {index % 2 === 0 && (
              <View style={styles.pathDot} />
            )}
          </View>
        ))}

        {/* Start marker */}
        <View
          style={[
            styles.marker,
            {
              left: startPoint.x - 31,
              top: startPoint.y - 65,
            },
          ]}
        >
          <Ionicons
            name="flag-outline"
            size={20}
            color="#16A34A"
          />

          <Text style={styles.startText}>
            START
          </Text>
        </View>

        {/* Finish marker */}
        <View
          style={[
            styles.marker,
            {
              left: finishPoint.x - 31,
              top: finishPoint.y + 25,
            },
          ]}
        >
          <Ionicons
            name="flag"
            size={20}
            color="#EF4444"
          />

          <Text style={styles.finishText}>
            FINISH
          </Text>
        </View>

        {/* Ball */}
        <View
          style={[
            styles.ball,
            {
              left: ballPosition.x - BALL_SIZE / 2,
              top: ballPosition.y - BALL_SIZE / 2,
            },
          ]}
        >
          <Ionicons
            name="football"
            size={21}
            color="#FFFFFF"
          />
        </View>

        {/* Completion overlay */}
        {completed && (
          <View style={styles.completedOverlay}>
            <View style={styles.completedCard}>
              <View style={styles.successCircle}>
                <Ionicons
                  name="checkmark"
                  size={34}
                  color="#FFFFFF"
                />
              </View>

              <Text style={styles.completedTitle}>
                Turn Complete!
              </Text>

              <Text style={styles.completedText}>
                Great job, {player.name}!
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Bottom Hint */}
      <View style={styles.hintContainer}>
        <Ionicons
          name="information-circle-outline"
          size={18}
          color="#64748B"
        />

        <Text style={styles.hintText}>
          Stay on the path and move the ball toward the finish.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  playerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 8,
    gap: 6,
  },

  playerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E3A8A',
    maxWidth: 180,
  },

  levelBadge: {
    backgroundColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },

  levelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },

  instructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    gap: 9,
    marginBottom: 12,
  },

  instructionText: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },

  progressContainer: {
    marginBottom: 10,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },

  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },

  progressValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B82F6',
  },

  progressTrack: {
    height: 7,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 10,
  },

  gameArea: {
    flex: 1,
    minHeight: 300,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    position: 'relative',
  },

  backgroundCircleOne: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#F8FAFC',
    top: 30,
    right: -70,
  },

  backgroundCircleTwo: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#F8FAFC',
    bottom: 30,
    left: -60,
  },

  pathBase: {
    position: 'absolute',
    height: PATH_WIDTH,
    borderRadius: PATH_WIDTH / 2,
    backgroundColor: '#CBD5E1',
    transformOrigin: 'left center',
  },

  pathInner: {
    position: 'absolute',
    height: PATH_WIDTH - 8,
    borderRadius: (PATH_WIDTH - 8) / 2,
    backgroundColor: '#DBEAFE',
    transformOrigin: 'left center',
    justifyContent: 'center',
  },

  pathDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#93C5FD',
    right: 20,
    top: '50%',
    marginTop: -3,
  },

  marker: {
    position: 'absolute',
    width: 62,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },

  startText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16A34A',
  },

  finishText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EF4444',
  },

  ball: {
    position: 'absolute',
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    elevation: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  completedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  completedCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 30,
    paddingVertical: 25,
    elevation: 5,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },

  successCircle: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  completedTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#0F172A',
  },

  completedText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 5,
  },

  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 9,
  },

  hintText: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
});
