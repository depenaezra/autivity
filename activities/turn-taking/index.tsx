import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { HeaderButton } from '@/components/header-button';
import ActivityBear from '@/assets/images/activity-bear.svg';
import { HoldToExitButton } from '@/components/set-manager';
import InstructionSpeakerButton from '@/components/ui/instruction-speaker-button';
import HintButton from '@/components/ui/hint-button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { ActivityLanguage, translateInstruction } from '@/src/utils/activityInstructions';

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
  initialTier?: number | string;
}

const TIER_TRACKS: Record<number, number[]> = {
  1: [1, 2, 3], // Easy: Straight Line, Gentle Wave, Smooth Curve
  2: [4, 5, 6], // Medium: S-Curve, Arch Bridge, Classic Zigzag
  3: [7, 8, 9, 10], // Hard: Mountain Peaks, Double Zigzag, Loop-de-Loop, Spiral Path
};

export default function TurnTakingActivity({
  assignedStudentId,
  classId: propClassId,
  initialTier,
}: TurnTakingActivityProps = {}) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  const params =
    useLocalSearchParams<{
      studentId?: string;
      studentName?: string;
      classId?: string;
      teacherId?: string;
      tier?: string;
      level?: string;
    }>();

  /* =========================================================
     STUDENT & CLASS RESOLUTION
  ========================================================= */

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

  /* =========================================================
     DIFFICULTY TIER & ACTIVE TRACKS
  ========================================================= */

  const [tier, setTier] = useState<number>(() => {
    const raw = initialTier || params.tier || params.level;
    if (raw) {
      const parsed = parseInt(String(raw).replace(/[^0-9]/g, ''), 10);
      if ([1, 2, 3].includes(parsed)) return parsed;
    }
    return 1;
  });

  const activeTracks = useMemo(
    () => TIER_TRACKS[tier] || TIER_TRACKS[1],
    [tier]
  );
  const totalTurns = activeTracks.length * 2;

  /* =========================================================
     GAME STATE
  ========================================================= */

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

  /* =========================================================
     CLASS STUDENTS
  ========================================================= */

  const [classStudents, setClassStudents] =
    useState<TurnTakingPlayer[]>([]);

  const [isLoadingStudents, setIsLoadingStudents] =
    useState(true);

  /* =========================================================
     MISTAKES & HINTS
  ========================================================= */

  const [mistakesByPlayer, setMistakesByPlayer] =
    useState<Record<string, number>>({});

  const [soundEnabled, setSoundEnabled] =
    useState(true);

  const [showGuide, setShowGuide] =
    useState(false);

  const [hintSignal, setHintSignal] =
    useState(0);

  const [bearMessage, setBearMessage] =
    useState('Select Player 2 to start playing together!');

  const [language, setLanguage] = useState<ActivityLanguage>('en');

  useEffect(() => {
    AsyncStorage.getItem('@activity_instruction_lang').then((saved) => {
      if (saved === 'tl' || saved === 'en') {
        setLanguage(saved);
      }
    });
  }, []);

  const toggleLanguage = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const nextLang = language === 'en' ? 'tl' : 'en';
    setLanguage(nextLang);
    try {
      await AsyncStorage.setItem('@activity_instruction_lang', nextLang);
    } catch (err) {
      console.error('Error saving instruction language:', err);
    }
  };

  const displayBearMessage = useMemo(() => {
    return translateInstruction(bearMessage, language);
  }, [bearMessage, language]);

  /* =========================================================
     CURRENT TRACK RESOLUTION
  ========================================================= */

  const currentTrackIndex = Math.min(
    Math.floor(completedLevels / 2),
    activeTracks.length - 1
  );
  const currentLevelId = activeTracks[currentTrackIndex];
  const level =
    TURN_TAKING_LEVELS.find((l) => l.id === currentLevelId) ||
    TURN_TAKING_LEVELS[0];

  /* =========================================================
     LOAD CLASS STUDENTS
  ========================================================= */

  useEffect(() => {
    let isMounted = true;

    async function loadStudents() {
      if (!actualClassId) {
        if (isMounted) {
          setIsLoadingStudents(false);
          setBearMessage('Class ID was not found.');
        }
        return;
      }

      try {
        setIsLoadingStudents(true);
        const data = await getClassStudents(actualClassId);

        if (!isMounted) return;

        const formattedStudents: TurnTakingPlayer[] = (data || []).map(
          (student: any) => ({
            id: String(student.id),
            name: student.name || 'Student',
            avatar: student.avatar || undefined,
          })
        );

        setClassStudents(formattedStudents);

        if (actualStudentId) {
          const foundAssigned = formattedStudents.find(
            (s) => String(s.id) === String(actualStudentId)
          );

          if (foundAssigned) {
            setPlayer1(foundAssigned);
          } else {
            const fallbackStudent: TurnTakingPlayer = {
              id: String(actualStudentId),
              name: (params.studentName as string) || 'Student 1',
            };
            setPlayer1(fallbackStudent);
          }
        }
      } catch (error) {
        console.error('Error loading class students:', error);
        if (isMounted) {
          setBearMessage('Could not load classmates.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingStudents(false);
        }
      }
    }

    loadStudents();

    return () => {
      isMounted = false;
    };
  }, [actualClassId, actualStudentId, params.studentName]);

  /* =========================================================
     NAVIGATION & ACTIONS
  ========================================================= */

  const handleBack = () => {
    router.back();
  };

  const handleSoundToggle = () => {
    setSoundEnabled((prev) => !prev);
  };

  const handleGuideToggle = () => {
    setShowGuide(true);
    setHintSignal((prev) => prev + 1);
    setBearMessage('Follow the dotted path and yellow guidance arrows!');
  };

  const handleStudentsSelected = (
    selectedPlayer1: TurnTakingPlayer,
    selectedPlayer2: TurnTakingPlayer,
    selectedTier: number = 1
  ) => {
    setPlayer1(selectedPlayer1);
    setPlayer2(selectedPlayer2);
    setTier(selectedTier);
    setCurrentLevel(1);
    setCompletedLevels(0);
    setResults([]);

    setFirstPlayer(null);
    setCurrentPlayer(null);
    setMistakesByPlayer({});
    setShowGuide(false);

    setBearMessage('Spin the wheel to see who takes the first turn!');
    setGameState('spinning');
  };

  const handleSpinComplete = (selectedFirstPlayer: TurnTakingPlayer) => {
    setFirstPlayer(selectedFirstPlayer);
    setCurrentPlayer(selectedFirstPlayer);
    setCurrentLevel(1);
    setCompletedLevels(0);
    setShowGuide(false);
    setIsTransitioning(false);
    setBearMessage('Drag the pencil along the dotted line from start to end!');
    setGameState('playing');
  };

  const getOtherPlayer = (player: TurnTakingPlayer) => {
    if (player1 && player.id === player1.id) {
      return player2;
    }
    return player1;
  };

  const handleTurnComplete = () => {
    if (!currentPlayer || !player1 || !player2 || !firstPlayer) return;

    const turnMistakes = mistakesByPlayer[currentPlayer.id] || 0;

    const newResult: TurnTakingResult = {
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      level: currentLevel,
      completed: true,
      timeSeconds: 0,
      mistakes: turnMistakes,
      obstacleCount: 0,
    };

    const updatedResults = [...results, newResult];
    setResults(updatedResults);

    const newCompletedLevels = completedLevels + 1;
    setCompletedLevels(newCompletedLevels);

    // Completed all turns
    if (newCompletedLevels >= totalTurns) {
      setShowGuide(false);
      setBearMessage('Amazing teamwork! Both students finished all tracks!');
      setGameState('result');
      return;
    }

    const nextPlayer = getOtherPlayer(currentPlayer);
    if (!nextPlayer) return;

    const nextTrackIndex = Math.min(
      Math.floor(newCompletedLevels / 2),
      activeTracks.length - 1
    );
    const nextLevel = nextTrackIndex + 1;

    setCurrentPlayer(nextPlayer);
    setCurrentLevel(nextLevel);
    setShowGuide(false);
    setIsTransitioning(true);

    setBearMessage(
      `Great job, ${currentPlayer.name}! Now it's ${nextPlayer.name}'s turn!`
    );

    setTimeout(() => {
      setIsTransitioning(false);
      setBearMessage('Drag the pencil along the dotted line from start to end!');
    }, 1100);
  };

  const handleMistake = () => {
    if (!currentPlayer) return;

    setMistakesByPlayer((current) => ({
      ...current,
      [currentPlayer.id]: (current[currentPlayer.id] || 0) + 1,
    }));

    setBearMessage('Stay close to the dotted line and keep going smoothly!');
  };

  const handlePlayAgain = () => {
    setCurrentLevel(1);
    setCompletedLevels(0);
    setResults([]);
    setMistakesByPlayer({});
    setShowGuide(false);
    setFirstPlayer(null);
    setCurrentPlayer(null);

    setBearMessage('Spin the wheel to see who goes first!');
    setGameState('spinning');
  };

  const handleFinish = () => {
    router.back();
  };

  /* =========================================================
     LOADING VIEW
  ========================================================= */

  if (isLoadingStudents) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <HeaderButton
            onPress={handleBack}
            icon={<Ionicons name="caret-back" size={24} color="#62A9E6" />}
          />
          <Text style={styles.topBarTitle}>Turn-Taking</Text>
          <View style={styles.topBarSpacer} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityBear width={isTablet ? 150 : 120} height={isTablet ? 150 : 120} />
          <Text style={styles.loadingText}>Loading class students...</Text>
        </View>
      </SafeAreaView>
    );
  }

  /* =========================================================
     SCREEN 1: PLAYER SELECTION
  ========================================================= */

  if (gameState === 'selecting' && player1) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <HeaderButton
            onPress={handleBack}
            icon={<Ionicons name="caret-back" size={24} color="#62A9E6" />}
          />
          <Text style={styles.topBarTitle}>Turn-Taking Setup</Text>
          <View style={styles.topBarSpacer} />
        </View>

        <StudentSelector
          assignedStudent={player1}
          students={classStudents}
          isLoading={isLoadingStudents}
          initialTier={tier}
          onStart={handleStudentsSelected}
        />
      </SafeAreaView>
    );
  }

  /* =========================================================
     SCREEN 2: SPIN WHEEL
  ========================================================= */

  if (gameState === 'spinning' && player1 && player2) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <HeaderButton
            onPress={() => setGameState('selecting')}
            icon={<Ionicons name="caret-back" size={24} color="#62A9E6" />}
          />
          <Text style={styles.topBarTitle}>Turn-Taking Wheel</Text>
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

  /* =========================================================
     SCREEN 4: RESULTS SCREEN
  ========================================================= */

  if (gameState === 'result' && player1 && player2) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <HeaderButton
            onPress={handleBack}
            icon={<Ionicons name="caret-back" size={24} color="#62A9E6" />}
          />
          <Text style={styles.topBarTitle}>Activity Results</Text>
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

  /* =========================================================
     SCREEN 3: COOPERATIVE GAMEPLAY (MATCHING TRACING & SETMANAGER)
  ========================================================= */

  if (gameState === 'playing' && player1 && player2 && currentPlayer) {
    const progressPercent = totalTurns > 0 ? (completedLevels / totalTurns) * 100 : 0;
    const isActivityDone = isTransitioning; // Using this as equivalent

    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header: X, Title, and Language Toggle */}
        <View className="flex-row items-center justify-between px-6 pt-4 pb-4">
          <View className="flex-row items-center flex-1 mr-3">
            <HoldToExitButton onExit={handleBack} />
            <Text className="text-2xl font-fredoka-one text-[#535B74] flex-shrink" numberOfLines={1}>
              Turn-Taking: Tracing
            </Text>
          </View>

          {/* Translate Toggle Button (EN <-> TL) */}
          <HeaderButton
            onPress={toggleLanguage}
            icon={
              <Text className={`font-fredoka-one ${isTablet ? 'text-base' : 'text-sm'} text-[#62A9E6]`}>
                {language === 'en' ? 'TL' : 'EN'}
              </Text>
            }
          />
        </View>

        {/* Progress Bar Row */}
        <View className="flex-row items-center px-6 pb-6">
          <View className="bg-white px-2.5 py-1 rounded-full border-[1.5px] border-[#BBE8FB] mr-3">
            <Text className="font-fredoka-one text-[13px] text-[#62A9E6]">
              {currentTrackIndex + 1}/{activeTracks.length}
            </Text>
          </View>

          <View className="flex-1 h-[18px] bg-[#C4E0F9] rounded-full overflow-hidden">
            <Animated.View className="h-full bg-[#69AEE3] rounded-full" style={{ width: `${progressPercent}%` }} />
          </View>

          <View className="flex-row items-center ml-3 gap-2.5">
            <HintButton
              onPress={handleGuideToggle}
              size={isTablet ? 44 : 36}
              iconSize={isTablet ? 22 : 18}
            />
            <InstructionSpeakerButton
              text={displayBearMessage}
              language={language}
              autoPlay={true}
              size={isTablet ? 44 : 36}
              iconSize={isTablet ? 22 : 18}
            />
          </View>
        </View>

        {/* Bear & Dialogue Row (Exact Autivity SetManager Specification) */}
        <View className={`flex-row items-center ${isTablet ? 'px-6 pb-4' : 'px-4 pb-2'}`}>
          <ActivityBear width={isTablet ? 180 : 135} height={isTablet ? 180 : 135} />

          <View className={`flex-1 ${isTablet ? 'ml-5' : 'ml-3'} justify-center relative`}>
            <View className={`rounded-2xl ${isTablet ? 'p-6 border-[1.5px]' : 'p-4 border-[1.5px]'} justify-center z-10 ${
                isTransitioning
                  ? 'bg-[#F0FDF4] border-[#86EFAC]'
                  : 'bg-[#FCF5F5] border-[#EAD5D5]'
              }`}
            >
              <Text className={`text-[#6D7179] font-quicksand-medium ${isTablet ? 'text-2xl leading-9' : 'text-lg leading-7'}`}>
                {displayBearMessage}
              </Text>
            </View>
          </View>
        </View>

        {/* Turn-Taking Player Banner */}
        <View style={styles.playerBanner}>
          <View style={styles.playerAvatarCircle}>
            <Text style={styles.playerAvatarInitial}>
              {currentPlayer.name.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.playerInfoColumn}>
            <Text style={styles.playerNameText}>
              {language === 'tl'
                ? `Turn ni ${currentPlayer.name}`
                : `${currentPlayer.name}'s Turn`}
            </Text>
            <Text style={styles.playerSubText}>
              {language === 'tl' ? `Aktibidad: ${level?.name}` : `Track: ${level?.name}`}
            </Text>
          </View>
        </View>

        {/* Tracing Canvas Card (Exact Tracing Container: Framed Canvas) */}
        <View className="flex-1 px-6 pb-6 mt-1">
          <View className="flex-1 bg-[#FCFCFC] border-[1.5px] border-[#EBE5E5] rounded-2xl overflow-hidden">
            {level && (
              <CurvedPath
                key={`${currentPlayer.id}-${currentLevel}-${level.id}`}
                level={level}
                player={currentPlayer}
                showGuide={showGuide}
                hintSignal={hintSignal}
                onComplete={handleTurnComplete}
                onMistake={handleMistake}
              />
            )}
          </View>
        </View>
        
        {/* CHECK Button (matches SetManager format) */}
        <View className="px-6 pb-4">
            <Pressable
                disabled={true}
                className="w-full flex items-center justify-center border-b-[4px] p-[10px] h-[60px] rounded-full bg-[#D1D5DB] border-[#9CA3AF]"
            >
                <Text className="text-white font-fredoka-regular text-2xl">
                    CHECK
                </Text>
            </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  /* Fallback */
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.loadingContainer}>
        <ActivityBear width={120} height={120} />
        <Text style={styles.loadingText}>Loading activity...</Text>
      </View>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES - Autivity Design System Specification
