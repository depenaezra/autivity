// Export the main component
export { default as TracingActivity } from "./components/tracing-activity";

// Export the types
export * from "./types";

// Export your data files
import * as LetterActivities from "./data/letters";
import * as LineActivities from "./data/lines";
import * as NumberActivities from "./data/numbers";
import * as ShapeActivities from "./data/shapes";
import { TracingActivityData } from "./types";

export { LetterActivities, LineActivities, NumberActivities, ShapeActivities };

// Unified activities dictionary
export const TracingActivities = {
    lines: LineActivities,
    shapes: ShapeActivities,
    letters: LetterActivities,
    numbers: NumberActivities,
} as const;

/**
 * Dynamically resolves a tracing activity by a path identifier.
 * Supported formats:
 * - "lines/zigzag", "lines/straight-horizontal", etc.
 * - "shapes/square", "shapes/circle", etc.
 * - "letters/A", "letters/B", etc.
 * - "numbers/1", "numbers/2", etc.
 * 
 * Supports prefixes like "activity/tracing/" and is case-insensitive.
 */
export function getTracingActivityByPath(path: string): TracingActivityData | undefined {
    if (!path) return undefined;

    // Normalize path by stripping optional prefixes and splitting
    const cleanPath = path.toLowerCase().replace(/^activity\/tracing\//, "");
    const parts = cleanPath.split("/");
    if (parts.length < 2) return undefined;

    const category = parts[0];
    const name = parts[1];

    // Map common category aliases
    const categoryMap: Record<string, any> = {
        line: TracingActivities.lines,
        lines: TracingActivities.lines,
        shape: TracingActivities.shapes,
        shapes: TracingActivities.shapes,
        letter: TracingActivities.letters,
        letters: TracingActivities.letters,
        number: TracingActivities.numbers,
        numbers: TracingActivities.numbers,
    };

    const cat = categoryMap[category];
    if (!cat) return undefined;

    // Search keys case-insensitively
    // E.g., name is "straight-horizontal" or "straighthorizontal" or "A" (which would be mapped from "traceA" etc.)
    // We'll normalize the keys by stripping "trace" prefix and matching case-insensitively.
    const matchKey = Object.keys(cat).find((key) => {
        const normalizedKey = key.replace(/^trace/, "").toLowerCase();
        // E.g., if key is "traceHorizontal" -> "horizontal"
        // E.g., if key is "traceA" -> "a"
        // Also check exact matches or matches without "trace"
        return normalizedKey === name || key.toLowerCase() === name;
    });

    return matchKey ? cat[matchKey] : undefined;
}
