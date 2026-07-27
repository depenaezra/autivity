// This file is responsible for the tracing engine.

import { Gesture } from "react-native-gesture-handler";
import {
    runOnJS,
    useSharedValue
} from "react-native-reanimated";

type Point = {
    x: number;
    y: number;
};

export const BOUNDARY_RADIUS = 35; // Radius in pixels around the path

function getDistanceToSegment(
    px: number,
    py: number,
    ax: number,
    ay: number,
    bx: number,
    by: number
): number {
    'worklet';
    const dx = bx - ax;
    const dy = by - ay;
    if (dx === 0 && dy === 0) {
        const dx2 = px - ax;
        const dy2 = py - ay;
        return Math.sqrt(dx2 * dx2 + dy2 * dy2);
    }
    const t = Math.max(
        0,
        Math.min(
            1,
            ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)
        )
    );
    const projX = ax + t * dx;
    const projY = ay + t * dy;
    const dxProj = px - projX;
    const dyProj = py - projY;
    return Math.sqrt(dxProj * dxProj + dyProj * dyProj);
}

export function useTracing(
    start: Point,
    end: Point,
    checkpoints: Point[],
    onBoundaryMistake?: () => void,
    onInterruption?: () => void,
) {
    const triggerBoundaryMistake = () => {
        onBoundaryMistake?.();
    };

    const triggerInterruption = () => {
        onInterruption?.();
    };
    const x = useSharedValue(start.x);
    const y = useSharedValue(start.y);

    const isTouchingLine = useSharedValue(false);

    const progress = useSharedValue(0);

    const currentCheckpoint = useSharedValue(0);

    const hasStarted = useSharedValue(false);

    const hasFinished = useSharedValue(false);

    const isOutsideBoundary = useSharedValue(false);

    const pan = Gesture.Pan().onUpdate((event) => {
        if (hasFinished.value) {
            return;
        }

        x.value = event.x;
        y.value = event.y;

        // If the finger is outside the start circle, do not start tracing
        const dxStart = event.x - start.x;
        const dyStart = event.y - start.y;
        const startDistance = Math.sqrt(dxStart * dxStart + dyStart * dyStart);

        // If the user drags the finger outside the start circle, prevent the trace from starting.
        if (!hasStarted.value) {
            if (startDistance <= 20) {
                hasStarted.value = true;
            } else {
                return;
            }
        }

        // Calculate boundary mistake detection
        let minDistance = Infinity;
        if (checkpoints.length < 2) {
            if (checkpoints.length === 1) {
                const dxCp = event.x - checkpoints[0].x;
                const dyCp = event.y - checkpoints[0].y;
                minDistance = Math.sqrt(dxCp * dxCp + dyCp * dyCp);
            } else {
                const dxS = event.x - start.x;
                const dyS = event.y - start.y;
                minDistance = Math.sqrt(dxS * dxS + dyS * dyS);
            }
        } else {
            for (let i = 0; i < checkpoints.length - 1; i++) {
                const dist = getDistanceToSegment(
                    event.x,
                    event.y,
                    checkpoints[i].x,
                    checkpoints[i].y,
                    checkpoints[i + 1].x,
                    checkpoints[i + 1].y
                );
                if (dist < minDistance) {
                    minDistance = dist;
                }
            }
        }

        if (minDistance > BOUNDARY_RADIUS) {
            if (currentCheckpoint.value > 1) {
                if (!isOutsideBoundary.value) {
                    isOutsideBoundary.value = true;
                    runOnJS(triggerBoundaryMistake)();
                }
            }
        } else {
            isOutsideBoundary.value = false;
        }

        // "Which checkpoint should the child reach next?"
        const nextCheckpoint = checkpoints[currentCheckpoint.value];

        if (!nextCheckpoint) {
            return;
        }

        const dxNext = event.x - nextCheckpoint.x;
        const dyNext = event.y - nextCheckpoint.y;
        const distance = Math.sqrt(dxNext * dxNext + dyNext * dyNext);

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
                isOutsideBoundary.value = false;
            }
        }
    })
        .onEnd(() => {
            // lift finger = do nothing
            if (hasFinished.value) {
                return;
            }

            if (hasStarted.value && currentCheckpoint.value > 1 && !isOutsideBoundary.value) {
                runOnJS(triggerInterruption)();
            }

            hasStarted.value = false;
            currentCheckpoint.value = 0;
            progress.value = 0;
            isTouchingLine.value = false;
            isOutsideBoundary.value = false;

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
        isOutsideBoundary,
    };
}