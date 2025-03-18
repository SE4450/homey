import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Agenda } from "react-native-calendars";
import useAxios from "./hooks/useAxios";
import { useIsFocused } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { CalendarStackParamList } from "./stacks/calendarStack";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  PRIMARY: "#4CAF50",
  WHITE: "#FFFFFF",
  LIGHT_GRAY: "#F5F5F5",
};

type CalendarScreenNavigationProp = StackNavigationProp<CalendarStackParamList, "calendar">;

export default function CalendarWithEvents() {
  const [items, setItems] = useState({});
  const { get, error, del } = useAxios();
  const navigation = useNavigation<CalendarScreenNavigationProp>();
  const isFocused = useIsFocused();

  const formatTime = (timeStr: string): string => {
    const [hourStr, minute] = timeStr.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minute} ${ampm}`;
  };

  useEffect(() => {
    if (isFocused) {
      getEvents();
    }
  }, [isFocused]);

  const getEvents = async () => {
    const result = await get<any>("/api/calendar");

    if (result && result.data) {
      const formattedEvents: any = {};

      // Inside getEvents() in calendar.tsx
      result.data.forEach((event: any) => {
        const date = event.eventDate;
        if (!formattedEvents[date]) {
          formattedEvents[date] = [];
        }

        const timeString = event.startTime
          ? `${formatTime(event.startTime)} - ${event.endTime ? formatTime(event.endTime) : "N/A"}`
          : "All Day";

        formattedEvents[date].push({
          id: event.id,
          name: event.title,
          eventDate: event.eventDate, // Add this line so eventDate is passed along
          startTime: event.startTime, // Optionally include these if needed by editEvent
          endTime: event.endTime,
          time: timeString,
          location: event.location || "No location",
          description: event.description || "No description",
          height: 70,
        });
      });


      setItems(formattedEvents);
    } else {
      Alert.alert("Error", error || "Failed to fetch events");
    }
  };

  const deleteEvent = async (id: number) => {
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await del(`/api/calendar/${id}`);
              Alert.alert("Success", "Event deleted successfully");
              getEvents(); // Refresh after deletion
            } catch (err) {
              Alert.alert("Error", "Failed to delete event");
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const renderItem = (item: any) => {
    return (
      <TouchableOpacity activeOpacity={1} style={styles.item}>
        {/* Delete Button */}
        <TouchableOpacity onPress={() => deleteEvent(item.id)} style={styles.deleteIcon}>
          <Ionicons name="trash-outline" size={20} color="red" />
        </TouchableOpacity>

        {/* Edit Button */}
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("editEvent", {
              id: item.id,
              title: item.name,
              eventDate: item.eventDate,
              startTime: item.startTime,
              endTime: item.endTime,
              location: item.location,
              description: item.description,
            })
          }
          style={styles.editIcon}
        >
          <Ionicons name="pencil-outline" size={20} color="blue" />
        </TouchableOpacity>

        <Text style={styles.itemText}>{item.name}</Text>
        <Text style={styles.timeText}>{item.time}</Text>
        <Text style={styles.locationText}>Location: {item.location}</Text>
        <Text style={styles.descriptionText}>Description: {item.description}</Text>
      </TouchableOpacity>
    );
  };


  const defaultSelectedDate = Object.keys(items).length ? Object.keys(items)[0] : "2025-03-15";

  return (
    <View style={styles.container}>
      <Agenda
        items={items}
        selected={defaultSelectedDate}
        renderItem={renderItem}
        theme={{
          agendaDayTextColor: COLORS.PRIMARY,
          agendaDayNumColor: COLORS.PRIMARY,
          agendaTodayColor: COLORS.PRIMARY,
          selectedDayBackgroundColor: COLORS.PRIMARY,
          dotColor: COLORS.PRIMARY,
          todayTextColor: COLORS.PRIMARY,
          backgroundColor: COLORS.LIGHT_GRAY,
        }}
        style={styles.agenda}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("addEvent")}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  agenda: {
    marginTop: 10,
  },
  item: {
    backgroundColor: COLORS.WHITE,
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  editIcon: {
    position: "absolute",
    right: 40,
    top: 10,
    zIndex: 10,
  },
  itemText: {
    color: COLORS.PRIMARY,
    fontWeight: "bold",
    fontSize: 16,
  },
  timeText: {
    color: "#555",
    fontSize: 14,
    marginTop: 4,
  },
  locationText: {
    color: "#777",
    fontSize: 14,
    marginTop: 2,
  },
  descriptionText: {
    color: "#777",
    fontSize: 14,
    marginTop: 2,
  },
  deleteIcon: {
    position: "absolute",
    right: 10,
    top: 10,
    zIndex: 10,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: COLORS.PRIMARY,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  fabText: {
    color: COLORS.WHITE,
    fontSize: 30,
    fontWeight: "bold",
  },
});
