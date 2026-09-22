import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TurnTakingPlayer } from '../types';

interface TurnIndicatorProps {
  currentPlayer: TurnTakingPlayer;
  player1: TurnTakingPlayer;
  player2: TurnTakingPlayer;
  level: number;
  isTransitioning?: boolean;
}

export default function TurnIndicator({
  currentPlayer,
  player1,
  player2,
  level,
  isTransitioning = false,
}: TurnIndicatorProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const isPlayerOne = currentPlayer.id === player1.id;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.08,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentPlayer.id, level]);

  return (
    <View style={styles.container}>
      {/* Top status */}
      <View style={styles.topRow}>
        <View style={styles.skillBadge}>
          <Ionicons
            name="people-outline"
            size={16}
            color="#3B82F6"
          />

          <Text style={styles.skillText}>
            Social & Turn-Taking
          </Text>
        </View>

        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>
            Level {level}
          </Text>
        </View>
      </View>

      {/* Turn card */}
      <Animated.View
        style={[
          styles.turnCard,
          {
            transform: [{ scale }],
          },
        ]}
      >
        <View style={styles.iconCircle}>
          <Ionicons
            name="person"
            size={25}
            color="#3B82F6"
          />
        </View>

        <View style={styles.turnInfo}>
          <Text style={styles.turnLabel}>
            {isTransitioning
              ? 'Get Ready!'
              : "It's Your Turn"}
          </Text>

          <Text style={styles.playerName}>
            {currentPlayer.name}
          </Text>

          <Text style={styles.instruction}>
            {isTransitioning
              ? 'Get ready to play!'
              : 'Drag the ball along the path.'}
          </Text>
        </View>

        <View style={styles.playerNumber}>
          <Text style={styles.playerNumberText}>
            {isPlayerOne ? '1' : '2'}
          </Text>
        </View>
      </Animated.View>

      {/* Turn order */}
      <View style={styles.turnOrder}>
        <View
          style={[
            styles.orderItem,
            isPlayerOne && styles.activeOrderItem,
          ]}
        >
          <View
            style={[
              styles.orderAvatar,
              isPlayerOne && styles.activeAvatar,
            ]}
          >
            <Text
              style={[
                styles.orderAvatarText,
                isPlayerOne && styles.activeAvatarText,
              ]}
            >
              1
            </Text>
          </View>

          <Text
            numberOfLines={1}
            style={[
              styles.orderName,
              isPlayerOne && styles.activeOrderName,
            ]}
          >
            {player1.name}
          </Text>
        </View>

        <View style={styles.arrowContainer}>
          <Ionicons
            name="arrow-forward"
            size={18}
            color="#94A3B8"
          />
        </View>

        <View
          style={[
            styles.orderItem,
            !isPlayerOne && styles.activeOrderItem,
          ]}
        >
          <View
            style={[
              styles.orderAvatar,
              !isPlayerOne && styles.activeAvatar,
            ]}
          >
            <Text
              style={[
                styles.orderAvatarText,
                !isPlayerOne && styles.activeAvatarText,
              ]}
            >
              2
            </Text>
          </View>

          <Text
            numberOfLines={1}
            style={[
              styles.orderName,
              !isPlayerOne && styles.activeOrderName,
            ]}
          >
            {player2.name}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#F8FAFC',
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  skillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 18,
    paddingHorizontal: 11,
    paddingVertical: 7,
    gap: 5,
  },

  skillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },

  levelBadge: {
    backgroundColor: '#E2E8F0',
    borderRadius: 18,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },

  levelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },

  turnCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },

  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  turnInfo: {
    flex: 1,
    marginLeft: 11,
  },

  turnLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },

  playerName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 1,
  },

  instruction: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  playerNumber: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  playerNumberText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  turnOrder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 9,
    gap: 8,
  },

  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '40%',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 15,
  },

  activeOrderItem: {
    backgroundColor: '#EFF6FF',
  },

  orderAvatar: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },

  activeAvatar: {
    backgroundColor: '#3B82F6',
  },

  orderAvatarText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
  },

  activeAvatarText: {
    color: '#FFFFFF',
  },

  orderName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    flexShrink: 1,
  },

  activeOrderName: {
    color: '#2563EB',
    fontWeight: '800',
  },

  arrowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});