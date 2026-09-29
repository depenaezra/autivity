import React from 'react';
import { View, StyleSheet } from 'react-native';
import TracingActivity from '@/activities/tracing/components/tracing-activity';
import { TurnTakingLevel, TurnTakingPlayer } from '../types';

interface CurvedPathProps {
  level: TurnTakingLevel;
  player: TurnTakingPlayer;
  showGuide?: boolean;
  hintSignal?: number;
  onComplete: () => void;
  onMistake?: () => void;
}

export default function CurvedPath({
  level,
  player,
  showGuide = false,
  hintSignal = 0,
  onComplete,
  onMistake,
}: CurvedPathProps) {
  const tracingActivityData = {
    id: `turn-taking-track-${level.id}`,
    paths: [level.svgPath],
  };

  return (
    <View style={styles.container}>
      <TracingActivity
        key={`${player.id}-${level.id}`}
        activity={tracingActivityData}
        onComplete={() => onComplete()}
        onIncorrectAttempt={onMistake}
        hintSignal={showGuide ? hintSignal + 1 : 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});