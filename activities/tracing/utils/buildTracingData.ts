import { svgPathProperties } from "svg-path-properties";

import type { TracingData } from "../types";
import { generateCheckpoints } from "./generateCheckpoints";

export function buildTracingData(path: string): TracingData {
    const properties = new svgPathProperties(path);

    const checkpoints = generateCheckpoints(path);

    const totalLength = properties.getTotalLength();

    const start = properties.getPointAtLength(0);
    const end = properties.getPointAtLength(totalLength);

    return {
        checkpoints,
        start: {
            x: start.x,
            y: start.y,
        },
        end: {
            x: end.x,
            y: end.y,
        },
        totalLength,
    };
}