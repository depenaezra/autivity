import TracingCanvas from "@/components/tracing-canvas";
import { generateCheckpoints } from "@/utils/generateCheckpoints";


const path =
    "M50 300 C150 120 250 480 350 300";

const checkpoints =
    generateCheckpoints(path);

export default function Tracing() {
    return (
        <TracingCanvas
            path={path}
            checkpoints={checkpoints}
            start={{ x: 50, y: 300 }}
            end={{ x: 350, y: 300 }}
        />
    );
}