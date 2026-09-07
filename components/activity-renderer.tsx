import { TracingActivity } from '@/activities/tracing';
import React from 'react';
import DragDropActivity from '@/activities/drag-drop/components/dragdrop-activity';
import BubbleActivity from '@/activities/bubble-pop/components/bubble-activity';
import PickChoiceActivity from '@/activities/pick-n-choose/components/pick-n-choose-activity';

type ActivityRendererProps = {
    activity: any;
    onComplete: (score: number, timeSpent: number, mistakes: number, hintsUsed?: number) => void;
    onFeedback?: (message: string) => void;
    onIncorrectAttempt?: () => void;
    hintSignal?: number;
};

export default function ActivityRenderer({ activity, onComplete, onFeedback, onIncorrectAttempt, hintSignal }: ActivityRendererProps) {
    const activityType = (activity.type || activity.content_data?.type || '').toLowerCase();

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
        case 'tracing':
            // Pass the specific data into your reusable engine
            return (
                <TracingActivity
                    activity={activity.data}
                    onComplete={onComplete}
                    onFeedback={onFeedback}
                    onIncorrectAttempt={onIncorrectAttempt}
                    hintSignal={hintSignal}
                />
            );

        case 'drag-and-drop':
        case 'dragdrop':
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

        default:
            return null; // Safety fallback
    }
}