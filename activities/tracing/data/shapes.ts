import type { TracingActivityData } from "../types";

export const traceCross: TracingActivityData = {
    id: "shape-cross",
    paths: [
        "M 100 100 L 300 300", // Stroke 1
        "M 300 100 L 100 300", // Stroke 2
    ],
};

export const traceSquare: TracingActivityData = {
    id: "shape-square",
    paths: [
        "M 100 100 L 300 100",
        "M 300 100 L 300 300",
        "M 300 300 L 100 300",
        "M 100 300 L 100 100",
    ]
};

export const traceTriangle: TracingActivityData = {
    id: "shape-triangle",
    paths: [
        "M 200 50 L 350 320",
        "M 350 320 L 50 320",
        "M 50 320 L 200 50",
    ]
};

export const traceCircle: TracingActivityData = {
    id: "shape-circle",
    paths: [
        "M 200 50 C 310 50, 310 350, 200 350 C 90 350, 90 50, 200 50"
    ]
};

export const traceStar: TracingActivityData = {
    id: "shape-star",
    paths: [
        "M 200 50 L 244 153 L 355 159 L 270 230 L 299 341 L 200 280 L 101 341 L 130 230 L 45 159 L 156 153 L 200 50"
    ]
};

export const traceRectangle: TracingActivityData = {
    id: "shape-rectangle",
    paths: [
        "M 50 120 L 350 120",
        "M 350 120 L 350 280",
        "M 350 280 L 50 280",
        "M 50 280 L 50 120",
    ]
};

export const traceHeart: TracingActivityData = {
    id: "shape-heart",
    paths: [
        "M 200 350 C 200 350, 60 250, 60 150 C 60 70, 200 70, 200 150",
        "M 200 150 C 200 70, 340 70, 340 150 C 340 250, 200 350, 200 350"
    ]
};