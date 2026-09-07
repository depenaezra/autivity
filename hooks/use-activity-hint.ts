import { useCallback, useEffect, useRef, useState } from 'react';
import { speakInstruction } from '@/src/utils/speech';

export type HintState = {
    isHintActive: boolean;
    hintLevel: 1 | 2; // Level 1 = Voice & text clue first; Level 2 = Direct visual highlight
    clueText: string | null;
    hintsUsed: number;
};

export type UseActivityHintOptions = {
    inactivityTimeoutMs?: number; // Default: 15 seconds (15000ms)
    mistakeThreshold?: number;     // Default: 3 consecutive wrong attempts
    getClueText?: () => string;    // Function returning clue for current step/question
    onFeedback?: (message: string) => void;
    enabled?: boolean;
};

export function useActivityHint({
    inactivityTimeoutMs = 15000,
    mistakeThreshold = 3,
    getClueText,
    onFeedback,
    enabled = true,
}: UseActivityHintOptions = {}) {
    const [hintState, setHintState] = useState<HintState>({
        isHintActive: false,
        hintLevel: 1,
        clueText: null,
        hintsUsed: 0,
    });

    const mistakeCountRef = useRef(0);
    const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Keep refs of callbacks to prevent timer reset on every render / prop change
    const getClueTextRef = useRef(getClueText);
    const onFeedbackRef = useRef(onFeedback);

    useEffect(() => {
        getClueTextRef.current = getClueText;
        onFeedbackRef.current = onFeedback;
    }, [getClueText, onFeedback]);

    // Trigger hint (TTS audio clue + feedback banner + level calculation)
    const triggerHint = useCallback((forcedLevel?: 1 | 2) => {
        let currentClue = getClueTextRef.current ? getClueTextRef.current() : 'Here is a hint to help you!';

        setHintState((prev) => {
            const nextLevel = forcedLevel || (prev.isHintActive && prev.hintLevel === 1 ? 2 : 1);
            currentClue = getClueTextRef.current ? getClueTextRef.current() : 'Here is a hint to help you!';

            return {
                isHintActive: true,
                hintLevel: nextLevel,
                clueText: currentClue,
                hintsUsed: prev.hintsUsed + 1,
            };
        });

        // Always speak TTS voice clue aloud for all hint triggers
        speakInstruction(currentClue);

        if (onFeedbackRef.current) {
            onFeedbackRef.current(`💡 ${currentClue}`);
        }
    }, []);

    // Reset 15s inactivity timer
    const resetInactivityTimer = useCallback(() => {
        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
            inactivityTimerRef.current = null;
        }

        if (!enabled) return;

        inactivityTimerRef.current = setTimeout(() => {
            triggerHint();
        }, inactivityTimeoutMs);
    }, [enabled, inactivityTimeoutMs, triggerHint]);

    // Record user attempt (wrong or right). Returns true if hint was triggered.
    const recordAttempt = useCallback((isCorrect: boolean): boolean => {
        if (isCorrect) {
            mistakeCountRef.current = 0;
            setHintState((prev) => ({
                ...prev,
                isHintActive: false,
                clueText: null,
            }));
            resetInactivityTimer();
            return false;
        } else {
            mistakeCountRef.current += 1;
            resetInactivityTimer();

            // Trigger Level 2 hint (visual highlight + spoken clue) when mistake threshold reached
            if (mistakeCountRef.current >= mistakeThreshold) {
                triggerHint(2);
                return true;
            }
            return false;
        }
    }, [mistakeThreshold, resetInactivityTimer, triggerHint]);

    // Reset hint state for next question/step
    const resetForNextQuestion = useCallback(() => {
        mistakeCountRef.current = 0;
        setHintState((prev) => ({
            ...prev,
            isHintActive: false,
            hintLevel: 1,
            clueText: null,
        }));
        resetInactivityTimer();
    }, [resetInactivityTimer]);

    // Initial mount start of inactivity timer
    useEffect(() => {
        resetInactivityTimer();
        return () => {
            if (inactivityTimerRef.current) {
                clearTimeout(inactivityTimerRef.current);
            }
        };
    }, []);

    return {
        isHintActive: hintState.isHintActive,
        hintLevel: hintState.hintLevel,
        clueText: hintState.clueText,
        hintsUsed: hintState.hintsUsed,
        triggerHint,
        recordAttempt,
        resetForNextQuestion,
        resetInactivityTimer,
    };
}
