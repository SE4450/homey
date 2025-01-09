import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, TextInput } from "react-native";
import ScreenWrapper from "./components/common/screen-wrapper";
import { RANDOM_THUMBNAIL } from "./pictures/assets";
import { COLORS } from "./theme/theme";
import AddButton from "./components/common/add-button";
import { useRouter } from "expo-router"; // Import useRouter

const AddChore = () => {
  const [choreBanner, setChoreBanner] = useState<any>(null); // Initialize the state
  const [chore, setChore] = useState(""); // TextInput state for the task
  const [room, setRoom] = useState(""); // TextInput state for the room
  const router = useRouter(); // Use the router hook

  useEffect(() => {
    const banner = RANDOM_THUMBNAIL();
    console.log("Banner:", banner); // Debugging to ensure banner is set
    setChoreBanner(banner); // Set a random banner
  }, []); // Only run once after the component mounts

  return (
    <ScreenWrapper>
      <View style={styles.addChoreContainer}>
        {choreBanner ? (
          <Image source={choreBanner} style={styles.banner} />
        ) : (
          <Text>No banner available</Text>
        )}
      </View>

      {/* Form Section */}
      <View style={styles.form}>
        <View style={styles.formItem}>
          <Text style={styles.subHeading}>What task?</Text>
          <TextInput
            value={chore} // Bind it to the chore state
            onChangeText={(e: string) => setChore(e)} // Update the chore state when text changes
            style={styles.input} // Apply input styling
            placeholder="Enter chore"
          />
        </View>

        <View style={styles.formItem}>
          <Text style={styles.subHeading}>Which room?</Text>
          <TextInput
            value={room}
            onChangeText={(e: string) => setRoom(e)}
            style={styles.input}
            placeholder="Enter room"
          />
        </View>
      </View>

      <View>
        {/* Update onPress function to use the router */}
        <AddButton
          buttonText="Add Chore"
          onPress={() => router.push("/home")}
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
