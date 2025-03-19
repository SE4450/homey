import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import LandlordHomeScreen from "../landlordHome";
import AddPropertyScreen from "../addProperty"
import AddPropertyImagesScreen from "../addPropertyImages";
import ViewEditPropertyScreen from "../viewEditProperty";
import AddEditPropertyImageScreen from "../addEditPropertyImage"

export type LandlordHomeStackParamList = {
    home: undefined;
    addProperty: undefined;
    addPropertyImages: { propertyData: object };
    viewEditProperty: { propertyId: string };
    addEditPropertyImage: { propertyId: string; imageData?: object, mode: string };
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
            </LandlordHomeStack.Navigator>
        </NavigationContainer>
    );
}
