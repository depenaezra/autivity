import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { HeaderButton } from '@/components/header-button';

import SpinWheel from './components/SpinWheel';
import StudentSelector from './components/StudentSelector';
import CurvedPath from './components/CurvedPath';
import ResultScreen from './components/ResultScreen';

import { TURN_TAKING_LEVELS } from './data/levels';

import {
  TurnTakingPlayer,
  TurnTakingResult,
  TurnTakingGameState,
} from './types';

import { getClassStudents } from '@/src/services/students';

interface TurnTakingActivityProps {
  assignedStudentId?: string;
  classId?: string;
}

export default function TurnTakingActivity({
  assignedStudentId,
  classId: propClassId,
}: TurnTakingActivityProps = {}) {
  const router = useRouter();

  const params =
    useLocalSearchParams<{
      studentId?: string;
      studentName?: string;
      classId?: string;
      teacherId?: string;
    }>();

  /*
   * =========================================================
   * ACTUAL ASSIGNED STUDENT + CLASS
   * =========================================================
   */

  const actualStudentId =
    assignedStudentId ||
    (Array.isArray(params.studentId)
      ? params.studentId[0]
      : params.studentId);

  const actualClassId =
    propClassId ||
    (Array.isArray(params.classId)
      ? params.classId[0]
      : params.classId);

  /*
   * =========================================================
   * GAME STATE
   * =========================================================
   *
   * Flow:
   *
   * selecting
   *    ↓
   * teacher selects Player 2
   *    ↓
   * spinning
   *    ↓
   * playing
   *    ↓
   * result
   */

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

  const [currentLevel, setCurrentLevel] =
    useState(1);

  const [completedLevels, setCompletedLevels] =
    useState(0);

  const [results, setResults] =
    useState<TurnTakingResult[]>([]);

  const [isTransitioning, setIsTransitioning] =
    useState(false);

  /*
   * =========================================================
   * SAME-CLASS STUDENTS
   * =========================================================
   */

  const [classStudents, setClassStudents] =
    useState<TurnTakingPlayer[]>([]);

  const [isLoadingStudents, setIsLoadingStudents] =
    useState(true);

  /*
   * =========================================================
   * MISTAKES
   * =========================================================
   */

  const [mistakesByPlayer, setMistakesByPlayer] =
    useState<Record<string, number>>({});

  /*
   * =========================================================
   * SOUND + GUIDE
   * =========================================================
   */

  const [soundEnabled, setSoundEnabled] =
    useState(true);

  const [showGuide, setShowGuide] =
    useState(false);

  /*
   * =========================================================
   * BEAR MESSAGE
   * =========================================================
   */

  const [bearMessage, setBearMessage] =
    useState(
      'Choose a classmate to play with.'
    );

  /*
   * =========================================================
   * LOAD ASSIGNED STUDENT + SAME CLASS STUDENTS
   * =========================================================
   */

  useEffect(() => {
    const loadStudents = async () => {
      if (!actualClassId || !actualStudentId) {
        console.warn(
          'Turn-Taking is missing studentId or classId.'
        );

        setIsLoadingStudents(false);
        return;
      }

      try {
        const students =
          await getClassStudents(actualClassId);

        /*
         * Convert database students to TurnTakingPlayer.
         */

        const mappedStudents: TurnTakingPlayer[] =
          students.map((student: any) => ({
            id: student.id,
            name: student.name,
            avatar:
              student.avatar ||
              undefined,
            difficulty: 1,
          }));

        /*
         * =====================================================
         * PLAYER 1
         * =====================================================
         *
         * The student who was assigned the activity is
         * automatically Player 1.
         */

        const assignedStudent =
          mappedStudents.find(
            (student) =>
              String(student.id) ===
              String(actualStudentId)
          );

        if (!assignedStudent) {
          console.error(
            'Assigned student was not found in the selected class.'
          );

          setIsLoadingStudents(false);
          return;
        }

        /*
         * =====================================================
         * SAVE SAME-CLASS STUDENTS
         * =====================================================
         *
         * getClassStudents(actualClassId) already makes sure
         * these students belong to the selected class.
         */

        setClassStudents(
          mappedStudents
        );

        /*
         * Player 1 is automatically the assigned student.
         */

        setPlayer1(
          assignedStudent
        );

        /*
         * IMPORTANT:
         *
         * DO NOT automatically select Player 2.
         *
         * The teacher must manually choose Player 2
         * through StudentSelector.
         */

        setPlayer2(null);

        /*
         * Show the Player 2 selection screen.
         */

        setBearMessage(
          'Choose a classmate to play with.'
        );

        setGameState(
          'selecting'
        );
      } catch (error) {
        console.error(
          'Unable to load same-class students for Turn-Taking:',
          error
        );

        setBearMessage(
          'Unable to load the students for this class.'
        );
      } finally {
        setIsLoadingStudents(false);
      }
    };

    loadStudents();
  }, [
    actualClassId,
    actualStudentId,
  ]);

  /*
   * =========================================================
   * STUDENTS SELECTED
   * =========================================================
   *
   * Player 1 = assigned student
   * Player 2 = manually selected classmate
   *
   * After selection, move to the Spin Wheel.
   */

  const handleStudentsSelected = (
    selectedPlayer1: TurnTakingPlayer,
    selectedPlayer2: TurnTakingPlayer
  ) => {
    setPlayer1(
      selectedPlayer1
    );

    setPlayer2(
      selectedPlayer2
    );

    setCurrentLevel(1);
    setCompletedLevels(0);
    setResults([]);

    setFirstPlayer(null);
    setCurrentPlayer(null);

    setMistakesByPlayer({});

    setShowGuide(false);

    setBearMessage(
      'Let us spin the wheel to see who goes first!'
    );

    setGameState(
      'spinning'
    );
  };

  /*
   * =========================================================
   * SPIN WHEEL
   * =========================================================
   */

  const handleSpinComplete = (
    selectedFirstPlayer: TurnTakingPlayer
  ) => {
    setFirstPlayer(
      selectedFirstPlayer
    );

    setCurrentPlayer(
      selectedFirstPlayer
    );

    setCurrentLevel(1);
    setCompletedLevels(0);
    setShowGuide(false);

    setBearMessage(
      `Great! ${selectedFirstPlayer.name} goes first!`
    );

    setIsTransitioning(true);
    setGameState('playing');

    setTimeout(() => {
      setIsTransitioning(false);

      setBearMessage(
        'Drag the pencil along the line!'
      );
    }, 1200);
  };

  /*
   * =========================================================
   * GET OTHER PLAYER
   * =========================================================
   */

  const getOtherPlayer = (
    player: TurnTakingPlayer
  ) => {
    if (
      player1 &&
      player.id === player1.id
    ) {
      return player2;
    }

    return player1;
  };

  /*
   * =========================================================
   * TURN COMPLETED
   * =========================================================
   */

  const handleTurnComplete = () => {
    if (
      !currentPlayer ||
      !player1 ||
      !player2 ||
      !firstPlayer
    ) {
      return;
    }

    const turnMistakes =
      mistakesByPlayer[
        currentPlayer.id
      ] || 0;

    const newResult: TurnTakingResult = {
      playerId:
        currentPlayer.id,
      playerName:
        currentPlayer.name,
      level:
        currentLevel,
      completed: true,
      timeSeconds: 0,
      mistakes:
        turnMistakes,
      obstacleCount: 0,
    };

    const updatedResults = [
      ...results,
      newResult,
    ];

    setResults(
      updatedResults
    );

    const newCompletedLevels =
      completedLevels + 1;

    setCompletedLevels(
      newCompletedLevels
    );

    /*
     * =======================================================
     * FINISHED
     * =======================================================
     *
     * 6 total turns:
     *
     * P1 L1
     * P2 L1
     * P1 L2
     * P2 L2
     * P1 L3
     * P2 L3
     */

    if (
      newCompletedLevels >= 6
    ) {
      setShowGuide(false);

      setBearMessage(
        'Amazing! Both students finished all three levels!'
      );

      setGameState(
        'result'
      );

      return;
    }

    /*
     * =======================================================
     * NEXT PLAYER
     * =======================================================
     */

    const nextPlayer =
      getOtherPlayer(
        currentPlayer
      );

    if (!nextPlayer) {
      return;
    }

    /*
     * =======================================================
     * NEXT LEVEL
     * =======================================================
     *
     * 0 → L1
     * 1 → L1
     * 2 → L2
     * 3 → L2
     * 4 → L3
     * 5 → L3
     */

    const nextLevel =
      Math.floor(
        newCompletedLevels / 2
      ) + 1;

    setCurrentPlayer(
      nextPlayer
    );

    setCurrentLevel(
      nextLevel
    );

    setShowGuide(false);

    setIsTransitioning(true);

    setBearMessage(
      `Great job, ${currentPlayer.name}! Now it is ${nextPlayer.name}'s turn!`
    );

    setTimeout(() => {
      setIsTransitioning(false);

      setBearMessage(
        'Drag the pencil along the line!'
      );
    }, 1000);
  };

  /*
   * =========================================================
   * MISTAKE
   * =========================================================
   */

  const handleMistake = () => {
    if (!currentPlayer) {
      return;
    }

    setMistakesByPlayer(
      (current) => ({
        ...current,
        [currentPlayer.id]:
          (current[
            currentPlayer.id
          ] || 0) + 1,
      })
    );

    setBearMessage(
      'Oops! Follow the line and try again.'
    );

    setShowGuide(true);
  };

  /*
   * =========================================================
   * GUIDE
   * =========================================================
   */

  const handleGuideToggle = () => {
    setShowGuide(
      (current) => !current
    );

    if (!showGuide) {
      setBearMessage(
        'Follow the arrow! It shows where to go next.'
      );
    } else {
      setBearMessage(
        'You can follow the line by dragging the pencil.'
      );
    }
  };

  /*
   * =========================================================
   * SOUND
   * =========================================================
   */

  const handleSoundToggle = () => {
    setSoundEnabled(
      (current) => !current
    );
  };

  /*
   * =========================================================
   * PLAY AGAIN
   * =========================================================
   */

  const handlePlayAgain = () => {
    if (
      !player1 ||
      !player2
    ) {
      return;
    }

    setCurrentLevel(1);
    setCompletedLevels(0);
    setResults([]);

    setFirstPlayer(null);
    setCurrentPlayer(null);

    setMistakesByPlayer({});

    setShowGuide(false);

    setBearMessage(
      'Let us spin the wheel again!'
    );

    setGameState(
      'spinning'
    );
  };

  /*
   * =========================================================
   * FINISH
   * =========================================================
   */

  const handleFinish = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/' as any);
    }
  };

  /*
   * =========================================================
   * BACK
   * =========================================================
   */

  const handleBack = () => {
    handleFinish();
  };

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (
    isLoadingStudents
  ) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <View
          style={
            styles.loadingContainer
          }
        >
          <Text
            style={
              styles.loadingText
            }
          >
            Loading students...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * =========================================================
   * PLAYER SELECTION
   * =========================================================
   *
   * Player 1 is already assigned.
   * Teacher chooses Player 2.
   */

  if (
    gameState === 'selecting' &&
    player1
  ) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <View
          style={styles.topBar}
        >
          <HeaderButton
            onPress={
              handleBack
            }
            icon={
              <Ionicons
                name="caret-back"
                size={24}
                color="#62A9E6"
              />
            }
          />

          <Text
            style={
              styles.topBarTitle
            }
          >
            Turn-Taking Activity
          </Text>

          <View
            style={
              styles.topBarSpacer
            }
          />
        </View>

        <StudentSelector
          assignedStudent={
            player1
          }
          students={
            classStudents
          }
          isLoading={
            isLoadingStudents
          }
          onStart={
            handleStudentsSelected
          }
        />
      </SafeAreaView>
    );
  }

  /*
   * =========================================================
   * NO PLAYER 1 / PLAYER 2
   * =========================================================
   */

  if (
    !player1 ||
    !player2
  ) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <View
          style={styles.topBar}
        >
          <HeaderButton
            onPress={
              handleBack
            }
            icon={
              <Ionicons
                name="caret-back"
                size={24}
                color="#62A9E6"
              />
            }
          />

          <Text
            style={
              styles.topBarTitle
            }
          >
            Turn-Taking Activity
          </Text>

          <View
            style={
              styles.topBarSpacer
            }
          />
        </View>

        <View
          style={
            styles.loadingContainer
          }
        >
          <Text
            style={
              styles.loadingText
            }
          >
            {bearMessage}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * =========================================================
   * SPIN WHEEL
   * =========================================================
   */

  if (
    gameState ===
    'spinning'
  ) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <View
          style={styles.topBar}
        >
          <HeaderButton
            onPress={
              handleBack
            }
            icon={
              <Ionicons
                name="caret-back"
                size={24}
                color="#62A9E6"
              />
            }
          />

          <Text
            style={
              styles.topBarTitle
            }
          >
            Turn-Taking Activity
          </Text>

          <View
            style={
              styles.topBarSpacer
            }
          />
        </View>

        <SpinWheel
          player1={player1}
          player2={player2}
          onComplete={
            handleSpinComplete
          }
        />
      </SafeAreaView>
    );
  }

  /*
   * =========================================================
   * RESULTS
   * =========================================================
   */

  if (
    gameState ===
      'result' &&
    player1 &&
    player2
  ) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <View
          style={styles.topBar}
        >
          <HeaderButton
            onPress={
              handleBack
            }
            icon={
              <Ionicons
                name="caret-back"
                size={24}
                color="#62A9E6"
              />
            }
          />

          <Text
            style={
              styles.topBarTitle
            }
          >
            Activity Results
          </Text>

          <View
            style={
              styles.topBarSpacer
            }
          />
        </View>

        <ResultScreen
          player1={player1}
          player2={player2}
          results={results}
          completedLevels={
            completedLevels
          }
          onPlayAgain={
            handlePlayAgain
          }
          onFinish={
            handleFinish
          }
        />
      </SafeAreaView>
    );
  }

  /*
   * =========================================================
   * GAME
   * =========================================================
   */

  if (
    gameState ===
      'playing' &&
    player1 &&
    player2 &&
    currentPlayer
  ) {
    const level =
      TURN_TAKING_LEVELS[
        currentLevel - 1
      ];

    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        {/* HEADER */}

        <View
          style={styles.gameHeader}
        >
          <HeaderButton
            onPress={
              handleBack
            }
            icon={
              <Ionicons
                name="close"
                size={25}
                color="#62A9E6"
              />
            }
          />

          <View
            style={
              styles.gameHeaderCenter
            }
          >
            <Text
              style={
                styles.gameTitle
              }
            >
              Curve Tracing
            </Text>

            <Text
              style={
                styles.gameSubtitle
              }
            >
              Level {currentLevel} of{' '}
              {TURN_TAKING_LEVELS.length}
            </Text>
          </View>

          {/* GUIDE */}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={
              handleGuideToggle
            }
            style={[
              styles.iconButton,
              styles.guideButton,
              showGuide &&
                styles.guideButtonActive,
            ]}
          >
            <Ionicons
              name="bulb-outline"
              size={25}
              color="#EAB308"
            />
          </TouchableOpacity>

          {/* SOUND */}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={
              handleSoundToggle
            }
            style={[
              styles.iconButton,
              styles.soundButton,
            ]}
          >
            <Ionicons
              name={
                soundEnabled
                  ? 'volume-high-outline'
                  : 'volume-mute-outline'
              }
              size={25}
              color="#62A9E6"
            />
          </TouchableOpacity>
        </View>

        {/* BEAR / INSTRUCTION */}

        <View
          style={
            styles.instructionArea
          }
        >
          <View
            style={
              styles.bearPlaceholder
            }
          >
            <Text
              style={
                styles.bearEmoji
              }
            >
              🐻
            </Text>
          </View>

          <View
            style={
              styles.speechBubble
            }
          >
            <Text
              style={
                styles.speechText
              }
            >
              {bearMessage}
            </Text>
          </View>
        </View>

        {/* CURRENT PLAYER */}

        <View
          style={
            styles.playerInfo
          }
        >
          <View
            style={
              styles.playerAvatar
            }
          >
            <Text
              style={
                styles.playerInitial
              }
            >
              {currentPlayer.name
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>

          <View
            style={
              styles.playerInfoText
            }
          >
            <Text
              style={
                styles.playerName
              }
            >
              {currentPlayer.name}
            </Text>

            <Text
              style={
                styles.levelName
              }
            >
              {level?.name}
            </Text>
          </View>

          <View
            style={
              styles.progressBadge
            }
          >
            <Text
              style={
                styles.progressBadgeText
              }
            >
              {currentLevel}/3
            </Text>
          </View>
        </View>

        {/* PATH */}

        <View
          style={
            styles.pathContainer
          }
        >
          {level && (
            <CurvedPath
              key={`${currentPlayer.id}-${currentLevel}`}
              level={level}
              player={
                currentPlayer
              }
              showGuide={
                showGuide
              }
              onComplete={
                handleTurnComplete
              }
              onMistake={
                handleMistake
              }
            />
          )}
        </View>
      </SafeAreaView>
    );
  }

  /*
   * =========================================================
   * FALLBACK
   * =========================================================
   */

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <View
        style={
          styles.loadingContainer
        }
      >
        <Text
          style={
            styles.loadingText
          }
        >
          Loading activity...
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  topBar: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    paddingHorizontal: 15,
    backgroundColor:
      '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor:
      '#F1F1F1',
  },

  topBarTitle: {
    fontSize: 17,
    fontFamily:
      'FredokaOne-Regular',
    color: '#484A4B',
  },

  topBarSpacer: {
    width: 40,
  },

  gameHeader: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      '#FFFFFF',
    paddingHorizontal: 14,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor:
      '#F1F1F1',
  },

  gameHeaderCenter: {
    flex: 1,
    alignItems:
      'center',
  },

  gameTitle: {
    fontSize: 19,
    fontFamily:
      'FredokaOne-Regular',
    color: '#48556A',
  },

  gameSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  iconButton: {
    width: 45,
    height: 45,
    borderRadius: 14,
    alignItems:
      'center',
    justifyContent:
      'center',
    backgroundColor:
      '#FFFFFF',
    borderWidth: 2,
  },

  guideButton: {
    borderColor:
      '#FDE68A',
  },

  guideButtonActive: {
    backgroundColor:
      '#FFF7CC',
    borderColor:
      '#FACC15',
  },

  soundButton: {
    borderColor:
      '#BAE6FD',
  },

  instructionArea: {
    flexDirection:
      'row',
    alignItems:
      'center',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 6,
    minHeight: 110,
  },

  bearPlaceholder: {
    width: 105,
    height: 105,
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  bearEmoji: {
    fontSize: 58,
  },

  speechBubble: {
    flex: 1,
    marginLeft: 8,
    backgroundColor:
      '#FFF9F9',
    borderWidth: 2,
    borderColor:
      '#E8D4D4',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },

  speechText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily:
      'Quicksand-Bold',
    color: '#555B66',
  },

  playerInfo: {
    marginHorizontal: 18,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor:
      '#EAF5FD',
    flexDirection:
      'row',
    alignItems:
      'center',
  },

  playerAvatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor:
      '#D3ECFF',
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  playerInitial: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3B82F6',
  },

  playerInfoText: {
    flex: 1,
    marginLeft: 10,
  },

  playerName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#334155',
  },

  levelName: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },

  progressBadge: {
    minWidth: 45,
    height: 35,
    paddingHorizontal: 9,
    borderRadius: 18,
    backgroundColor:
      '#FFFFFF',
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  progressBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3B82F6',
  },

  pathContainer: {
    flex: 1,
    paddingHorizontal: 18,
    paddingBottom: 12,
  },

  loadingContainer: {
    flex: 1,
    alignItems:
      'center',
    justifyContent:
      'center',
    paddingHorizontal: 30,
  },

  loadingText: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
  },
});