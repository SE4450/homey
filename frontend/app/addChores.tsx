import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Alert,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import ScreenWrapper from "./components/common/screen-wrapper";
import { RANDOM_THUMBNAIL, THUMBNAILS } from "./pictures/assets";
import { COLORS } from "./theme/theme";
import AddButton from "./components/common/add-button";
import { useRouter } from "expo-router";
import axios from "axios";
import { useAuth } from "./context/AuthContext";
import useAxios from "./hooks/useAxios";

// Update the Roommate interface to match your user data structure
interface Roommate {
  id: number;
  firstName: string;
  lastName: string;
}

const AddChore = () => {
  const [choreBanner, setChoreBanner] = useState<any>(null);
  const [chore, setChore] = useState("");
  const [room, setRoom] = useState("");
  const [assignedTo, setAssignedTo] = useState<number | null>(null);
  const [selectedRoommateName, setSelectedRoommateName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const router = useRouter();
  const { userToken, userId } = useAuth();
  const { get } = useAxios();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const banner = RANDOM_THUMBNAIL();
    console.log("Banner:", banner);
    setChoreBanner(banner);

    // Fetch roommates when component mounts
    fetchRoommates();
  }, []);

  const fetchRoommates = async () => {
    try {
      // Fetch users from your API
      const response = await get<any>(`/api/users`);

      if (response && response.data) {
        setRoommates(response.data);
      }
    } catch (error) {
      console.error("Error fetching roommates:", error);
      Alert.alert("Error", "Failed to load roommates. Please try again.");
    }
  };

  const handleSelectRoommate = (roommate: Roommate) => {
    setAssignedTo(roommate.id);
    setSelectedRoommateName(`${roommate.firstName} ${roommate.lastName}`);
    setModalVisible(false);
  };

  const handleAddChore = async () => {
    if (!chore.trim() || !room.trim()) {
      Alert.alert("Error", "Please enter both chore name and room");
      return;
    }

    setIsLoading(true);
    try {
      // Store a reference to the image (just a number 1-5)
      // This matches the keys in the THUMBNAILS object
      const bannerKey = Object.keys(THUMBNAILS)
        .map((key) => parseInt(key, 10))
        .find((key) => THUMBNAILS[key] === choreBanner);

      const payload: any = {
        choreName: chore,
        room: room,
        bannerImage: bannerKey || null,
      };

      // Only add assignedTo if it's provided
      if (assignedTo !== null) {
        payload.assignedTo = assignedTo;
      }

      const response = await axios.post(`${API_URL}/api/chores`, payload, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 201) {
        Alert.alert("Success", "Chore added successfully", [
          { text: "OK", onPress: () => router.push("/chores") },
        ]);
      }
    } catch (error) {
      console.error("Error adding chore:", error);
      Alert.alert("Error", "Failed to add chore. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.addChoreContainer}>
        {choreBanner && <Image source={choreBanner} style={styles.banner} />}
      </View>

      <View style={styles.form}>
        <View style={styles.formItem}>
          <Text style={styles.subHeading}>Chore Name</Text>
          <TextInput
            value={chore}
            onChangeText={(e: string) => setChore(e)}
            style={styles.input}
            placeholder="Enter chore name"
          />
        </View>

        <View style={styles.formItem}>
          <Text style={styles.subHeading}>Room</Text>
          <TextInput
            value={room}
            onChangeText={(e: string) => setRoom(e)}
            style={styles.input}
            placeholder="Enter room"
          />
        </View>

        <View style={styles.formItem}>
          <Text style={styles.subHeading}>Assign To</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.dropdownButtonText}>
              {selectedRoommateName || "Select a roommate (optional)"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View>
        <AddButton
          buttonText={isLoading ? "Adding..." : "Add Chore"}
          onPress={handleAddChore}
        />
      </View>

      {/* Roommate Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Roommate</Text>

            <FlatList
              data={roommates}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.roommateItem,
                    assignedTo === item.id && styles.selectedRoommateItem,
                  ]}
                  onPress={() => handleSelectRoommate(item)}
                >
                  <Text style={styles.roommateName}>
                    ID {item.id}, {item.firstName} {item.lastName}
                  </Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

export default AddChore;

const styles = StyleSheet.create({
  addChoreContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "50%",
    width: "100%",
    padding: 20,
  },
  banner: {
    height: 240,
    width: "100%",
    resizeMode: "cover",
    marginBottom: 20,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  form: {
    padding: 20,
  },
  formItem: {
    marginBottom: 15,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 10,
    marginTop: 10,
    borderRadius: 5,
  },
  subHeading: {
    fontSize: 20,
    fontWeight: "600",
  },
  dropdownButton: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 10,
    marginTop: 10,
    borderRadius: 5,
    justifyContent: "center",
  },
  dropdownButtonText: {
    color: "#555",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  roommateItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedRoommateItem: {
    backgroundColor: "#e6f7ff",
  },
  roommateName: {
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#555",
  },
});
