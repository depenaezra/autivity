import { Image, StyleSheet, Text } from "react-native";

import { bubbleAssets } from "../utils/bubble-assets";
import { BubbleContent as BubbleContentType } from "../utils/types";

type Props = {
    content: BubbleContentType;
};

export default function BubbleContent({
    content,
}: Props) {
    return (
        <>
            <Image
                source={
                    bubbleAssets[
                    content.color
                    ]
                }
                style={styles.bubble}
            />

            {content.type === "number" && (
                <Text style={styles.text}>
                    {content.value}
                </Text>
            )}

            {content.type === "letter" && (
                <Text style={styles.text}>
                    {content.value}
                </Text>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    bubble: {
        width: 100,
        height: 100,
    },

    text: {
        position: "absolute",
        alignSelf: "center",
        top: 32,
        fontSize: 32,
        fontWeight: "bold",
        color: "#000000",
    },
});