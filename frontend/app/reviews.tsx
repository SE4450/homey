import { View, ScrollView, StyleSheet, Text, TextInput, Button, Pressable, TouchableOpacity, Alert } from "react-native";
import { useState, useEffect } from "react";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import useAxios from "../app/hooks/useAxios";
import { ReviewStackParamList } from "./stacks/reviewsStack";
import useUser from "./hooks/useUser";
import StarRating from "react-native-star-rating-widget";
type ReviewScreenRouteProp = RouteProp<ReviewStackParamList, 'review'>;
//stylesheet
const styles = StyleSheet.create({
    textAreaFormat : {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        backgroundColor: "white"
    },
    headerFormat: {
        fontSize: 30,
        padding: 10
    },
    textFormat: {
        fontSize: 20,
        padding: 10,
    },
    reviewSectionFormat: {
        flexDirection: "row",
    },
    reviewButtonFormat: {
        borderWidth: 2,
        width: 100,
        height: 100,
        backgroundColor: "white",
    },
    reviewTextFormat: {
        fontSize: 15
    }
});
export default function Reviews() {
    //useState to set the review and description
    const [reviewScore, setReviewScore] = useState(0);
    const [reviewDescription, setReviewDescription] = useState("");
    //variable to navigate back to the previous page
    const navigation = useNavigation();
    //variable to make requests
    const { post, error } = useAxios();
    const { user, userLoading, userError } = useUser();
    //add a route here so that we can connect to this page from the review selector
    const route = useRoute<ReviewScreenRouteProp>();
    //use effect for if an error occurs when creating a review
    useEffect(() => {
        if(error) {
            Alert.alert("Error", error);
        }
    }, [error]);
    //function to create the review
    const createReview = async() => {
        //ensure that the score is not zero
        if(reviewScore < 0 || reviewScore > 5) {
            alert("You must enter a review that is not zero");
        }
        else {
            const body = { reviewType: route.params.reviewType, reviewedItemId: route.params.itemId, reviewerId: user.id , score: reviewScore , description: reviewDescription };
            const response = await post<any>("/api/reviews", body);
            if(response) {
                alert("Review successfully created");
                //clear out the description and the rating
                setReviewScore(0);
                setReviewDescription("");
                //re-route back to the reviews page
                navigation.goBack();
            }
        }
    }
    return(
        <ScrollView>
            <Text style={styles.headerFormat}>Creating a Review For {route.params.reviewName}</Text>
            <Text style={styles.textFormat}>Score:</Text>
            <View style={styles.reviewSectionFormat}>
                <StarRating rating={reviewScore} onChange={setReviewScore} enableHalfStar={false} />
                
            </View>
            
            <Text style={styles.textFormat}>Description:</Text>
            <TextInput style={styles.textAreaFormat} placeholder="Add a description for your review (optional)" placeholderTextColor="grey" onChangeText={text => setReviewDescription(text)}></TextInput>
            <Button title="Submit Review" onPress={() => createReview()}></Button>
        </ScrollView>
    )
}