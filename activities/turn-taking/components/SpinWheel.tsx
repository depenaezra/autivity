import React, {
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { TurnTakingPlayer } from '../types';

interface SpinWheelProps {
  player1: TurnTakingPlayer;
  player2: TurnTakingPlayer;
  onComplete: (firstPlayer: TurnTakingPlayer) => void;
}

type ConfettiPiece = {
  x: number;
  size: number;
  rotation: number;
  color: string;
  delay: number;
};

const CONFETTI_COLORS = [
  '#62A9E6',
  '#BBE8FB',
  '#179D33',
  '#CBFAC4',
  '#FFAE02',
  '#FFF3C4',
  '#FF8870',
];

const CONFETTI_COUNT = 32;

export default function SpinWheel({
  player1,
  player2,
  onComplete,
}: SpinWheelProps) {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 600;
  const maxAvailable = Math.min(width - 40, height * 0.46);
  const wheelSize = isTablet
    ? Math.min(maxAvailable, 460)
    : Math.min(maxAvailable, 340);

  const spinDegreesAnim = useRef(new Animated.Value(0)).current;
  const idleRotation = useRef(new Animated.Value(0)).current;
  const idleAnimation = useRef<Animated.CompositeAnimation | null>(null);

  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<TurnTakingPlayer | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  /* Confetti animations */
  const confettiAnimations = useRef(
    Array.from({ length: CONFETTI_COUNT }, () => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;

  const [confettiPieces] = useState<ConfettiPiece[]>(() =>
    Array.from({ length: CONFETTI_COUNT }, (_, index) => ({
      x: -110 + Math.random() * 220,
      size: 6 + Math.random() * 7,
      rotation: Math.random() * 360,
      color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
      delay: Math.random() * 180,
    }))
  );

  /* Idle gentle rotation before user spins */
  useEffect(() => {
    if (isSpinning || winner) return;

    idleRotation.setValue(0);
    idleAnimation.current = Animated.loop(
      Animated.timing(idleRotation, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    idleAnimation.current.start();

    return () => {
      idleAnimation.current?.stop();
    };
  }, [isSpinning, winner, idleRotation]);

  const idleRotate = idleRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spinRotate = spinDegreesAnim.interpolate({
    inputRange: [0, 3600],
    outputRange: ['0deg', '3600deg'],
  });

  const triggerConfetti = () => {
    setShowConfetti(true);

    confettiAnimations.forEach((anim, index) => {
      anim.translateY.setValue(0);
      anim.translateX.setValue(0);
      anim.rotate.setValue(0);
      anim.opacity.setValue(1);

      const piece = confettiPieces[index];

      Animated.sequence([
        Animated.delay(piece.delay),
        Animated.parallel([
          Animated.timing(anim.translateY, {
            toValue: 160 + Math.random() * 100,
            duration: 1200,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateX, {
            toValue: piece.x + (Math.random() * 40 - 20),
            duration: 1200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(anim.rotate, {
            toValue: 360 + Math.random() * 360,
            duration: 1200,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(anim.opacity, {
            toValue: 0,
            duration: 1200,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    });
  };

  const handleCenterSpinPress = () => {
    if (isSpinning || winner) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    setIsSpinning(true);
    idleAnimation.current?.stop();

    // Random winner: 50/50 chance
    const targetIsPlayer1 = Math.random() < 0.5;
    const selectedWinner = targetIsPlayer1 ? player1 : player2;

    // Left half = Player 1 (needs 90deg to reach top pointer at 12 o'clock)
    // Right half = Player 2 (needs 270deg to reach top pointer at 12 o'clock)
    const baseAngle = targetIsPlayer1 ? 90 : 270;
    const randomVariance = (Math.random() - 0.5) * 60; // -30 to +30 degrees variance
    const totalSpins = 5;
    const targetDegrees = totalSpins * 360 + baseAngle + randomVariance;

    spinDegreesAnim.setValue(0);

    Animated.timing(spinDegreesAnim, {
      toValue: targetDegrees,
      duration: 3200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setIsSpinning(false);
      setWinner(selectedWinner);
      triggerConfetti();
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
    });
  };

  const handleStartActivity = () => {
    if (!winner) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    onComplete(winner);
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Spin the Wheel!</Text>
        <Text style={styles.subtitle}>
          {winner
            ? `${winner.name} goes first! Tap Start Activity below.`
            : isSpinning
            ? 'Deciding who takes the first turn...'
            : 'Tap the center button to spin the wheel!'}
        </Text>
      </View>

      {/* WHEEL CONTAINER */}
      <View style={[styles.wheelWrapper, { width: wheelSize, height: wheelSize }]}>
        {/* Top Pointer Needle */}
        <View style={styles.pointerContainer}>
          <View style={styles.pointerTriangle} />
          <View style={styles.pointerDot} />
        </View>

        {/* The Animated Wheel */}
        <Animated.View
          style={[
            styles.wheel,
            {
              width: wheelSize,
              height: wheelSize,
              borderRadius: wheelSize / 2,
              transform: [
                {
                  rotate: isSpinning || winner ? spinRotate : idleRotate,
                },
              ],
            },
          ]}
        >
          {/* Player 1 Half (Autivity Blue) */}
          <View style={[styles.wheelHalf, styles.playerOneHalf]}>
            <View style={styles.playerBadge}>
              <Text style={styles.playerBadgeText}>1</Text>
            </View>
            <Text style={styles.wheelPlayerName} numberOfLines={2}>
              {player1.name}
            </Text>
          </View>

          {/* Player 2 Half (Autivity Green) */}
          <View style={[styles.wheelHalf, styles.playerTwoHalf]}>
            <View style={[styles.playerBadge, styles.playerTwoBadge]}>
              <Text style={[styles.playerBadgeText, styles.playerTwoBadgeText]}>2</Text>
            </View>
            <Text style={[styles.wheelPlayerName, styles.playerTwoName]} numberOfLines={2}>
              {player2.name}
            </Text>
          </View>
        </Animated.View>

        {/* Interactive Center Spin Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={isSpinning || Boolean(winner)}
          onPress={handleCenterSpinPress}
          style={[
            styles.centerButton,
            winner && styles.centerButtonWinner,
            isSpinning && styles.centerButtonSpinning,
          ]}
        >
          {winner ? (
            <Ionicons name="checkmark" size={28} color="#15803D" />
          ) : isSpinning ? (
            <Ionicons name="sync" size={24} color="#62A9E6" />
          ) : (
            <View style={styles.centerButtonContent}>
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.centerButtonText}>SPIN</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Confetti Particles */}
        {showConfetti &&
          confettiPieces.map((piece, index) => {
            const animation = confettiAnimations[index];
            const rotateConfetti = animation.rotate.interpolate({
              inputRange: [0, 360, 720],
              outputRange: ['0deg', '360deg', '720deg'],
            });

            return (
              <Animated.View
                key={index}
                pointerEvents="none"
                style={[
                  styles.confetti,
                  {
                    width: piece.size,
                    height: piece.size * 1.5,
                    backgroundColor: piece.color,
                    left: '50%',
                    marginLeft: piece.x,
                    opacity: animation.opacity,
                    transform: [
                      { translateY: animation.translateY },
                      { translateX: animation.translateX },
                      { rotate: rotateConfetti },
                    ],
                  },
                ]}
              />
            );
          })}
      </View>

      {/* WINNER ANNOUNCEMENT / PLAYER PILLS & BOTTOM BUTTON */}
      <View style={styles.bottomCardContainer}>
        {winner ? (
          <View style={styles.winnerCard}>
            <Ionicons name="trophy" size={28} color="#FFAE02" />
            <View style={styles.winnerInfo}>
              <Text style={styles.winnerLabel}>FIRST PLAYER</Text>
              <Text style={styles.winnerName}>{winner.name} goes first!</Text>
            </View>
          </View>
        ) : (
          <View style={styles.playersCard}>
            <View style={styles.playerRow}>
              <View style={styles.p1Indicator}>
                <Text style={styles.p1IndicatorText}>1</Text>
              </View>
              <Text style={styles.playerNameText} numberOfLines={1}>
                {player1.name}
              </Text>
            </View>

            <View style={styles.vsBadge}>
              <Text style={styles.vsBadgeText}>VS</Text>
            </View>

            <View style={styles.playerRow}>
              <View style={styles.p2Indicator}>
                <Text style={styles.p2IndicatorText}>2</Text>
              </View>
              <Text style={styles.playerNameText} numberOfLines={1}>
                {player2.name}
              </Text>
            </View>
          </View>
        )}

        {/* START ACTIVITY BUTTON (Greyed out until wheel has spinned) */}
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={!winner || isSpinning}
          onPress={handleStartActivity}
          style={[
            styles.startActivityButton,
            (!winner || isSpinning) && styles.disabledStartActivityButton,
          ]}
        >
          <Text style={styles.startActivityButtonText}>
            START ACTIVITY
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* =========================================================
   STYLES - Autivity Design System Specification
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFBFB',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  header: {
    alignItems: 'center',
    marginTop: 4,
  },

  title: {
    fontSize: 24,
    fontFamily: 'FredokaOne-Regular',
    color: '#484A4B',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 14,
    fontFamily: 'Quicksand-Medium',
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },

  /* Wheel */
  wheelWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    position: 'relative',
  },

  pointerContainer: {
    position: 'absolute',
    top: -16,
    zIndex: 99,
    alignItems: 'center',
  },

  pointerTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderTopWidth: 26,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFAE02',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 4,
  },

  pointerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    top: -4,
  },

  wheel: {
    overflow: 'hidden',
    borderWidth: 6,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    shadowColor: '#BBE8FB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.9,
    shadowRadius: 0,
    elevation: 6,
  },

  wheelHalf: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },

  playerOneHalf: {
    backgroundColor: '#EFF6FF',
    borderRightWidth: 2,
    borderRightColor: '#BBE8FB',
  },

  playerTwoHalf: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 2,
    borderLeftColor: '#CBFAC4',
  },

  playerBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#BBE8FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  playerBadgeText: {
    fontSize: 18,
    fontFamily: 'FredokaOne-Regular',
    color: '#62A9E6',
  },

  playerTwoBadge: {
    backgroundColor: '#CBFAC4',
  },

  playerTwoBadgeText: {
    color: '#179D33',
  },

  wheelPlayerName: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: 'FredokaOne-Regular',
    color: '#484A4B',
    textAlign: 'center',
    paddingHorizontal: 8,
  },

  playerTwoName: {
    color: '#15803D',
  },

  /* Center Button */
  centerButton: {
    position: 'absolute',
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#62A9E6',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#62A9E6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
  },

  centerButtonSpinning: {
    backgroundColor: '#EBF4FF',
    borderColor: '#BBE8FB',
  },

  centerButtonWinner: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },

  centerButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  centerButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'FredokaOne-Regular',
    marginTop: 1,
    letterSpacing: 0.5,
  },

  confetti: {
    position: 'absolute',
    borderRadius: 3,
  },

  /* Bottom Area */
  bottomCardContainer: {
    width: '100%',
  },

  winnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
    borderColor: '#86EFAC',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#86EFAC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 2,
  },

  winnerInfo: {
    marginLeft: 12,
    flex: 1,
  },

  winnerLabel: {
    fontSize: 11,
    fontFamily: 'FredokaOne-Regular',
    color: '#16A34A',
    letterSpacing: 0.5,
  },

  winnerName: {
    fontSize: 17,
    fontFamily: 'FredokaOne-Regular',
    color: '#15803D',
    marginTop: 1,
  },

  playersCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F1F1F1',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#F1F1F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },

  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },

  p1Indicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#BBE8FB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  p1IndicatorText: {
    fontSize: 13,
    fontFamily: 'FredokaOne-Regular',
    color: '#62A9E6',
  },

  p2Indicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#CBFAC4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  p2IndicatorText: {
    fontSize: 13,
    fontFamily: 'FredokaOne-Regular',
    color: '#179D33',
  },

  playerNameText: {
    fontSize: 14,
    fontFamily: 'FredokaOne-Regular',
    color: '#484A4B',
    flex: 1,
  },

  vsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 6,
  },

  vsBadgeText: {
    fontSize: 11,
    fontFamily: 'FredokaOne-Regular',
    color: '#94A3B8',
  },

  startActivityButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: '#62A9E6',
    borderBottomWidth: 4,
    borderBottomColor: '#5298D4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabledStartActivityButton: {
    backgroundColor: '#D1D5DB',
    borderBottomColor: '#9CA3AF',
  },

  startActivityButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'FredokaOne-Regular',
    letterSpacing: 0.5,
  },
});