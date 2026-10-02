import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Pressable,
  useWindowDimensions,
  ActivityIndicator,
  Dimensions,
  Animated as RNAnimated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { HeaderButton } from '@/components/header-button';
import ActivityBear from '@/assets/images/activity-bear.svg';
import InstructionSpeakerButton from '@/components/ui/instruction-speaker-button';
import { speakInstruction, stopSpeech } from '@/src/utils/speech';
import FeedbackModal from '@/components/feedback-modal';
import { RubricEvaluation } from '@/src/services/sessions';

import SpinWheel from './components/SpinWheel';
import StudentSelector from './components/StudentSelector';
import CurvedPath from './components/CurvedPath';
import CategorySelectorModal from './components/CategorySelectorModal';

import { CATEGORY_METADATA, getRandomizedCategoryLevels } from './data/categories';

import {
  TurnTakingPlayer,
  TurnTakingResult,
  TurnTakingGameState,
  TurnTakingCategory,
  TurnTakingLevel,
  TeacherDualEvaluationResult,
} from './types';

import { getClassStudents } from '@/src/services/students';
import { saveStudentSession } from '@/src/services/sessions';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface TurnTakingActivityProps {
  assignedStudentId?: string;
  classId?: string;
}

export default function TurnTakingActivity({
  assignedStudentId,
  classId: propClassId,
}: TurnTakingActivityProps = {}) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const params = useLocalSearchParams<{
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
    (Array.isArray(params.studentId) ? params.studentId[0] : params.studentId);

  const actualClassId =
    propClassId ||
    (Array.isArray(params.classId) ? params.classId[0] : params.classId);

  /*
   * =========================================================
   * GAME STATE & CATEGORY SELECTION
   * =========================================================
   */
  const [gameState, setGameState] =
    useState<TurnTakingGameState>('category_select');

  const [selectedCategory, setSelectedCategory] =
    useState<TurnTakingCategory>('lines');

  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(true);

  const [activeLevels, setActiveLevels] = useState<TurnTakingLevel[]>(() =>
    getRandomizedCategoryLevels('lines', 3)
  );

  const [player1, setPlayer1] = useState<TurnTakingPlayer | null>(null);
  const [player2, setPlayer2] = useState<TurnTakingPlayer | null>(null);
  const [firstPlayer, setFirstPlayer] = useState<TurnTakingPlayer | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<TurnTakingPlayer | null>(null);

  const [currentLevel, setCurrentLevel] = useState(1);
  const [completedLevels, setCompletedLevels] = useState(0);
  const [results, setResults] = useState<TurnTakingResult[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  /*
   * =========================================================
   * EVALUATION & SESSION IDS (2 FORMS - 1 PER STUDENT)
   * =========================================================
   */
  const [session1Id, setSession1Id] = useState<string | null>(null);
  const [session2Id, setSession2Id] = useState<string | null>(null);
  const [activeEvalStudent, setActiveEvalStudent] = useState<'p1' | 'p2' | null>(null);
  const [isEvalSequence, setIsEvalSequence] = useState<boolean>(false);
  const [teacherEvaluations, setTeacherEvaluations] =
    useState<TeacherDualEvaluationResult | null>(null);

  /*
   * =========================================================
   * ELAPSED TIMER
   * =========================================================
   */
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  /*
   * =========================================================
   * SAME-CLASS STUDENTS
   * =========================================================
   */
  const [classStudents, setClassStudents] = useState<TurnTakingPlayer[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);

  /*
   * =========================================================
   * MISTAKES
   * =========================================================
   */
  const [mistakesByPlayer, setMistakesByPlayer] = useState<Record<string, number>>({});

  /*
   * =========================================================
   * SOUND + GUIDE
   * =========================================================
   */
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showGuide, setShowGuide] = useState(false);

  /*
   * =========================================================
   * BEAR MESSAGE
   * =========================================================
   */
  const [bearMessage, setBearMessage] = useState(
    'Choose a category and classmate to play with.'
  );

  /*
   * =========================================================
   * LOAD ASSIGNED STUDENT + SAME CLASS STUDENTS
   * =========================================================
   */
  useEffect(() => {
    const loadStudents = async () => {
      if (!actualClassId || !actualStudentId) {
        console.warn('Turn-Taking is missing studentId or classId.');
        setIsLoadingStudents(false);
        return;
      }

      try {
        const students = await getClassStudents(actualClassId);

        const mappedStudents: TurnTakingPlayer[] = students.map((student: any) => ({
          id: student.id,
          name: student.name,
          avatar: student.avatar || undefined,
          difficulty: 1,
        }));

        const assignedStudent = mappedStudents.find(
          (student) => String(student.id) === String(actualStudentId)
        );

        if (!assignedStudent) {
          console.error('Assigned student was not found in the selected class.');
          setIsLoadingStudents(false);
          return;
        }

        setClassStudents(mappedStudents);
        setPlayer1(assignedStudent);
        setPlayer2(null);

        setBearMessage('Choose a classmate to play with.');
        setGameState('selecting');
      } catch (error) {
        console.error('Unable to load same-class students for Turn-Taking:', error);
        setBearMessage('Unable to load the students for this class.');
      } finally {
        setIsLoadingStudents(false);
      }
    };

    loadStudents();
  }, [actualClassId, actualStudentId]);

  /*
   * =========================================================
   * CATEGORY CONFIRM & DUAL SESSION SAVING
   * =========================================================
   */
  const handleCategoryConfirm = () => {
    const randomized = getRandomizedCategoryLevels(selectedCategory, 3);
    setActiveLevels(randomized);
    setShowCategoryModal(false);
    if (gameState === 'category_select') {
      setGameState('selecting');
    }
  };

  const persistDualStudentSessions = async (
    p1: TurnTakingPlayer,
    p2: TurnTakingPlayer,
    allResults: TurnTakingResult[],
    categoryKey: TurnTakingCategory
  ): Promise<{ session1Id: string | null; session2Id: string | null }> => {
    let s1Id: string | null = null;
    let s2Id: string | null = null;

    try {
      const p1Results = allResults.filter((r) => r.playerId === p1.id);
      const p2Results = allResults.filter((r) => r.playerId === p2.id);
      const p1Mistakes = p1Results.reduce((sum, r) => sum + (r.mistakes || 0), 0);
      const p2Mistakes = p2Results.reduce((sum, r) => sum + (r.mistakes || 0), 0);
      const p1Time = p1Results.reduce((sum, r) => sum + (r.timeSeconds || 15), 0);
      const p2Time = p2Results.reduce((sum, r) => sum + (r.timeSeconds || 15), 0);

      if (p1.id && actualClassId) {
        const res1 = await saveStudentSession({
          student_id: String(p1.id),
          class_id: String(actualClassId),
          teacher_id: String(params.teacherId || ''),
          activity_path: [`turn-taking/${categoryKey}`],
          category: 'Turn-Taking',
          skill_domain: ['Social Skills', 'Turn Taking', 'Fine Motor'],
          stars: 15, // Standard completion stars; awaits teacher rubric evaluation
          duration_seconds: p1Time || elapsedSeconds || 60,
          mistakes: p1Mistakes,
        });

        if (res1 && res1.length > 0) {
          s1Id = res1[0].id;
        }
      }

      if (p2.id && actualClassId) {
        const res2 = await saveStudentSession({
          student_id: String(p2.id),
          class_id: String(actualClassId),
          teacher_id: String(params.teacherId || ''),
          activity_path: [`turn-taking/${categoryKey}`],
          category: 'Turn-Taking',
          skill_domain: ['Social Skills', 'Turn Taking', 'Fine Motor'],
          stars: 15, // Standard completion stars; awaits teacher rubric evaluation
          duration_seconds: p2Time || elapsedSeconds || 60,
          mistakes: p2Mistakes,
        });

        if (res2 && res2.length > 0) {
          s2Id = res2[0].id;
        }
      }
    } catch (err) {
      console.error('[Turn-Taking] Error saving dual student sessions:', err);
    }

    const finalS1 = s1Id || `local-turn-taking-p1-${p1.id}`;
    const finalS2 = s2Id || `local-turn-taking-p2-${p2.id}`;
    setSession1Id(finalS1);
    setSession2Id(finalS2);
    return { session1Id: finalS1, session2Id: finalS2 };
  };

  /*
   * =========================================================
   * STUDENTS SELECTED
   * =========================================================
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

    setFirstPlayer(null);
    setCurrentPlayer(null);
    setMistakesByPlayer({});
    setShowGuide(false);
    setElapsedSeconds(0);

    const spinPrompt = 'Let us spin the wheel to see who goes first!';
    setBearMessage(spinPrompt);
    speakInstruction(spinPrompt);

    setGameState('spinning');
  };

  /*
   * =========================================================
   * SPIN WHEEL COMPLETE
   * =========================================================
   */
  const handleSpinComplete = (selectedFirstPlayer: TurnTakingPlayer) => {
    setFirstPlayer(selectedFirstPlayer);
    setCurrentPlayer(selectedFirstPlayer);
    setCurrentLevel(1);
    setCompletedLevels(0);
    setShowGuide(false);

    const spinAnnouncement = `Great! ${selectedFirstPlayer.name} goes first!`;
    setBearMessage(spinAnnouncement);
    speakInstruction(spinAnnouncement);

    setIsTransitioning(true);
    setGameState('playing');

    setTimeout(() => {
      setIsTransitioning(false);
      const traceMsg = 'Drag the pencil along the line!';
      setBearMessage(traceMsg);
      speakInstruction(traceMsg);
    }, 1200);
  };

  /*
   * =========================================================
   * GET OTHER PLAYER
   * =========================================================
   */
  const getOtherPlayer = (player: TurnTakingPlayer) => {
    if (player1 && player.id === player1.id) {
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
    if (!currentPlayer || !player1 || !player2 || !firstPlayer) {
      return;
    }

    const turnMistakes = mistakesByPlayer[currentPlayer.id] || 0;

    const newResult: TurnTakingResult = {
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      level: currentLevel,
      levelName: activeLevels[currentLevel - 1]?.name,
      completed: true,
      timeSeconds: 15,
      mistakes: turnMistakes,
      obstacleCount: 0,
    };

    const updatedResults = [...results, newResult];
    setResults(updatedResults);

    const newCompletedLevels = completedLevels + 1;
    setCompletedLevels(newCompletedLevels);

    /*
     * 6 total turns:
     * P1 L1, P2 L1, P1 L2, P2 L2, P1 L3, P2 L3
     */
    if (newCompletedLevels >= 6) {
      setShowGuide(false);
      setIsTransitioning(false);

      if (player1 && player2) {
        persistDualStudentSessions(
          player1,
          player2,
          updatedResults,
          selectedCategory
        );
      }

      // Automatically launch the 2 student evaluation forms (1 for each student)
      setIsEvalSequence(true);
      setActiveEvalStudent('p1');
      const evalPrompt = `Session finished! Teacher, please evaluate Player 1, ${player1?.name}.`;
      setBearMessage(evalPrompt);
      speakInstruction(evalPrompt);
      return;
    }

    /*
     * NEXT PLAYER
     */
    const nextPlayer = getOtherPlayer(currentPlayer);
    if (!nextPlayer) return;

    const nextLevel = Math.floor(newCompletedLevels / 2) + 1;

    setCurrentPlayer(nextPlayer);
    setCurrentLevel(nextLevel);
    setShowGuide(false);
    setIsTransitioning(true);

    const turnSwitchMsg = `Great job, ${currentPlayer.name}! Now it is ${nextPlayer.name}'s turn!`;
    setBearMessage(turnSwitchMsg);
    speakInstruction(turnSwitchMsg);

    setTimeout(() => {
      setIsTransitioning(false);
      setBearMessage('Drag the pencil along the line!');
    }, 1200);
  };

  /*
   * =========================================================
   * MISTAKE
   * =========================================================
   */
  const handleMistake = () => {
    if (!currentPlayer) return;

    setMistakesByPlayer((current) => ({
      ...current,
      [currentPlayer.id]: (current[currentPlayer.id] || 0) + 1,
    }));

    const mistakeMsg = 'Oops! Follow the line and try again.';
    setBearMessage(mistakeMsg);
    speakInstruction(mistakeMsg);
    setShowGuide(true);
  };

  /*
   * =========================================================
   * GUIDE TOGGLE
   * =========================================================
   */
  const handleGuideToggle = () => {
    setShowGuide((current) => !current);

    if (!showGuide) {
      const guideMsg = 'Follow the arrow! It shows where to go next.';
      setBearMessage(guideMsg);
      speakInstruction(guideMsg);
    } else {
      setBearMessage('You can follow the line by dragging the pencil.');
    }
  };

  /*
   * =========================================================
   * SOUND TOGGLE
   * =========================================================
   */
  const handleSoundToggle = () => {
    setSoundEnabled((current) => !current);
  };



  /*
   * =========================================================
   * EVALUATION FLOW HANDLERS (2 FORMS - 1 PER PLAYER)
   * =========================================================
   */
  const handleP1EvalSuccess = (scores: RubricEvaluation, feedback: string) => {
    setTeacherEvaluations((prev) => ({
      ...prev,
      p1: { scores, feedback },
    }));

    if (player2) {
      const nextMsg = `Player 1 evaluation saved! Now evaluating Player 2, ${player2.name}.`;
      setBearMessage(nextMsg);
      speakInstruction(nextMsg);
      setTimeout(() => {
        setActiveEvalStudent('p2');
      }, 350);
    } else {
      setActiveEvalStudent(null);
      setIsEvalSequence(false);
      handleFinish();
    }
  };

  const handleP2EvalSuccess = (scores: RubricEvaluation, feedback: string) => {
    setTeacherEvaluations((prev) => ({
      ...prev,
      p2: { scores, feedback },
    }));

    setActiveEvalStudent(null);
    setIsEvalSequence(false);

    const allDoneMsg = 'Both student evaluations recorded successfully! Great work!';
    setBearMessage(allDoneMsg);
    speakInstruction(allDoneMsg);

    setTimeout(() => {
      handleFinish();
    }, 1200);
  };

  const handleEvalClose = () => {
    setActiveEvalStudent(null);
    setIsEvalSequence(false);
    handleFinish();
  };

  /*
   * =========================================================
   * RENDER DUAL EVALUATION FORMS (1 FORM FOR EACH STUDENT)
   * =========================================================
   */
  const renderEvaluationForms = () => {
    const currentMeta =
      CATEGORY_METADATA.find((c) => c.id === selectedCategory) ||
      CATEGORY_METADATA[0];

    return (
      <>
        {/* EVALUATION FORM 1: PLAYER 1 (Standard FeedbackModal from @/components/feedback-modal) */}
        {player1 && (
          <FeedbackModal
            visible={activeEvalStudent === 'p1'}
            sessionId={session1Id || `local-turn-taking-p1-${player1.id}`}
            studentName={`${player1.name} (Player 1)`}
            activityTitle={`${currentMeta.title} Tracing - Turn-Taking`}
            isEditing={Boolean(teacherEvaluations?.p1?.scores)}
            initialScores={teacherEvaluations?.p1?.scores}
            initialFeedback={teacherEvaluations?.p1?.feedback}
            onClose={handleEvalClose}
            onSuccess={handleP1EvalSuccess}
          />
        )}

        {/* EVALUATION FORM 2: PLAYER 2 (Standard FeedbackModal from @/components/feedback-modal) */}
        {player2 && (
          <FeedbackModal
            visible={activeEvalStudent === 'p2'}
            sessionId={session2Id || `local-turn-taking-p2-${player2.id}`}
            studentName={`${player2.name} (Player 2)`}
            activityTitle={`${currentMeta.title} Tracing - Turn-Taking`}
            isEditing={Boolean(teacherEvaluations?.p2?.scores)}
            initialScores={teacherEvaluations?.p2?.scores}
            initialFeedback={teacherEvaluations?.p2?.feedback}
            onClose={handleEvalClose}
            onSuccess={handleP2EvalSuccess}
          />
        )}
      </>
    );
  };

  /*
   * =========================================================
   * FINISH / BACK
   * =========================================================
   */
  const handleFinish = () => {
    stopSpeech().catch(() => {});
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/' as any);
    }
  };

  const handleBack = () => {
    handleFinish();
  };

  /*
   * =========================================================
   * LOADING SCREEN
   * =========================================================
   */
  if (isLoadingStudents) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#62A9E6" />
          <Text style={styles.loadingText}>Loading students...</Text>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * =========================================================
   * PLAYER SELECTION
   * =========================================================
   */
  if (
    (gameState === 'selecting' || gameState === 'category_select') &&
    player1
  ) {
    const currentMeta =
      CATEGORY_METADATA.find((c) => c.id === selectedCategory) ||
      CATEGORY_METADATA[0];

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <HeaderButton
            onPress={handleBack}
            icon={<Ionicons name="caret-back" size={24} color="#62A9E6" />}
          />
          <Text style={styles.topBarTitle}>Turn-Taking Activity</Text>
          <View style={styles.topBarSpacer} />
        </View>

        <StudentSelector
          assignedStudent={player1}
          students={classStudents}
          categoryTitle={currentMeta.title}
          categoryIcon={currentMeta.icon}
          onChangeCategory={() => setShowCategoryModal(true)}
          isLoading={isLoadingStudents}
          onStart={handleStudentsSelected}
        />

        <CategorySelectorModal
          visible={showCategoryModal || gameState === 'category_select'}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          onConfirm={handleCategoryConfirm}
          onClose={() => {
            setShowCategoryModal(false);
            if (gameState === 'category_select') setGameState('selecting');
          }}
        />
      </SafeAreaView>
    );
  }

  /*
   * =========================================================
   * NO PLAYER 1 / PLAYER 2 (FALLBACK)
   * =========================================================
   */
  if (!player1 || !player2) {
    if (gameState === 'spinning' || gameState === 'playing' || gameState === 'result') {
      // Missing players fallback
      return (
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.topBar}>
            <HeaderButton
              onPress={handleBack}
              icon={<Ionicons name="caret-back" size={24} color="#62A9E6" />}
            />
            <Text style={styles.topBarTitle}>Turn-Taking Activity</Text>
            <View style={styles.topBarSpacer} />
          </View>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{bearMessage}</Text>
          </View>
        </SafeAreaView>
      );
    }
  }

  /*
   * =========================================================
   * SPIN WHEEL SCREEN
   * =========================================================
   */
  if (gameState === 'spinning' && player1 && player2) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <HeaderButton
            onPress={handleBack}
            icon={<Ionicons name="caret-back" size={24} color="#62A9E6" />}
          />
          <Text style={styles.topBarTitle}>Turn-Taking Activity</Text>
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
   * =========================================================
   * GAME SCREEN (MATCHING EXACT GAMEPLAY UI OF OTHER GAMES)
   * =========================================================
   */
  if (
    gameState === 'playing' &&
    player1 &&
    player2 &&
    currentPlayer
  ) {
    const level = activeLevels[currentLevel - 1] || activeLevels[0];
    const currentMeta =
      CATEGORY_METADATA.find((c) => c.id === selectedCategory) ||
      CATEGORY_METADATA[0];
    const progressPercent = Math.min(100, Math.round((completedLevels / 6) * 100));

    return (
      <SafeAreaView style={styles.safeArea}>
        {/* HEADER: Exit and Title */}
        <View style={styles.gameHeader}>
          <HeaderButton
            onPress={handleBack}
            icon={<Ionicons name="close" size={26} color="#535B74" />}
          />

          <View style={styles.gameHeaderCenter}>
            <Text style={styles.gameTitle}>{currentMeta.title} Tracing</Text>
            <Text style={styles.gameSubtitle}>
              Turn {completedLevels + 1} of 6 • Level {currentLevel} of {activeLevels.length}
            </Text>
          </View>
        </View>

        {/* STATUS BAR ROW: Progress Bar, Speaker, Guide & Timer (Identical to other games) */}
        <View style={styles.statusBarRow}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>

          <View style={styles.statusBarControls}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleGuideToggle}
              style={[
                styles.guideIconBtn,
                showGuide && styles.guideIconBtnActive,
              ]}
            >
              <Ionicons
                name="bulb-outline"
                size={isTablet ? 22 : 18}
                color={showGuide ? '#CA8A04' : '#EAB308'}
              />
            </TouchableOpacity>

            <InstructionSpeakerButton
              text={bearMessage}
              autoPlay={false}
              size={isTablet ? 42 : 36}
              iconSize={isTablet ? 20 : 18}
            />

            <View style={styles.timerBadge}>
              <Feather name="clock" size={isTablet ? 18 : 16} color="#69AEE3" />
              <Text style={styles.timerText}>{formattedTime}</Text>
            </View>
          </View>
        </View>

        {/* BEAR & SPEECH BUBBLE (Vector ActivityBear and polished Quicksand typography) */}
        <View style={[styles.instructionArea, isTablet && styles.instructionAreaTablet]}>
          <ActivityBear
            width={isTablet ? 160 : 120}
            height={isTablet ? 160 : 120}
          />

          <View style={[styles.speechBubble, isTablet && styles.speechBubbleTablet]}>
            <Text style={[styles.speechText, isTablet && styles.speechTextTablet]}>
              {bearMessage}
            </Text>
          </View>
        </View>

        {/* CURRENT PLAYER BADGE */}
        <View style={styles.playerInfo}>
          <View style={styles.playerAvatar}>
            <Text style={styles.playerInitial}>
              {currentPlayer.name.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.playerInfoText}>
            <Text style={styles.playerName}>
              {currentPlayer.name}'s Turn
            </Text>
            <Text style={styles.levelName}>
              {level?.name || `Pattern ${currentLevel}`}
            </Text>
          </View>

          <View style={styles.progressBadge}>
            <Text style={styles.progressBadgeText}>
              Turn {completedLevels + 1}/6
            </Text>
          </View>
        </View>

        {/* PATH TRACING CANVAS */}
        <View style={styles.pathContainer}>
          {level && (
            <CurvedPath
              key={`${currentPlayer.id}-${currentLevel}`}
              level={level}
              player={currentPlayer}
              showGuide={showGuide}
              onComplete={handleTurnComplete}
              onMistake={handleMistake}
            />
          )}
        </View>

        {renderEvaluationForms()}
      </SafeAreaView>
    );
  }

  /*
   * =========================================================
   * FALLBACK
   * =========================================================
   */
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading activity...</Text>
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

  /*
   * GAME HEADER & STATUS BAR
   */
  gameHeader: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },

  gameHeaderCenter: {
    flex: 1,
    alignItems: 'center',
  },

  gameTitle: {
    fontSize: 20,
    fontFamily: 'FredokaOne-Regular',
    color: '#48556A',
  },

  gameSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Quicksand-Medium',
    marginTop: 2,
  },

  statusBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  progressBarBackground: {
    flex: 1,
    height: 16,
    backgroundColor: '#C4E0F9',
    borderRadius: 999,
    overflow: 'hidden',
  },

  progressBarFill: {
    height: '100%',
    backgroundColor: '#69AEE3',
    borderRadius: 999,
  },

  statusBarControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  guideIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  guideIconBtnActive: {
    backgroundColor: '#FEF9C3',
    borderColor: '#EAB308',
  },

  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: '#F0F9FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },

  timerText: {
    fontSize: 14,
    fontFamily: 'Quicksand-Bold',
    color: '#475569',
  },

  /*
   * BEAR & SPEECH BUBBLE
   */
  instructionArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },

  instructionAreaTablet: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 16,
  },

  speechBubble: {
    flex: 1,
    backgroundColor: '#FCF5F5',
    borderWidth: 1.5,
    borderColor: '#EAD5D5',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'center',
  },

  speechBubbleTablet: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 22,
  },

  speechText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Quicksand-Bold',
    color: '#555B66',
  },

  speechTextTablet: {
    fontSize: 19,
    lineHeight: 26,
  },

  /*
   * CURRENT PLAYER BADGE
   */
  playerInfo: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#EAF5FD',
    flexDirection: 'row',
    alignItems: 'center',
  },

  playerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#D3ECFF',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontFamily: 'Quicksand-Medium',
  },

  progressBadge: {
    minWidth: 45,
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3B82F6',
  },

  /*
   * PATH CANVAS
   */
  pathContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    fontFamily: 'Quicksand-Medium',
  },
});