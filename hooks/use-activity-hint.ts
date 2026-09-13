import { useCallback, useEffect, useRef, useState } from 'react';
import { speakInstruction } from '@/src/utils/speech';

export type HintState = {
    isHintActive: boolean;
    hintLevel: 1 | 2; // Level 1 = Audio & text clue only (1st tap); Level 2 = Direct visual highlight + audio (2nd+ tap)
    clueText: string | null;
    hintsUsed: number;
};

export type UseActivityHintOptions = {
    inactivityTimeoutMs?: number; // Kept for backwards-compatibility; no longer triggers auto-hints
    mistakeThreshold?: number;     // Kept for backwards-compatibility; no longer triggers auto-hints
    getClueText?: () => string;    // Function returning clue for current step/question
    onFeedback?: (message: string) => void;
    enabled?: boolean;
};

export function useActivityHint({
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

    // Keep refs of callbacks to prevent unnecessary re-creations
    const getClueTextRef = useRef(getClueText);
    const onFeedbackRef = useRef(onFeedback);

    useEffect(() => {
        getClueTextRef.current = getClueText;
        onFeedbackRef.current = onFeedback;
    }, [getClueText, onFeedback]);

    /**
     * Manual Trigger for Hint Button:
     * - 1st click on current question: Level 1 (Audio clue spoken aloud + top banner clue, no visual highlighting)
     * - 2nd or subsequent clicks: Level 2 (Audio clue re-spoken + visual answer/target highlight activated)
     */
    const triggerHint = useCallback((forcedLevel?: 1 | 2) => {
        if (!enabled) return;

        let currentClue = getClueTextRef.current ? getClueTextRef.current() : 'Here is a hint to help you!';

        setHintState((prev) => {
            // If hint was not active yet, 1st tap is Level 1. If already active, escalate to Level 2.
            const nextLevel = forcedLevel || (prev.isHintActive ? 2 : 1);
            currentClue = getClueTextRef.current ? getClueTextRef.current() : 'Here is a hint to help you!';

            return {
                isHintActive: true,
                hintLevel: nextLevel,
                clueText: currentClue,
                hintsUsed: prev.hintsUsed + 1,
            };
        });

        // Speak TTS voice clue aloud on every manual tap
        speakInstruction(currentClue);

        if (onFeedbackRef.current) {
            onFeedbackRef.current(`💡 ${currentClue}`);
        }
    }, [enabled]);

    // Record user attempt (purely records mistakes; NO automated hints are triggered on mistakes)
    const recordAttempt = useCallback((isCorrect: boolean): boolean => {
        if (isCorrect) {
            mistakeCountRef.current = 0;
            setHintState((prev) => ({
                ...prev,
                isHintActive: false,
                hintLevel: 1,
                clueText: null,
            }));
            return false;
        } else {
            mistakeCountRef.current += 1;
            // No automated hint trigger on mistake — user must manually tap hint if needed
            return false;
        }
    }, []);

    // Reset hint state for next question/step (clears active hints and resets tier to Level 1)
    const resetForNextQuestion = useCallback(() => {
        mistakeCountRef.current = 0;
        setHintState((prev) => ({
            ...prev,
            isHintActive: false,
            hintLevel: 1,
            clueText: null,
        }));
    }, []);

    // Kept as a no-op for any legacy caller references
    const resetInactivityTimer = useCallback(() => {}, []);

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

