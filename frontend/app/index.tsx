import { View, StyleSheet } from "react-native";
import React from "react";
import LoginScreen from "./login";

import Lists from ".././components/Lists"
import ListDisplay from ".././pages/ListDisplay"
//import Profile from ".././components/Profile"

export default function Index() {
  return (
    <View style={styles.container}>
      <LoginScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
});