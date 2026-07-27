import Bubble from "./bubble";

import { BubbleData } from "../utils/types";

type Props = {
    bubbles: BubbleData[];
    scale?: number;
    onPop: (id: string) => void;
    onPopFinished?: (id: string) => void;
    onRecycle: (id: string) => void;
};

export default function BubbleList({
    bubbles,
    scale,
    onPop,
    onPopFinished,
    onRecycle,
}: Props) {
    return (
        <>
            {bubbles.map((bubble) => (
                <Bubble
                    key={bubble.id}
                    x={bubble.x}
                    y={bubble.y}
                    speed={bubble.speed}
                    scale={scale}
                    content={bubble.content}
                    onPop={() => onPop(bubble.id)}
                    onPopFinished={() => onPopFinished?.(bubble.id)}
                    onRecycle={() => onRecycle(bubble.id)}
                />
            ))}
        </>
    );
}