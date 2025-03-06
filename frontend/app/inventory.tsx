import { View, ScrollView, StyleSheet, Text, TextInput, Button, Pressable, Alert } from "react-native";
import { useState, useEffect } from "react";

import useAxios from "../app/hooks/useAxios";
import { useAuth } from "../app/context/AuthContext";
import { useIsFocused } from "@react-navigation/native";


const styles = StyleSheet.create({
    button: {
        fontSize: 25,
        paddingLeft: 15,
        paddingRight: 15
    },
    /* CSS for the table */
    table: {
        margin: 15,
        alignItems: "center",
    },
    tableHead: {
        flexDirection: "row",
        backgroundColor: "#4CAF50",
        padding: 10
    },
    tableRow: {
        width: "35%",
        flexDirection: "row",
        alignItems: "center",
    },
    tableCaption: {
        color: "white",
        fontWeight: "bold"
    },
    tableBody: {
        flexDirection: "row",
        padding: 10,
    },
    tableData: {
        fontSize: 15
    }
});


export default function Inventory() {
    //variables
    const [inventoryItems, setInventoryItems] = useState([] as Array<{itemId: Number, itemName: String, quantity: Number}>);
    const [item, setItem] = useState("");

    //fetch requests
    const { post, get, error } = useAxios();

    //get the userId
    const { userToken, userId } = useAuth();

    //variable to determine if we are in the screen
    const isFocused = useIsFocused();

    //call for the inventory items
    useEffect(() => {
        if(isFocused) {
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
    const getItems = async() => {
        //make a fetch request to get any items for the selected list
        const body = { houseId: userId } //this will need to be changed to the houseId when we have it
        const response = await get<any>("/api/inventory", body);

        if(response) {
            //clear the set list items
            setInventoryItems([]);
            response.data.forEach((item: {itemId: Number, houseId: Number, itemName: String, quantity: Number}) => {
                setInventoryItems(l => [...l, {itemId: item.itemId, itemName: item.itemName, quantity: item.quantity}]);
            });
        }
    }

    /*
    //function to add an item to the list
    const addItem = async() => {
        if(item != "") {
            //make a fetch request to add the new item to the database
            const body = { houseId: userId, itemName: item };
            const response = await post<any>("/api/inventory/createInventory", body);

            if(response) {
                getItems();
            }
        }
        else {
            alert("You must enter an item");
        }
    }
    */

    //function to add an item to the list
    const addItem = async(itemName: String) => {
        
        //make a fetch request to add the new item to the database
        const body = { houseId: userId, itemName: itemName };
        const response = await post<any>("/api/inventory/createInventory", body);

        if(response) {
            getItems();
        }
    }



    //function to decrement the inventory
    const removeItem = async(itemId: Number, quantity: Number) => {
        const body = { itemId: itemId, houseId: userId, quantity: quantity }

        //call the post request
        const response = await post<any>("/api/inventory/removeQuantity", body);

        if(response) {
            //if the inventory is now empty alert the user
            if(response.message.includes("There is only one more ")) {
                Alert.alert("Inventory Low", response.message);
            }
            //getItems();
            setInventoryItems(inventoryItems.map((item) => item.itemId == itemId ? { itemId: item.itemId, itemName: item.itemName, quantity: item.quantity.valueOf()-1 } : { itemId: item.itemId, itemName: item.itemName, quantity: item.quantity } ));
        }
    }


    return(
        <ScrollView>

            <View style={styles.tableHead}>
            
                <View style={styles.tableRow}>
                    <Text style={styles.tableCaption}>Item</Text>
                </View>
                <View style={styles.tableRow}>
                    <Text style={styles.tableCaption}>Quantity</Text>
                </View>

            </View>

            {
                inventoryItems.map((item, index) => 
                    <View key={"viewnode_row"+index} style={styles.tableBody}>

                        <View key={item.itemName+"viewnode"} style={styles.tableRow}>
                            <Text key={item.itemName+"textnode"} style={styles.tableData}>{item.itemName}</Text>
                        </View>
                        <View key={item.itemName+"quantityviewnode"} style={styles.tableRow}>
                            <Pressable key={"incrementRow_"+index} onPress={() => {addItem(item.itemName)}}><Text style={styles.button}>+</Text></Pressable>
                            <Text key={item.itemName+"quantitytextnode"} style={styles.tableData}>{`${item.quantity}`}</Text>
                            <Pressable key={"decrementRow_"+index} onPress={() => {removeItem(item.itemId, item.quantity)}}><Text style={styles.button}>-</Text></Pressable>
                        </View>
                        
                    </View> 
                )
            }
        </ScrollView>
    )
}