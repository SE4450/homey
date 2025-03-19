import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import useAxios from "../hooks/useAxios";
import Dropdown from "./dropdown";
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  textAreaFormat: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "white",
    borderColor: "#ddd",
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#4a90e2",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  tableContainer: {
    marginTop: 16,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 30,
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: "#0047AB",
    padding: 12,
  },
  tableRow: {
    width: "25%",
    paddingHorizontal: 4,
  },
  tableCaption: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
  tableBody: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  tableData: {
    fontSize: 14,
  },
  actionButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    padding: 8,
    alignItems: "center",
    marginTop: 4,
  },
  actionButtonText: {
    fontSize: 11,
    color: "#333",
    fontWeight: "500",
  },
  deleteButton: {
    backgroundColor: "#ffebee",
    borderRadius: 6,
    padding: 8,
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: 11,
    color: "#d32f2f",
    fontWeight: "500",
  },
  purchaseButton: {
    backgroundColor: "#e8f5e9",
    borderRadius: 6,
    padding: 8,
    alignItems: "center",
  },
  purchaseButtonText: {
    fontSize: 11,
    color: "#388e3c",
    fontWeight: "500",
  },
  dropdown: {
    width: "100%",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedOption: {
    backgroundColor: "#f5f5f5",
    padding: 8,
    borderRadius: 6,
  },
  emptyListMessage: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginTop: 40,
    marginBottom: 40,
  },
  purchasedItem: {
    backgroundColor: "#f5f5f5",
    opacity: 0.7,
  },
  purchasedText: {
    textDecorationLine: "line-through",
    color: "#888",
  },
});
export default function Lists(props: {
  name: String;
  id: Number;
  houseId: any;
}) {
  const [listItems, setListItems] = useState(
    [] as Array<{
      item: String;
      AssignedTo: String;
      itemId: Number;
      purchased: String;
    }>
  );
  const [item, setItem] = useState("");
  const [users, setUsers] = useState(
    [] as Array<{ id: number; firstName: string; lastName: string }>
  );
  const [isLoading, setIsLoading] = useState(true);
  const { post, get, error } = useAxios();
  useEffect(() => {
    // Load both data sources and then set loading to false
    Promise.all([getItems(), fetchRoommates()]).finally(() =>
      setIsLoading(false)
    );
  }, []);
  const fetchRoommates = async () => {
    try {
      const response = await get<any>(`/api/users`);
      if (response && response.data) {
        setUsers(response.data);
      }
      return response;
    } catch (error) {
      console.error("Error fetching roommates:", error);
      Alert.alert("Error", "Failed to load roommates. Please try again.");
      return null;
    }
  };
  const getItems = async () => {
    try {
      const body = { listId: props.id };
      const response = await get<any>("/api/lists/items", body);
      setListItems([]);
      if (response) {
        response.data.forEach(
          (item: {
            listId: Number;
            itemId: Number;
            item: String;
            assignedTo: string;
            createdAt: String;
            updatedAt: String;
            purchased: Number;
          }) => {
            let purchaseVal = "No";
            let assignmentVal = "";
            if (item.purchased) {
              purchaseVal = "Yes";
            }
            if (item.assignedTo != null) {
              assignmentVal = item.assignedTo;
            }
            setListItems((l) => [
              ...l,
              {
                item: item.item,
                AssignedTo: assignmentVal,
                itemId: item.itemId,
                purchased: purchaseVal,
              },
            ]);
          }
        );
      }
      return response;
    } catch (error) {
      console.error("Error fetching list items:", error);
      return null;
    }
  };
  const addItem = async () => {
    if (item != "") {
      const body = { listId: props.id, item: item };
      const response = await post<any>("/api/lists/createItem", body);
      if (response) {
        getItems();
        setItem("");
      }
    } else {
      Alert.alert("Error", "You must enter an item");
    }
  };
  const deleteRow = async (deleteItemId: Number) => {
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: async () => {
          const body = { listId: props.id, rowNum: deleteItemId };
          const response = await post<any>("/api/lists/deleteItem", body);
          if (response) {
            getItems();
            Alert.alert("Success", "Item deleted successfully");
          }
        },
        style: "destructive",
      },
    ]);
  };
  const confirmPurchase = async (
    itemId: Number,
    itemName: String,
    purchased: String
  ) => {
    if (purchased.toLowerCase() == "no") {
      const body = {
        rowNum: itemId,
        listId: props.id,
        item: null,
        assignedTo: null,
        purchased: 1,
      };
      const response = await post<any>("/api/lists/updateItem", body);
      if (response) {
        getItems();
        const inventoryBody = { itemName: itemName, houseId: props.houseId };
        const inventoryResponse = await post<any>(
          "/api/inventory/createInventory",
          inventoryBody
        );
        if (inventoryResponse) {
          Alert.alert(
            "Success",
            "Item marked as purchased and added to inventory"
          );
        }
      }
    } else {
      Alert.alert(
        "Already Purchased",
        `${itemName} has already been purchased`
      );
    }
  };
  const updateAssigment = async (itemId: Number, assignee: String) => {
    const body = {
      rowNum: itemId,
      listId: props.id,
      item: null,
      assignedTo: assignee,
      purchased: 0,
    };
    const response = await post<any>("/api/lists/updateItem", body);
    if (response) {
      // Find the user name for the success message
      const assignedUser = users.find(
        (user) => user.id.toString() === assignee.toString()
      );
      const userName = assignedUser
        ? `${assignedUser.firstName} ${assignedUser.lastName}`
        : assignee;
      getItems();
      Alert.alert("Success", `Item assigned to ${userName}`);
    }
  };
  // Helper function to get full name from user ID
  const getUserFullName = (userId: string) => {
    // If userId is empty, return "Assign"
    if (!userId || userId.trim() === "") {
      return "Assign";
    }
    // Try to find the user by ID
    const user = users.find((user) => user.id.toString() === userId.toString());
    // Return the full name if found, otherwise return the ID to at least show something
    return user ? `${user.firstName} ${user.lastName}` : userId;
  };
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.listTitle}>{props.name}</Text>
      <Text style={styles.inputLabel}>New Entry:</Text>
      <TextInput
        style={styles.textAreaFormat}
        placeholder="Enter Item Name"
        value={item}
        onChangeText={(text) => setItem(text)}
      />
      <TouchableOpacity style={styles.addButton} onPress={addItem}>
        <Text style={styles.addButtonText}>Add Item To List</Text>
      </TouchableOpacity>
      {isLoading ? (
        <Text style={styles.emptyListMessage}>Loading...</Text>
      ) : listItems.length > 0 ? (
        <View style={styles.tableContainer}>
          <View style={styles.tableHead}>
            <View style={styles.tableRow}>
              <Text style={styles.tableCaption}>Item</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCaption}>Assigned To</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCaption}>Status</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCaption}>Actions</Text>
            </View>
          </View>
          {listItems.map((item, index) => (
            <View
              key={`row_${index}`}
              style={[
                styles.tableBody,
                item.purchased === "Yes" ? styles.purchasedItem : null,
              ]}
            >
              <View style={styles.tableRow}>
                <Text
                  style={[
                    styles.tableData,
                    item.purchased === "Yes" ? styles.purchasedText : null,
                  ]}
                >
                  {item.item}
                </Text>
              </View>
              <View style={styles.tableRow}>
                <Dropdown
                  options={users.map(
                    (user) => `${user.firstName} ${user.lastName}`
                  )}
                  onOptionSelect={(option) => {
                    const selectedUser = users.find(
                      (user) => `${user.firstName} ${user.lastName}` === option
                    );
                    if (selectedUser) {
                      updateAssigment(item.itemId, selectedUser.id.toString());
                    }
                  }}
                  customStyle={{
                    containerStyle: styles.dropdown,
                    selectedOptionStyle: styles.selectedOption,
                  }}
                  placeholder={getUserFullName(
                    item.AssignedTo ? item.AssignedTo.toString() : ""
                  )}
                  key={`dropdown-${item.itemId}-${item.AssignedTo}`}
                />
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableData}>
                  {item.purchased === "Yes" ? (
                    <Text style={{ color: "green" }}>Purchased</Text>
                  ) : (
                    <Text style={{ color: "orange" }}>Pending</Text>
                  )}
                </Text>
              </View>
              <View style={styles.tableRow}>
                {item.purchased === "No" && (
                  <TouchableOpacity
                    style={styles.purchaseButton}
                    onPress={() =>
                      confirmPurchase(item.itemId, item.item, item.purchased)
                    }
                  >
                    <Text style={styles.purchaseButtonText}>Purchased</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteRow(item.itemId)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyListMessage}>
          No items in this list yet. Add your first item above!
        </Text>
      )}
    </ScrollView>
  );
}
