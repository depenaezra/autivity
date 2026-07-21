import { TracingActivity } from '@/activities/tracing';
import React from 'react';
import DragDropActivity from '@/activities/drag-drop/components/dragdrop-activity';
import BubbleActivity from '@/activities/bubble-pop/components/bubble-activity';

type ActivityRendererProps = {
    activity: any;
    onComplete: (score: number, timeSpent: number, mistakes: number) => void;
    onFeedback?: (message: string) => void;
    onIncorrectAttempt?: () => void;
};

export default function ActivityRenderer({ activity, onComplete, onFeedback, onIncorrectAttempt }: ActivityRendererProps) {
    const activityType = (activity.type || activity.content_data?.type || '').toLowerCase();

    if (activityType.includes('bubble')) {
        return (
            <BubbleActivity
                contentData={activity.content_data}
                onComplete={onComplete}
                onFeedback={onFeedback}
                onIncorrectAttempt={onIncorrectAttempt}
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
                    onIncorrectAttempt={onIncorrectAttempt}
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
                />
            );

        default:
            return null; // Safety fallback
    }
}