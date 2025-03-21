import { NavigationIndependentTree } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import GroupProfileScreen from "../groupProfileScreen";
import AddReviewScreen from "../addReview";
import DisplayReviews from "../displayReviews";
import Profile from "../profile";

export type GroupStackParamList = {
    groups: undefined,
    displayReviews: { reviewName: String, reviewType: String, itemId: any };
    addReview: { reviewName: String, reviewType: String, itemId: any };
    profile: undefined,
};

const GroupStack = createStackNavigator<GroupStackParamList>();

type GroupScreenProps = {
    groupId: string;
    role: string;
};

export default function GroupStackScreen({ groupId, role }: GroupScreenProps) {
    return (
        <GroupStack.Navigator>
            <GroupStack.Screen name="groups" component={() => GroupProfileScreen({ groupId, role })} options={{
                headerShown: false
            }} />
            <GroupStack.Screen name="addReview" component={AddReviewScreen} options={{
                headerShown: false
            }} />
            <GroupStack.Screen name="displayReviews" component={DisplayReviews} options={{
                headerShown: false
            }} />
            <GroupStack.Screen name="profile" component={() => Profile({ groupId, role })} options={{
                headerShown: false
            }} />
        </GroupStack.Navigator>
    );
}