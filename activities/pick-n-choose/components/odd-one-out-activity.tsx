import React, { useEffect, useRef, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useActivityHint } from '@/hooks/use-activity-hint';
import { playCorrectSound } from '@/src/utils/sound';
import { ODD_ONE_OUT_GROUPS } from '../data/odd-one-out';
import { OBJECT_IDENTIFICATION_POOL } from '../data/object-identification';
import { PickChoiceActivityProps } from '../types';
import { getPickChoiceAsset } from '../utils/assetDictionary';
import { shuffleArray } from '../utils/shuffler';

// Deal every group once before reshuffling, including across activity rounds.
let remainingGroups: typeof ODD_ONE_OUT_GROUPS = [];
function takeGroups(count: number) {
    if (remainingGroups.length < count) {
        const remaining = remainingGroups;
        const used = ODD_ONE_OUT_GROUPS.filter(group => !remaining.includes(group));
        remainingGroups = [...remaining, ...shuffleArray(used)];
    }
    return remainingGroups.splice(0, Math.min(count, ODD_ONE_OUT_GROUPS.length));
}

export default function OddOneOutActivity({ contentData, onComplete, onFeedback, onIncorrectAttempt, hintSignal }: PickChoiceActivityProps) {
    const [groups] = useState(() => takeGroups(Math.max(1, contentData?.item_count || 3)).map(group => ({ ...group, items: shuffleArray(group.items) })));
    const [index, setIndex] = useState(0);
    const [selected, setSelected] = useState<string | null>(null);
    const mistakes = useRef(0);
    const lastRetryMessage = useRef(-1);
    const start = useRef(Date.now());
    const group = groups[index];
    const { hintLevel, isHintActive, hintsUsed, triggerHint, recordAttempt, resetForNextQuestion } = useActivityHint({ getClueText: () => group.clue, onFeedback });
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
    useEffect(() => { void say('Look at all four pictures. Tap the one that does not fit with the others.'); }, []);

    const choose = (item: string) => {
        if (selected) return;
        setSelected(item);
        const correct = item === group.answer;
        const hinted = recordAttempt(correct);
        if (correct) {
            playCorrectSound();
            const praise = ['Great spotting!', 'You found the odd one out!', 'That one does not fit. Nice work!', 'Well done choosing the different picture!'];
            void say(praise[Math.floor(Math.random() * praise.length)], true).finally(() => {
                if (index + 1 === groups.length) onComplete?.(15, Math.max(1, Math.floor((Date.now() - start.current) / 1000)), mistakes.current, hintsUsed);
                else { setIndex(index + 1); setSelected(null); resetForNextQuestion(); void say('Here comes the next group. Which picture does not belong?'); }
            });
        } else {
            mistakes.current += 1;
            onIncorrectAttempt?.();
            if (!hinted) {
                const messages = ['Take another look. Which picture is different?', 'One picture belongs somewhere else. Can you find it?', 'Look at what the other three have in common.', 'Try again. Which picture does not fit this group?'];
                let messageIndex = Math.floor(Math.random() * messages.length);
                if (messageIndex === lastRetryMessage.current) messageIndex = (messageIndex + 1) % messages.length;
                lastRetryMessage.current = messageIndex;
                // Retry dialogue is visual only: speech playback must never gate input.
                onFeedback?.(messages[messageIndex]);
            }
            setTimeout(() => setSelected(null), 1800);
        }
    };

    return <View className="flex-1 bg-[#F5F7FA] p-4 items-center justify-center">
        <Text className="font-fredoka-one text-[#484A4B] text-[22px] text-center mb-3">Which one doesn't belong?</Text>
        <Text className="font-quicksand-medium text-[#9CA3AF] text-base mb-6">Question {index + 1} of {groups.length}</Text>
        <View className="w-full max-w-lg flex-row flex-wrap justify-between">
            {group.items.map(key => {
                const item = OBJECT_IDENTIFICATION_POOL.find(entry => entry.asset_key === key);
                const highlight = isHintActive && hintLevel === 2 && key === group.answer;
                const border = selected === key ? (key === group.answer ? '#CBFAC4' : '#FF8870') : highlight ? '#FFAE02' : '#F1F1F1';
                return <Pressable key={key} accessibilityRole="button" accessibilityLabel={item?.label || key} onPress={() => choose(key)} className="w-[48%] bg-white rounded-[20px] border-4 items-center justify-center p-4 mb-4 active:scale-95" style={{ borderColor: border, shadowColor: border, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 0, elevation: 2 }}>
                    <Image source={getPickChoiceAsset(key)} style={{ width: 100, height: 100 }} resizeMode="contain" />
                    <Text className="font-quicksand-medium text-[#484A4B] text-base mt-2">{item?.label}</Text>
                </Pressable>;
            })}
        </View>
    </View>;
}
