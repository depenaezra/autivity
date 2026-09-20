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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  '#3B82F6',
  '#60A5FA',
  '#93C5FD',
  '#FBBF24',
  '#F59E0B',
  '#34D399',
  '#F472B6',
];

const CONFETTI_COUNT = 36;

export default function SpinWheel({
  player1,
  player2,
  onComplete,
}: SpinWheelProps) {
  const rotation = useRef(
    new Animated.Value(0)
  ).current;

  const idleRotation = useRef(
    new Animated.Value(0)
  ).current;

  const idleAnimation =
    useRef<Animated.CompositeAnimation | null>(
      null
    );

  const [isSpinning, setIsSpinning] =
    useState(false);

  const [winner, setWinner] =
    useState<TurnTakingPlayer | null>(null);

  const [showConfetti, setShowConfetti] =
    useState(false);

  /*
   * =====================================================
   * CONFETTI
   * =====================================================
   */

  const confettiAnimations = useRef(
    Array.from(
      { length: CONFETTI_COUNT },
      () => ({
        translateY: new Animated.Value(0),
        translateX: new Animated.Value(0),
        rotate: new Animated.Value(0),
        opacity: new Animated.Value(0),
      })
    )
  ).current;

  const [confettiPieces] =
    useState<ConfettiPiece[]>(() =>
      Array.from(
        {
          length: CONFETTI_COUNT,
        },
        (_, index) => ({
          x:
            -120 +
            Math.random() * 240,

          size:
            6 +
            Math.random() * 7,

          rotation:
            Math.random() * 360,

          color:
            CONFETTI_COLORS[
              index %
                CONFETTI_COLORS.length
            ],

          delay:
            Math.random() * 180,
        })
      )
    );

  /*
   * =====================================================
   * IDLE ROTATION
   * =====================================================
   */

  useEffect(() => {
    if (isSpinning || winner) {
      return;
    }

    idleRotation.setValue(0);

    idleAnimation.current =
      Animated.loop(
        Animated.timing(
          idleRotation,
          {
            toValue: 1,
            duration: 7000,
            easing: Easing.linear,
            useNativeDriver: true,
          }
        )
      );

    idleAnimation.current.start();

    return () => {
      idleAnimation.current?.stop();
    };
  }, [
    isSpinning,
    winner,
    idleRotation,
  ]);

  const idleRotate =
    idleRotation.interpolate({
      inputRange: [0, 1],
      outputRange: [
        '0deg',
        '360deg',
      ],
    });

  /*
   * =====================================================
   * CONFETTI
   * =====================================================
   */

  const releaseConfetti = () => {
    setShowConfetti(true);

    confettiAnimations.forEach(
      (animation, index) => {
        const piece =
          confettiPieces[index];

        animation.translateY.setValue(0);
        animation.translateX.setValue(0);
        animation.rotate.setValue(0);
        animation.opacity.setValue(0);

        setTimeout(() => {
          Animated.parallel([
            Animated.timing(
              animation.opacity,
              {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
              }
            ),

            Animated.timing(
              animation.translateY,
              {
                toValue:
                  170 +
                  Math.random() * 150,

                duration:
                  1100 +
                  Math.random() * 500,

                easing:
                  Easing.out(
                    Easing.quad
                  ),

                useNativeDriver: true,
              }
            ),

            Animated.timing(
              animation.translateX,
              {
                toValue:
                  (Math.random() - 0.5) *
                  220,

                duration:
                  1100 +
                  Math.random() * 500,

                easing:
                  Easing.out(
                    Easing.quad
                  ),

                useNativeDriver: true,
              }
            ),

            Animated.timing(
              animation.rotate,
              {
                toValue:
                  piece.rotation +
                  720,

                duration:
                  1100 +
                  Math.random() * 500,

                easing:
                  Easing.linear,

                useNativeDriver: true,
              }
            ),
          ]).start();
        }, piece.delay);
      }
    );

    setTimeout(() => {
      setShowConfetti(false);
    }, 2000);
  };

  /*
   * =====================================================
   * SPIN
   * =====================================================
   *
   * IMPORTANT:
   *
   * WE DO NOT CHOOSE A WINNER HERE.
   *
   * The wheel gets a completely random stopping angle.
   *
   * AFTER the wheel stops, we determine which student's
   * section is underneath the fixed pointer.
   */

  const spin = () => {
    if (isSpinning || winner) {
      return;
    }

    /*
     * Stop slow idle rotation.
     */
    idleAnimation.current?.stop();

    setIsSpinning(true);
    setWinner(null);
    setShowConfetti(false);

    /*
     * Reset confetti.
     */
    confettiAnimations.forEach(
      (animation) => {
        animation.translateY.setValue(0);
        animation.translateX.setValue(0);
        animation.rotate.setValue(0);
        animation.opacity.setValue(0);
      }
    );

    /*
     * =================================================
     * COMPLETELY RANDOM LANDING POSITION
     * =================================================
     *
     * 0 - 360 degrees.
     *
     * We are NOT choosing Student 1.
     * We are NOT choosing Student 2.
     *
     * We are choosing ONLY where the wheel stops.
     */

    const randomLandingAngle =
      Math.random() * 360;

    /*
     * Random number of complete rotations.
     */

    const extraSpins =
      6 +
      Math.floor(
        Math.random() * 4
      );

    /*
     * Final wheel rotation.
     */

    const finalRotation =
      extraSpins * 360 +
      randomLandingAngle;

    /*
     * Start the actual spin from zero.
     *
     * This makes the mathematical position
     * exactly match the visual position.
     */

    rotation.stopAnimation();
    rotation.setValue(0);

    /*
     * =================================================
     * SPIN ANIMATION
     * =================================================
     */

    Animated.timing(rotation, {
      toValue: finalRotation,

      duration:
        4000 +
        Math.floor(
          Math.random() * 1000
        ),

      easing:
        Easing.out(
          Easing.cubic
        ),

      useNativeDriver: true,

    }).start(({ finished }) => {

      if (!finished) {
        setIsSpinning(false);
        return;
      }

      /*
       * =================================================
       * THE WHEEL HAS STOPPED
       * =================================================
       *
       * NOW determine who is underneath the pointer.
       *
       * We use ONLY the actual final wheel position.
       */

      const finalAngle =
        randomLandingAngle;

      /*
       * Because the wheel is split vertically:
       *
       *              POINTER
       *                 ↓
       *
       *          ┌──────┬──────┐
       *          │  P1  │  P2  │
       *          │ LEFT │RIGHT │
       *          └──────┴──────┘
       *
       * P1 occupies the first 180 degrees.
       * P2 occupies the second 180 degrees.
       *
       * 0° and 180° are the boundaries.
       */

      let actualWinner: TurnTakingPlayer;

      if (
        finalAngle >= 0 &&
        finalAngle < 180
      ) {
        actualWinner = player1;
      } else {
        actualWinner = player2;
      }

      /*
       * NOW the winner comes from where
       * the wheel ACTUALLY stopped.
       */

      setIsSpinning(false);

      setWinner(
        actualWinner
      );

      /*
       * Confetti.
       */

      releaseConfetti();

      /*
       * Continue to activity using the
       * ACTUAL wheel result.
       */

      setTimeout(() => {
        onComplete(
          actualWinner
        );
      }, 1500);
    });
  };

  /*
   * =====================================================
   * ROTATION
   * =====================================================
   */

  const spinRotate =
    rotation.interpolate({
      inputRange: [
        0,
        360,
      ],

      outputRange: [
        '0deg',
        '360deg',
      ],

      extrapolate:
        'extend',
    });

  return (
    <View style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>

        <View
          style={styles.iconCircle}
        >
          <Ionicons
            name="sync-outline"
            size={28}
            color="#3B82F6"
          />
        </View>

        <Text style={styles.title}>
          Who Goes First?
        </Text>

        <Text
          style={styles.subtitle}
        >
          Spin the wheel to decide who will
          start
        </Text>

      </View>

      {/* WHEEL */}

      <View
        style={styles.wheelContainer}
      >

        {/* FIXED POINTER */}

        <View
          style={
            styles.pointerContainer
          }
        >
          <View
            style={styles.pointer}
          />
        </View>

        {/* ROTATING WHEEL */}

        <Animated.View
          style={[
            styles.wheel,
            {
              transform: [
                {
                  rotate: isSpinning || winner ? spinRotate : idleRotate,
                },
              ],
            },
          ]}
        >

          {/* PLAYER 1 - LEFT */}

          <View
            style={[
              styles.wheelHalf,
              styles.playerOneHalf,
            ]}
          >

            <Text
              style={
                styles.playerNumber
              }
            >
              1
            </Text>

            <Text
              style={
                styles.wheelPlayerName
              }
              numberOfLines={2}
            >
              {player1.name}
            </Text>

          </View>

          {/* PLAYER 2 - RIGHT */}

          <View
            style={[
              styles.wheelHalf,
              styles.playerTwoHalf,
            ]}
          >

            <Text
              style={
                styles.playerNumber
              }
            >
              2
            </Text>

            <Text
              style={
                styles.wheelPlayerName
              }
              numberOfLines={2}
            >
              {player2.name}
            </Text>

          </View>

          {/* CENTER */}

          <View
            style={
              styles.centerCircle
            }
          >
            <Ionicons
              name="shuffle"
              size={24}
              color="#FFFFFF"
            />
          </View>

        </Animated.View>

        {/* CONFETTI */}

        {showConfetti &&
          confettiPieces.map(
            (piece, index) => {

              const animation =
                confettiAnimations[
                  index
                ];

              const rotateConfetti =
                animation.rotate.interpolate(
                  {
                    inputRange: [
                      0,
                      360,
                      720,
                    ],

                    outputRange: [
                      '0deg',
                      '360deg',
                      '720deg',
                    ],
                  }
                );

              return (
                <Animated.View
                  key={index}
                  pointerEvents="none"
                  style={[
                    styles.confetti,
                    {
                      width:
                        piece.size,

                      height:
                        piece.size *
                        1.5,

                      backgroundColor:
                        piece.color,

                      left: '50%',

                      marginLeft:
                        piece.x,

                      opacity:
                        animation.opacity,

                      transform: [
                        {
                          translateY:
                            animation.translateY,
                        },

                        {
                          translateX:
                            animation.translateX,
                        },

                        {
                          rotate:
                            rotateConfetti,
                        },
                      ],
                    },
                  ]}
                />
              );
            }
          )}

      </View>

      {/* WINNER */}

      {winner ? (
        <View
          style={styles.winnerCard}
        >

          <Ionicons
            name="trophy-outline"
            size={25}
            color="#F59E0B"
          />

          <View
            style={styles.winnerInfo}
          >

            <Text
              style={
                styles.winnerLabel
              }
            >
              First Player
            </Text>

            <Text
              style={
                styles.winnerName
              }
            >
              {winner.name}
            </Text>

          </View>

        </View>

      ) : (

        <View
          style={styles.playersCard}
        >

          <View
            style={styles.playerRow}
          >

            <View
              style={
                styles.smallAvatar
              }
            >
              <Text
                style={
                  styles.avatarText
                }
              >
                1
              </Text>
            </View>

            <Text
              style={
                styles.playerName
              }
              numberOfLines={1}
            >
              {player1.name}
            </Text>

          </View>

          <View
            style={
              styles.vsContainer
            }
          >
            <Text
              style={styles.vsText}
            >
              VS
            </Text>
          </View>

          <View
            style={styles.playerRow}
          >

            <View
              style={
                styles.smallAvatar
              }
            >
              <Text
                style={
                  styles.avatarText
                }
              >
                2
              </Text>
            </View>

            <Text
              style={
                styles.playerName
              }
              numberOfLines={1}
            >
              {player2.name}
            </Text>

          </View>

        </View>

      )}

      {/* SPIN BUTTON */}

      <TouchableOpacity
        activeOpacity={0.8}
        disabled={
          isSpinning ||
          !!winner
        }
        onPress={spin}
        style={[
          styles.spinButton,
          (isSpinning ||
            !!winner) &&
            styles.disabledButton,
        ]}
      >

        <Ionicons
          name={
            isSpinning
              ? 'sync'
              : 'refresh-outline'
          }
          size={21}
          color="#FFFFFF"
        />

        <Text
          style={
            styles.spinButtonText
          }
        >
          {isSpinning
            ? 'Spinning...'
            : 'Spin the Wheel'}
        </Text>

      </TouchableOpacity>

      <Text
        style={styles.helperText}
      >
        The wheel slowly rotates until you
        spin.
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    padding: 20,
  },

  header: {
    alignItems: 'center',
    marginBottom: 10,
  },

  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },

  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 5,
    textAlign: 'center',
  },

  wheelContainer: {
    width: 290,
    height: 290,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 15,
  },

  pointerContainer: {
    position: 'absolute',
    top: -2,
    zIndex: 20,
    alignItems: 'center',
  },

  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 13,
    borderRightWidth: 13,
    borderTopWidth: 25,
    borderLeftColor:
      'transparent',
    borderRightColor:
      'transparent',
    borderTopColor:
      '#0F172A',
  },

  wheel: {
    width: 250,
    height: 250,
    borderRadius: 125,
    overflow: 'hidden',
    borderWidth: 7,
    borderColor: '#FFFFFF',
    backgroundColor: '#DBEAFE',
    elevation: 6,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.15,
    shadowRadius: 8,
  },

  wheelHalf: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  playerOneHalf: {
    left: 0,
    backgroundColor: '#93C5FD',
    borderRightWidth: 1,
    borderRightColor:
      '#FFFFFF',
  },

  playerTwoHalf: {
    right: 0,
    backgroundColor: '#BFDBFE',
    borderLeftWidth: 1,
    borderLeftColor:
      '#FFFFFF',
  },

  playerNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E3A8A',
    marginBottom: 5,
  },

  wheelPlayerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    paddingHorizontal: 5,
    maxWidth: 105,
  },

  centerCircle: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#3B82F6',
    left: '50%',
    top: '50%',
    marginLeft: -29,
    marginTop: -29,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },

  confetti: {
    position: 'absolute',
    top: '50%',
    borderRadius: 2,
    zIndex: 30,
  },

  playersCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  playerRow: {
    flex: 1,
    alignItems: 'center',
  },

  smallAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },

  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
  },

  playerName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
    maxWidth: 110,
  },

  vsContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },

  vsText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
  },

  winnerCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  winnerInfo: {
    marginLeft: 10,
  },

  winnerLabel: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
  },

  winnerName: {
    fontSize: 18,
    color: '#78350F',
    fontWeight: '800',
    marginTop: 2,
  },

  spinButton: {
    width: '100%',
    maxWidth: 420,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  disabledButton: {
    backgroundColor: '#94A3B8',
  },

  spinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  helperText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 10,
  },
});