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
import { Provider } from "react-redux";
import ScreenWrapper from "./components/common/screen-wrapper";
import { store } from "./redux/store";
import { COLORS } from "./theme/theme";
import { IMAGES, RANDOM_THUMBNAIL, THUMBNAILS } from "./pictures/assets";
import { useAuth } from "./context/AuthContext";
import axios from "axios";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { ChoresStackParamList } from "./stacks/choresStack";
import { StackNavigationProp } from "@react-navigation/stack";

type ChoresScreenNavigationProp = StackNavigationProp<
  ChoresStackParamList,
  "chores"
>;

interface Chore {
  id: number;
  choreName: string;
  room: string;
  bannerImage: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  assignedTo: string;
  assignee?: {
    firstName: string;
    lastName: string;
  };
}

export default function HomeScreen({ groupId, role }: any) {
  const { userToken, userId } = useAuth();
  const [myActiveChores, setMyActiveChores] = useState<Chore[]>([]);
  const [roommatesActiveChores, setRoommatesActiveChores] = useState<Chore[]>(
    []
  );
  const [completedChores, setCompletedChores] = useState<Chore[]>([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const navigation = useNavigation<ChoresScreenNavigationProp>();
  const isFocused = useIsFocused();

  const fetchChores = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/chores/${groupId}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.data.status === "success") {
        // Separate chores into my active, roommates active, and completed
        const myActive: Chore[] = [];
        const roommatesActive: Chore[] = [];
        const completed: Chore[] = [];

        response.data.data.forEach((chore: Chore) => {
          if (chore.completed) {
            completed.push(chore);
          } else if (chore.assignedTo === userId) {
            myActive.push(chore);
          } else {
            roommatesActive.push(chore);
          }
        });

        setMyActiveChores(myActive);
        setRoommatesActiveChores(roommatesActive);
        setCompletedChores(completed);
      }
    } catch (error) {
      console.error("Error fetching chores:", error);
      Alert.alert("Error", "Failed to load chores. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userToken && isFocused) {
      fetchChores();
    }
  }, [userToken, isFocused]);

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

  // Render a single chore card
  const renderChoreCard = (item: Chore) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("choreDetails", {
          id: item.id.toString(),
          choreName: item.choreName,
          room: item.room,
          completed: item.completed,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          bannerImage: item.bannerImage,
          assignedTo: item.assignedTo,
          assigneeName: item.assignee
            ? `${item.assignee.firstName} ${item.assignee.lastName}`
            : null,
        })
      }
    >
      <View style={styles.choreCard}>
        <Image source={getChoreImage(item)} style={styles.choreBanner} />
        <Text style={styles.choreName}>{item.choreName}</Text>
        <Text style={styles.room}>{item.room}</Text>
      </View>
    </TouchableOpacity>
  );

  // Render a section of chores (either active or completed)
  const renderChoreSection = (
    title: string,
    chores: Chore[],
    emptyMessage: string
  ) => (
    <View style={styles.sectionContainer}>
      <Text style={styles.subHeading}>{title}</Text>
      {chores.length === 0 ? (
        <Text style={styles.noChoresText}>{emptyMessage}</Text>
      ) : (
        <FlatList
          data={chores}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.choreList}
          renderItem={({ item }) => renderChoreCard(item)}
          scrollEnabled={false} // Disable scrolling for nested FlatList
        />
      )}
    </View>
  );

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
    sectionContainer: {
      marginBottom: 20,
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
      marginTop: 10,
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
      marginTop: 10,
      marginBottom: 20,
      color: COLORS.TEXT,
    },
    scrollContainer: {
      paddingBottom: 150,
      flexGrow: 1,
    },
  });

  return (
    <Provider store={store}>
      <ScreenWrapper>
        <View style={styles.bannerContainer}>
          <Image source={IMAGES.HOMEY_BANNER} style={styles.banner} />
          <TouchableOpacity onPress={() => navigation.navigate("addChore")}>
            <View style={styles.addChoreButton}>
              <Text style={styles.addButtonText}>Add Chore</Text>
            </View>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        ) : (
          <FlatList
            data={[1]} // Just need one item to render all sections
            keyExtractor={() => "main"}
            renderItem={() => (
              <View>
                {renderChoreSection(
                  "MY ACTIVE CHORES",
                  myActiveChores,
                  "You have no active chores. Add a new chore!"
                )}
                {renderChoreSection(
                  "ROOMMATES' ACTIVE CHORES",
                  roommatesActiveChores,
                  "Your roommates have no active chores."
                )}
                {renderChoreSection(
                  "COMPLETED CHORES",
                  completedChores,
                  "No completed chores yet."
                )}
              </View>
            )}
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={true}
          />
        )}
      </ScreenWrapper>
    </Provider>
  );
}
