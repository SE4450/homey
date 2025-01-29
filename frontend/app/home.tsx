import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from "react-native";
import useAxios from "./hooks/useAxios";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "expo-router";

const COLORS = {
  PRIMARY: "#4CAF50",
  SECONDARY: "#FF9800",
  WHITE: "#FFFFFF",
  BLACK: "#000000",
  TEXT: "#333333",
  LIGHT_GRAY: "#F5F5F5",
  LOGOUT: "#D32F2F",
};

export default function HomeScreen() {
  const [user, setUser] = useState<any>({});
  const { userToken, userId, logout } = useAuth();
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

  const handleNavigation = (path: any, params = {}) => {
    router.push({ pathname: path, params });
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (!userToken) {
    return <ActivityIndicator size="large" color={COLORS.PRIMARY} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome, {user.firstName} {user.lastName}
        </Text>
        <Text style={styles.heading}>Homeys</Text>
      </View>
      <View style={styles.buttonContainer}>
        {[
          { title: "Profile", path: "/profile", params: { username: user.username } },
          { title: "Lists", path: "/listDisplay" },
          { title: "Expenses", path: "/expenses" },
          { title: "Chores", path: "/chores" },
          { title: "Messages", path: "/contacts" },
          { title: "Inventory", path: "/inventory"},
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.button, { backgroundColor: COLORS.PRIMARY }]}
            onPress={() => handleNavigation(item.path, item.params)}
          >
            <Text style={styles.buttonText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: COLORS.LOGOUT }]}
          onPress={handleLogout}
        >
          <Text style={[styles.buttonText, { color: COLORS.WHITE }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: COLORS.LIGHT_GRAY,
    alignItems: "center",
  },
  header: {
    marginBottom: 30,
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 18,
    color: COLORS.TEXT,
    marginBottom: 10,
  },
  heading: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.PRIMARY,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  button: {
    width: "80%",
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.WHITE,
  },
});