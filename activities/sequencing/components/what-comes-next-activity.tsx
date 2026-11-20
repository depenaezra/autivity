import React, { useEffect, useRef, useState } from 'react';
import { Image, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { NEXT_SEQUENCES } from '../data/what-comes-next';
import { shuffleArray } from '@/activities/pick-n-choose/utils/shuffler';
import { useActivityHint } from '@/hooks/use-activity-hint';

export default function WhatComesNextActivity({ contentData, onComplete, onFeedback, onIncorrectAttempt, hintSignal }: any) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const level = Number(contentData?.level) === 1 ? 1 : Number(contentData?.level) === 2 ? 2 : 3;
  const answerIndex = level === 1 ? 2 : 3;
  const [rounds] = useState(() => shuffleArray(NEXT_SEQUENCES).map(sequence => ({ ...sequence, choices: shuffleArray(level === 1 ? [2, 3] : level === 2 ? [2, 3] : [1, 2, 3]) })));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const mistakes = useRef(0);
  const start = useRef(Date.now());
  const usedMessages = useRef<string[]>([]);
  const pickMessage = (messages: string[]) => {
    if (usedMessages.current.length >= messages.length) usedMessages.current = [];
    const options = messages.filter(message => !usedMessages.current.includes(message));
    const message = options[Math.floor(Math.random() * options.length)];
    usedMessages.current.push(message);
    return message;
  };
  const prompt = () => pickMessage(['Study the pictures in order. Which one should come next?', 'Think about what happens after these steps. Choose the next picture.', 'Use the sequence to figure out what comes next.']);
  const round = rounds[index];
  const { isHintActive, hintLevel, hintsUsed, triggerHint, recordAttempt, resetForNextQuestion } = useActivityHint({ getClueText: () => `Look for the picture that follows these steps in ${round.title}.`, onFeedback });
  const lastHint = useRef(hintSignal);
  useEffect(() => { if (hintSignal !== undefined && hintSignal !== lastHint.current) { lastHint.current = hintSignal; triggerHint(); } }, [hintSignal, triggerHint]);
  useEffect(() => { onFeedback?.(prompt()); }, []);
  const choose = (choice: number) => {
    if (selected !== null) return;
    setSelected(choice);
    recordAttempt(choice === answerIndex);
    if (choice !== answerIndex) {
      mistakes.current++;
      onIncorrectAttempt?.();
      onFeedback?.(pickMessage(['Try again! What happens after these pictures?', 'Take another look at the order.', 'Almost! Choose the picture that comes next.']));
      setTimeout(() => setSelected(null), 900);
      return;
    }
    const praise = pickMessage(['Great job! You found what comes next!', 'Well done! That is the next picture!', 'You got it! That picture comes next!']);
    const advance = () => {
      if (index + 1 === rounds.length) onComplete?.(15, Math.max(1, Math.floor((Date.now() - start.current) / 1000)), mistakes.current, hintsUsed);
      else { setIndex(index + 1); setSelected(null); resetForNextQuestion(); onFeedback?.(prompt()); }
    };
    if (onFeedback) onFeedback(praise, advance, true);
    else setTimeout(advance, 2500);
  };
  return <View className="flex-1 bg-[#F5F7FA] p-4 sm:p-6 items-center w-full">
    <View className="w-full max-w-lg items-start px-1 pt-1"><Text className="font-quicksand-bold text-[#484A4B] text-xl sm:text-2xl">Question {index + 1} of {rounds.length}</Text></View>
    <View className="flex-1 w-full pt-8">
      <Text className={`font-fredoka-one text-[#484A4B] text-center mb-3 ${isTablet ? 'text-3xl' : 'text-2xl'}`}>{round.title}</Text>
      <View className="w-full max-w-lg self-center flex-row justify-between items-center">
        {round.steps.slice(0, answerIndex).map((image, i) => <View key={i} className="bg-white rounded-xl border-2 border-[#F1F1F1] p-1 items-center justify-center" style={{ width: '23%', shadowColor: '#F1F1F1', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 0, elevation: 2 }}><Image source={image} resizeMode="contain" style={{ width: '100%', height: isTablet ? 130 : 75 }} /></View>)}
        <View className="bg-white rounded-xl border-2 border-[#BBE8FB] items-center justify-center" style={{ width: '23%', height: isTablet ? 142 : 87 }}><Text className="font-fredoka-one text-[#62A9E6] text-3xl">?</Text></View>
      </View>
      <View className="flex-1 justify-center">
        <Text className="font-quicksand-medium text-[#484A4B] text-center text-base mb-3">Choose what comes next</Text>
        <View className="w-full flex-row justify-center gap-3">{round.choices.map(choice => <Pressable key={choice} accessibilityRole="button" accessibilityLabel={`Picture ${choice + 1}`} onPress={() => choose(choice)} className="bg-white border-2 rounded-xl items-center justify-center active:scale-95 transition-transform" style={{ width: level === 3 ? '31%' : '40%', aspectRatio: 1, borderColor: selected === choice ? choice === answerIndex ? '#22C55E' : '#FF8870' : isHintActive && hintLevel === 2 && choice === answerIndex ? '#FFAE02' : '#F1F1F1', shadowColor: selected === choice && choice === answerIndex ? '#22C55E' : '#F1F1F1', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 0, elevation: 2 }}><Image source={round.steps[choice]} resizeMode="contain" style={{ width: '100%', height: '100%' }} /></Pressable>)}</View>
      </View>
    </View>
  </View>;
}

