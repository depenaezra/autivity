import { PickChoiceItem, PickChoiceQuestion } from '../types';

/**
 * Modern Fisher-Yates array shuffling algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * Dynamically generates a series of Pick 'n Choose questions from an item pool.
 * Automatically creates plausible wrong answer choices (distractors) at runtime.
 */
export function generatePickChoiceQuestions(
    pool: PickChoiceItem[],
    questionCount: number = 3,
    optionsPerQuestion: number = 3
): PickChoiceQuestion[] {
    if (!pool || pool.length === 0) return [];

    const shuffledPool = shuffleArray(pool);
    const selectedTargets = shuffledPool.slice(0, Math.min(questionCount, shuffledPool.length));

    return selectedTargets.map((target, index) => {
        // Find candidate distractors (all items in pool except the target item)
        const candidates = pool.filter((item) => item.id !== target.id);
        
        // Prioritize distractors from the same category if available
        const sameCategoryCandidates = candidates.filter(
            (item) => target.category && item.category === target.category
        );

        const distractorPool =
            sameCategoryCandidates.length >= optionsPerQuestion - 1
                ? sameCategoryCandidates
                : candidates;

        const selectedDistractors = shuffleArray(distractorPool).slice(
            0,
            Math.min(optionsPerQuestion - 1, distractorPool.length)
        );

        const rawOptions = [
            {
                id: `${target.id}-correct`,
                label: target.label,
                isCorrect: true,
                asset_key: target.asset_key,
            },
            ...selectedDistractors.map((d) => ({
                id: `${d.id}-distractor`,
                label: d.label,
                isCorrect: false,
                asset_key: d.asset_key,
            })),
        ];

        return {
            id: `q-${index}-${target.id}`,
            targetItem: target,
            instruction: `What item is this? Choose the correct word!`,
            options: shuffleArray(rawOptions),
        };
    });
}
