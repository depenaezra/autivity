import type { CopyLetterData } from "../types";

export const CopyLetters: Record<string, CopyLetterData> = {
    A: {
        id: "copy-letter-A",
        letter: "A",
        difficulty_level: 15,
        expectedStrokes: 3,
        minStrokes: 1,
        maxStrokes: 5,
        targetZones: [
            { x: 50, y: 15, label: "apex" },
            { x: 20, y: 85, label: "bottom-left" },
            { x: 80, y: 85, label: "bottom-right" },
            { x: 50, y: 55, label: "crossbar" },
        ],
    },
    B: {
        id: "copy-letter-B",
        letter: "B",
        difficulty_level: 22,
        expectedStrokes: 3,
        minStrokes: 1,
        maxStrokes: 5,
        targetZones: [
            { x: 25, y: 15, label: "top-spine" },
            { x: 25, y: 85, label: "bottom-spine" },
            { x: 70, y: 32, label: "top-loop" },
            { x: 75, y: 68, label: "bottom-loop" },
        ],
    },
    C: {
        id: "copy-letter-C",
        letter: "C",
        difficulty_level: 7,
        expectedStrokes: 1,
        minStrokes: 1,
        maxStrokes: 3,
        targetZones: [
            { x: 75, y: 20, label: "top-tip" },
            { x: 25, y: 50, label: "curve-spine" },
            { x: 75, y: 80, label: "bottom-tip" },
        ],
        emptyZones: [
            { x: 80, y: 50, radius: 20 }, // Right middle opening must remain empty (rejects O or full loop)
        ],
    },
    D: {
        id: "copy-letter-D",
        letter: "D",
        difficulty_level: 14,
        expectedStrokes: 2,
        minStrokes: 1,
        maxStrokes: 4,
        targetZones: [
            { x: 25, y: 15, label: "top-spine" },
            { x: 25, y: 85, label: "bottom-spine" },
            { x: 75, y: 50, label: "curve-belly" },
        ],
    },
    E: {
        id: "copy-letter-E",
        letter: "E",
        difficulty_level: 5,
        expectedStrokes: 4,
        minStrokes: 1,
        maxStrokes: 5,
        targetZones: [
            { x: 25, y: 15, label: "top-left" },
            { x: 25, y: 85, label: "bottom-left" },
            { x: 75, y: 15, label: "top-arm" },
            { x: 65, y: 50, label: "mid-arm" },
            { x: 75, y: 85, label: "bottom-arm" },
        ],
    },
    F: {
        id: "copy-letter-F",
        letter: "F",
        difficulty_level: 6,
        expectedStrokes: 3,
        minStrokes: 1,
        maxStrokes: 4,
        targetZones: [
            { x: 25, y: 15, label: "top-left" },
            { x: 25, y: 85, label: "bottom-left" },
            { x: 75, y: 15, label: "top-arm" },
            { x: 65, y: 50, label: "mid-arm" },
        ],
    },
    G: {
        id: "copy-letter-G",
        letter: "G",
        difficulty_level: 24,
        expectedStrokes: 2,
        minStrokes: 1,
        maxStrokes: 4,
        targetZones: [
            { x: 75, y: 20, label: "top-right" },
            { x: 25, y: 50, label: "left-curve" },
            { x: 75, y: 80, label: "bottom-right" },
            { x: 60, y: 55, label: "inner-shelf" },
        ],
    },
    H: {
        id: "copy-letter-H",
        letter: "H",
        difficulty_level: 4,
        expectedStrokes: 3,
        minStrokes: 1,
        maxStrokes: 4,
        targetZones: [
            { x: 25, y: 15, label: "top-left" },
            { x: 25, y: 85, label: "bottom-left" },
            { x: 75, y: 15, label: "top-right" },
            { x: 75, y: 85, label: "bottom-right" },
            { x: 50, y: 50, label: "crossbar" },
        ],
    },
    I: {
        id: "copy-letter-I",
        letter: "I",
        difficulty_level: 1,
        expectedStrokes: 1,
        minStrokes: 1,
        maxStrokes: 3,
        maxAspectRatio: 0.85, // Width cannot exceed 85% of height (rejects circles, squares, faces)
        targetZones: [
            { x: 50, y: 15, label: "top" },
            { x: 50, y: 50, label: "mid-stem" },
            { x: 50, y: 85, label: "bottom" },
        ],
        emptyZones: [
            { x: 15, y: 50, radius: 22 }, // Left side must be empty (rejects smiley/circle cheeks)
            { x: 85, y: 50, radius: 22 }, // Right side must be empty (rejects smiley/circle cheeks)
        ],
    },
    J: {
        id: "copy-letter-J",
        letter: "J",
        difficulty_level: 13,
        expectedStrokes: 1,
        minStrokes: 1,
        maxStrokes: 3,
        targetZones: [
            { x: 65, y: 15, label: "top" },
            { x: 65, y: 70, label: "stem-down" },
            { x: 30, y: 80, label: "hook" },
        ],
    },
    K: {
        id: "copy-letter-K",
        letter: "K",
        difficulty_level: 21,
        expectedStrokes: 3,
        minStrokes: 1,
        maxStrokes: 4,
        targetZones: [
            { x: 25, y: 15, label: "top-spine" },
            { x: 25, y: 85, label: "bottom-spine" },
            { x: 75, y: 15, label: "top-slant" },
            { x: 75, y: 85, label: "bottom-slant" },
            { x: 35, y: 50, label: "junction" },
        ],
    },
    L: {
        id: "copy-letter-L",
        letter: "L",
        difficulty_level: 2,
        expectedStrokes: 2,
        minStrokes: 1,
        maxStrokes: 3,
        targetZones: [
            { x: 25, y: 15, label: "top" },
            { x: 25, y: 85, label: "corner" },
            { x: 75, y: 85, label: "foot" },
        ],
    },
    M: {
        id: "copy-letter-M",
        letter: "M",
        difficulty_level: 18,
        expectedStrokes: 4,
        minStrokes: 1,
        maxStrokes: 5,
        targetZones: [
            { x: 15, y: 85, label: "bottom-left" },
            { x: 15, y: 15, label: "top-left" },
            { x: 50, y: 65, label: "center-v" },
            { x: 85, y: 15, label: "top-right" },
            { x: 85, y: 85, label: "bottom-right" },
        ],
    },
    N: {
        id: "copy-letter-N",
        letter: "N",
        difficulty_level: 17,
        expectedStrokes: 3,
        minStrokes: 1,
        maxStrokes: 4,
        targetZones: [
            { x: 25, y: 85, label: "bottom-left" },
            { x: 25, y: 15, label: "top-left" },
            { x: 75, y: 85, label: "bottom-right" },
            { x: 75, y: 15, label: "top-right" },
        ],
    },
    O: {
        id: "copy-letter-O",
        letter: "O",
        difficulty_level: 8,
        expectedStrokes: 1,
        minStrokes: 1,
        maxStrokes: 3,
        targetZones: [
            { x: 50, y: 15, label: "top" },
            { x: 20, y: 50, label: "left" },
            { x: 80, y: 50, label: "right" },
            { x: 50, y: 85, label: "bottom" },
        ],
        emptyZones: [
            { x: 50, y: 50, radius: 20 }, // Center must remain hollow (rejects smiley face drawings inside)
        ],
    },
    P: {
        id: "copy-letter-P",
        letter: "P",
        difficulty_level: 12,
        expectedStrokes: 2,
        minStrokes: 1,
        maxStrokes: 4,
        targetZones: [
            { x: 25, y: 15, label: "top-spine" },
            { x: 25, y: 85, label: "bottom-spine" },
            { x: 70, y: 35, label: "loop" },
            { x: 30, y: 55, label: "loop-close" },
        ],
    },
    Q: {
        id: "copy-letter-Q",
        letter: "Q",
        difficulty_level: 26,
        expectedStrokes: 2,
        minStrokes: 1,
        maxStrokes: 4,
        targetZones: [
            { x: 50, y: 15, label: "top" },
            { x: 20, y: 50, label: "left" },
            { x: 80, y: 50, label: "right" },
            { x: 50, y: 80, label: "bottom" },
            { x: 80, y: 90, label: "tail" },
        ],
    },
    R: {
        id: "copy-letter-R",
        letter: "R",
        difficulty_level: 23,
        expectedStrokes: 3,
        minStrokes: 1,
        maxStrokes: 5,
        targetZones: [
            { x: 25, y: 15, label: "top-spine" },
            { x: 25, y: 85, label: "bottom-spine" },
            { x: 70, y: 35, label: "loop" },
            { x: 75, y: 85, label: "kick-leg" },
        ],
    },
    S: {
        id: "copy-letter-S",
        letter: "S",
        difficulty_level: 25,
        expectedStrokes: 1,
        minStrokes: 1,
        maxStrokes: 3,
        targetZones: [
            { x: 75, y: 20, label: "top-hook" },
            { x: 30, y: 35, label: "top-curve" },
            { x: 70, y: 65, label: "bottom-curve" },
            { x: 25, y: 80, label: "bottom-hook" },
        ],
    },
    T: {
        id: "copy-letter-T",
        letter: "T",
        difficulty_level: 3,
        expectedStrokes: 2,
        minStrokes: 1,
        maxStrokes: 3,
        targetZones: [
            { x: 20, y: 15, label: "top-left" },
            { x: 80, y: 15, label: "top-right" },
            { x: 50, y: 15, label: "top-center" },
            { x: 50, y: 85, label: "bottom-stem" },
        ],
        emptyZones: [
            { x: 15, y: 70, radius: 25 }, // Lower left must be open
            { x: 85, y: 70, radius: 25 }, // Lower right must be open
        ],
    },
    U: {
        id: "copy-letter-U",
        letter: "U",
        difficulty_level: 9,
        expectedStrokes: 1,
        minStrokes: 1,
        maxStrokes: 3,
        targetZones: [
            { x: 25, y: 15, label: "top-left" },
            { x: 50, y: 85, label: "bottom-curve" },
            { x: 75, y: 15, label: "top-right" },
        ],
        emptyZones: [
            { x: 50, y: 25, radius: 22 }, // Top center must stay open (rejects closed O loop)
        ],
    },
    V: {
        id: "copy-letter-V",
        letter: "V",
        difficulty_level: 10,
        expectedStrokes: 2,
        minStrokes: 1,
        maxStrokes: 3,
        targetZones: [
            { x: 20, y: 15, label: "top-left" },
            { x: 50, y: 85, label: "vertex" },
            { x: 80, y: 15, label: "top-right" },
        ],
    },
    W: {
        id: "copy-letter-W",
        letter: "W",
        difficulty_level: 19,
        expectedStrokes: 4,
        minStrokes: 1,
        maxStrokes: 5,
        targetZones: [
            { x: 15, y: 15, label: "top-left" },
            { x: 35, y: 85, label: "bottom-left" },
            { x: 50, y: 35, label: "mid-peak" },
            { x: 65, y: 85, label: "bottom-right" },
            { x: 85, y: 15, label: "top-right" },
        ],
    },
    X: {
        id: "copy-letter-X",
        letter: "X",
        difficulty_level: 11,
        expectedStrokes: 2,
        minStrokes: 1,
        maxStrokes: 3,
        targetZones: [
            { x: 20, y: 15, label: "top-left" },
            { x: 80, y: 85, label: "bottom-right" },
            { x: 80, y: 15, label: "top-right" },
            { x: 20, y: 85, label: "bottom-left" },
            { x: 50, y: 50, label: "crossing" },
        ],
    },
    Y: {
        id: "copy-letter-Y",
        letter: "Y",
        difficulty_level: 16,
        expectedStrokes: 3,
        minStrokes: 1,
        maxStrokes: 4,
        targetZones: [
            { x: 20, y: 15, label: "top-left" },
            { x: 80, y: 15, label: "top-right" },
            { x: 50, y: 50, label: "junction" },
            { x: 50, y: 85, label: "bottom-stem" },
        ],
    },
    Z: {
        id: "copy-letter-Z",
        letter: "Z",
        difficulty_level: 12,
        expectedStrokes: 3,
        minStrokes: 1,
        maxStrokes: 4,
        targetZones: [
            { x: 20, y: 15, label: "top-left" },
            { x: 80, y: 15, label: "top-right" },
            { x: 20, y: 85, label: "bottom-left" },
            { x: 80, y: 85, label: "bottom-right" },
        ],
    },
};

export function getCopyLetterData(letterOrPath: string): CopyLetterData | undefined {
    if (!letterOrPath) return undefined;
    const clean = letterOrPath.toUpperCase().replace(/^.*\/([A-Z])$/, "$1").trim();
    if (clean.length === 1 && CopyLetters[clean]) {
        return CopyLetters[clean];
    }
    // Search by ID or key
    const foundKey = Object.keys(CopyLetters).find(
        k => k === clean || CopyLetters[k].id.toUpperCase() === clean
    );
    return foundKey ? CopyLetters[foundKey] : undefined;
}
