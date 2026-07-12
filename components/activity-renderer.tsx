import { TracingActivity } from '@/activities/tracing';
import React from 'react';
// import { DragDropActivity } from '@/activities/dragdrop'; // For later!

type ActivityRendererProps = {
    activity: any;
    onComplete: () => void;
};

export default function ActivityRenderer({ activity, onComplete }: ActivityRendererProps) {
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
            // return <DragDropActivity data={activity.data} onComplete={onComplete} />;
            return null;

        default:
            return null; // Safety fallback
    }
}