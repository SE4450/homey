import { createStackNavigator } from "@react-navigation/stack";
import mainProfileScreen from "../mainProfileDisplay";
import editProfileScreen from "../profile";
import reviewSelectScreen from "../reviewSelection";
import displayReviewScreen from "../displayReviews";
import reviewScreen from "../reviews";

export type ReviewStackParamList = {
    mainProfile: undefined,
    editProfile: undefined,
    reviewSelection: undefined;
    displayReview: undefined;
    review: { reviewName: String, reviewType: String, itemId: Number };
};

const ReviewStack = createStackNavigator<ReviewStackParamList>();

type ReviewScreenProps = {
    groupId: string;
    role: string;
};

export default function ReviewStackScreen({ groupId, role }: ReviewScreenProps) {
    return (
        <ReviewStack.Navigator>
            <ReviewStack.Screen name="mainProfile" component={mainProfileScreen} options={{
                headerShown: false
            }} />
            <ReviewStack.Screen name="editProfile" component={editProfileScreen} options={{
                headerShown: false
            }} />
            <ReviewStack.Screen name="reviewSelection" component={reviewSelectScreen} options={{
                headerShown: false
            }} />
            <ReviewStack.Screen
                name="displayReview" component={displayReviewScreen} options={{
                    headerShown: false
                }}
            />
            <ReviewStack.Screen
                name="review" component={reviewScreen} options={{
                    headerShown: false
                }}
            />
        </ReviewStack.Navigator>
    );
}