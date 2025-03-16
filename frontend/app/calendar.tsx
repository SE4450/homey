import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Agenda } from "react-native-calendars";
import useAxios from "./hooks/useAxios";
import { useNavigation } from "@react-navigation/native";
import { CalendarStackParamList } from "./stacks/calendarStack";
import { StackNavigationProp } from "@react-navigation/stack";

const COLORS = {
  PRIMARY: "#4CAF50",
  WHITE: "#FFFFFF",
  LIGHT_GRAY: "#F5F5F5",
};

type CalendarScreenNavigationProp = StackNavigationProp<CalendarStackParamList, "calendar">;

export default function CalendarWithEvents() {
  const [items, setItems] = useState({});
  const { get, error } = useAxios();
  const navigation = useNavigation<CalendarScreenNavigationProp>();

  // Helper function to format "HH:mm:ss" into "h:mm AM/PM"
  const formatTime = (timeStr: string): string => {
    const [hourStr, minute] = timeStr.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minute} ${ampm}`;
  };

  useEffect(() => {
    getEvents();
  }, []);

  // Function to fetch events from the backend and format them
  const getEvents = async () => {
    const result = await get<any>("/api/calendar");

    if (result && result.data) {
      const formattedEvents: any = {};

      result.data.forEach((event: any) => {
        const date = event.eventDate; // Expected format: "YYYY-MM-DD"
        if (!formattedEvents[date]) {
          formattedEvents[date] = [];
        }

        const timeString = event.startTime
          ? `${formatTime(event.startTime)} - ${event.endTime ? formatTime(event.endTime) : "N/A"}`
          : "All Day";

        formattedEvents[date].push({
          name: event.title,
          time: timeString,
          height: 50,
        });
      });

      setItems(formattedEvents);
    } else {
      Alert.alert("Error", error || "Failed to fetch events");
    }
  };

  const renderItem = (item: any) => {
    return (
      <View style={styles.item}>
        <Text style={styles.itemText}>{item.name}</Text>
        <Text style={styles.timeText}>{item.time}</Text>
      </View>
    );
  };

  // Use the first date from the events as the default selected date, or fallback
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
