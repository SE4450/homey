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
import { useNavigation, useRoute } from "@react-navigation/native";
import ScreenWrapper from "./components/common/screen-wrapper";
import useAxios from "./hooks/useAxios";
import { Ionicons } from "@expo/vector-icons";

const EditEvent = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { put, loading, error } = useAxios();

  const {
    id,
    title: initialTitle,
    eventDate: initialEventDate,
    startTime: initialStartTime,
    endTime: initialEndTime,
    location: initialLocation,
    description: initialDescription,
  } = route.params as {
    id: number;
    title: string;
    eventDate: string;
    startTime: string;
    endTime: string;
    location: string;
    description: string;
  };

  const parseDateTime = (dateStr: string, timeStr: string): Date => {
    return new Date(`${dateStr}T${timeStr}:00`);
  };

  const [title, setTitle] = useState(initialTitle);
  const [eventDate, setEventDate] = useState(new Date(initialEventDate));
  const [startTime, setStartTime] = useState(parseDateTime(initialEventDate, initialStartTime));
  const [endTime, setEndTime] = useState(parseDateTime(initialEventDate, initialEndTime));
  const [location, setLocation] = useState(initialLocation);
  const [description, setDescription] = useState(initialDescription);

  const formatTime = (date: Date): string => {
    const pad = (num: number) => num.toString().padStart(2, "0");
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const handleUpdateEvent = async () => {
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
    };

    const result = await put(`/api/calendar/${id}`, data);

    if (result) {
      Alert.alert("Success", "Event updated successfully");
      navigation.goBack();
    } else if (error) {
      Alert.alert("Error", error);
    }
  };

  return (
    <View style={styles.root}>
      {/* Sticky Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Edit Event</Text>
      </View>

      <ScreenWrapper>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ marginTop: 10 }}>
            <View style={styles.form}>
              <Text style={styles.heading}>Edit Event</Text>

              <View style={styles.formItem}>
                <Text style={styles.subHeading}>Event Title</Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  style={styles.input}
                  placeholder="Enter event title"
                />
              </View>

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

              <View style={styles.formItem}>
                <Text style={styles.subHeading}>Location</Text>
                <TextInput
                  value={location}
                  onChangeText={setLocation}
                  style={styles.input}
                  placeholder="Enter location"
                />
              </View>

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

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleUpdateEvent}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? "Updating..." : "Update Event"}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </ScreenWrapper>
    </View>
  );
};

export default EditEvent;

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
  form: {
    padding: 20,
  },
  formItem: {
    marginBottom: 15,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
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
    justifyContent: "flex-start",
    marginTop: 10,
  },
  timeWrapper: {
    marginRight: 20,
    alignItems: "flex-start",
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