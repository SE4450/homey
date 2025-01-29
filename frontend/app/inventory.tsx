import { View, ScrollView, StyleSheet, Text, TextInput, Button, Pressable, Alert } from "react-native";
import { useState, useEffect } from "react";

import useAxios from "../app/hooks/useAxios";
import { useAuth } from "../app/context/AuthContext";


const styles = StyleSheet.create({
    textAreaFormat : {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        backgroundColor: "white"
    },
    button: {
        fontSize: 11
    },
    /* CSS for the table */
    table: {
        margin: 15
    },
    tableHead: {
        flexDirection: "row",
        backgroundColor: "blue",
        padding: 10
    },
    tableRow: {
        width: "35%"
    },
    tableCaption: {
        color: "white",
        fontWeight: "bold"
    },
    tableBody: {
        flexDirection: "row",
        padding: 10
    },
    tableData: {
        fontSize: 11
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

    //call for the inventory items
    useEffect(() => {
        getItems();            
    }, []);

    //useEffect that is triggered on errors
    useEffect(() => {
        if (error) {
            Alert.alert("Error", error);
        }
    }, [error]);

    //function to get the house inventory
    const getItems = async() => {
        //clear the set list items
        setInventoryItems([]);
        //make a fetch request to get any items for the selected list
        const body = { houseId: userId } //this will need to be changed to the houseId when we have it
        const response = await get<any>("/api/inventory", body);

        if(response) {
            response.data.forEach((item: {itemId: Number, houseId: Number, itemName: String, quantity: Number}) => {
                console.log(`ITEM NAME: ${item.itemName}`);
                setInventoryItems(l => [...l, {itemId: item.itemId, itemName: item.itemName, quantity: item.quantity}]);
            });
        }
    }


    //function to add an item to the list
    const addItem = async() => {
        if(item != "") {
            //make a fetch request to add the new item to the database
            const body = { houseId: userId, itemName: item };
            const response = await post<any>("/api/inventory/createInventory", body);

            if(response) {
                getItems();
                /*
                //add the new item and assignment to the table
                setInventoryItems(l => [...l, {itemId: response.data.itemId, itemName: response.data.itemName, quantity: response.data.quantity}]);
                */
            }
        }
        else {
            alert("You must enter an item");
        }
    }



    //function to decrement the inventory
    const removeItem = async(itemId: Number, quantity: Number) => {
        const body = { itemId: itemId, houseId: userId, quantity: quantity }

        //call the post request
        const response = await post<any>("/api/inventory/removeQuantity", body);

        if(response) {
            getItems();
        }
    }

    return(
        <View>

            <Text>New Entry: </Text>
            <TextInput style={styles.textAreaFormat} placeholder="Type New List Entry Here" onChangeText={text => setItem(text)}></TextInput>
            <Button title="Add Item To List" onPress={addItem} /> 

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
                            <Text key={item.itemName+"quantitytextnode"} style={styles.tableData}>{`${item.quantity}`}</Text>
                        </View>
                        <Pressable key={"deleteRow_"+index} onPress={() => {removeItem(item.itemId, item.quantity)}}><Text style={styles.button}>Decrement</Text></Pressable>
                    </View> 
                )
            }
        </View>
    )
}