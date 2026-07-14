import type { TracingActivityData } from "../types";

export const traceHorizontal: TracingActivityData = {
    id: "line-horizontal",
    paths: [
        "M 50 200 L 350 200"
    ],
};

export const traceVertical: TracingActivityData = {
    id: "line-vertical",
    paths: [
        "M 200 50 L 200 350"
    ],
};

export const traceDiagonalDown: TracingActivityData = {
    id: "line-diagonal-down",
    paths: [
        "M 50 50 L 350 350"
    ],
};

export const traceDiagonalUp: TracingActivityData = {
    id: "line-diagonal-up",
    paths: [
        "M 50 350 L 350 50"
    ],
};

export const traceZigzag: TracingActivityData = {
    id: "line-zigzag",
    paths: [
        "M 50 200 L 125 100 L 200 300 L 275 100 L 350 200"
    ],
};

export const traceWave: TracingActivityData = {
    id: "line-wave",
    paths: [
        "M 50 200 Q 125 100 200 200 T 350 200"
    ],
};

export const traceArc: TracingActivityData = {
    id: "line-arc",
    paths: [
        "M 100 250 A 100 100 0 0 1 300 250"
    ],
};
