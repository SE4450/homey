import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import TenantHomeScreen from "../tenantHome";
import TenantHomePropertySearchResultsScreen from "../tenantHomePropertySearchResults";
import TenantHomePropertyDetailsScreen from "../tenantPropertyDetails";
import AllReviewsScreen from "../allReviews";

type Property = {
  id: number;
  name: string;
  propertyType: string;
  address: string;
  city: string;
  price: number;
  bedrooms: number;
  description: string;
  landlord: {
    id: number; // Added landlord id for navigation purposes
    firstName: string;
    lastName: string;
    name: string;
    email: string;
  };
};

export type TenantHomeStackParamList = {
  home: undefined;
  propertySearchResults: undefined;
  propertyDetails: { property: Property };
  allReviews: { reviewType: string; itemId: number };
};

const TenantHomeStack = createStackNavigator<TenantHomeStackParamList>();

export default function TenantHomeStackScreen() {
  return (
    <NavigationContainer>
      <TenantHomeStack.Navigator screenOptions={{ headerShown: false }}>
        <TenantHomeStack.Screen name="home" component={TenantHomeScreen} />
        <TenantHomeStack.Screen name="propertySearchResults" component={TenantHomePropertySearchResultsScreen} />
        <TenantHomeStack.Screen name="propertyDetails" component={TenantHomePropertyDetailsScreen} />
        <TenantHomeStack.Screen name="allReviews" component={AllReviewsScreen} />
      </TenantHomeStack.Navigator>
    </NavigationContainer>
  );
}
