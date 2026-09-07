import Bubble from "./bubble";

import { BubbleColor } from "../utils/bubble-assets";
import { BubbleData } from "../utils/types";

type Props = {
    bubbles: BubbleData[];
    scale?: number;
    onPop: (id: string) => void;
    onPopFinished?: (id: string) => void;
    onRecycle: (id: string) => void;
    isHintActive?: boolean;
    hintLevel?: number;
    targetColor?: BubbleColor;
};

export default function BubbleList({
    bubbles,
    scale,
    onPop,
    onPopFinished,
    onRecycle,
    isHintActive = false,
    hintLevel = 1,
    targetColor,
}: Props) {
    return (
        <>
            {bubbles.map((bubble) => {
                const isTarget = targetColor ? bubble.content.color === targetColor : true;
                const isHighlighted = isHintActive && hintLevel === 2 && isTarget;

                return (
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
                        isHighlighted={isHighlighted}
                    />
                );
            })}
        </>
    );
}