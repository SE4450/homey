import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
type MessageBoxProps = {
    message: string;
    senderType?: "self" | "other";
    timestamp: string;
    status?: "sending" | "delivered" | "read";
};
const MessageBox: React.FC<MessageBoxProps> = ({ message, senderType = "self", timestamp, status }) => {
    const isSelf = senderType === "self";
    return (
        <View
            style={[
                styles.messageContainer,
                isSelf ? styles.selfContainer : styles.otherContainer,
            ]}
        >
            <Text style={[styles.messageText, isSelf && styles.selfText]}>
                {message}
            </Text>
            <View style={styles.footer}>
                <Text style={styles.timestamp}>{timestamp}</Text>
            </View>
            {isSelf && status && (
                <Text style={[styles.statusText, styles[status]]}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
            )}
        </View>
    );
};
const styles = StyleSheet.create<{
    messageContainer: ViewStyle;
    selfContainer: ViewStyle;
    otherContainer: ViewStyle;
    messageText: TextStyle;
    selfText: TextStyle;
    footer: ViewStyle;
    timestamp: TextStyle;
    statusText: TextStyle;
    sending: TextStyle;
    delivered: TextStyle;
    read: TextStyle;
}>({
    messageContainer: {
        maxWidth: "75%",
        marginVertical: 5,
        padding: 10,
        borderRadius: 15
    },
    selfContainer: {
        alignSelf: "flex-end",
        backgroundColor: "#007AFF"
    },
    otherContainer: {
        alignSelf: "flex-start",
        backgroundColor: "#E4E6EB"
    },
    messageText: {
        fontSize: 16,
        color: "#000"
    },
    selfText: {
        color: "#fff"
    },
    footer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        marginTop: 5
    },
    timestamp: {
        fontSize: 12,
        color: "#A7A7A7"
    },
    statusText: {
        fontSize: 12,
        marginTop: 2,
        alignSelf: "flex-end"
    },
    sending: {
        color: "#34C759"
    },
    delivered: {
        color: "#34C759",
    },
    read: {
        color: "#34C759"
    },
});
export default MessageBox;