========================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBFBFB',
  },

  topBar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1.5,
    borderBottomColor: '#F1F1F1',
  },

  topBarTitle: {
    fontSize: 20,
    fontFamily: 'FredokaOne-Regular',
    color: '#484A4B',
  },

  topBarSpacer: {
    width: 44,
  },

  gameTopBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 4,
  },

  gameTopTitle: {
    fontSize: 22,
    fontFamily: 'FredokaOne-Regular',
    color: '#535B74',
    flex: 1,
    marginLeft: 12,
  },

  rightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  actionBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#BBE8FB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 2,
  },

  guideBtn: {
    borderColor: '#FFF3C4',
    shadowColor: '#FFF3C4',
  },

  guideBtnActive: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FFAE02',
  },

  soundBtn: {
    borderColor: '#BBE8FB',
  },

  /* Progress Bar */
  progressBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 10,
    gap: 12,
  },

  progressBarTrack: {
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

  progressBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#BBE8FB',
  },

  progressBadgeText: {
    fontFamily: 'FredokaOne-Regular',
    fontSize: 13,
    color: '#62A9E6',
  },

  /* Bear & Dialogue Row */
  bearDialogueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },

  speechBubbleContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },

  speechBubbleCard: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1.5,
  },

  speechBubbleNormal: {
    backgroundColor: '#FCF5F5',
    borderColor: '#EAD5D5',
  },

  speechBubbleSuccess: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },

  speechBubbleText: {
    fontFamily: 'Quicksand-Medium',
    color: '#6D7179',
  },

  /* Player Banner */
  playerBanner: {
    marginHorizontal: 24,
    marginBottom: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#BBE8FB',
  },

  playerAvatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#BBE8FB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  playerAvatarInitial: {
    fontFamily: 'FredokaOne-Regular',
    fontSize: 18,
    color: '#62A9E6',
  },

  playerInfoColumn: {
    flex: 1,
    marginLeft: 10,
  },

  playerNameText: {
    fontFamily: 'FredokaOne-Regular',
    fontSize: 16,
    color: '#484A4B',
  },

  playerSubText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 12,
    color: '#64748B',
  },

  trackPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#BBE8FB',
  },

  trackPillText: {
    fontFamily: 'FredokaOne-Regular',
    fontSize: 12,
    color: '#62A9E6',
    textTransform: 'uppercase',
  },

  /* Canvas Container (Exact Framed Canvas) */
  canvasContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },

  canvasFrame: {
    flex: 1,
    backgroundColor: '#FCFCFC',
    borderWidth: 1.5,
    borderColor: '#EBE5E5',
    borderRadius: 20,
    overflow: 'hidden',
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  loadingText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 15,
    color: '#64748B',
    marginTop: 14,
  },
});