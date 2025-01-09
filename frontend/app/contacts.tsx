import React, { useEffect, useState } from "react";
import {
    View,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Alert,
    Button,
} from "react-native";
import Contact from "./components/contact";
import TextField from "./components/textField";
import useAxios from "./hooks/useAxios";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "expo-router";

export default function ContactsScreen() {
    const [conversations, setConversations] = useState<any>();
    const [loading, setLoading] = useState(true);
    const [newUserId, setNewUserId] = useState("");
    const { get, post, error } = useAxios();
    const { userId } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (error) {
            Alert.alert("Error", error);
        }
    }, [error]);

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const response = await get<any>("/api/conversations");
            if (response) {
                const formattedConversations = response.data.map((conversation: any) => {
                    const latestMessage = conversation.messages[0] || null;

                    const hasNewMessage =
                        latestMessage &&
                        latestMessage.senderId !== userId &&
                        !latestMessage.readBy?.includes(userId);

                    return {
                        id: conversation.id,
                        name: conversation.participants
                            .filter((p: any) => p.userId !== userId)
                            .map((p: any) => `${p.users.firstName} ${p.users.lastName}`)
                            .join(", "),
                        latestMessage: latestMessage?.content || "No messages yet",
                        date: new Date(latestMessage?.createdAt || Date.now()).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        }),
                        imageUri:
                            conversation.participants[0]?.user?.profilePicture ||
                            "https://www.gravatar.com/avatar/00000000000000000000000000000000?s=200&d=mp",
                        hasNewMessage,
                    };
                });
                setConversations(formattedConversations);
            }
        } catch (err) {
            Alert.alert("Error", `Failed to fetch conversations for reason:\n\n${err}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    const handlePress = (id: any, name: any) => {
        router.push({
            pathname: "/conversation",
            params: { id, name },
        });
    };

    const createConversation = async () => {
        if (!newUserId) {
            Alert.alert("Error", "Please enter a user ID to create a conversation.");
            return;
        }
        try {
            const response = await post<any>("/api/conversations/dm", { userId: newUserId });
            if (response) {
                Alert.alert("Success", `Conversation created with user ID ${newUserId}`);
                setNewUserId("");
                await fetchConversations();
            }
        } catch (err) {
            Alert.alert("Error", `Failed to create conversation:\n${err}`);
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" style={styles.loadingIndicator} />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <TextField
                    placeholder="Enter User ID"
                    value={newUserId}
                    onChangeText={setNewUserId}
                    customStyle={{ containerStyle: styles.textFieldContainer, inputStyle: styles.textField }}
                />
                <Button title="Create" onPress={createConversation} />
            </View>
            <FlatList
                data={conversations}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <Contact
                        imageUri={item.imageUri}
                        name={item.name}
                        latestMessage={item.latestMessage}
                        date={item.date}
                        onPress={() => handlePress(item.id, item.name)}
                        hasNewMessage={item.hasNewMessage}
                    />
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f8f8"
    },
    loadingIndicator: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    separator: {
        height: 1,
        backgroundColor: "#eee"
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        margin: 10
    },
    textFieldContainer: {
        flex: 1,
        marginRight: 10
    },
    textField: {
        height: 40,
        borderColor: "gray",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        fontSize: 16
    }
});