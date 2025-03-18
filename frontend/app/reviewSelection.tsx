import { View, ScrollView, StyleSheet, Text, TextInput, Button, Pressable, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { ReviewStackParamList } from "./stacks/reviewsStack";
import { StackNavigationProp } from "@react-navigation/stack";

type ReviewScreenNavigationProp = StackNavigationProp<
  ReviewStackParamList,
  "reviewSelection"
>;

const styles = StyleSheet.create({
    textFormat: {
        fontSize: 20,
        padding: 10,
    },
    reviewSectionFormat: {
        flexDirection: "row",
    },
    reviewButtonFormat: {
        borderWidth: 1,
        width: 100,
        height: 100,
        backgroundColor: "white",
    },
    reviewTextFormat: {
        fontSize: 15
    }
});


export default function ReviewSelection() {
    //useStates to get the users that can be reviewed (memebers of the group)
    const [usersToReview, setUsersToReview] = useState([] as Array<{ name: String, userId: Number }>);
    const [houseToReview, setHouseToReview] = useState({} as { houseName: String, houseId: Number });
    //navigation variable to load the next page
    const navigation = useNavigation<ReviewScreenNavigationProp>();
    //varibale to check if we are on the given page
    const isFocused = useIsFocused();

    //useEffect to set the array of usersToReview and the houseToReview
    useEffect(() => {
        if(isFocused) {
            getGroupMembers();
            getHouseDetails();
        }
    }, [isFocused]);


    //function that returns all memeber of the house
    const getGroupMembers = async () => {
        //currently set up as a test
        setUsersToReview([{name: "Andrew", userId: 1}, {name: "Aarish", userId: 2}, {name: "Ayush", userId: 3}, {name: "Nico", userId: 4}]);
    }

    //function to get the house information
    const getHouseDetails = async () => {
        //currently hardcoded
        setHouseToReview({houseName: "My House", houseId: 1});
    }

    //function that loads the review page and sends in information for whichever item is being reviewed
    const createNewReview = (reviewName: String, reviewType: String, itemId: Number) => {
        navigation.navigate("review", { reviewName, reviewType, itemId });
    }

    return(
        <ScrollView>
            <Text style={styles.textFormat}>Users You Can Review:</Text>
            <View style={styles.reviewSectionFormat}>
                {usersToReview.map((user) => 
                    <TouchableOpacity style={styles.reviewButtonFormat}
                    key={user.name+"touchable"}
                    onPress={() => createNewReview(user.name, "user", user.userId)}>
                        <Text style={styles.reviewTextFormat} >Review For {user.name}</Text>
                    </TouchableOpacity>
                        
                    )
                }
            </View>
        </ScrollView>
    )
}