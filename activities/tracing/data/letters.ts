import type { TracingActivityData } from "../types";

export const traceA: TracingActivityData = {
    id: "letter-A",
    paths: [
        "M 200 50 L 100 350",   // Left leg down
        "M 200 50 L 300 350",   // Right leg down
        "M 150 230 L 250 230",  // Cross bar
    ],
};

export const traceB: TracingActivityData = {
    id: "letter-B",
    paths: [
        "M 130 50 L 130 350",                           // Spine
        "M 130 50 C 270 50, 270 190, 130 190",          // Top loop
        "M 130 190 C 290 190, 290 350, 130 350",        // Bottom loop
    ],
};

export const traceC: TracingActivityData = {
    id: "letter-C",
    paths: [
        "M 280 100 C 150 100, 110 200, 130 260 C 150 310, 220 310, 280 290" // Continuous curve
    ],
};

export const traceD: TracingActivityData = {
    id: "letter-D",
    paths: [
        "M 130 50 L 130 350",                           // Spine
        "M 130 50 C 310 50, 310 350, 130 350",          // Semi-circle curve
    ],
};

export const traceE: TracingActivityData = {
    id: "letter-E",
    paths: [
        "M 130 50 L 130 350",   // Spine
        "M 130 50 L 280 50",    // Top bar
        "M 130 200 L 250 200",  // Mid bar
        "M 130 350 L 280 350",  // Bottom bar
    ],
};

export const traceF: TracingActivityData = {
    id: "letter-F",
    paths: [
        "M 130 50 L 130 350",   // Spine
        "M 130 50 L 280 50",    // Top bar
        "M 130 200 L 250 200",  // Mid bar
    ],
};

export const traceG: TracingActivityData = {
    id: "letter-G",
    paths: [
        "M 280 100 C 150 100, 110 200, 130 260 C 150 310, 220 310, 280 290", // Main curve
        "M 220 200 L 280 200 L 280 250",                                    // Inner crossbar/hook
    ],
};

export const traceH: TracingActivityData = {
    id: "letter-H",
    paths: [
        "M 120 50 L 120 350",   // Left spine
        "M 280 50 L 280 350",   // Right spine
        "M 120 200 L 280 200",  // Cross bar
    ],
};

export const traceI: TracingActivityData = {
    id: "letter-I",
    paths: [
        "M 200 50 L 200 350",   // Center spine
        "M 130 50 L 270 50",    // Top cap
        "M 130 350 L 270 350",  // Bottom cap
    ],
};

export const traceJ: TracingActivityData = {
    id: "letter-J",
    paths: [
        "M 130 50 L 270 50",                            // Top bar
        "M 200 50 L 200 270 C 200 350, 120 350, 120 290" // Spine and hook
    ],
};

export const traceK: TracingActivityData = {
    id: "letter-K",
    paths: [
        "M 130 50 L 130 350",   // Spine
        "M 270 50 L 130 200",   // Diagonal down-left
        "M 130 200 L 270 350",  // Diagonal down-right
    ],
};

export const traceL: TracingActivityData = {
    id: "letter-L",
    paths: [
        "M 130 50 L 130 350 L 280 350" // Continuous spine and foot
    ],
};

export const traceM: TracingActivityData = {
    id: "letter-M",
    paths: [
        "M 100 350 L 100 50 L 200 250 L 300 50 L 300 350" // Continuous M
    ],
};

export const traceN: TracingActivityData = {
    id: "letter-N",
    paths: [
        "M 100 350 L 100 50",   // Left leg up
        "M 100 50 L 300 350",   // Diagonal down-right
        "M 300 350 L 300 50",   // Right leg up
    ],
};

export const traceO: TracingActivityData = {
    id: "letter-O",
    paths: [
        "M 200 50 C 310 50, 310 350, 200 350 C 90 350, 90 50, 200 50" // Circle
    ],
};

export const traceP: TracingActivityData = {
    id: "letter-P",
    paths: [
        "M 130 50 L 130 350",                   // Spine
        "M 130 50 C 270 50, 270 200, 130 200",  // Top loop
    ],
};

export const traceQ: TracingActivityData = {
    id: "letter-Q",
    paths: [
        "M 200 50 C 310 50, 310 350, 200 350 C 90 350, 90 50, 200 50", // O loop
        "M 230 260 L 300 330",                                         // Tail
    ],
};

export const traceR: TracingActivityData = {
    id: "letter-R",
    paths: [
        "M 130 50 L 130 350",                   // Spine
        "M 130 50 C 270 50, 270 200, 130 200",  // Loop
        "M 130 200 L 270 350",                  // Leg
    ],
};

export const traceS: TracingActivityData = {
    id: "letter-S",
    paths: [
        "M 270 100 C 270 50, 130 50, 130 190 C 130 330, 270 330, 130 350" // Continuous S curve
    ],
};

export const traceT: TracingActivityData = {
    id: "letter-T",
    paths: [
        "M 100 50 L 300 50",   // Cross bar
        "M 200 50 L 200 350",  // Spine
    ],
};

export const traceU: TracingActivityData = {
    id: "letter-U",
    paths: [
        "M 120 50 L 120 270 C 120 350, 280 350, 280 270 L 280 50" // Cup
    ],
};

export const traceV: TracingActivityData = {
    id: "letter-V",
    paths: [
        "M 100 50 L 200 350 L 300 50" // V shape
    ],
};

export const traceW: TracingActivityData = {
    id: "letter-W",
    paths: [
        "M 80 50 L 140 350 L 200 170 L 260 350 L 320 50" // W shape
    ],
};

export const traceX: TracingActivityData = {
    id: "letter-X",
    paths: [
        "M 100 50 L 300 350", // Diagonal 1
        "M 300 50 L 100 350", // Diagonal 2
    ],
};

export const traceY: TracingActivityData = {
    id: "letter-Y",
    paths: [
        "M 100 50 L 200 200",   // Left branch
        "M 300 50 L 200 200",   // Right branch
        "M 200 200 L 200 350",  // Tail
    ],
};

export const traceZ: TracingActivityData = {
    id: "letter-Z",
    paths: [
        "M 100 50 L 300 50 L 100 350 L 300 350" // Z strokes
    ],
};
