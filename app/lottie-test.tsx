import { View } from "react-native";

import {
    BubbleActivity,
} from "../activities/bubble-pop";


export default function LottieTest() {

    return (

        <View
            style={{
                flex: 1,
                backgroundColor: "#ffffff",
            }}
        >

            <BubbleActivity

                bubbleCount={5}

                speed={12000}

                // [ADDED]: Free Pop uses your original bubble.
                availableColors={[
                    "default",
                ]}

            />

        </View>

    );
}