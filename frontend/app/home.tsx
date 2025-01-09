import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native"; // Added StyleSheet here
import useAxios from "./hooks/useAxios";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useRouter } from "expo-router";
import { Provider } from "react-redux";

// Import the ScreenWrapper
import ScreenWrapper from "./components/common/screen-wrapper";
import { store } from "./redux/store";
import { COLORS } from "./theme/theme";

export default function HomeScreen() {
  const [user, setUser] = useState<any>({});
  const { userToken, userId, logout } = useAuth();
  const { get, error } = useAxios();
  const router = useRouter();

  const styles = StyleSheet.create({
    homeHeader: {
      // Assuming you have a homeHeader style
      padding: 20,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
    },
    heading: {
      fontSize: 28,
      fontWeight: "600",
      color: COLORS.TEXT,
    },
  });

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
    }
  }, [error]);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await get<any>(`/api/users/user/${userId}`);
      if (response) {
        setUser(response.data[0]);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!userToken) {
      router.push("/login");
    }
  }, [userToken]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (!userToken) {
    return <ActivityIndicator size="large" />;
  }

  return (
    // Wrap the entire view/content in ScreenWrapper
    <Provider store={store}>
      <ScreenWrapper>
        <View style={styles.homeHeader}>
          <Text>
            Welcome {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.heading}>Homeys</Text>
        </View>
        <View></View>
        <View>
          <Button title="Logout" onPress={handleLogout} />
        </View>
      </ScreenWrapper>
    </Provider>
  );
}
