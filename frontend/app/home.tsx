import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native"; // Added StyleSheet here
import useAxios from "./hooks/useAxios";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useRouter } from "expo-router";
import { Provider } from "react-redux";

// Import the ScreenWrapper
import ScreenWrapper from "./components/common/screen-wrapper";
import { store } from "./redux/store";
import { COLORS } from "./theme/theme";
import { IMAGES } from "./pictures/assets";

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
    addButtonText: {
      fontWeight: "700",
      color: COLORS.TEXT,
    },
    addChoreButton: {
      position: "absolute",
      backgroundColor: COLORS.WHITE,
      paddingHorizontal: 25,
      paddingVertical: 12,
      borderRadius: 18,
      bottom: 0,
      left: 70,
    },
    logoutButton: {
      position: "absolute",
      backgroundColor: COLORS.WHITE,
      paddingHorizontal: 25,
      paddingVertical: 12,
      borderRadius: 18,
      top: 370,
      left: 250,
    },
    banner: {
      width: "150%",
      height: 200,
      resizeMode: "contain",
    },
    bannerContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
    },

    heading: {
      fontSize: 28,
      fontWeight: "600",
      color: COLORS.TEXT,
    },
    subHeading: {
      fontSize: 18,
      fontWeight: "700",
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
        <View style={styles.bannerContainer}>
          <Image source={IMAGES.HOMEY_BANNER} style={styles.banner} />
          <TouchableOpacity onPress={() => router.push("/add-chore")}>
            <View style={styles.addChoreButton}>
              <Text style={styles.addButtonText}>Add Chore</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.subHeading}>RECENT CHORES</Text>

        <TouchableOpacity onPress={handleLogout}>
          <View style={styles.logoutButton}>
            <Text style={styles.addButtonText}>Logout</Text>
          </View>
        </TouchableOpacity>
      </ScreenWrapper>
    </Provider>
  );
}
