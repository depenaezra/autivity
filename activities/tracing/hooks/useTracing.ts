// This file is responsible for the tracing engine.

import { Gesture } from "react-native-gesture-handler";
import {
    useSharedValue
} from "react-native-reanimated";

type Point = {
    x: number;
    y: number;
};

export function useTracing(
    start: Point,
    end: Point,
    checkpoints: Point[],
) {
    const x = useSharedValue(start.x);
    const y = useSharedValue(start.y);

    const isTouchingLine = useSharedValue(false);

    const progress = useSharedValue(0);

    const currentCheckpoint = useSharedValue(0);

    const hasStarted = useSharedValue(false);

    const hasFinished = useSharedValue(false);

    const pan = Gesture.Pan().onUpdate((event) => {
        if (hasFinished.value) {
            return;
        }

        x.value = event.x;
        y.value = event.y;

        // If the finger is outside the start circle, do not start tracing
        const startDistance = Math.hypot(
            event.x - start.x,
            event.y - start.y
        );

        // If the user drags the finger outside the start circle, prevent the trace from starting.
        if (!hasStarted.value) {
            if (startDistance <= 20) {
                hasStarted.value = true;
            } else {
                return;
            }
        }

        // "Which checkpoint should the child reach next?"
        const nextCheckpoint = checkpoints[currentCheckpoint.value];

        if (!nextCheckpoint) {
            return;
        }

        const distance = Math.hypot( // Measure the distance (works for any direction)
            event.x - nextCheckpoint.x,
            event.y - nextCheckpoint.y
        );

        // Controls the tolerance for the checkpoint
        // Can consider 30 for children
        const checkpointRadius = 20;

        isTouchingLine.value = distance <= checkpointRadius;

        if (distance <= checkpointRadius) {
            currentCheckpoint.value += 1;

            progress.value =
                // Math.min = prevents progress from exceeding 100%
                Math.min(currentCheckpoint.value, checkpoints.length - 1) /
                (checkpoints.length - 1);

            if (currentCheckpoint.value >= checkpoints.length) {
                hasFinished.value = true;

                x.value = end.x;
                y.value = end.y;

                isTouchingLine.value = false;
            }
        }
    })
        .onEnd(() => {
            // lift finger = do nothing
            if (hasFinished.value) {
                return;
            }

            hasStarted.value = false;
            currentCheckpoint.value = 0;
            progress.value = 0;
            isTouchingLine.value = false;

            x.value = start.x;
            y.value = start.y;
        });

    return {
        gesture: pan,

        x,
        y,
        isTouchingLine,
        progress,
        currentCheckpoint,
        hasStarted,
        hasFinished,
    };
}