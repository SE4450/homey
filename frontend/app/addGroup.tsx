import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Picker } from "@react-native-picker/picker";
import useAxios from "./hooks/useAxios";
import Button from "./components/button";
import { Ionicons } from "@expo/vector-icons";
import { LandlordHomeStackParamList } from "./stacks/landlordHomeStack";

type AddGroupNavigationProp = StackNavigationProp<LandlordHomeStackParamList, "addGroup">;

export default function AddGroupScreen() {
    const navigation = useNavigation<AddGroupNavigationProp>();
    const { get, post, error } = useAxios();

    const [groupName, setGroupName] = useState("");
    const [properties, setProperties] = useState<any[]>([]);
    const [selectedProperty, setSelectedProperty] = useState("");
    const [selectedPropertyRooms, setSelectedPropertyRooms] = useState<number | null>(null);
    const [username, setUsername] = useState("");
    const [participants, setParticipants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchProperties();
    }, []);

    useEffect(() => {
        if (error) {
            //Alert.alert("Error", error);
        }
    }, [error]);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const response = await get<any>("/api/properties");
            if (response) {
                setProperties(response.data);
                if (response.data.length > 0) {
                    setSelectedProperty(response.data[0].id);
                    setSelectedPropertyRooms(response.data[0].bedrooms);
                }
            }
        } catch (err) {
            //Alert.alert("Error", "Failed to fetch properties.");
        } finally {
            setLoading(false);
        }
    };

    const handlePropertyChange = (propertyId: string) => {
        const property = properties.find((p) => p.id == propertyId);
        setSelectedProperty(propertyId);
        setSelectedPropertyRooms(property?.bedrooms ?? null);
        setParticipants([]); // Reset participants list when switching properties
    };

    const handleAddParticipant = async () => {
        if (!username.trim()) {
            //Alert.alert("Error", "Please enter a username.");
            return;
        }

        if (selectedPropertyRooms !== null && participants.length >= selectedPropertyRooms) {
            Alert.alert("Error", `This property has a limit of ${selectedPropertyRooms} tenants.`);
            return;
        }

        const response = await get<any>(`/api/users?username=${username}`);
        if (response) {
            if (participants.some((user) => user.id == response.data[0].id)) {
                Alert.alert("Error", "User is already added.");
            } else if (response.data[0].role == "landlord") {
                Alert.alert("Error", "Cannot add user of type landlord");
            } else {
                setParticipants([...participants, response.data[0]]);
            }
        } else {
            Alert.alert("Error", "User not found.");
        }
        setUsername("");
    };

    const handleRemoveParticipant = (userId: number) => {
        setParticipants(participants.filter((user) => user.id !== userId));
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            Alert.alert("Error", "Group name is required.");
            return;
        }
        if (!selectedProperty) {
            Alert.alert("Error", "Please select a property.");
            return;
        }
        if (participants.length === 0) {
            Alert.alert("Error", "Please add at least one participant.");
            return;
        }

        setCreating(true);

        try {
            const response = await post<any>("/api/groups", {
                name: groupName,
                propertyId: selectedProperty,
                tenantIds: participants.map((user) => user.id),
            });

            if (response) {
                Alert.alert("Success", "Group created successfully!");
                navigation.goBack();
            } else {
                Alert.alert("Error", "Failed to create group.");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to create group.");
        } finally {
            setCreating(false);
        }
    };

    return (
        <View style={styles.root}>
            {/* Sticky Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Create Group</Text>
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

                    {/* Property Selector */}
                    <Text style={styles.label}>Select Property</Text>
                    <Picker
                        selectedValue={selectedProperty}
                        onValueChange={handlePropertyChange}
                        style={styles.picker}
                    >
                        {properties.map((property) => (
                            <Picker.Item key={property.id} label={property.name} value={property.id} />
                        ))}
                    </Picker>

                    {/* Add Participants Section */}
                    <Text style={styles.label}>
                        Add Participants ({selectedPropertyRooms !== null ? `Max: ${selectedPropertyRooms}` : "Select a property first"})
                    </Text>
                    <View style={styles.usernameInputContainer}>
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder="Enter username"
                            value={username}
                            onChangeText={setUsername}
                            editable={selectedProperty !== ""}
                        />
                        <TouchableOpacity
                            style={[styles.addButton, selectedProperty === "" && { backgroundColor: "#ccc" }]}
                            onPress={handleAddParticipant}
                            disabled={selectedProperty === ""}
                        >
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

                    {/* Create Group Button */}
                    <Button text={creating ? "Creating..." : "Create Group"} onClick={handleCreateGroup} disabled={creating} />
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#f5f5f5"
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
        paddingLeft: 15
    },
    headerText: {
        fontSize: 22,
        fontWeight: "bold",
        flex: 1,
        textAlign: "center",
        paddingRight: 35
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    container: {
        flexGrow: 1,
        padding: 16
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 5,
        marginBottom: 5
    },
    input: {
        backgroundColor: "white",
        padding: 10,
        alignItems: "center",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
        marginBottom: 0,
    },
    picker: {
        backgroundColor: "transparent",
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 10,
        height: 200,
    },
    usernameInputContainer: {
        flexDirection: "row",
        alignItems: "center", // Ensures vertical centering
        gap: 10,
        marginBottom: 15,
        backgroundColor: "white",
        padding: 10,  // Added padding for better spacing
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    addButton: {
        backgroundColor: "#4CAF50",
        paddingVertical: 10, // Ensures vertical padding
        paddingHorizontal: 15,
        borderRadius: 6,
        justifyContent: "center", // Centers text vertically
        alignItems: "center", // Centers text horizontally
        height: 40, // Make sure it matches the input height
    },
    addButtonText: {
        color: "white",
        fontWeight: "bold"
    },
    participantList: {
        backgroundColor: "white",
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
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
});