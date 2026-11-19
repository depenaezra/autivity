import type { Stroke } from "../types";

export type ValidationResult = {
    isValid: boolean;
    reason?: "empty" | "too_small" | "too_many_strokes" | "scribble" | "missed_zones" | "aspect_ratio" | "forbidden_zone";
    message?: string;
    hitRatio?: number;
};

export function validateCopyDrawing(
    strokes: Stroke[],
    targetLetter: string,
    targetZones: { x: number; y: number }[],
    minStrokes: number,
    maxStrokes: number,
    emptyZones?: { x: number; y: number; radius?: number }[],
    maxAspectRatio?: number
): ValidationResult {
    if (!strokes || strokes.length === 0) {
        return {
            isValid: false,
            reason: "empty",
            message: `Draw the letter ${targetLetter} on the board first!`,
        };
    }

    // Filter out tiny accidental taps (fewer than 2 points)
    const validStrokes = strokes.filter((s) => s.length >= 2);
    if (validStrokes.length === 0) {
        return {
            isValid: false,
            reason: "empty",
            message: `Draw the letter ${targetLetter} on the board first!`,
        };
    }

    // 1. Anti-scribble: Check excessive stroke count (generous tolerance for kid handwriting)
    if (validStrokes.length > maxStrokes + 5) {
        return {
            isValid: false,
            reason: "too_many_strokes",
            message: "That looks like too many extra lines! Try writing it with fewer strokes.",
        };
    }

    // Calculate bounding box and total drawn distance
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    let totalLength = 0;

    const allPoints: { x: number; y: number }[] = [];

    for (const stroke of validStrokes) {
        for (let i = 0; i < stroke.length; i++) {
            const pt = stroke[i];
            allPoints.push(pt);
            if (pt.x < minX) minX = pt.x;
            if (pt.x > maxX) maxX = pt.x;
            if (pt.y < minY) minY = pt.y;
            if (pt.y > maxY) maxY = pt.y;

            if (i > 0) {
                const prev = stroke[i - 1];
                const dx = pt.x - prev.x;
                const dy = pt.y - prev.y;
                totalLength += Math.sqrt(dx * dx + dy * dy);
            }
        }
    }

    const boxWidth = maxX - minX;
    const boxHeight = maxY - minY;

    // 2. Aspect Ratio Check (e.g. Letter I cannot be a round circle or square smiley face)
    const aspectRatio = boxWidth / Math.max(boxHeight, 1);
    if (maxAspectRatio && aspectRatio > maxAspectRatio) {
        return {
            isValid: false,
            reason: "aspect_ratio",
            message: `The letter ${targetLetter} should be tall and straight, not round or wide!`,
        };
    }

    // 3. Size check: must be a reasonable size on the handwriting board
    if (boxWidth < 40 || boxHeight < 50) {
        return {
            isValid: false,
            reason: "too_small",
            message: "Make your letter a bit bigger so it fills the handwriting lines!",
        };
    }

    // 3. Continuous scribble check:
    // If a student drew 1 single stroke with thousands of pixels of frantic winding
    const avgStrokeLength = totalLength / validStrokes.length;
    if (validStrokes.length === 1 && targetLetter !== "O" && targetLetter !== "C" && avgStrokeLength > 2000) {
        return {
            isValid: false,
            reason: "scribble",
            message: `Look at the letter ${targetLetter} above and try copying its shape!`,
        };
    }

    // 4. Normalized Target Zone Hit-Testing:
    // Normalize each point into a [0, 100] coordinate space relative to the user's bounding box
    const normalizedPoints = allPoints.map((pt) => ({
        x: ((pt.x - minX) / Math.max(boxWidth, 1)) * 100,
        y: ((pt.y - minY) / Math.max(boxHeight, 1)) * 100,
    }));

    // Check how many target zones were approached (within 35% tolerance radius)
    const HIT_RADIUS = 35; // generous radius to accommodate ASD motor variance
    let hitCount = 0;

    for (const zone of targetZones) {
        const isHit = normalizedPoints.some((pt) => {
            const dx = pt.x - zone.x;
            const dy = pt.y - zone.y;
            return Math.sqrt(dx * dx + dy * dy) <= HIT_RADIUS;
        });
        if (isHit) {
            hitCount++;
        }
    }

    const hitRatio = targetZones.length > 0 ? hitCount / targetZones.length : 1;

    // Minimum 55% zone coverage to pass (e.g. 2 of 3 or 3 of 4 zones)
    if (hitRatio < 0.55) {
        return {
            isValid: false,
            reason: "missed_zones",
            hitRatio,
            message: `Almost! Look closely at the letter ${targetLetter} above and try again!`,
        };
    }

    // 5. Negative / Forbidden Zones Check:
    // Some letters MUST NOT have ink in certain quadrants (e.g. flanks of 'I', hollow center of 'O', opening of 'C')
    if (emptyZones && emptyZones.length > 0) {
        for (const zone of emptyZones) {
            const rad = zone.radius || 20;
            const pointsInForbidden = normalizedPoints.filter((pt) => {
                const dx = pt.x - zone.x;
                const dy = pt.y - zone.y;
                return Math.sqrt(dx * dx + dy * dy) <= rad;
            });

            // If more than 4 points and over 4% of total drawing lands in a forbidden zone, reject!
            if (pointsInForbidden.length >= 4 && (pointsInForbidden.length / normalizedPoints.length) > 0.04) {
                return {
                    isValid: false,
                    reason: "forbidden_zone",
                    message: `Almost! Check the shape of letter ${targetLetter} above and try again!`,
                };
            }
        }
    }

    return {
        isValid: true,
        hitRatio,
    };
}
