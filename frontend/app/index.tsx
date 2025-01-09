import { View, StyleSheet } from "react-native";
import React from "react";
import LoginScreen from "./login";
import ShoppingList from "../components/ShoppingList";
import ExpenseList from "../components/ExpenseList";
import ChoresList from "../components/ChoresList";

import Lists from ".././components/Lists"
import ListDisplay from ".././pages/ListDisplay"
//import Profile from ".././components/Profile"

export default function Index() {
  return (
    <View style={styles.container}>
      <ShoppingList />
      {/* <ExpenseList /> */}
      {/* <ChoresList /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
});