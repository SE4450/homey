import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import useAxios from "./hooks/useAxios";
import useUser from "./hooks/useUser";
import { GroupStackParamList } from "./stacks/groupsStack";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAuth } from "./context/AuthContext";

type GroupNavigationProp = StackNavigationProp<GroupStackParamList, "groups">;

export default function GroupProfileScreen({ groupId, role }: any) {
    const navigation = useNavigation<GroupNavigationProp>();
    const { get, error } = useAxios();
    const { user, userLoading, userError } = useUser();
    const { userId } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [roommates, setRoommates] = useState<any[]>([]);
    const [landlord, setLandlord] = useState<any>(null);
    const [property, setProperty] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [userAverageRating, setUserAverageRating] = useState<number | null>(null);
    const [roommateRatings, setRoommateRatings] = useState<{ [key: number]: number }>({});
    const [landlordRating, setLandlordRating] = useState<number | null>(null);
    const [propertyRating, setPropertyRating] = useState<number | null>(null);
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            fetchData();
        }
    }, [isFocused]);

    useEffect(() => {
        if (error) {
            //Alert.alert("Error", error);
        }
    }, [error]);

    const fetchAverageRating = async (reviewType: string, itemId: any) => {
        try {
            const response = await get<any>(`/api/reviews?reviewType=${reviewType}&reviewedItemId=${itemId}`);
            if (response.data.length > 0) {
                const totalScore = response.data.reduce((acc: number, review: any) => acc + review.score, 0);
                return totalScore / response.data.length;
            }
            return null;
        } catch (error) {
            return null;
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const profileResponse = await get<any>(`/api/profile/${groupId}?userId=${userId}`);
            const roommatesResponse = await get<any>(`/api/groups/${groupId}/participants`);
            const landlordResponse = await get<any>(`/api/groups/${groupId}/landlord`);
            const propertyResponse = await get<any>(`/api/groups/${groupId}/property`);

            if (profileResponse) setProfile(profileResponse.data[0]);
            if (landlordResponse) setLandlord(landlordResponse.data);
            if (propertyResponse) setProperty(propertyResponse.data);

            // Fetch User Average Rating
            const userRating = await fetchAverageRating("user", userId);
            setUserAverageRating(userRating);

            if (roommatesResponse) {
                const filteredRoommates = roommatesResponse.data.filter((r: any) => r.id !== userId);
                const roommateProfiles = await Promise.all(
                    filteredRoommates.map(async (roommate: any) => {
                        const profileRes = await get<any>(`/api/profile/${groupId}?userId=${roommate.id}`);
                        const rating = await fetchAverageRating("user", roommate.id);
                        return profileRes ? { ...roommate, profile: profileRes.data[0], rating } : null;
                    })
                );

                setRoommates(roommateProfiles);
            }

            if (landlordResponse) {
                const landlordRating = await fetchAverageRating("user", landlordResponse.data.id);
                setLandlordRating(landlordRating);
            }

            if (propertyResponse) {
                const propertyRating = await fetchAverageRating("property", propertyResponse.data.id);
                setPropertyRating(propertyRating);
            }

        } catch (err) {
            console.log(err);
            Alert.alert("Error", "Failed to fetch group details.");
        } finally {
            setLoading(false);
        }
    };


    if (loading || userLoading) {
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
                <Text style={styles.headerText}>Group</Text>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                {profile && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>👤 Your Profile</Text>
                        <Text style={styles.infoText}>📛 {user.firstName} {user.lastName}</Text>
                        <Text style={styles.infoText}>🆔 {user.username}</Text>
                        <Text style={styles.infoText}>📧 {user.email}</Text>
                        <Text style={styles.infoText}>⚖️ Cleanliness: {profile.cleaningHabits || "N/A"}</Text>
                        <Text style={styles.infoText}>🔇 Noise Level: {profile.noiseLevel || "N/A"}</Text>
                        <Text style={styles.infoText}>💤 Sleep Start: {profile.sleepStart || "N/A"}</Text>
                        <Text style={styles.infoText}>⏰ Sleep End: {profile.sleepEnd || "N/A"}</Text>
                        <Text style={styles.infoText}>🤧 Allergies: {profile.alergies || "N/A"}</Text>
                        <Text style={styles.infoText}>⭐ {userAverageRating ? `${userAverageRating.toFixed(1)} / 5` : "No Ratings Yet"}</Text>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Profile")}>
                                <Text style={styles.buttonText}>Edit Profile</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("displayReviews", { reviewName: `${user.firstName} ${user.lastName}`, reviewType: "user", itemId: userId })}>
                                <Text style={styles.buttonText}>View Reviews</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Roommates / Tenants Section */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{role === "landlord" ? "🏠 Tenants" : "🏠 Roommates"}</Text>
                    {roommates.length > 0 ? (
                        roommates.map((roommate) => (
                            <View key={roommate.id} style={styles.roommateItem}>
                                <Text style={styles.infoText}>📛 {roommate.firstName} {roommate.lastName}</Text>
                                <Text style={styles.infoText}>🆔 {roommate.username}</Text>
                                <Text style={styles.infoText}>📧 {roommate.email}</Text>
                                <Text style={styles.infoText}>⚖️ Cleanliness: {roommate.profile.cleaningHabits || "N/A"}</Text>
                                <Text style={styles.infoText}>🔇 Noise Level: {roommate.profile.noiseLevel || "N/A"}</Text>
                                <Text style={styles.infoText}>💤 Sleep Start: {roommate.profile.sleepStart || "N/A"}</Text>
                                <Text style={styles.infoText}>⏰ Sleep End: {roommate.profile.sleepEnd || "N/A"}</Text>
                                <Text style={styles.infoText}>🤧 Allergies: {roommate.profile.alergies || "N/A"}</Text>
                                <Text style={styles.infoText}>⭐ {roommate.rating ? `${roommate.rating.toFixed(1)} / 5` : "No Ratings Yet"}</Text>
                                <View style={styles.buttonRow}>
                                    <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("displayReviews", { reviewName: `${roommate.firstName} ${roommate.lastName}`, reviewType: "user", itemId: roommate.id })}>
                                        <Text style={styles.buttonText}>View Reviews</Text>
                                    </TouchableOpacity>
                                    {/* ✅ Everyone can leave reviews for roommates/tenants */}
                                    <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("addReview", { reviewName: `${roommate.firstName} ${roommate.lastName}`, reviewType: "user", itemId: roommate.id })}>
                                        <Text style={styles.buttonText}>Leave Review</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.infoText}>No {role === "landlord" ? "tenants" : "roommates"} found.</Text>
                    )}
                </View>

                {/* Landlord Profile */}
                {landlord && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>👨‍💼 Landlord</Text>
                        <Text style={styles.infoText}>📛 {landlord.firstName} {landlord.lastName}</Text>
                        <Text style={styles.infoText}>🆔 {landlord.username}</Text>
                        <Text style={styles.infoText}>📧 {landlord.email}</Text>
                        <Text style={styles.infoText}>⭐ {landlordRating ? `${landlordRating.toFixed(1)} / 5` : "No Ratings Yet"}</Text>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("displayReviews", { reviewName: `${landlord.firstName} ${landlord.lastName}`, reviewType: "user", itemId: landlord.id })}>
                                <Text style={styles.buttonText}>View Reviews</Text>
                            </TouchableOpacity>
                            {/* ✅ Tenants can leave reviews for the landlord */}
                            {role === "tenant" && (
                                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("addReview", { reviewName: `${landlord.firstName} ${landlord.lastName}`, reviewType: "user", itemId: landlord.id })}>
                                    <Text style={styles.buttonText}>Leave Review</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}

                {/* Property Info */}
                {property && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>🏡 Property</Text>
                        <Image source={{ uri: property.exteriorImage }} style={styles.propertyImage} />
                        <Text style={styles.infoText}>📍 {property.name}</Text>
                        <Text style={styles.infoText}>🏙 {property.city}</Text>
                        <Text style={styles.infoText}>📌 {property.address}</Text>
                        <Text style={styles.infoText}>⭐ {propertyRating ? `${propertyRating.toFixed(1)} / 5` : "No Ratings Yet"}</Text>
                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("displayReviews", { reviewName: `${property.name}`, reviewType: "property", itemId: property.id })}>
                                <Text style={styles.buttonText}>View Reviews</Text>
                            </TouchableOpacity>
                            {/* ✅ Tenants can review properties, but landlords cannot */}
                            {role === "tenant" && (
                                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("addReview", { reviewName: `${property.name}`, reviewType: "property", itemId: property.id })}>
                                    <Text style={styles.buttonText}>Leave Review</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}
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
    headerText: {
        fontSize: 22,
        fontWeight: "bold",
    },
    container: {
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        backgroundColor: "white",
        padding: 16,
        borderRadius: 10,
        elevation: 3,
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8,
    },
    infoText: {
        fontSize: 16,
        marginBottom: 4,
    },
    roommateItem: {
        backgroundColor: "#f5f5f5",
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    button: {
        backgroundColor: "#4CAF50",
        padding: 10,
        borderRadius: 6,
        alignItems: "center",
        flex: 1,
        marginHorizontal: 5,
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
    },
    propertyImage: {
        width: "100%",
        height: 400,
        borderRadius: 8,
        marginVertical: 10,
    },
});