import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import ScreenWrapper from "./components/common/screen-wrapper";
import useAxios from "./hooks/useAxios";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "./context/AuthContext";

const AddEvent = () => {
  const { post, loading, error } = useAxios();
  const navigation = useNavigation();

  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const { userId } = useAuth();

  const handleCreateEvent = async () => {
    if (!title || !eventDate) {
      Alert.alert("Error", "Title and Event Date are required");
      return;
    }

    const data = {
      title,
      eventDate,
      startTime,
      endTime,
      location,
      description,
      userId,
    };

    const result = await post("/api/calendar", data);

    if (result) {
      Alert.alert("Success", "Event created successfully");
      navigation.goBack(); // Go back to calendar screen
    } else if (error) {
      Alert.alert("Error", error);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="Event Date (YYYY-MM-DD)"
          value={eventDate}
          onChangeText={setEventDate}
        />
        <TextInput
          style={styles.input}
          placeholder="Start Time (HH:MM)"
          value={startTime}
          onChangeText={setStartTime}
        />
        <TextInput
          style={styles.input}
          placeholder="End Time (HH:MM)"
          value={endTime}
          onChangeText={setEndTime}
        />
        <TextInput
          style={styles.input}
          placeholder="Location"
          value={location}
          onChangeText={setLocation}
        />
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TouchableOpacity style={styles.button} onPress={handleCreateEvent}>
          <Text style={styles.buttonText}>
            {loading ? "Adding..." : "Add Event"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AddEvent;
