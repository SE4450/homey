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
import axios from "axios";
import ScreenWrapper from "./components/common/screen-wrapper";
import { useAuth } from "./context/AuthContext";
import { COLORS } from "./theme/theme";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
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

  useEffect(() => {
    if (route.params) {
      const choreFromParams: Chore = {
        id: parseInt(route.params.id),
        choreName: route.params.choreName,
        room: route.params.room,
        completed: route.params.completed,
        createdAt: route.params.createdAt,
        updatedAt: route.params.updatedAt,
        bannerImage: route.params.bannerImage,
        dueDate: new Date().toISOString(),
        assignedTo: route.params.assignedTo
          ? parseInt(route.params.assignedTo)
          : null,
        assignee: route.params.assigneeName
          ? {
            id: 0,
            firstName: route.params.assigneeName.split(" ")[0],
            lastName: route.params.assigneeName.split(" ")[1] || "",
            email: "",
          }
          : undefined,
      };

      setChore(choreFromParams);
      setLoading(false);
    }
  }, [route.params]);

  const handleMarkComplete = async () => {
    if (!chore) return;

    try {
      const response = await axios.put(
        `${API_URL}/api/chores/${chore.id}`,
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
          { text: "OK", onPress: () => navigation.navigate("chores") },
        ]);
      }
    } catch (error) {
      console.error("Error updating chore:", error);
      Alert.alert("Error", "Failed to update chore. Please try again.");
    }
  };

  const handleDeleteChore = async () => {
    if (!chore) return;

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
                `${API_URL}/api/chores/${chore.id}`,
                {
                  headers: {
                    Authorization: `Bearer ${userToken}`,
                  },
                }
              );

              if (response.data.status === "success") {
                Alert.alert("Success", "Chore deleted successfully", [
                  { text: "OK", onPress: () => navigation.navigate("chores") },
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
      <View style={styles.root}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("chores")}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Chore Details</Text>
        </View>
        <ScreenWrapper>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        </ScreenWrapper>
      </View>
    );
  }

  if (!chore) {
    return (
      <View style={styles.root}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("chores")}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Chore Details</Text>
        </View>
        <ScreenWrapper>
          <Text>Chore not found</Text>
        </ScreenWrapper>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("chores")}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Chore Details</Text>
      </View>

      <ScreenWrapper>
        <View style={styles.container}>
          <View style={styles.detailsContainer}>
            <Text style={styles.title}>
              {chore?.choreName || "Unnamed Chore"}
            </Text>
            <Text style={styles.room}>
              Room: {chore?.room || "Unknown Room"}
            </Text>

            <Text style={styles.sectionTitle}>Status</Text>
            <View
              style={[
                styles.statusBadge,
                chore?.completed ? styles.completedBadge : styles.activeBadge,
              ]}
            >
              <Text style={styles.statusText}>
                {chore?.completed ? "Completed" : "Active"}
              </Text>
            </View>

            {chore?.assignee || route.params.assigneeName ? (
              <>
                <Text style={styles.sectionTitle}>Assigned To</Text>
                <Text style={styles.assignee}>
                  {chore?.assignee
                    ? `${chore.assignee.firstName} ${chore.assignee.lastName}`
                    : route.params.assigneeName}
                </Text>
              </>
            ) : null}

            <Text style={styles.sectionTitle}>Created</Text>
            <Text style={styles.date}>
              {chore?.createdAt
                ? new Date(chore.createdAt).toLocaleDateString()
                : "Unknown"}
            </Text>

            <Text style={styles.sectionTitle}>Due Date</Text>
            <Text style={styles.date}>
              {chore?.dueDate
                ? new Date(chore.dueDate).toLocaleDateString()
                : "Unknown"}
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
    </View>
  );
};

export default ChoreDetails;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    elevation: 3,
    zIndex: 100,
  },
  backButton: {
    paddingLeft: 15,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    paddingRight: 35,
  },
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
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