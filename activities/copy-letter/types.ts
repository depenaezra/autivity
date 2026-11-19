export type CopyLetterData = {
    id: string;
    letter: string;
    difficulty_level: number;
    expectedStrokes: number;
    minStrokes: number;
    maxStrokes: number;
    // Normalized key target checkpoints (0-100% of bounding box)
    targetZones: { x: number; y: number; label?: string }[];
    // Negative zones that MUST remain empty (e.g. flanks of 'I', hollow center of 'O')
    emptyZones?: { x: number; y: number; radius?: number }[];
    // Expected aspect ratio bounds (width / height)
    maxAspectRatio?: number;
    minAspectRatio?: number;
};

export type Point = {
    x: number;
    y: number;
};

export type Stroke = Point[];
