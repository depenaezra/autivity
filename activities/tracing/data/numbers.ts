import type { TracingActivityData } from "../types";

export const trace0: TracingActivityData = {
    id: "number-0",
    paths: [
        "M 200 50 C 300 50, 300 350, 200 350 C 100 350, 100 50, 200 50" // Oval
    ],
};

export const trace1: TracingActivityData = {
    id: "number-1",
    paths: [
        "M 160 100 L 200 50 L 200 350" // Slant top then down
    ],
};

export const trace2: TracingActivityData = {
    id: "number-2",
    paths: [
        "M 130 110 C 130 50, 270 50, 270 150 C 270 230, 200 280, 130 350 L 270 350" // Curved top, diagonal, base
    ],
};

export const trace3: TracingActivityData = {
    id: "number-3",
    paths: [
        "M 130 90 C 130 50, 270 50, 200 190 C 270 190, 270 350, 130 310" // Top & bottom loop
    ],
};

export const trace4: TracingActivityData = {
    id: "number-4",
    paths: [
        "M 250 50 L 130 250 L 290 250", // Triangle-like L stroke
        "M 250 50 L 250 350",           // Vertical line
    ],
};

export const trace5: TracingActivityData = {
    id: "number-5",
    paths: [
        "M 150 70 L 150 180 C 230 180, 270 220, 270 290 C 270 350, 150 350, 130 310", // Down and loop
        "M 150 70 L 250 70",                                                           // Top bar
    ],
};

export const trace6: TracingActivityData = {
    id: "number-6",
    paths: [
        "M 250 70 C 130 90, 120 220, 120 270 C 120 340, 250 340, 250 270 C 250 200, 120 200, 120 270" // Down and circle loop
    ],
};

export const trace7: TracingActivityData = {
    id: "number-7",
    paths: [
        "M 130 70 L 270 70 L 170 350" // Across and diagonal down
    ],
};

export const trace8: TracingActivityData = {
    id: "number-8",
    paths: [
        "M 200 200 C 120 150, 120 50, 200 50 C 280 50, 280 150, 200 200 C 120 250, 120 350, 200 350 C 280 350, 280 250, 200 200" // Figure 8 loops
    ],
};

export const trace9: TracingActivityData = {
    id: "number-9",
    paths: [
        "M 250 140 C 250 70, 150 70, 150 140 C 150 210, 250 210, 250 140 L 250 350" // Circle then down tail
    ],
};
