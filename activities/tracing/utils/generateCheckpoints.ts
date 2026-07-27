import { svgPathProperties } from "svg-path-properties";
import type { Point } from "../types";

export function generateCheckpoints(
    path: string,
    spacing = 30
): Point[] {
    const properties = new svgPathProperties(path);

    const totalLength = properties.getTotalLength();

    const checkpoints: Point[] = [];

    for (
        let distance = 0;
        distance <= totalLength;
        distance += spacing
    ) {
        const point = properties.getPointAtLength(distance);

        checkpoints.push({
            x: point.x,
            y: point.y,
        });
    }

    return checkpoints;
}