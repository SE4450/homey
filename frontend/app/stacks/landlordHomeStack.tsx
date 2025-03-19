import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import LandlordHomeScreen from "../landlordHome";
import AddPropertyScreen from "../addProperty";
import AddPropertyImagesScreen from "../addPropertyImages";
import ViewEditPropertyScreen from "../viewEditProperty";
import AddEditPropertyImageScreen from "../addEditPropertyImage";
import AddGroupScreen from "../addGroup";
import EditGroupScreen from "../editGroup";
export type LandlordHomeStackParamList = {
    home: undefined;
    addProperty: undefined;
    addPropertyImages: { propertyData: object };
    viewEditProperty: { propertyId: string };
    addEditPropertyImage: { propertyId: string; imageData?: object; mode: string };
    addGroup: undefined;
    editGroup: { groupId: string };
};
const LandlordHomeStack = createStackNavigator<LandlordHomeStackParamList>();
export default function LandlordHomeStackScreen() {
    return (
        <NavigationContainer>
            <LandlordHomeStack.Navigator screenOptions={{ headerShown: false }}>
                <LandlordHomeStack.Screen name="home" component={LandlordHomeScreen} />
                <LandlordHomeStack.Screen name="addProperty" component={AddPropertyScreen} />
                <LandlordHomeStack.Screen name="addPropertyImages" component={AddPropertyImagesScreen} />
                <LandlordHomeStack.Screen name="viewEditProperty" component={ViewEditPropertyScreen} />
                <LandlordHomeStack.Screen name="addEditPropertyImage" component={AddEditPropertyImageScreen} />
                <LandlordHomeStack.Screen name="addGroup" component={AddGroupScreen} />
                <LandlordHomeStack.Screen name="editGroup" component={EditGroupScreen} />
            </LandlordHomeStack.Navigator>
        </NavigationContainer>
    );
}