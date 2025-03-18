import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useAuth } from "./context/AuthContext";
import useAxios from "./hooks/useAxios";
import { useIsFocused } from "@react-navigation/native";
import useUser from "./hooks/useUser";
import { useRouter, useNavigation } from "expo-router";
import { TenantHomeStackParamList } from "./stacks/tenantHomeStack";
import { StackNavigationProp } from "@react-navigation/stack";

type TenantHomeScreenNavigationProp = StackNavigationProp<TenantHomeStackParamList, "home">;

export default function TenantHomeScreen() {
    const [groups, setGroups] = useState<any>([]);
    const [loading, setLoading] = useState(true);
    const { user, userLoading, userError } = useUser();
    const { logout } = useAuth();
    const { get, error } = useAxios();
    const isFocused = useIsFocused();
    const navigation = useNavigation<TenantHomeScreenNavigationProp>();
    const router = useRouter();

    useEffect(() => {
        if (isFocused) {
            fetchGroups();
            setLoading(false);
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

    const handleNavigateToSearchProperties = () => {
        navigation.navigate("propertySearchResults");
    };

    const handleNavigateToGroup = (groupId: string) => {
        router.push("/groupNavigation");
    };

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    if (userLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (userError) return <Text>Error: {userError}</Text>;
    if (!user) return <Text>No user found.</Text>;

    return (
        <View style={styles.root}>
            {/* Sticky Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Home</Text>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.profileSection}>
                    <Image
                        style={styles.profileImage}
                        source={{
                            uri: "https://www.gravatar.com/avatar/00000000000000000000000000000000?s=200&d=mp",
                        }}
                    />
                    <View style={styles.profileInfo}>
                        <Text style={styles.welcomeText}>Welcome {user.firstName}, {user.lastName}</Text>
                        <Text style={styles.emailText}>{user.email}</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                <View style={styles.mainContent}>
                    {/* Search for Properties */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Search for Properties</Text>
                        <TouchableOpacity style={styles.createButton} onPress={handleNavigateToSearchProperties}>
                            <Text style={styles.buttonText}>Find a Property</Text>
                        </TouchableOpacity>
                    </View>

                    {/* View Groups */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Your Groups</Text>
                        <View style={styles.groupsList}>
                            {groups.length > 0 ? (
                                groups.map((group: any) => (
                                    <TouchableOpacity
                                        key={group.id}
                                        style={styles.groupItem}
                                        onPress={() => handleNavigateToGroup(group.id)}
                                    >
                                        <Text style={styles.groupName}>{group.name}</Text>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <Text style={styles.noGroupsText}>You are not in any groups.</Text>
                            )}
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
    header: {
        backgroundColor: "white",
        paddingTop: 50,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        elevation: 3,
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "bold",
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
    profileSection: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        padding: 20,
        borderRadius: 8,
        marginBottom: 20,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
    },
    profileInfo: {
        flex: 1,
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
        padding: 15,
        backgroundColor: "#f9f9f9",
        borderRadius: 6,
        textAlign: "center",
    },
    groupName: {
        fontSize: 16,
        fontWeight: "500",
        textAlign: "center",
    },
    noGroupsText: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
    },
});