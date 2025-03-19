import React, { useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import ScreenWrapper from "./components/common/screen-wrapper";
import useAxios from "./hooks/useAxios";
import { useAuth } from "./context/AuthContext";

const AddEvent = ({ groupId, role }: any) => {
  const navigation = useNavigation();
  const { post, loading, error } = useAxios();
  const { userId } = useAuth();

  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
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

  // Helper to format a Date object into HH:MM string
  const formatTime = (date: Date): string => {
    const pad = (num: number) => num.toString().padStart(2, "0");
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const handleCreateEvent = async () => {
    if (!title || !eventDate) {
      Alert.alert("Error", "Title and Event Date are required");
      return;
    }

    const data = {
      title,
      eventDate: eventDate.toISOString().split("T")[0],
      startTime: formatTime(startTime),
      endTime: formatTime(endTime),
      location,
      description,
      userId,
      groupId
    };

    const result = await post("/api/calendar", data);

    if (result) {
      Alert.alert("Success", "Event created successfully");
      navigation.goBack();
    } else if (error) {
      Alert.alert("Error", error);
    }
  };

  return (
    <ScreenWrapper>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ marginTop: 50 }}>
          <View style={styles.form}>
            {/* Title */}
            <View style={styles.formItem}>
              <Text style={styles.subHeading}>Event Title</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                style={styles.input}
                placeholder="Enter event title"
              />
            </View>

            {/* Date Picker */}
            <View style={styles.formItem}>
              <Text style={styles.subHeading}>Date (YYYY-MM-DD)</Text>
              <DateTimePicker
                value={eventDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  if (selectedDate) setEventDate(selectedDate);
                }}
                textColor="black"
              />
              <View style={styles.inlineTimeContainer}>
                <View style={styles.timeWrapper}>
                  <Text style={styles.label}>Start</Text>
                  <DateTimePicker
                    value={startTime}
                    mode="time"
                    display="default"
                    onChange={(event, selectedTime) => {
                      if (selectedTime) setStartTime(selectedTime);
                    }}
                    textColor="black"
                    style={styles.timePicker}
                  />
                </View>
                <View style={styles.timeWrapper}>
                  <Text style={styles.label}>End</Text>
                  <DateTimePicker
                    value={endTime}
                    mode="time"
                    display="default"
                    onChange={(event, selectedTime) => {
                      if (selectedTime) setEndTime(selectedTime);
                    }}
                    textColor="black"
                    style={styles.timePicker}
                  />
                </View>
              </View>
            </View>

            {/* Location */}
            <View style={styles.formItem}>
              <Text style={styles.subHeading}>Location</Text>
              <TextInput
                value={location}
                onChangeText={setLocation}
                style={styles.input}
                placeholder="Enter location"
              />
            </View>

            {/* Description */}
            <View style={styles.formItem}>
              <Text style={styles.subHeading}>Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                style={[styles.input, styles.textArea]}
                placeholder="Enter description"
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleCreateEvent}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? "Saving..." : "Save Event"}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
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
    backgroundColor: "white",
    color: "black",
  },
  inlineTimeContainer: {
    flexDirection: "row",
    justifyContent: "flex-start", // Align to left side
    marginTop: 10,
  },
  timeWrapper: {
    marginRight: 20,
    alignItems: "flex-start", // Align each picker to left side
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
  },
  timePicker: {
    width: 120,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  subHeading: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
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
