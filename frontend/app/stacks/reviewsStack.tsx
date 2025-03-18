import { createStackNavigator } from "@react-navigation/stack";
import reviewSelectScreen from "../reviewSelection";
import reviewScreen from "../reviews";

export type ReviewStackParamList = {
    reviewSelection: undefined;
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
            <ReviewStack.Screen name="reviewSelection" component={reviewSelectScreen} options={{
                headerShown: false
            }} />
            <ReviewStack.Screen
                name="review" component={reviewScreen} options={{
                    headerShown: false
                }}
            />
        </ReviewStack.Navigator>
    );
}