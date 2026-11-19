import React, { useEffect, useRef, useState } from 'react';
import { Image, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useActivityHint } from '@/hooks/use-activity-hint';
import { playCorrectSound } from '@/src/utils/sound';
import { CHOOSE_BY_CLUE_GROUPS } from '../data/choose-by-clue';
import { OBJECT_IDENTIFICATION_POOL } from '../data/object-identification';
import { PickChoiceActivityProps } from '../types';
import { getPickChoiceAsset } from '../utils/assetDictionary';
import { shuffleArray } from '../utils/shuffler';

// Deal every group once before reshuffling, including across activity rounds.
let remainingGroups: typeof CHOOSE_BY_CLUE_GROUPS = [];
function takeGroups(count: number) {
    if (remainingGroups.length < count) {
        const remaining = remainingGroups;
        const used = CHOOSE_BY_CLUE_GROUPS.filter(group => !remaining.includes(group));
        remainingGroups = [...remaining, ...shuffleArray(used)];
    }
    return remainingGroups.splice(0, Math.min(count, CHOOSE_BY_CLUE_GROUPS.length));
}

export default function ChooseByClueActivity({ contentData, onComplete, onFeedback, onIncorrectAttempt, hintSignal }: PickChoiceActivityProps) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;
    const [groups] = useState(() => takeGroups(Math.max(1, contentData?.item_count || 3)).map(group => ({ ...group, items: shuffleArray(group.items) })));
    const [index, setIndex] = useState(0);
    const [selected, setSelected] = useState<string | null>(null);
    const mistakes = useRef(0);
    const lastRetryMessage = useRef(-1);
    const start = useRef(Date.now());
    const group = groups[index];
    const { hintLevel, isHintActive, hintsUsed, triggerHint, recordAttempt, resetForNextQuestion } = useActivityHint({ getClueText: () => group.hint, onFeedback });
    const lastHint = useRef(hintSignal);
    useEffect(() => {
        if (hintSignal !== undefined && hintSignal !== lastHint.current) {
            lastHint.current = hintSignal;
            triggerHint();
        }
    }, [hintSignal, triggerHint]);
    const say = (message: string, correct = false) => {
        return new Promise<void>(resolve => {
            if (onFeedback) onFeedback(message, resolve, correct);
            else resolve();
        });
    };
    useEffect(() => { onFeedback?.(group.clue); }, []);

    const choose = (item: string) => {
        if (selected) return;
        setSelected(item);
        const correct = item === group.answer;
        const hinted = recordAttempt(correct);
        if (correct) {
            playCorrectSound();
            const praise = ['Great spotting!', 'You found it!', 'That matches the clue!', 'Well done!'];
            void say(praise[Math.floor(Math.random() * praise.length)], true).finally(() => {
                if (index + 1 === groups.length) onComplete?.(15, Math.max(1, Math.floor((Date.now() - start.current) / 1000)), mistakes.current, hintsUsed);
                else { setIndex(index + 1); setSelected(null); resetForNextQuestion(); onFeedback?.(groups[index + 1].clue); }
            });
        } else {
            mistakes.current += 1;
            onIncorrectAttempt?.();
            if (!hinted) {
                const messages = ['Try again! Listen to the clue.', 'Take another look at the pictures.', 'Which picture matches the clue?', 'You can try another answer!'];
                let messageIndex = Math.floor(Math.random() * messages.length);
                if (messageIndex === lastRetryMessage.current) messageIndex = (messageIndex + 1) % messages.length;
                lastRetryMessage.current = messageIndex;
                // Retry dialogue is visual only: speech playback must never gate input.
                onFeedback?.(`${messages[messageIndex]} ${group.clue}`);
            }
            setTimeout(() => setSelected(null), 1800);
        }
    };

    return <View className="flex-1 bg-[#F5F7FA] p-4 sm:p-6 items-center justify-start w-full">
        <View className="w-full max-w-lg items-start px-1 pt-1 mb-2">
            <Text className="font-quicksand-bold text-[#484A4B] text-xl sm:text-2xl">Question {index + 1} of {groups.length}</Text>
        </View>
        <View className="flex-1 w-full items-center justify-center">
          <View className="w-full max-w-lg flex-row flex-wrap justify-between gap-y-3">
            {group.items.map(key => {
                const item = OBJECT_IDENTIFICATION_POOL.find(entry => entry.asset_key === key);
                const highlight = isHintActive && hintLevel === 2 && key === group.answer;
                const border = selected === key ? (key === group.answer ? '#CBFAC4' : '#FF8870') : highlight ? '#FFAE02' : '#F1F1F1';
                return <Pressable key={key} accessibilityRole="button" accessibilityLabel={item?.label || key} onPress={() => choose(key)} className={`w-[48%] bg-white rounded-xl border-2 items-center justify-center active:scale-95 transition-transform ${isTablet ? 'p-6' : 'p-4'}`} style={{ borderColor: border, shadowColor: border, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 0, elevation: 2 }}>
                    <Image source={getPickChoiceAsset(key)} style={{ width: isTablet ? 160 : 100, height: isTablet ? 160 : 100 }} resizeMode="contain" />
                    <Text className={`font-fredoka-one text-[#484A4B] text-center mt-2 ${isTablet ? 'text-lg' : 'text-base'}`}>{item?.label}</Text>
                </Pressable>;
            })}
          </View>
        </View>
    </View>;
}

