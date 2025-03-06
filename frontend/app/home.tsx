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
import { useIsFocused } from "@react-navigation/native";

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
  const [inventoryAlert, setInventoryAlert] = useState([] as Array<{itemName: String}>);
  const { userToken, userId, logout } = useAuth();
  const { get, error } = useAxios();
  const router = useRouter();
  const isFocused = useIsFocused();

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

  useEffect(() => {
    if(isFocused) {
      lowInventoryAlert();
    }
  }, [isFocused]);

  const handleNavigation = (path: any, params = {}) => {
    router.push({ pathname: path, params });
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const lowInventoryAlert = async () => {
    setInventoryAlert([]);

    const response = await get<any>(`/api/inventory/getLowItem?houseId=${userId}&quantity=1&quantity=0`);

    if(response) {
      response.data.forEach((item: {itemId: Number, houseId: Number, itemName: String, quantity: Number}) => {
      setInventoryAlert(l => [...l, {itemName: item.itemName}])
      })
    }
  }

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
        { 
          inventoryAlert.length != 0 &&
          <View style={styles.alertContainer}>
            <Text style={styles.alertHeading}>Alerts</Text>
            <Text style={styles.alertHeader}>Low Inventory:</Text>
            {
              inventoryAlert.map((item) => <Text key={item.itemName+"textnode"} style={styles.alertText}>{item.itemName}</Text>)
            }
          </View>
        }
      </View>

      {/*
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
      */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: COLORS.LIGHT_GRAY,
    /*
    alignItems: "center",
    justifyContent: "space-evenly"
    */
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
    paddingBottom: 10
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
  alertContainer: {
    alignItems: "center",
    borderWidth: 1,
    paddingLeft: 50,
    paddingRight: 50,
    backgroundColor: COLORS.WHITE
  },
  alertHeading: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.LOGOUT,
  },
  alertHeader: {
    fontSize: 20,
    fontWeight: "bold"
  },
  alertText: {
    fontSize: 20,
  },
});