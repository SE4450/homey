import React, { useEffect, useState, useLayoutEffect } from "react";
import {
    View,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    Text,
    Alert,
    Platform,
    KeyboardAvoidingView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import useAxios from "./hooks/useAxios";
import { useAuth } from "./context/AuthContext";
import MessageBox from "./components/messageBox";
import { MessageStackParamList } from "./stacks/messagesStack";

type ConversationScreenRouteProp = RouteProp<MessageStackParamList, 'conversation'>;

export default function ConversationScreen() {
    const navigation = useNavigation();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState<string>("");
    const { get, post, patch, error } = useAxios();
    const { userId } = useAuth();
    const route = useRoute<ConversationScreenRouteProp>();

    useLayoutEffect(() => {
        const parent = navigation.getParent();
        parent?.setOptions({ tabBarStyle: { display: "none" } });

        return () => {
            parent?.setOptions({ tabBarStyle: { display: "flex" } });
        };
    }, [navigation]);

    useEffect(() => {
        if (error) {
            Alert.alert("Error", error);
        }
    }, [error]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await get<any>(`/api/messages/conversation/${route.params.id}`);
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
                            name: `${message.users.firstName} ${message.users.lastName}`
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
            const response = await post<any>(`/api/messages/send`, { conversationId: route.params.id, content: tempMessage.content });
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
            type={route.params.type}
            sender={item.name}
        />
    );

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0} // adjust as needed
        >
            <View style={styles.root}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>Chore Details</Text>
                </View>
                <FlatList
                    data={messages}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderMessage}
                    inverted
                    // Adding extra bottom padding so last messages aren't hidden by the input area
                    contentContainerStyle={[styles.messageList, { paddingBottom: 60 }]}
                    style={{ flex: 1 }}
                />
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
            </View>
        </KeyboardAvoidingView>
    );

}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 50,
        paddingBottom: 10,
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        elevation: 3,
        zIndex: 100,
    },
    backButton: {
        paddingLeft: 15,
    },
    headerText: {
        fontSize: 22,
        fontWeight: "bold",
        flex: 1,
        textAlign: "center",
        paddingRight: 35,
    },
    headerContainer: {
        backgroundColor: "#E4E6EB",
        paddingVertical: 10,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
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