import React, { useEffect, useState } from "react";
import {
    View,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    Text,
    Alert,
    Keyboard,
    TouchableWithoutFeedback,
    Platform,
    KeyboardAvoidingView
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import useAxios from "./hooks/useAxios";
import { useAuth } from "./context/AuthContext";
import MessageBox from "./components/messageBox";

export default function ConversationScreen() {
    const { id, name } = useLocalSearchParams();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState<string>("");
    const { get, post, patch, error } = useAxios();
    const { userId } = useAuth();

    useEffect(() => {
        if (error) {
            Alert.alert("Error", error);
        }
    }, [error]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await get<any>(`/api/messages/conversation/${id}`);
                if (response) {
                    let lastSentMessage: any = null;
                    let lastReceivedMessage: any = null;

                    const formattedMessages = response.data.map((message: any) => {
                        lastSentMessage = message.senderId == userId ? message : lastSentMessage;
                        lastReceivedMessage = message.senderId != userId ? message : lastReceivedMessage;

                        return {
                            id: message.id,
                            sender: message.senderId !== userId ? "other" : "self",
                            content: message.content,
                            timestamp: new Date(message.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            }),
                            status: null,
                        };
                    });

                    if (lastSentMessage) {
                        formattedMessages[
                            formattedMessages.findIndex((message: any) => message.id == lastSentMessage.id)
                        ].status = lastSentMessage.readBy ? "read" : "delivered";
                    }

                    if (lastReceivedMessage) {
                        await patch(`/api/messages/read`, { messageId: lastReceivedMessage.id });
                    }

                    setMessages(formattedMessages.reverse());
                }
            } catch (err) {
                Alert.alert("Error", `Failed to fetch messages in conversation:\n${err}`);
            }
        };

        const interval = setInterval(() => {
            fetchMessages();
        }, 5000);

        fetchMessages();

        return () => clearInterval(interval);
    }, []);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        const tempMessage = {
            id: Date.now().toString(),
            sender: "self",
            content: newMessage.trim(),
            timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
            status: "sending"
        };

        setMessages((prev) => [tempMessage, ...prev]);
        setNewMessage("");

        try {
            const response = await post<any>(`/api/messages/send`, { conversationId: id, content: tempMessage.content });
            if (response) {
                const sentMessage = {
                    id: response.data[0].id,
                    sender: "self",
                    content: response.data[0].content,
                    timestamp: new Date(response.data[0].createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                    status: "delivered"
                };
                setMessages((prev) =>
                    prev.map((msg) => (msg.id === tempMessage.id ? sentMessage : msg))
                );
            }
        } catch (err) {
            Alert.alert("Error", `Failed to send message:\n${err}`);
            setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
        }
    };

    const renderMessage = ({ item }: any) => (
        <MessageBox
            message={item.content}
            senderType={item.sender}
            timestamp={item.timestamp}
            status={item.status}
        />
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>{name}</Text>
            <FlatList
                data={messages}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderMessage}
                inverted
                contentContainerStyle={styles.messageList}
            />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 95 : 70}
                style={styles.keyboardAvoidingView}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={newMessage}
                        onChangeText={setNewMessage}
                        placeholder="Type a message"
                    />
                    <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
                        <Text style={styles.sendButtonText}>Send</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    header: {
        textAlign: "center",
        fontSize: 18,
        fontWeight: "bold",
        paddingVertical: 10,
        backgroundColor: "#E4E6EB",
    },
    messageList: {
        flexGrow: 1,
        paddingHorizontal: 10,
    },
    keyboardAvoidingView: {
        borderTopWidth: 1,
        borderTopColor: "#E4E6EB",
        backgroundColor: "#FFFFFF",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
    },
    input: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: "#E4E6EB",
        borderRadius: 20,
        paddingHorizontal: 10,
    },
    sendButton: {
        marginLeft: 10,
        backgroundColor: "#007AFF",
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 20,
    },
    sendButtonText: {
        color: "#fff",
        fontSize: 16,
    },
});