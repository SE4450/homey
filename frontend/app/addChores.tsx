import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, TextInput, Alert } from "react-native";
import ScreenWrapper from "./components/common/screen-wrapper";
import { RANDOM_THUMBNAIL, THUMBNAILS } from "./pictures/assets";
import { COLORS } from "./theme/theme";
import AddButton from "./components/common/add-button";
import { useRouter } from "expo-router";
import axios from "axios";
import { useAuth } from "./context/AuthContext";

const AddChore = () => {
  const [choreBanner, setChoreBanner] = useState<any>(null);
  const [chore, setChore] = useState("");
  const [room, setRoom] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { userToken } = useAuth();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const banner = RANDOM_THUMBNAIL();
    console.log("Banner:", banner);
    setChoreBanner(banner);
  }, []);

  const handleAddChore = async () => {
    if (!chore.trim() || !room.trim()) {
      Alert.alert("Error", "Please enter both chore name and room");
      return;
    }

    setIsLoading(true);
    try {
      // Store a reference to the image (just a number 1-5)
      // This matches the keys in the THUMBNAILS object
      const bannerKey = Object.keys(THUMBNAILS).find(
        (key) => THUMBNAILS[key] === choreBanner
      );

      const response = await axios.post(
        `${API_URL}/api/chores`,
        {
          choreName: chore,
          room: room,
          bannerImage: bannerKey || null,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

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
      </View>

      <View>
        <AddButton
          buttonText={isLoading ? "Adding..." : "Add Chore"}
          onPress={handleAddChore}
        />
      </View>
    </ScreenWrapper>
  );
};

export default AddChore;

const styles = StyleSheet.create({
  addChoreContainer: {
    display: "flex",
    justifyContent: "center", // Center vertically
    alignItems: "center", // Center horizontally
    height: "50%", // Adjust height to prevent overflow
    width: "100%", // Ensure full width
    padding: 20, // Add padding for spacing
  },
  banner: {
    height: 240,
    width: "100%",
    resizeMode: "cover",
    marginBottom: 20, // Add margin below the image
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
    borderRadius: 5, // Rounded corners for better UI
  },
  subHeading: {
    fontSize: 20,
    fontWeight: "600",
  },
});
