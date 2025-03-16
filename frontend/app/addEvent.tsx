import React, { useState, useLayoutEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import ScreenWrapper from "./components/common/screen-wrapper";
import useAxios from "./hooks/useAxios";

const AddEvent = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { post, error } = useAxios();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  // Hide bottom navbar when the component is focused
  useLayoutEffect(() => {
    const parent = navigation.getParent();
    parent?.setOptions({ tabBarStyle: { display: "none" } });
    return () => {
      parent?.setOptions({ tabBarStyle: { display: "flex" } });
    };
  }, [navigation]);

  // Function to add event to backend
  const addEvent = async () => {
    if (!title || !date) {
      Alert.alert("Error", "Title and Date are required fields.");
      return;
    }

    const eventData = {
      title,
      eventDate: date,
      startTime: time || null,
      endTime: null, // Optionally add end time if needed
      location,
      description,
    };

    const result = await post("/api/calendar", eventData);

    if (result) {
      Alert.alert("Success", "Event added successfully!");
      router.push("/calendar"); // Redirect to calendar screen after adding
    } else {
      Alert.alert("Error", error || "Failed to add event");
    }
  };

  return (
    <ScreenWrapper>
      {/* Form Section */}
      <View style={styles.form}>
        <View style={styles.formItem}>
          <Text style={styles.subHeading}>Event Title</Text>
          <TextInput
            value={title}
            onChangeText={(e) => setTitle(e)}
            style={styles.input}
            placeholder="Enter event title"
          />
        </View>

        <View style={styles.formItem}>
          <Text style={styles.subHeading}>Date (YYYY-MM-DD)</Text>
          <TextInput
            value={date}
            onChangeText={(e) => setDate(e)}
            style={styles.input}
            placeholder="Enter date"
          />
        </View>

        <View style={styles.formItem}>
          <Text style={styles.subHeading}>Time (e.g., 14:00)</Text>
          <TextInput
            value={time}
            onChangeText={(e) => setTime(e)}
            style={styles.input}
            placeholder="Enter time"
          />
        </View>

        <View style={styles.formItem}>
          <Text style={styles.subHeading}>Location</Text>
          <TextInput
            value={location}
            onChangeText={(e) => setLocation(e)}
            style={styles.input}
            placeholder="Enter location"
          />
        </View>

        <View style={styles.formItem}>
          <Text style={styles.subHeading}>Description</Text>
          <TextInput
            value={description}
            onChangeText={(e) => setDescription(e)}
            style={[styles.input, styles.textArea]}
            placeholder="Enter description"
            multiline
            numberOfLines={4}
          />
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={addEvent}>
        <Text style={styles.saveButtonText}>Save Event</Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
};

export default AddEvent;

const styles = StyleSheet.create({
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
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  subHeading: {
    fontSize: 20,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
