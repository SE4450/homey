import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Provider } from "react-redux";

import ScreenWrapper from "./components/common/screen-wrapper";
import { store } from "./redux/store";
import { COLORS } from "./theme/theme";
import { IMAGES, RANDOM_THUMBNAIL, THUMBNAILS } from "./pictures/assets";
import { useAuth } from "./context/AuthContext";
import axios from "axios";

interface Chore {
  id: number;
  choreName: string;
  room: string;
  bannerImage: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { userToken } = useAuth();
  const [chores, setChores] = useState<Chore[]>([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const fetchChores = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/chores`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.data.status === "success") {
        setChores(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching chores:", error);
      Alert.alert("Error", "Failed to load chores. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userToken) {
      fetchChores();
    }
  }, [userToken]);

  // This function will get the correct thumbnail based on the stored bannerImage
  const getChoreImage = (chore: Chore) => {
    if (chore.bannerImage) {
      const key = parseInt(chore.bannerImage, 10);
      if (THUMBNAILS[key]) {
        return THUMBNAILS[key];
      }
    }
    return RANDOM_THUMBNAIL();
  };

  const styles = StyleSheet.create({
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
    noChoresText: {
      fontSize: 16,
      textAlign: "center",
      marginTop: 20,
      color: COLORS.TEXT,
    },
  });

  return (
    <Provider store={store}>
      <ScreenWrapper>
        <View style={styles.bannerContainer}>
          <Image source={IMAGES.HOMEY_BANNER} style={styles.banner} />
          <TouchableOpacity onPress={() => router.push("/addChores")}>
            <View style={styles.addChoreButton}>
              <Text style={styles.addButtonText}>Add Chore</Text>
            </View>
          </TouchableOpacity>
        </View>
        <Text style={styles.subHeading}>ACTIVE CHORES</Text>
        <View style={styles.listWrapper}>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          ) : chores.length === 0 ? (
            <Text style={styles.noChoresText}>
              No chores found. Add a new chore!
            </Text>
          ) : (
            <FlatList
              data={chores}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              columnWrapperStyle={styles.choreList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => router.push(`/choreDetails?id=${item.id}`)}
                >
                  <View style={styles.choreCard}>
                    <Image
                      source={getChoreImage(item)}
                      style={styles.choreBanner}
                    />
                    <Text style={styles.choreName}>{item.choreName}</Text>
                    <Text style={styles.room}>{item.room}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </ScreenWrapper>
    </Provider>
  );
}
