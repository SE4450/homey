import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import useAxios from "./hooks/useAxios";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useRouter } from "expo-router";
import { Provider } from "react-redux";

// Import the ScreenWrapper
import ScreenWrapper from "./components/common/screen-wrapper";
import { store } from "./redux/store";
import { COLORS } from "./theme/theme";
import { IMAGES, RANDOM_THUMBNAIL } from "./pictures/assets";
import ListDisplay from "../pages/ListDisplay";
import Profile from "./components/Profile";

export default function HomeScreen() {
  const [user, setUser] = useState<any>({});
  const { userToken, userId, logout } = useAuth();
  const { get, error } = useAxios();
  const router = useRouter();

  const MOCKDATA = [
    {
      id: 1,
      banner: RANDOM_THUMBNAIL(),
      choreName: "DISHES", // Renamed
      ROOM: "KITCHEN", // Renamed
    },
    {
      id: 2,
      banner: RANDOM_THUMBNAIL(),
      choreName: "CLEAN", // Renamed
      ROOM: "LIVING ROOM", // Renamed
    },
    {
      id: 3,
      banner: RANDOM_THUMBNAIL(),
      choreName: "CLEAN", // Renamed
      ROOM: "DRIVEWAY", // Renamed
    },
  ];

  const styles = StyleSheet.create({
    homeHeader: {
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
      top: 0,
      left: 70,
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
    listWrapper: {
      marginBottom: 120,
      height: 420,
    },
    choreName: {
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 6,
    },
    room: {
      fontSize: 10,
      fontWeight: "600",
      marginLeft: 6,
    },
    subHeading: {
      fontSize: 18,
      fontWeight: "700",
      color: COLORS.TEXT,
      marginBottom: 12,
    },
    choreBanner: {
      height: 140,
      width: 140,
    },
    choreCard: {
      backgroundColor: COLORS.WHITE,
      marginBottom: 12,
      padding: 8,
      borderRadius: 18,
    },
    choreList: {
      justifyContent: "space-between",
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
    
  const handleMessages = () => {
    router.push("./contacts");
  };

  if (!userToken) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <Provider store={store}>
      <ScreenWrapper>
        <View style={styles.homeHeader}>
          <Text>
            Welcome {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.heading}>Homeys</Text>
        </View>
        <View style={styles.bannerContainer}>
          {/* Render the image */}
          <Image source={IMAGES.HOMEY_BANNER} style={styles.banner} />
          <TouchableOpacity onPress={() => router.push("/add-chore")}>
            <View style={styles.addChoreButton}>
              <Text style={styles.addButtonText}>Add Chore</Text>
            </View>
          </TouchableOpacity>
        </View>
        <Text style={styles.subHeading}>ACTIVE CHORES</Text>
        <View style={styles.listWrapper}>
          <FlatList
            data={MOCKDATA}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.choreList}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => router.push(`/chore-details?id=${item.id}`)}
              >
                <View style={styles.choreCard}>
                  {/* Check if the image exists */}
                  {item.banner ? (
                    <Image source={item.banner} style={styles.choreBanner} />
                  ) : (
                    <Text>No Image Available</Text>
                  )}
                  {/* Render choreName */}
                  <Text style={styles.choreName}>{item.choreName}</Text>
                  {/* Render room */}
                  <Text style={styles.room}>{item.ROOM}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        <View>
            <Text>Welcome {user.firstName} {user.lastName}</Text>
            <Profile username={user.username} userId={userId}/>
            <Button title="Logout" onPress={handleLogout} />
            <ListDisplay />
            <Button title="Expenses" onPress={() => router.push("./expenses")} />
            <Button title="Messages" onPress={handleMessages} />
        </View>
      </ScreenWrapper>
    </Provider>
  );
}
