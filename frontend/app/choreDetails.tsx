import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import axios from "axios";
import ScreenWrapper from "./components/common/screen-wrapper";
import { useAuth } from "./context/AuthContext";
import { COLORS } from "./theme/theme";
import { RANDOM_THUMBNAIL } from "./pictures/assets";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { ChoresStackParamList } from "./stacks/choresStack";
import { StackNavigationProp } from "@react-navigation/stack";

type ChoreDetailsScreenRouteProp = RouteProp<
  ChoresStackParamList,
  "choreDetails"
>;
type ChoreDetailsScreenNavigationProp = StackNavigationProp<
  ChoresStackParamList,
  "choreDetails"
>;

interface Chore {
  id: number;
  choreName: string;
  room: string;
  bannerImage: string | null;
  completed: boolean;
  createdAt: string;
  dueDate: string;
  updatedAt: string;
  assignedTo: number | null;
  assignee?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

const ChoreDetails = () => {
  const { userToken } = useAuth();
  const [chore, setChore] = useState<Chore | null>(null);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const route = useRoute<ChoreDetailsScreenRouteProp>();
  const navigation = useNavigation<ChoreDetailsScreenNavigationProp>();

  const fetchChoreDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/api/chores?id=${route.params.id}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (response.data.status === "success" && response.data.data.length > 0) {
        setChore(response.data.data[0]);
      } else {
        Alert.alert("Error", "Chore not found");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error fetching chore details:", error);
      Alert.alert("Error", "Failed to load chore details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userToken && route.params.id) {
      fetchChoreDetails();
    }
  }, [userToken, route.params.id]);

  const handleMarkComplete = async () => {
    try {
      const response = await axios.put(
        `${API_URL}/api/chores/${route.params.id}`,
        {
          completed: true,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        Alert.alert("Success", "Chore marked as complete", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error("Error updating chore:", error);
      Alert.alert("Error", "Failed to update chore. Please try again.");
    }
  };

  const handleDeleteChore = async () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this chore?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await axios.delete(
                `${API_URL}/api/chores/${route.params.id}`,
                {
                  headers: {
                    Authorization: `Bearer ${userToken}`,
                  },
                }
              );

              if (response.data.status === "success") {
                Alert.alert("Success", "Chore deleted successfully", [
                  { text: "OK", onPress: () => navigation.goBack() },
                ]);
              }
            } catch (error) {
              console.error("Error deleting chore:", error);
              Alert.alert("Error", "Failed to delete chore. Please try again.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </ScreenWrapper>
    );
  }

  if (!chore) {
    return (
      <ScreenWrapper>
        <Text>Chore not found</Text>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Image
          source={
            chore.bannerImage ? { uri: chore.bannerImage } : RANDOM_THUMBNAIL()
          }
          style={styles.banner}
        />

        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{chore.choreName}</Text>
          <Text style={styles.room}>Room: {chore.room}</Text>

          <Text style={styles.sectionTitle}>Status</Text>
          <View
            style={[
              styles.statusBadge,
              chore.completed ? styles.completedBadge : styles.activeBadge,
            ]}
          >
            <Text style={styles.statusText}>
              {chore.completed ? "Completed" : "Active"}
            </Text>
          </View>

          {chore.assignee && (
            <>
              <Text style={styles.sectionTitle}>Assigned To</Text>
              <Text style={styles.assignee}>
                {chore.assignee.firstName} {chore.assignee.lastName}
              </Text>
            </>
          )}

          <Text style={styles.sectionTitle}>Created</Text>
          <Text style={styles.date}>
            {new Date(chore.createdAt).toLocaleDateString()}
          </Text>

          <Text style={styles.sectionTitle}>Due Date</Text>
          <Text style={styles.date}>
            {new Date(chore.dueDate).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          {!chore.completed && (
            <TouchableOpacity
              style={[styles.button, styles.completeButton]}
              onPress={handleMarkComplete}
            >
              <Text style={styles.buttonText}>Mark as Complete</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDeleteChore}
          >
            <Text style={styles.buttonText}>Delete Chore</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default ChoreDetails;

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  banner: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  detailsContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: COLORS.TEXT,
  },
  room: {
    fontSize: 18,
    marginBottom: 16,
    color: COLORS.TEXT,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 4,
    color: COLORS.TEXT,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  activeBadge: {
    backgroundColor: "#FFC107",
  },
  completedBadge: {
    backgroundColor: "#4CAF50",
  },
  statusText: {
    color: COLORS.WHITE,
    fontWeight: "bold",
  },
  assignee: {
    fontSize: 16,
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: COLORS.TEXT_LIGHT,
  },
  buttonContainer: {
    marginTop: 16,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  completeButton: {
    backgroundColor: "#4CAF50",
  },
  deleteButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    color: COLORS.WHITE,
    fontWeight: "bold",
    fontSize: 16,
  },
});
