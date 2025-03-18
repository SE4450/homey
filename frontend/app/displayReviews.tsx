import { View, ScrollView, StyleSheet, Text, TextInput, Button, Pressable, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { StarRatingDisplay } from "react-native-star-rating-widget";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { ReviewStackParamList } from "./stacks/reviewsStack";
import { StackNavigationProp } from "@react-navigation/stack";
import useAxios from "./hooks/useAxios";

type ReviewScreenNavigationProp = StackNavigationProp<
  ReviewStackParamList,
  "displayReview"
>;

const COLORS = {
    PRIMARY: "#4a90e2",
    SECONDARY: "#FF9800",
    WHITE: "#FFFFFF",
    BLACK: "#000000",
    TEXT: "#333333",
    LIGHT_GRAY: "#F5F5F5",
    LOGOUT: "#D32F2F",
  };

const styles = StyleSheet.create({
    viewFormat: {
        alignItems: "center",
    },
    descriptionFormat: {
        fontSize: 20,
        padding: 5
    },
    starAreaFormat: {
        padding: 5
    },
    reviewAreaFormat: {
        backgroundColor: COLORS.WHITE,
        borderRadius: 10,
        margin: 15,
        shadowColor: COLORS.BLACK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        width: 300,
        height: 80,
        alignItems: "center",
    },
    emptyListMessage: {
        textAlign: "center",
        fontSize: 16,
        color: "#888",
        marginTop: 40,
        marginBottom: 40,
      },
});

export default function DisplayReviews() {
    const [yourReviews, setYourReviews] = useState([] as Array<{score: number, description: String}>);
    const { get } = useAxios();
    const { userId } = useAuth();
    const isFocused = useIsFocused();

    //need a useEffect to get your reviews
    useEffect(() => {
        if(isFocused) {
            getUserReviews();
        }
    }, [isFocused]);


    //function to get the reviews
    const getUserReviews = async () => {
        const response = await get<any>(`/api/reviews?reviewType=user&reviewedItemId=${userId}`);

        if(response){
            setYourReviews([]);
            response.data.forEach((review: { score: number, description: String}) => {
                setYourReviews(r => [...r, { score: review.score, description: review.description }]);
            });
        }
    }


    return(
        <ScrollView>
            <View style={styles.viewFormat}>
                { yourReviews.length > 0 ? (
                    yourReviews.map((item, index) =>
                        <View key={"viewnode_row" + index} style={styles.reviewAreaFormat}>
                            <StarRatingDisplay key={"star_node" + index} style={styles.starAreaFormat} rating={item.score} starSize={32}/>
                            <Text key={"descriptionReview" + index} style={styles.descriptionFormat}>{item.description}</Text>
                        </View>
                    )
                ) : (
                    <Text style={styles.emptyListMessage}>There are no Reviews for this user yet</Text>
                )}
            </View>
        </ScrollView>
    );
}