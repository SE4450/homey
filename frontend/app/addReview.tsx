import { View, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useState, useEffect, useLayoutEffect } from "react";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import useAxios from "../app/hooks/useAxios";
import { GroupStackParamList } from "./stacks/groupsStack";
import useUser from "./hooks/useUser";
import StarRating from "react-native-star-rating-widget";
import { Ionicons } from "@expo/vector-icons";

type AddReviewScreenRouteProp = RouteProp<GroupStackParamList, "addReview">;

export default function AddReviewScreen() {
    // State for review data
    const [reviewScore, setReviewScore] = useState(0);
    const [reviewDescription, setReviewDescription] = useState("");

    // Navigation and API calls
    const navigation = useNavigation();
    const { post, error } = useAxios();
    const { user, userLoading, userError } = useUser();

    // Retrieve parameters from route
    const route = useRoute<AddReviewScreenRouteProp>();
    const { reviewType, itemId, reviewName } = route.params;

    useLayoutEffect(() => {
        const parent = navigation.getParent();
        parent?.setOptions({ headerShown: false });

        return () => {
            parent?.setOptions({ headerShown: false });
        };
    }, [navigation]);

    // Show errors if any occur
    useEffect(() => {
        if (error) {
            Alert.alert("Error", error);
        }
    }, [error]);

    // Function to submit review
    const createReview = async () => {
        if (reviewScore <= 0 || reviewScore > 5) {
            Alert.alert("Invalid Score", "Please select a score between 1 and 5.");
            return;
        }

        const reviewData = {
            reviewType,
            reviewedItemId: itemId,
            reviewerId: user.id,
            score: reviewScore,
            description: reviewDescription,
        };

        const response = await post("/api/reviews", reviewData);

        if (response) {
            Alert.alert("Success", "Review successfully created!");
            setReviewScore(0);
            setReviewDescription("");
            navigation.goBack();
        }
    };

    return (
        <View style={styles.root}>
            {/* Sticky Header with Back Button */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Write a Review</Text>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Review for {reviewName}</Text>

                <Text style={styles.label}>Score:</Text>
                <View style={styles.reviewSection}>
                    <StarRating rating={reviewScore} onChange={setReviewScore} enableHalfStar={false} />
                </View>

                <Text style={styles.label}>Description:</Text>
                <TextInput
                    style={styles.textArea}
                    placeholder="Add a description for your review (optional)"
                    placeholderTextColor="grey"
                    onChangeText={setReviewDescription}
                    multiline
                />

                <TouchableOpacity style={styles.submitButton} onPress={createReview}>
                    <Text style={styles.submitButtonText}>Submit Review</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

// Stylesheet
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
        paddingRight: 35, // Ensures title is centered when back button exists
    },
    container: {
        flexGrow: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        paddingBottom: 10,
        textAlign: "center",
    },
    label: {
        fontSize: 18,
        marginTop: 10,
    },
    reviewSection: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    textArea: {
        height: 100,
        margin: 12,
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        backgroundColor: "white",
        borderRadius: 6,
    },
    submitButton: {
        backgroundColor: "#4CAF50",
        padding: 12,
        borderRadius: 6,
        alignItems: "center",
        marginTop: 15,
    },
    submitButtonText: {
        color: "white",
        fontWeight: "600",
        fontSize: 16,
    },
});