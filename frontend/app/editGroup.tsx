import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import useAxios from "./hooks/useAxios";
import Button from "./components/button";
import { LandlordHomeStackParamList } from "./stacks/landlordHomeStack";
type EditGroupRouteProp = RouteProp<LandlordHomeStackParamList, "editGroup">;
type EditGroupNavigationProp = StackNavigationProp<LandlordHomeStackParamList, "editGroup">;
export default function EditGroupScreen() {
    const route = useRoute<EditGroupRouteProp>();
    const navigation = useNavigation<EditGroupNavigationProp>();
    const { get, put, del, error } = useAxios();
    const [groupName, setGroupName] = useState("");
    const [participants, setParticipants] = useState<any[]>([]);
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const { groupId } = route.params;
    useEffect(() => {
        fetchGroupDetails();
    }, []);
    useEffect(() => {
        if (error) {
            Alert.alert("Error", error);
        }
    }, [error]);
    const fetchGroupDetails = async () => {
        setLoading(true);
        try {
            const response = await get<any>(`/api/groups/${groupId}`);
            if (response) {
                setGroupName(response.data.name);
                setParticipants(response.data.participants);
            }
        } catch (err) {
            Alert.alert("Error", "Failed to fetch group details.");
        } finally {
            setLoading(false);
        }
    };
    const handleAddParticipant = async () => {
        if (!username.trim()) {
            Alert.alert("Error", "Please enter a username.");
            return;
        }
        const response = await get<any>(`/api/users?username=${username}`);
        if (response) {
            const user = response.data[0];
            if (!user) {
                Alert.alert("Error", "User not found.");
                return;
            }
            if (participants.some((p) => p.id === user.id)) {
                Alert.alert("Error", "User is already in the group.");
                return;
            }
            if (user.role === "landlord") {
                Alert.alert("Error", "Cannot add a landlord as a participant.");
                return;
            }
            setParticipants([...participants, user]);
        } else {
            Alert.alert("Error", "User not found.");
        }
        setUsername("");
    };
    const handleRemoveParticipant = async (userId: number) => {
        setParticipants(participants.filter((user) => user.id !== userId));
    };
    const handleUpdateGroup = async () => {
        if (!groupName.trim()) {
            Alert.alert("Error", "Group name is required.");
            return;
        }
        setUpdating(true);
        try {
            const response = await put<any>(`/api/groups/${groupId}`, {
                name: groupName,
                participants: participants.map((p) => p.id),
            });
            if (response) {
                Alert.alert("Success", "Group updated successfully!");
                navigation.goBack();
            } else {
                Alert.alert("Error", "Failed to update group.");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to update group.");
        } finally {
            setUpdating(false);
        }
    };
    const handleDeleteGroup = async () => {
        Alert.alert("Confirm Delete", "Are you sure you want to delete this group?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    setDeleting(true);
                    try {
                        const response = await del<any>(`/api/groups/${groupId}`);
                        if (response) {
                            Alert.alert("Success", "Group deleted successfully!");
                            navigation.goBack();
                        } else {
                            Alert.alert("Error", "Failed to delete group.");
                        }
                    } catch (error) {
                        Alert.alert("Error", "Failed to delete group.");
                    } finally {
                        setDeleting(false);
                    }
                },
            },
        ]);
    };
    return (
        <View style={styles.root}>
            {/* Sticky Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Edit Group</Text>
            </View>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.container}>
                    {/* Group Name Input */}
                    <Text style={styles.label}>Group Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter group name"
                        value={groupName}
                        onChangeText={setGroupName}
                    />
                    {/* Add Participants Section */}
                    <Text style={styles.label}>Add Participants</Text>
                    <View style={styles.usernameInputContainer}>
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder="Enter username"
                            value={username}
                            onChangeText={setUsername}
                        />
                        <TouchableOpacity style={styles.addButton} onPress={handleAddParticipant}>
                            <Text style={styles.addButtonText}>Add</Text>
                        </TouchableOpacity>
                    </View>
                    {/* Selected Participants List */}
                    {participants.length > 0 && (
                        <View style={styles.participantList}>
                            {participants.map((user) => (
                                <View key={user.id} style={styles.participantItem}>
                                    <Text style={styles.participantText}>
                                        {user.firstName} {user.lastName} (@{user.username})
                                    </Text>
                                    <TouchableOpacity onPress={() => handleRemoveParticipant(user.id)}>
                                        <Ionicons name="close-circle" size={20} color="red" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}
                    {/* Update Group Button */}
                    <Button text={updating ? "Updating..." : "Update Group"} onClick={handleUpdateGroup} disabled={updating} />
                    {/* Delete Group Button */}
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteGroup} disabled={deleting}>
                        <Text style={styles.deleteButtonText}>{deleting ? "Deleting..." : "Delete Group"}</Text>
                    </TouchableOpacity>
                </ScrollView>
            )}
        </View>
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        flexGrow: 1,
        padding: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
        marginTop: 10,
    },
    input: {
        backgroundColor: "white",
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    addButton: {
        backgroundColor: "#4CAF50",
        padding: 10,
        borderRadius: 6,
        justifyContent: "center",
        alignItems: "center",
    },
    addButtonText: {
        color: "white",
        fontWeight: "bold",
    },
    usernameInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 15,
    },
    participantList: {
        backgroundColor: "white",
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
    },
    participantItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    participantText: {
        fontSize: 16,
        fontWeight: "500",
    },
    deleteButton: {
        backgroundColor: "red",
        padding: 12,
        borderRadius: 6,
        alignItems: "center",
        marginTop: 20,
    },
    deleteButtonText: {
        color: "white",
        fontWeight: "bold",
    },
});