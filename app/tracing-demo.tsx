import { View } from "react-native";
// 1. Clean import from the index file
import { ShapeActivities, TracingActivity } from "@/activities/tracing";

export default function TracingScreen() {
    return (
        <View style={{ flex: 1 }}>
            <TracingActivity
                // 2. Change this to ANY shape, letter, or number!
                activity={ShapeActivities.traceSquare}

                onComplete={() => alert("Activity Mastered!")}
            />
        </View>
    );
}