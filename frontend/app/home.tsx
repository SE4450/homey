import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView
} from "react-native";
import useAxios from "./hooks/useAxios";
import { useIsFocused } from "@react-navigation/native";
import useUser from "./hooks/useUser";

const COLORS = {
  PRIMARY: "#4CAF50",
  SECONDARY: "#FF9800",
  WHITE: "#FFFFFF",
  BLACK: "#000000",
  TEXT: "#333333",
  LIGHT_GRAY: "#F5F5F5",
  LOGOUT: "#D32F2F",
};

type HomeScreenProps = {
  groupId: string;
  role: string;
};

export default function HomeScreen({ groupId, role }: HomeScreenProps) {
  const [inventoryAlert, setInventoryAlert] = useState([] as Array<{ itemName: String }>);
  const { user, userLoading, userError } = useUser();
  const { get, error } = useAxios();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
    }
  }, [error]);

  useEffect(() => {
    if (isFocused) {
      lowInventoryAlert();
    }
  }, [isFocused]);

  const lowInventoryAlert = async () => {

    setInventoryAlert([]);

    const response = await get<any>(`/api/inventory/getLowItem?houseId=${user.id}&quantity=1&quantity=0`);

    if (response) {
      response.data.forEach((item: { itemId: Number, houseId: Number, itemName: String, quantity: Number }) => {
        setInventoryAlert(l => [...l, { itemName: item.itemName }])
      });
    }
  }

  if (userLoading) return <ActivityIndicator size="large" color="#0000ff" />;
  if (userError) return <Text>Error: {userError}</Text>;
  if (!user) return <Text>No user found.</Text>;

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
              inventoryAlert.map((item) => <Text key={item.itemName + "textnode"} style={styles.alertText}>{item.itemName}</Text>)
            }
          </View>
        }

      </View>
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
  }
});