import { View, ScrollView, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useState, useEffect, useLayoutEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { StarRatingDisplay } from "react-native-star-rating-widget";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { GroupStackParamList } from "./stacks/groupsStack";
import { StackNavigationProp } from "@react-navigation/stack";
import useAxios from "./hooks/useAxios";
import { Ionicons } from "@expo/vector-icons";

type DisplayReviewsRouteProp = RouteProp<GroupStackParamList, "displayReviews">;
type DisplayReviewsNavigationProp = StackNavigationProp<GroupStackParamList, "displayReviews">;

export default function DisplayReviews() {
    const [reviews, setReviews] = useState<{ score: number; description: string; reviewerId: number; reviewerName?: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [averageScore, setAverageScore] = useState<number | null>(null);

    const navigation = useNavigation<DisplayReviewsNavigationProp>();
    const route = useRoute<DisplayReviewsRouteProp>();
    const { get, error } = useAxios();

    // Extract route params
    const { reviewName, reviewType, itemId } = route.params;

    useLayoutEffect(() => {
        const parent = navigation.getParent();
        parent?.setOptions({ headerShown: false });

        return () => {
            parent?.setOptions({ headerShown: false });
        };
    }, [navigation]);

    useEffect(() => {
        fetchReviews();
    }, []);

    useEffect(() => {
        if (error) {
            Alert.alert("Error", error);
        }
    }, [error]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const response = await get<any>(`/api/reviews?reviewType=${reviewType}&reviewedItemId=${itemId}`);

            if (response) {
                const fetchedReviews = response.data;

                // Fetch names for each reviewer
                const reviewsWithNames = await Promise.all(
                    fetchedReviews.map(async (review: { reviewerId: number; score: number; description: string }) => {
                        try {
                            const userResponse = await get<any>(`/api/users/user/${review.reviewerId}`);
                            const reviewerName = userResponse ? `${userResponse.data[0].firstName} ${userResponse.data[0].lastName}` : "Unknown User";
                            return { ...review, reviewerName };
                        } catch {
                            return { ...review, reviewerName: "Unknown User" };
                        }
                    })
                );

                // Calculate the average rating
                if (reviewsWithNames.length > 0) {
                    const totalScore = reviewsWithNames.reduce((acc, review) => acc + review.score, 0);
                    const avg = totalScore / reviewsWithNames.length;
                    setAverageScore(avg);
                } else {
                    setAverageScore(null);
                }

                setReviews(reviewsWithNames);
            }
        } catch (err) {
            console.error("Error fetching reviews:", err);
        } finally {
            setLoading(false);
        }
    };


    return (
        <View style={styles.root}>
            {/* Sticky Header with Back Button */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Reviews for {reviewName}</Text>
            </View>

            {/* Loading Indicator */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4a90e2" />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.container}>
                    {averageScore !== null && (
                        <View style={styles.averageScoreContainer}>
                            <Text style={styles.averageScoreText}>Average Rating</Text>
                            <StarRatingDisplay rating={averageScore} starSize={32} />
                            <Text style={styles.averageScoreValue}>{averageScore.toFixed(1)} / 5</Text>
                        </View>
                    )}
                    {reviews.length > 0 ? (
                        reviews.map((review, index) => (
                            <View key={index} style={styles.reviewCard}>
                                <Text style={styles.reviewerName}>{review.reviewerName}</Text>
                                <StarRatingDisplay rating={review.score} starSize={24} />
                                <Text style={styles.reviewText}>{review.description || "No description provided"}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noReviewsText}>No reviews available</Text>
                    )}
                </ScrollView>
            )}
        </View>
    );
}

// Styles
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
        fontSize: 20,
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
    reviewCard: {
        backgroundColor: "white",
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    reviewerName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 4,
    },
    reviewText: {
        fontSize: 16,
        marginTop: 8,
        color: "#333",
    },
    noReviewsText: {
        textAlign: "center",
        fontSize: 16,
        color: "#888",
        marginTop: 40,
        marginBottom: 40,
    },
    averageScoreContainer: {
        alignItems: "center",
        marginVertical: 20,
        backgroundColor: "white",
        padding: 15,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    averageScoreText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    averageScoreValue: {
        fontSize: 16,
        fontWeight: "600",
        color: "#555",
        marginTop: 5,
    }
});