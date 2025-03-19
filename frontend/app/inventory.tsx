import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Button,
  Pressable,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";

import useAxios from "../app/hooks/useAxios";
import { useAuth } from "../app/context/AuthContext";
import { useIsFocused } from "@react-navigation/native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  header: {
    backgroundColor: "#4a90e2",
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginHorizontal: 15,
    marginTop: 15,
  },
  headerText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  itemColumn: {
    flex: 2,
  },
  quantityColumn: {
    flex: 1,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginHorizontal: 15,
  },
  lastRow: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginBottom: 15,
  },
  itemText: {
    fontSize: 16,
    color: "#333",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  quantityText: {
    fontSize: 16,
    color: "#333",
    marginHorizontal: 10,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4a90e2",
    justifyContent: "center",
    alignItems: "center",
  },
  decrementButton: {
    backgroundColor: "#ff5252",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  addItemContainer: {
    flexDirection: "row",
    marginHorizontal: 15,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: "white",
    marginRight: 10,
  },
  addButton: {
    backgroundColor: "#4a90e2",
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 10,
  },
});

type InventoryScreenProps = {
  groupId: string;
  role: string;
};

export default function Inventory({ groupId, role }: InventoryScreenProps) {
  const [inventoryItems, setInventoryItems] = useState([] as Array<{ itemId: Number; itemName: String; quantity: Number }>);
  const [item, setItem] = useState("");
  const [newItem, setNewItem] = useState("");

  //fetch requests
  const { post, get, error } = useAxios();

  //get the userId
  const { userToken, userId } = useAuth();

  //variable to determine if we are in the screen
  const isFocused = useIsFocused();

  //call for the inventory items
  useEffect(() => {
    if (isFocused) {
      getItems();
    }
  }, [isFocused]);

  //useEffect that is triggered on errors
  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
    }
  }, [error]);

  //function to get the house inventory
  const getItems = async () => {
    //make a fetch request to get any items for the selected list
    const response = await get<any>(`/api/inventory/${groupId}`);

    //clear the set list items
    setInventoryItems([]);
    if (response) {
      response.data.forEach(
        (item: {
          itemId: Number;
          houseId: Number;
          itemName: String;
          quantity: Number;
        }) => {
          setInventoryItems((l) => [
            ...l,
            {
              itemId: item.itemId,
              itemName: item.itemName,
              quantity: item.quantity,
            },
          ]);
        }
      );
    }
  };

  //function to add an item to the list
  const addItem = async (itemName: String) => {
    //make a fetch request to add the new item to the database
    const body = { groupId, itemName: itemName };
    const response = await post<any>("/api/inventory/createInventory", body);

    if (response) {
      getItems();
    }
  };

  //function to decrement the inventory
  const removeItem = async (itemId: Number, quantity: Number) => {
    const body = { itemId: itemId, quantity: quantity };

    //call the post request
    const response = await post<any>("/api/inventory/removeQuantity", body);

    if (response) {
      //if the inventory is almost empty alert the user
      if (response.message.includes("There is only one more ")) {
        Alert.alert("Inventory Low", response.message);
      }
      //if the inventory is empty remove it from the displayed list
      if (response.data.quantity == 1) {
        const deleteItemBody = { itemId: itemId };
        const deleteInventoryResponse = await post<any>(
          "/api/inventory/deleteItem",
          deleteItemBody
        );

        if (deleteInventoryResponse) {
          getItems();
        }
      } else {
        setInventoryItems(
          inventoryItems.map((item) =>
            item.itemId == itemId
              ? {
                itemId: item.itemId,
                itemName: item.itemName,
                quantity: item.quantity.valueOf() - 1,
              }
              : {
                itemId: item.itemId,
                itemName: item.itemName,
                quantity: item.quantity,
              }
          )
        );
      }
    }
  };

  // Function to add a new item from input
  const handleAddNewItem = () => {
    if (newItem.trim()) {
      addItem(newItem.trim());
      setNewItem("");
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Add new item input */}
      <View style={[styles.addItemContainer, { marginTop: 10 }]}>
        <TextInput
          style={styles.input}
          placeholderTextColor="grey"
          placeholder="Add new item..."
          value={newItem}
          onChangeText={setNewItem}
        />
        <Pressable style={styles.addButton} onPress={handleAddNewItem}>
          <Text style={styles.buttonText}>Add</Text>
        </Pressable>
      </View>

      {/* Table header */}
      <View style={styles.header}>
        <View style={styles.itemColumn}>
          <Text style={styles.headerText}>Item</Text>
        </View>
        <View style={styles.quantityColumn}>
          <Text style={styles.headerText}>Quantity</Text>
        </View>
      </View>

      {/* Inventory items */}
      {inventoryItems.length > 0 ? (
        inventoryItems.map((item, index) => (
          <View
            key={`row_${item.itemId}`}
            style={[
              styles.row,
              index === inventoryItems.length - 1 && styles.lastRow,
            ]}
          >
            <View style={styles.itemColumn}>
              <Text style={styles.itemText}>{item.itemName}</Text>
            </View>
            <View style={styles.quantityColumn}>
              <View style={styles.quantityContainer}>
                <Pressable
                  style={[styles.quantityButton, styles.decrementButton]}
                  onPress={() => removeItem(item.itemId, item.quantity)}
                >
                  <Text style={styles.buttonText}>-</Text>
                </Pressable>
                <Text style={styles.quantityText}>
                  {item.quantity.toString()}
                </Text>
                <Pressable
                  style={styles.quantityButton}
                  onPress={() => addItem(item.itemName)}
                >
                  <Text style={styles.buttonText}>+</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ))
      ) : (
        <View style={[styles.row, styles.lastRow, styles.emptyState]}>
          <Text style={styles.emptyStateText}>
            Your inventory is empty. Add items using the field above.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
