import { TracingActivity, getTracingActivityByPath } from '@/activities/tracing';
import { CopyLetterActivity } from '@/activities/copy-letter';
import React from 'react';
import DragDropActivity from '@/activities/drag-drop/components/dragdrop-activity';
import BubbleActivity from '@/activities/bubble-pop/components/bubble-activity';
import PickChoiceActivity from '@/activities/pick-n-choose/components/pick-n-choose-activity';
import OddOneOutActivity from '@/activities/pick-n-choose/components/odd-one-out-activity';
import ChooseByClueActivity from '@/activities/pick-n-choose/components/choose-by-clue-activity';
import SequencingActivity from '@/activities/sequencing/components/sequencing-activity';
import CountingActivity from '@/activities/counting/components/counting-activity';

type ActivityRendererProps = {
    activity: any;
    onComplete: (score: number, timeSpent: number, mistakes: number, hintsUsed?: number) => void;
    onFeedback?: (message: string, onSpoken?: () => void, correct?: boolean) => void;
    onIncorrectAttempt?: () => void;
    hintSignal?: number;
};

export default function ActivityRenderer({ activity, onComplete, onFeedback, onIncorrectAttempt, hintSignal }: ActivityRendererProps) {
    const activityType = (activity.type || activity.content_data?.type || activity.category || '').toLowerCase();

    const activityIdentity = [activityType, activity.path, activity.sub_category, activity.title, activity.name, activity.content_data?.activity_id].filter(Boolean).join(' ').toLowerCase();
    if (activityIdentity.includes('choose-by-clue') || activityIdentity.includes('choose by clue')) {
        return <ChooseByClueActivity contentData={activity.content_data} onComplete={onComplete} onFeedback={onFeedback} onIncorrectAttempt={onIncorrectAttempt} hintSignal={hintSignal} />;
    }
    if (activityIdentity.includes('odd-one-out') || activityIdentity.includes('odd one out') || activityIdentity.includes('doesn\u0027t belong') || activityIdentity.includes('does not belong')) {
        return <OddOneOutActivity contentData={activity.content_data} onComplete={onComplete} onFeedback={onFeedback} onIncorrectAttempt={onIncorrectAttempt} hintSignal={hintSignal} />;
    }

    if (activityType.includes('count') || activityType.includes('basket')) {
        return (
            <CountingActivity
                contentData={activity.content_data}
                onComplete={onComplete}
                onFeedback={onFeedback}
                onIncorrectAttempt={onIncorrectAttempt}
                hintSignal={hintSignal}
            />
        );
    }

    if (activityType.includes('sequenc')) {
        return (
            <SequencingActivity
                contentData={activity.content_data}
                onComplete={onComplete}
                onFeedback={onFeedback}
                onIncorrectAttempt={onIncorrectAttempt}
                hintSignal={hintSignal}
            />
        );
    }

    if (activityType.includes('bubble')) {
        return (
            <BubbleActivity
                contentData={activity.content_data}
                onComplete={onComplete}
                onFeedback={onFeedback}
                onIncorrectAttempt={onIncorrectAttempt}
                hintSignal={hintSignal}
            />
        );
    }

    if (
        activityType.includes('pick') ||
        activityType.includes('choice') ||
        activityType.includes('identification')
    ) {
        return (
            <PickChoiceActivity
                contentData={activity.content_data}
                onComplete={onComplete}
                onFeedback={onFeedback}
                onIncorrectAttempt={onIncorrectAttempt}
                hintSignal={hintSignal}
            />
        );
    }

    switch (activityType) {
        case 'sequencing':
        case 'picture-sequencing':
            return (
                <SequencingActivity
                    contentData={activity.content_data}
                    onComplete={onComplete}
                    onFeedback={onFeedback}
                    onIncorrectAttempt={onIncorrectAttempt}
                    hintSignal={hintSignal}
                />
            );

        case 'copy':
        case 'copying':
        case 'copy-letter':
        case 'copy-letters':
            return (
                <CopyLetterActivity
                    activity={activity}
                    onComplete={onComplete}
                    onFeedback={onFeedback}
                    onIncorrectAttempt={onIncorrectAttempt}
                    hintSignal={hintSignal}
                />
            );

        case 'tracing':
            if (
                activity?.sub_category === 'Copy Letters' ||
                activity?.sub_category?.toLowerCase()?.includes('copy') ||
                (typeof activity?.path === 'string' && activity.path.includes('copy'))
            ) {
                return (
                    <CopyLetterActivity
                        activity={activity}
                        onComplete={onComplete}
                        onFeedback={onFeedback}
                        onIncorrectAttempt={onIncorrectAttempt}
                        hintSignal={hintSignal}
                    />
                );
            }
            // Pass the specific data into your reusable engine
            return (
                <TracingActivity
                    activity={(() => {
                        const pathId = activity?.path || activity?.data?.activity_id || activity?.content_data?.activity_id;
                        const local = pathId ? getTracingActivityByPath(pathId) : undefined;
                        return local || activity.data;
                    })()}
                    onComplete={onComplete}
                    onFeedback={onFeedback}
                    onIncorrectAttempt={onIncorrectAttempt}
                    hintSignal={hintSignal}
                />
            );

        case 'drag-and-drop':
        case 'drag-drop':
        case 'dragdrop':
        case 'matching':
            return (
                <DragDropActivity
                    contentData={activity.content_data}
                    onComplete={onComplete}
                    onFeedback={onFeedback}
                    onIncorrectAttempt={onIncorrectAttempt}
                    hintSignal={hintSignal}
                />
            );

        case 'pick-n-choose':
        case 'pick_and_choose':
        case 'choice-selection':
        case 'identification':
            return (
                <PickChoiceActivity
                    contentData={activity.content_data}
                    onComplete={onComplete}
                    onFeedback={onFeedback}
                    onIncorrectAttempt={onIncorrectAttempt}
                    hintSignal={hintSignal}
                />
            );

        case 'counting':
        case 'basket-counting':
            return (
                <CountingActivity
                    contentData={activity.content_data}
                    onComplete={onComplete}
                    onFeedback={onFeedback}
                    onIncorrectAttempt={onIncorrectAttempt}
                    hintSignal={hintSignal}
                />
            );

        default:
            return null; // Safety fallback
    }
}