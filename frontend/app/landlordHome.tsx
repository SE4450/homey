import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useAuth } from "./context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import useAxios from "./hooks/useAxios";
import { useIsFocused } from "@react-navigation/native";
import useUser from "./hooks/useUser";
import { useRouter } from "expo-router";
import { LandlordHomeStackParamList } from "./stacks/landlordHomeStack";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

type LandlordHomeScreenNavigationProp = StackNavigationProp<LandlordHomeStackParamList, "home">;

export default function LandlordHomeScreen() {
    const [groups, setGroups] = useState<any>([]);
    const [properties, setProperties] = useState<any>([]);
    const { user, userLoading, userError } = useUser();
    const { logout } = useAuth();
    const { get, error, loading } = useAxios();
    const isFocused = useIsFocused();
    const navigation = useNavigation<LandlordHomeScreenNavigationProp>();
    const router = useRouter();

    useEffect(() => {
        if (isFocused) {
            fetchGroups();
            fetchProperties();
        }
    }, [isFocused]);

    useEffect(() => {
        if (error) {
            Alert.alert("Error", error);
        }
    }, [error]);

    const fetchGroups = async () => {
        const response = await get<any>("/api/groups");
        if (response) {
            setGroups(response.data);
        }
    };

    const fetchProperties = async () => {
        const response = await get<any>("/api/properties");
        if (response) {
            setProperties(response.data);
        }
    };

    const handleNavigateToAddProperty = () => {
        navigation.navigate("addProperty");
    };

    const handleNavigateToEditProperty = (propertyId: string) => {
        navigation.navigate("viewEditProperty", { propertyId });
    };

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (userError) return <Text>Error: {userError}</Text>;
    if (!user) return <Text>No user found.</Text>;

    // Group properties into rows of two
    const propertyRows = [];
    for (let i = 0; i < properties.length; i += 2) {
        propertyRows.push(properties.slice(i, i + 2));
    }

    return (
        <View style={styles.root}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <View style={styles.profileSection}>
                        <Image
                            style={styles.profileImage}
                            source={{
                                uri: "https://www.gravatar.com/avatar/00000000000000000000000000000000?s=200&d=mp",
                            }}
                        />
                        <View style={styles.profileInfo}>
                            <Text style={styles.welcomeText}>
                                Welcome {user.firstName}, {user.lastName}
                            </Text>
                            <Text style={styles.emailText}>{user.email}</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                <View style={styles.mainContent}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Manage Groups</Text>
                        <TouchableOpacity style={styles.createButton} onPress={handleNavigateToAddProperty}>
                            <Text style={styles.buttonText}>Create New Group</Text>
                        </TouchableOpacity>

                        <View style={styles.groupsList}>
                            {groups.map((group: any) => (
                                <View key={group.id} style={styles.groupItem}>
                                    <Text style={styles.groupName}>{group.name}</Text>
                                    <View style={styles.groupButtons}>
                                        <TouchableOpacity style={styles.editButton}>
                                            <Text style={styles.buttonText}>Edit</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.deleteButton}>
                                            <Text style={styles.buttonText}>Delete</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Manage Properties</Text>
                        <TouchableOpacity style={styles.createButton} onPress={handleNavigateToAddProperty}>
                            <Text style={styles.buttonText}>Create New Property</Text>
                        </TouchableOpacity>

                        {/* Render properties in rows */}
                        <View style={styles.propertiesGrid}>
                            {propertyRows.map((row, rowIndex) => (
                                <View key={rowIndex} style={styles.propertyRow}>
                                    {row.map((property: any) => (
                                        <View key={property.id} style={styles.propertyCard}>
                                            <Image style={styles.propertyImage} source={{ uri: property.exteriorImage }} />
                                            <View style={styles.propertyDetails}>
                                                <Text style={styles.propertyName}>{property.name}</Text>
                                                <Text style={styles.propertyAddress}>{property.address}</Text>
                                                <TouchableOpacity style={styles.editButton} onPress={() => handleNavigateToEditProperty(property.id)}>
                                                    <Text style={styles.buttonText}>View/Edit Details</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ))}
                                    {/* If the row has only one property, render an empty view to occupy the other half */}
                                    {row.length === 1 && <View style={[styles.propertyCard, { width: "48%" }]} />}
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
    },
    container: {
        flexGrow: 1,
        padding: 16,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        backgroundColor: "white",
        borderRadius: 8,
        marginBottom: 20,
    },
    profileSection: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    profileInfo: {
        gap: 5,
    },
    welcomeText: {
        fontSize: 18,
        fontWeight: "bold",
    },
    emailText: {
        fontSize: 14,
        color: "#666",
    },
    logoutButton: {
        backgroundColor: "#ff4444",
        padding: 10,
        borderRadius: 6,
        marginBottom: 20,
        alignSelf: "center",
        minWidth: 100,
        alignItems: "center",
    },
    logoutText: {
        color: "white",
        fontWeight: "600",
    },
    mainContent: {
        gap: 20,
    },
    section: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 8,
        elevation: 3,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
    },
    createButton: {
        backgroundColor: "#4CAF50",
        padding: 12,
        borderRadius: 6,
        alignItems: "center",
        marginBottom: 15,
    },
    buttonText: {
        color: "white",
        fontWeight: "600",
    },
    groupsList: {
        gap: 10,
    },
    groupItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 15,
        backgroundColor: "#f9f9f9",
        borderRadius: 6,
    },
    groupName: {
        fontSize: 16,
        fontWeight: "500",
    },
    groupButtons: {
        flexDirection: "row",
        gap: 10,
    },
    editButton: {
        backgroundColor: "#2196F3",
        padding: 8,
        borderRadius: 6,
        alignItems: "center",
    },
    deleteButton: {
        backgroundColor: "#ff4444",
        padding: 8,
        borderRadius: 6,
        alignItems: "center",
    },
    propertiesGrid: {
        // Using our grouped rows approach; rows are handled in propertyRow
    },
    propertyRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
    },
    propertyCard: {
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        overflow: "hidden",
        width: "48%",
        marginBottom: 15,
    },
    propertyImage: {
        width: "100%",
        height: 150,
    },
    propertyDetails: {
        padding: 15,
        gap: 8,
    },
    propertyName: {
        fontSize: 16,
        fontWeight: "600",
    },
    propertyAddress: {
        fontSize: 14,
        color: "#666",
    },
});