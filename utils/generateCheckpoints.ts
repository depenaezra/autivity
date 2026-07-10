import { svgPathProperties } from "svg-path-properties";

export type Point = {
    x: number;
    y: number;
};

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
        distance += spacing // if spacing is 30, we sample 0, 30, 60, 90...
    ) {
        const point = properties.getPointAtLength(distance); // returns x, y for every sample = checkpoints

        checkpoints.push({
            x: point.x,
            y: point.y,
        });
    }

    return checkpoints;
}