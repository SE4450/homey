import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Agenda } from "react-native-calendars";
import { useRouter } from "expo-router";
import useAxios from "./hooks/useAxios";

const COLORS = {
  PRIMARY: "#4CAF50",
  WHITE: "#FFFFFF",
  LIGHT_GRAY: "#F5F5F5",
};

export default function CalendarWithEvents() {
  const [items, setItems] = useState({});
  const router = useRouter();
  const { get, loading, error } = useAxios();

  useEffect(() => {
    getEvents(); // Call the function to fetch events from the backend
  }, []);

  // Function to fetch events from the backend
  const getEvents = async () => {
    const result = await get<any>("/api/calendar");

    if (result) {
      const formattedEvents: any = {};

      result.data.forEach((event: any) => {
        const date = event.eventDate; // Format: "YYYY-MM-DD"

        if (!formattedEvents[date]) {
          formattedEvents[date] = [];
        }

        formattedEvents[date].push({
          name: event.title,
          time: event.startTime
            ? `${event.startTime} - ${event.endTime || "N/A"}`
            : "All Day",
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

  return (
    <View style={styles.container}>
      <Agenda
        items={items}
        selected={"2025-03-15"}
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
      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("./addChores")}
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
