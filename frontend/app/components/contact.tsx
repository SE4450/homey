import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

type ContactProps = {
    imageUri: string;
    name: string;
    latestMessage: string;
    date: string;
    hasNewMessage: boolean;
    onPress: () => void;
};

const Contact: React.FC<ContactProps> = ({ imageUri, name, latestMessage, date, hasNewMessage, onPress }) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={styles.imageContainer}>
                <Image source={{ uri: imageUri }} style={styles.image} />
                {hasNewMessage && <View style={styles.blueDot} />}
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.latestMessage} numberOfLines={1}>
                    {latestMessage}
                </Text>
            </View>
            <Text style={styles.date}>{date}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    imageContainer: {
        position: "relative",
        marginRight: 10,
    },
    image: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    blueDot: {
        position: "absolute",
        top: 0,
        right: 0,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#007AFF",
    },
    textContainer: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
    },
    latestMessage: {
        fontSize: 14,
        color: "#666",
    },
    date: {
        fontSize: 12,
        color: "#aaa",
        alignSelf: "flex-start",
    },
});

export default Contact;
