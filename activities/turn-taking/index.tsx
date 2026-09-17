import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { HeaderButton } from '@/components/header-button';

import StudentSelector from './components/StudentSelector';
import SpinWheel from './components/SpinWheel';
import CurvedPath from './components/CurvedPath';
import TurnIndicator from './components/TurnIndicator';
import ResultScreen from './components/ResultScreen';

import { TURN_TAKING_LEVELS } from './data/levels';

import {
  TurnTakingPlayer,
  TurnTakingResult,
  TurnTakingGameState,
} from './types'

export default function TurnTakingActivity() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    studentId?: string;
    studentName?: string;
    classId?: string;
    teacherId?: string;
  }>();

  const [gameState, setGameState] =
    useState<TurnTakingGameState>('selecting');

  const [player1, setPlayer1] =
    useState<TurnTakingPlayer | null>(null);

  const [player2, setPlayer2] =
    useState<TurnTakingPlayer | null>(null);

  const [firstPlayer, setFirstPlayer] =
    useState<TurnTakingPlayer | null>(null);

  const [currentPlayer, setCurrentPlayer] =
    useState<TurnTakingPlayer | null>(null);

  const [currentLevel, setCurrentLevel] = useState(1);

  const [completedLevels, setCompletedLevels] = useState(0);

  const [results, setResults] = useState<TurnTakingResult[]>([]);

  const [isTransitioning, setIsTransitioning] =
    useState(false);

  /*
   * Temporary student list.
   *
   * Later, this can be replaced with the actual
   * students passed from your class/student data.
   */
  const students = useMemo<TurnTakingPlayer[]>(() => {
    return [
      {
        id: 'student-1',
        name: 'Student 1',
      },
      {
        id: 'student-2',
        name: 'Student 2',
      },
      {
        id: 'student-3',
        name: 'Student 3',
      },
      {
        id: 'student-4',
        name: 'Student 4',
      },
      {
        id: 'student-5',
        name: 'Student 5',
      },
    ];
  }, []);

  /*
   * STEP 1
   *
   * Teacher selects two students.
   */
  const handleStudentsSelected = (
    selectedPlayer1: TurnTakingPlayer,
    selectedPlayer2: TurnTakingPlayer
  ) => {
    setPlayer1(selectedPlayer1);
    setPlayer2(selectedPlayer2);

    setCurrentLevel(1);
    setCompletedLevels(0);
    setResults([]);

    setGameState('spinning');
  };

  /*
   * STEP 2
   *
   * Wheel decides who goes first.
   */
  const handleSpinComplete = (
    selectedFirstPlayer: TurnTakingPlayer
  ) => {
    setFirstPlayer(selectedFirstPlayer);
    setCurrentPlayer(selectedFirstPlayer);

    setIsTransitioning(true);
    setGameState('playing');

    /*
     * Give the student a short "Get Ready" moment.
     */
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1200);
  };

  /*
   * STEP 3
   *
   * Current student finishes the path.
   */
  const handleTurnComplete = () => {
    if (!currentPlayer || !player1 || !player2) {
      return;
    }

    const newResult: TurnTakingResult = {
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      level: currentLevel,
      completed: true,
      timeSeconds: 0,
    };

    setResults((currentResults) => [
      ...currentResults,
      newResult,
    ]);

    /*
     * The player chosen by the wheel always takes the first turn.
     * The other player must then complete the same level. This is
     * deliberately based on firstPlayer rather than player number so
     * it also works when Player 2 wins the spin.
     */
    const isFirstTurn = currentPlayer.id === firstPlayer?.id;

    if (isFirstTurn) {
      setCurrentPlayer(
        currentPlayer.id === player1.id ? player2 : player1
      );
      setIsTransitioning(true);

      setTimeout(() => {
        setIsTransitioning(false);
      }, 1200);

      return;
    }

    /*
     * If Player 2 finished, both students
     * have completed this level.
     */
    setCompletedLevels((current) => current + 1);

    /*
     * Check whether there are more levels.
     */
    if (currentLevel < TURN_TAKING_LEVELS.length) {
      const nextLevel = currentLevel + 1;

      setCurrentLevel(nextLevel);

      /*
       * The students continue taking turns.
       *
       * The student who started the previous level
       * starts the next level as well.
       */
      if (firstPlayer) {
        setCurrentPlayer(firstPlayer);
      } else {
        setCurrentPlayer(player1);
      }

      setIsTransitioning(true);

      setTimeout(() => {
        setIsTransitioning(false);
      }, 1200);
    } else {
      /*
       * All levels are complete.
       */
      setGameState('result');
    }
  };

  /*
   * Play the activity again using the same
   * two selected students.
   */
  const handlePlayAgain = () => {
    if (!player1 || !player2) {
      setGameState('selecting');
      return;
    }

    setCurrentLevel(1);
    setCompletedLevels(0);
    setResults([]);
    setFirstPlayer(null);
    setCurrentPlayer(null);

    setGameState('spinning');
  };

  /*
   * Finish the activity and return to the
   * previous screen.
   */
  const handleFinish = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/' as any);
    }
  };

  /*
   * Back button.
   */
  const handleBack = () => {
    if (gameState === 'selecting') {
      handleFinish();
      return;
    }

    if (gameState === 'spinning') {
      setGameState('selecting');
      return;
    }

    if (gameState === 'playing') {
      /*
       * Going back during the game returns
       * to student selection.
       */
      setGameState('selecting');
      setPlayer1(null);
      setPlayer2(null);
      setCurrentPlayer(null);
      setFirstPlayer(null);
      setCurrentLevel(1);
      setCompletedLevels(0);
      setResults([]);
      return;
    }

    if (gameState === 'result') {
      setGameState('selecting');
      setPlayer1(null);
      setPlayer2(null);
      setCurrentPlayer(null);
      setFirstPlayer(null);
      setCurrentLevel(1);
      setCompletedLevels(0);
      setResults([]);
      return;
    }
  };

  /*
   * SELECT STUDENTS
   */
  if (gameState === 'selecting') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <HeaderButton
            onPress={handleBack}
            icon={<Ionicons name="caret-back" size={24} color="#62A9E6" />}
          />

          <Text style={styles.topBarTitle}>
            Turn-Taking Activity
          </Text>

          <View style={styles.topBarSpacer} />
        </View>

        <StudentSelector
          students={students}
          onStart={handleStudentsSelected}
        />
      </SafeAreaView>
    );
  }

  /*
   * SPIN WHEEL
   */
  if (
    gameState === 'spinning' &&
    player1 &&
    player2
  ) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <HeaderButton
            onPress={handleBack}
            icon={<Ionicons name="caret-back" size={24} color="#62A9E6" />}
          />

          <Text style={styles.topBarTitle}>
            Turn-Taking Activity
          </Text>

          <View style={styles.topBarSpacer} />
        </View>

        <SpinWheel
          player1={player1}
          player2={player2}
          onComplete={handleSpinComplete}
        />
      </SafeAreaView>
    );
  }

  /*
   * RESULT SCREEN
   */
  if (
    gameState === 'result' &&
    player1 &&
    player2
  ) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <HeaderButton
            onPress={handleBack}
            icon={<Ionicons name="caret-back" size={24} color="#62A9E6" />}
          />

          <Text style={styles.topBarTitle}>
            Activity Results
          </Text>

          <View style={styles.topBarSpacer} />
        </View>

        <ResultScreen
          player1={player1}
          player2={player2}
          results={results}
          completedLevels={completedLevels}
          onPlayAgain={handlePlayAgain}
          onFinish={handleFinish}
        />
      </SafeAreaView>
    );
  }

  /*
   * GAME SCREEN
   */
  if (
    gameState === 'playing' &&
    player1 &&
    player2 &&
    currentPlayer
  ) {
    const level = TURN_TAKING_LEVELS[currentLevel - 1];

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.gameHeader}>
          <HeaderButton
            onPress={handleBack}
            icon={<Ionicons name="caret-back" size={24} color="#62A9E6" />}
          />

          <View style={styles.gameHeaderCenter}>
            <Text style={styles.gameTitle}>
              Turn-Taking
            </Text>

            <Text style={styles.gameSubtitle}>
              Level {currentLevel} of{' '}
              {TURN_TAKING_LEVELS.length}
            </Text>
          </View>

          <View style={styles.levelCircle}>
            <Text style={styles.levelCircleText}>
              {currentLevel}
            </Text>
          </View>
        </View>

        <TurnIndicator
          currentPlayer={currentPlayer}
          player1={player1}
          player2={player2}
          level={currentLevel}
          isTransitioning={isTransitioning}
        />

        {level && (
          <View style={styles.pathContainer}>
            <CurvedPath
              key={`${currentPlayer.id}-${currentLevel}`}
              level={level}
              player={currentPlayer}
              onComplete={handleTurnComplete}
            />
          </View>
        )}
      </SafeAreaView>
    );
  }

  /*
   * Fallback.
   */
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          Loading activity...
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  topBar: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },

  topBarTitle: {
    fontSize: 17,
    fontFamily: 'FredokaOne-Regular',
    color: '#484A4B',
  },

  topBarSpacer: {
    width: 40,
  },

  gameHeader: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
    paddingHorizontal: 15,
  },

  gameHeaderCenter: {
    flex: 1,
    alignItems: 'center',
  },

  gameTitle: {
    fontSize: 17,
    fontFamily: 'FredokaOne-Regular',
    color: '#484A4B',
  },

  gameSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  levelCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  levelCircleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2563EB',
  },

  pathContainer: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    fontSize: 15,
    color: '#64748B',
  },
});
