import React, { useState, useEffect } from "react";
import { ActivityIndicator, Alert } from "react-native";
import useAxios from "./hooks/useAxios";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "expo-router";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";

import HomeScreen from "./home";
import ListScreen from "./listDisplay";
import ExpenseScreen from "./expenses";
import MessageStackScreen from "./stacks/messagesStack";
import InventoryScreen from "./inventory";
import CalendarScreen from "./calendar";
import ChoresStackScreen from "./stacks/choresStack";
import ReviewsScreen from "./stacks/reviewsStack";

const Tab = createBottomTabNavigator();

const COLORS = {
  PRIMARY: "#4CAF50",
  SECONDARY: "#FF9800",
  WHITE: "#FFFFFF",
  BLACK: "#000000",
  TEXT: "#333333",
  LIGHT_GRAY: "#F5F5F5",
  LOGOUT: "#D32F2F",
};

export default function GroupNavigationScreen() {
  const [user, setUser] = useState<any>({});
  const { userToken, userId, userRole } = useAuth();
  const { get, error } = useAxios();
  const router = useRouter();

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
    }
  }, [error]);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await get<any>(`/api/users/user/${userId}`);
      if (response) {
        setUser(response.data[0]);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!userToken) {
      router.push("/login");
    }
  }, [userToken]);

  if (!userToken) {
    return <ActivityIndicator size="large" color={COLORS.PRIMARY} />;
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap;

          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "List") {
            iconName = "shopping-cart";
          } else if (route.name === "Expenses") {
            iconName = "paid";
          } else if (route.name === "Chores") {
            iconName = "checklist";
          } else if (route.name === "Messages") {
            iconName = "message";
          } else if (route.name === "Inventory") {
            iconName = "inventory";
          } else if (route.name === "Profile") {
            iconName = "account-circle";
          } else if (route.name === "Calendar") {
            iconName = "calendar-today";
          } else {
            iconName = "help"; // Fallback icon
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: "grey",
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ReviewsScreen} />
      <Tab.Screen name="List" component={ListScreen} />
      <Tab.Screen name="Expenses" component={ExpenseScreen} />
      <Tab.Screen name="Chores" component={ChoresStackScreen} />
      <Tab.Screen name="Messages" component={MessageStackScreen} />
      <Tab.Screen name="Inventory" component={InventoryScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
    </Tab.Navigator>
  );
}
