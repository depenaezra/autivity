export type Point = {
    x: number;
    y: number;
};

export type TracingData = {
    checkpoints: Point[];
    start: Point;
    end: Point;
    totalLength: number;
};

export type TracingActivityData = {
    id: string;
    paths: string[];
};