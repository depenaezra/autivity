// Paths
import type { TracingActivityData } from "../types";

export const traceCross: TracingActivityData = {
    id: "shape-cross",
    paths: [
        "M 100 100 L 300 300", // Stroke 1
        "M 300 100 L 100 300", // Stroke 2
    ],
};

// Add more anytime!
export const traceSquare: TracingActivityData = {
    id: "shape-square",
    paths: [
        "M 100 100 L 300 100",
        "M 300 100 L 300 300",
        "M 300 300 L 100 300",
        "M 100 300 L 100 100",
    ]
};