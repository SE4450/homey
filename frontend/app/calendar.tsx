import React from "react";
import { View, StyleSheet } from "react-native";
import { Calendar as RNCalendar } from "react-native-calendars";

const COLORS = {
  PRIMARY: "#4CAF50",
  WHITE: "#FFFFFF",
  LIGHT_GRAY: "#F5F5F5",
};

export default function Calendar() {
  const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

  return (
    <View style={styles.container}>
      <RNCalendar
        current={today}
        markedDates={{
          [today]: {
            selected: true,
            selectedColor: COLORS.PRIMARY,
          },
        }}
        style={styles.calendar}
        theme={{
          calendarBackground: COLORS.LIGHT_GRAY,
          textSectionTitleColor: COLORS.PRIMARY,
          selectedDayBackgroundColor: COLORS.PRIMARY,
          todayTextColor: COLORS.PRIMARY,
          dayTextColor: COLORS.PRIMARY,
          arrowColor: COLORS.PRIMARY,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
    justifyContent: "center",
    alignItems: "center",
  },
  calendar: {
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    borderRadius: 5,
  },
});
