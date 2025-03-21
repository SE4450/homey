import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  Text,
} from "react-native";
import Contact from "./components/contact";
import useAxios from "./hooks/useAxios";
import { useAuth } from "./context/AuthContext";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { MessageStackParamList } from "./stacks/messagesStack";
import { StackNavigationProp } from "@react-navigation/stack";

type ContactsScreenNavigationProp = StackNavigationProp<
  MessageStackParamList,
  "contacts"
>;

type ContactScreenProps = {
  groupId: string;
  role: string;
};

export default function ContactsScreen({ groupId, role }: ContactScreenProps) {
  const navigation = useNavigation<ContactsScreenNavigationProp>();
  const [conversations, setConversations] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [newUserId, setNewUserId] = useState("");
  const { get, post, error } = useAxios();
  const { userId } = useAuth();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
    }
  }, [error]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await get<any>(`/api/conversations/${groupId}`);
      if (response) {
        const formattedConversations = response.data.map(
          (conversation: any) => {
            const latestMessage = conversation.messages[0] || null;
            const hasNewMessage =
              latestMessage &&
              latestMessage.senderId !== userId &&
              !latestMessage.readBy?.includes(userId);

            return {
              id: conversation.id,
              name: conversation.participants
                .filter((p: any) => p.userId !== userId)
                .map((p: any) => {
                  if (conversation.type == "group") {
                    if (
                      conversation.participants.some(
                        (participant: any) =>
                          participant.role === "landlord"
                      ) &&
                      conversation.participants.length > 2
                    ) {
                      return "Tenants and Landlord Groupchat";
                    } else {
                      return "Tenants Groupchat";
                    }
                  } else {
                    return `${p.users.firstName} ${p.users.lastName}`;
                  }
                })
                .slice(0, 1)
                .join(", "),
              latestMessage: latestMessage?.content || "No messages yet",
              date: new Date(
                latestMessage?.createdAt || Date.now()
              ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              type: conversation.type,
              imageUri:
                conversation.participants[0]?.user?.profilePicture ||
                "https://www.gravatar.com/avatar/00000000000000000000000000000000?s=200&d=mp",
              hasNewMessage,
            };
          }
        );
        setConversations(formattedConversations);
      }
    } catch (err) {
      Alert.alert(
        "Error",
        `Failed to fetch conversations for reason:\n\n${err}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (isFocused) {
      fetchConversations();
      intervalId = setInterval(fetchConversations, 5000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isFocused]);

  const handlePress = (id: any, name: any, type: any) => {
    navigation.navigate("conversation", { id, name, type });
  };

  const createConversation = async () => {
    if (!newUserId) {
      Alert.alert("Error", "Please enter a user ID to create a conversation.");
      return;
    }
    try {
      const response = await post<any>("/api/conversations/dm", {
        userId: newUserId,
      });
      if (response) {
        Alert.alert(
          "Success",
          `Conversation created with user ID ${newUserId}`
        );
        setNewUserId("");
        await fetchConversations();
      }
    } catch (err) {
      Alert.alert("Error", `Failed to create conversation:\n${err}`);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Contacts</Text>
      </View>

      <View style={styles.container}>
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Contact
              imageUri={item.imageUri}
              name={item.name}
              latestMessage={item.latestMessage}
              date={item.date}
              onPress={() => handlePress(item.id, item.name, item.type)}
              hasNewMessage={item.hasNewMessage}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f8f8f8",
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
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  container: {
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
  },
});