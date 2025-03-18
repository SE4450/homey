import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useAuth } from "./context/AuthContext";
import useAxios from "./hooks/useAxios";
import { useIsFocused } from "@react-navigation/native";
import useUser from "./hooks/useUser";
import { useRouter, useNavigation } from "expo-router";
import { TenantHomeStackParamList } from "./stacks/tenantHomeStack";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

type TenantHomeScreenNavigationProp = StackNavigationProp<TenantHomeStackParamList, "home">;

export default function TenantHomeScreen() {
    const [groups, setGroups] = useState<any>([]);
    const [loadingState, setLoadingState] = useState(true); // custom loading state

    const { user, userLoading, userError } = useUser();
    const { logout } = useAuth();
    const { get, error } = useAxios();
    const isFocused = useIsFocused();
    const navigation = useNavigation<TenantHomeScreenNavigationProp>();
    const router = useRouter();

    useEffect(() => {
        if (isFocused) {
            loadData();
        }
    }, [isFocused]);

    useEffect(() => {
        if (error) {
            Alert.alert("Error", error);
        }
    }, [error]);

    const loadData = async () => {
        setLoadingState(true);
        await Promise.all([fetchGroups()]);
        setLoadingState(false);
    };

    const fetchGroups = async () => {
        const response = await get<any>("/api/groups/tenant");
        if (response) {
            setGroups(response.data);
        }
    };

    const handleNavigateToSearchProperties = () => {
        navigation.navigate("propertySearchResults");
    };

    // When a group card is pressed, navigate into group details (or your group navigation screen)
    const handleNavigateToGroup = (groupId: string) => {
        router.push({ pathname: "/groupNavigation", params: { groupId, role: "tenant" } });
    };

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    if (userLoading || loadingState) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }
    if (userError) return <Text>Error: {userError}</Text>;
    if (!user) return <Text>No user found.</Text>;

    // Group the groups into rows of two
    const groupRows = [];
    for (let i = 0; i < groups.length; i += 2) {
        groupRows.push(groups.slice(i, i + 2));
    }

    return (
        <View style={styles.root}>
            {/* Sticky Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Home</Text>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                {/* Profile Section */}
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

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                <View style={styles.mainContent}>
                    {/* Search for Properties Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Search for Properties</Text>
                        <TouchableOpacity style={styles.createButton} onPress={handleNavigateToSearchProperties}>
                            <Text style={styles.buttonText}>Find a Property</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Groups Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Your Groups</Text>
                        <View style={styles.groupsGrid}>
                            {groupRows.map((row, rowIndex) => (
                                <View key={rowIndex} style={styles.groupRow}>
                                    {row.map((group: any) => (
                                        <TouchableOpacity
                                            key={group.id}
                                            style={styles.groupCard}
                                            onPress={() => handleNavigateToGroup(group.id)}
                                        >
                                            <Text style={styles.groupCardTitle}>{group.name}</Text>
                                            {group.property && group.property.exteriorImage ? (
                                                <Image
                                                    style={styles.groupPropertyImage}
                                                    source={{ uri: group.property.exteriorImage }}
                                                />
                                            ) : (
                                                <View style={styles.noImagePlaceholder}>
                                                    <Text style={styles.noImageText}>No Image</Text>
                                                </View>
                                            )}
                                            {group.property && (
                                                <View style={styles.groupPropertyDetails}>
                                                    <Text style={styles.groupPropertyName}>{group.property.name}</Text>
                                                    <Text style={styles.groupPropertyAddress}>
                                                        {group.property.address}, {group.property.city}
                                                    </Text>
                                                    {group.landlord && (
                                                        <Text style={styles.groupLandlord}>
                                                            Landlord: {group.landlord.firstName} {group.landlord.lastName}
                                                        </Text>
                                                    )}
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                    {row.length === 1 && <View style={[styles.groupCard, { width: "48%" }]} />}
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
    groupsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 15,
    },
    groupRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
    },
    groupCard: {
        backgroundColor: "#fff",
        borderRadius: 8,
        width: "48%",
        marginBottom: 15,
        elevation: 3,
        padding: 10,
        alignItems: "center",
    },
    groupCardTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    groupPropertyImage: {
        width: "100%",
        height: 150,
        borderRadius: 8,
        marginBottom: 10,
    },
    noImagePlaceholder: {
        width: "100%",
        height: 150,
        borderRadius: 8,
        backgroundColor: "#ddd",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    noImageText: {
        color: "#666",
        fontSize: 16,
    },
    groupPropertyDetails: {
        alignItems: "center",
    },
    groupPropertyName: {
        fontSize: 16,
        fontWeight: "bold",
    },
    groupPropertyAddress: {
        fontSize: 14,
        color: "#666",
    },
    groupLandlord: {
        fontSize: 14,
        color: "#666",
        marginTop: 5,
    },
    // (Properties section styles remain unchanged)
    propertiesGrid: {},
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
    propertyCity: {
        fontSize: 14,
        color: "#666",
    },
});