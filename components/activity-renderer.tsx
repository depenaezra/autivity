import { TracingActivity } from '@/activities/tracing';
import React from 'react';
import DragDropActivity from '@/activities/drag-drop/components/dragdrop-activity';

type ActivityRendererProps = {
    activity: any;
    onComplete: () => void;
    onFeedback?: (message: string) => void;
};

export default function ActivityRenderer({ activity, onComplete, onFeedback }: ActivityRendererProps) {
    // Read the 'type' string from the database/data
    switch (activity.type) {
        case 'tracing':
            // Pass the specific data into your reusable engine
            return (
                <TracingActivity
                    activity={activity.data}
                    onComplete={onComplete}
                />
            );

        case 'drag-and-drop':
            return (
                <DragDropActivity
                    contentData={activity.content_data}
                    onComplete={onComplete}
                    onFeedback={onFeedback}
                />
            );

        default:
            return null; // Safety fallback
    }
}