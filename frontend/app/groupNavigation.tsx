import React, { useState, useEffect } from "react";
import { ActivityIndicator, Alert } from "react-native";
import useAxios from "./hooks/useAxios";
import { useAuth } from "./context/AuthContext";
import { useRouter, useLocalSearchParams } from "expo-router";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";

import HomeScreen from "./home";
import ProfileScreen from "./profile";
import ListScreen from "./listDisplay";
import ExpenseScreen from "./expenses";
import MessageStackScreen from "./stacks/messagesStack";
import InventoryScreen from "./inventory";
import CalendarStackScreen from "./stacks/calendarStack";
import ChoresStackScreen from "./stacks/choresStack";
import GroupStackScreen from "./stacks/groupsStack";

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
  const { groupId, role } = useLocalSearchParams();
  const groupIdString = groupId as string;
  const roleString = role as string;

  useEffect(() => {
    if (error) {
      //Alert.alert("Error", error);
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

          switch (route.name) {
            case "Home":
              iconName = "home";
              break;
            case "Profile":
              iconName = "account-circle";
              break;
            case "List":
              iconName = "shopping-cart";
              break;
            case "Expenses":
              iconName = "paid";
              break;
            case "Chores":
              iconName = "checklist";
              break;
            case "Messages":
              iconName = "message";
              break;
            case "Inventory":
              iconName = "inventory";
              break;
            case "Group":
              iconName = "groups";
              break;
            case "Calendar":
              iconName = "calendar-month";
              break;
            default:
              iconName = "help";
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: "grey",
      })}
    >
      <Tab.Screen name="Home">
        {() => <HomeScreen groupId={groupIdString} role={roleString} />}
      </Tab.Screen>
      <Tab.Screen name="Expenses">
        {() => <ExpenseScreen groupId={groupIdString} role={roleString} />}
      </Tab.Screen>
      <Tab.Screen name="Chores">
        {() => <ChoresStackScreen groupId={groupIdString} role={roleString} />}
      </Tab.Screen>
      <Tab.Screen name="Messages">
        {() => <MessageStackScreen groupId={groupIdString} role={roleString} />}
      </Tab.Screen>
      <Tab.Screen name="Group" options={{ headerShown: false }} >
        {() => <GroupStackScreen groupId={groupIdString} role={roleString} />}
      </Tab.Screen>
      <Tab.Screen name="Calendar">
        {() => <CalendarStackScreen groupId={groupIdString} role={roleString} />}
      </Tab.Screen>

      {/* Show additional tabs only for tenants */}
      {roleString == "tenant" && (
        <>
          <Tab.Screen name="Profile">
            {() => <ProfileScreen groupId={groupIdString} role={roleString} />}
          </Tab.Screen>
          <Tab.Screen name="List">
            {() => <ListScreen groupId={groupIdString} role={roleString} />}
          </Tab.Screen>
          <Tab.Screen name="Inventory">
            {() => <InventoryScreen groupId={groupIdString} role={roleString} />}
          </Tab.Screen>
        </>
      )}
    </Tab.Navigator>
  );
}