import React, { useEffect, useRef, useState } from 'react';
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

export default function SpinWheel({
  player1,
  player2,
  onComplete,
}: SpinWheelProps) {
  const rotation = useRef(new Animated.Value(0)).current;
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<TurnTakingPlayer | null>(null);

  const spin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setWinner(null);

    /*
     * Randomly choose which student will go first.
     * The wheel visually spins several times before stopping.
     */
    const selectedPlayer =
      Math.random() < 0.5 ? player1 : player2;

    const extraSpins = 5 + Math.floor(Math.random() * 3);
    const finalRotation =
      extraSpins * 360 +
      (selectedPlayer.id === player1.id ? 0 : 180);

    rotation.setValue(0);

    Animated.timing(rotation, {
      toValue: finalRotation,
      duration: 3500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setIsSpinning(false);
      setWinner(selectedPlayer);

      setTimeout(() => {
        onComplete(selectedPlayer);
      }, 1200);
    });
  };

  const rotate = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons
            name="sync-outline"
            size={28}
            color="#3B82F6"
          />
        </View>

        <Text style={styles.title}>Who Goes First?</Text>

        <Text style={styles.subtitle}>
          Spin the wheel to decide who will start
        </Text>
      </View>

      <View style={styles.wheelContainer}>
        {/* Pointer */}
        <View style={styles.pointerContainer}>
          <View style={styles.pointer} />
        </View>

        {/* Wheel */}
        <Animated.View
          style={[
            styles.wheel,
            {
              transform: [{ rotate }],
            },
          ]}
        >
          {/* Player 1 half */}
          <View
            style={[
              styles.wheelHalf,
              styles.playerOneHalf,
            ]}
          >
            <Text style={styles.playerNumber}>1</Text>
            <Text style={styles.wheelPlayerName}>
              {player1.name}
            </Text>
          </View>

          {/* Player 2 half */}
          <View
            style={[
              styles.wheelHalf,
              styles.playerTwoHalf,
            ]}
          >
            <Text style={styles.playerNumber}>2</Text>
            <Text style={styles.wheelPlayerName}>
              {player2.name}
            </Text>
          </View>

          {/* Center circle */}
          <View style={styles.centerCircle}>
            <Ionicons
              name="shuffle"
              size={24}
              color="#FFFFFF"
            />
          </View>
        </Animated.View>
      </View>

      {winner ? (
        <View style={styles.winnerCard}>
          <Ionicons
            name="trophy-outline"
            size={25}
            color="#F59E0B"
          />

          <View style={styles.winnerInfo}>
            <Text style={styles.winnerLabel}>
              First Player
            </Text>

            <Text style={styles.winnerName}>
              {winner.name}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.playersCard}>
          <View style={styles.playerRow}>
            <View style={styles.smallAvatar}>
              <Text style={styles.avatarText}>1</Text>
            </View>

            <Text style={styles.playerName}>
              {player1.name}
            </Text>
          </View>

          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          <View style={styles.playerRow}>
            <View style={styles.smallAvatar}>
              <Text style={styles.avatarText}>2</Text>
            </View>

            <Text style={styles.playerName}>
              {player2.name}
            </Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        activeOpacity={0.8}
        disabled={isSpinning || !!winner}
        onPress={spin}
        style={[
          styles.spinButton,
          (isSpinning || !!winner) && styles.disabledButton,
        ]}
      >
        <Ionicons
          name={isSpinning ? 'sync' : 'refresh-outline'}
          size={21}
          color="#FFFFFF"
        />

        <Text style={styles.spinButtonText}>
          {isSpinning ? 'Spinning...' : 'Spin the Wheel'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.helperText}>
        The wheel randomly decides who takes the first turn.
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
    zIndex: 10,
    alignItems: 'center',
  },

  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 13,
    borderRightWidth: 13,
    borderTopWidth: 25,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#0F172A',
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
    borderRightColor: '#FFFFFF',
  },

  playerTwoHalf: {
    right: 0,
    backgroundColor: '#BFDBFE',
    borderLeftWidth: 1,
    borderLeftColor: '#FFFFFF',
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