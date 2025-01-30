import { View, ScrollView, SafeAreaView, StyleSheet, Text, TextInput, Button, Pressable, Alert } from "react-native";
import { useState, useEffect } from "react";

import useAxios from "../hooks/useAxios";
import StoreSearch from "./StoreSearch";
import Dropdown from "./dropdown";

//stylesheet for the component
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
    tableContainer: {
        paddingBottom: 30
    },
    table: {
        margin: 15
    },
    tableHead: {
        flexDirection: "row",
        backgroundColor: "blue",
        padding: 10
    },
    tableRow: {
        width: "21%",
        paddingRight: 5
    },
    tableCaption: {
        color: "white",
        fontWeight: "bold",
        fontSize: 13
    },
    tableBody: {
        flexDirection: "row",
        padding: 10
    },
    tableData: {
        fontSize: 11
    },
    /* For the dropdown */
    dropdown: {
        width: "100%",
    },
    selectedOption: {
        backgroundColor: "lightgray",
        padding: 8,
        borderRadius: 8,
    },
});


export default function Lists (props: {name: String, id: Number, houseId: any}) {
    //use states go here
    const [listItems, setListItems] = useState([] as Array<{item: String, AssignedTo: String, itemId: Number, purchased: String }>);
    const [item, setItem] = useState("");
    const [users, setUsers] = useState([] as Array<any>);
    //const [assignment, setAssignment] = useState("");

    const { post, get, error } = useAxios();

    //once the page loads we get all the items in the list
    useEffect(() => {
        getItems();
        /*
        if (error) {
            Alert.alert("Error", error);
        }
        */
    }, []);

    /*
    //useEffect to get all the users in the house
    useEffect(() => {
        //make a fetch request to get the users in the house

        if(response) {
            response.data.forEach((user: String) => {
                setUsers(u => [...u, user]);
            })
        }
    }, []);
    */

    //function to initalize the listItem array with anything in the database
    const getItems = async() => {
        //make a fetch request to get any items for the selected list
        const body = { listId: props.id }
        const response = await get<any>("/api/lists/items", body);

        //clear the set list items
        setListItems([]);

        if(response) {
            response.data.forEach((item: {listId: Number, itemId: Number, item: String, assignedTo: string, createdAt: String, updatedAt: String, purchased: Number}) => {
                let purchaseVal = "No"
                let assignmentVal = "";
                if(item.purchased) {
                    purchaseVal = "Yes";
                }
                if(item.assignedTo != null) {
                    assignmentVal = item.assignedTo;
                }
                setListItems(l => [...l, {item: item.item, AssignedTo: assignmentVal, itemId: item.itemId, purchased: purchaseVal }]);
            });
        }
    }

    //function to add an item to the list
    const addItem = async() => {
        if(item != "") {
            //make a fetch request to add the new item to the database
            const body = { listId: props.id, item: item };  //, assignedTo: assignment
            const response = await post<any>("/api/lists/createItem", body);

            if(response) {
                //add the new item and assignment to the table
                //setListItems(l => [...l, {item: response.data.item, AssignedTo: response.data.assignedTo, itemId: response.data.itemId, purchased: response.data.purchased }]);
                getItems();
            }
        }
        else {
            alert("You must enter an item");
        }
    }

    //function to delete a row from the list
    const deleteRow = async(deleteItemId: Number) => {
        //call the fetch request to delete the selected row from the database
        const body = { listId: props.id, rowNum: deleteItemId };
        const response = await post<any>("/api/lists/deleteItem", body);

        if(response) {
            //setListItems(listItems.filter((_, i) => i !== deleteIndex))
            getItems();
            alert("Row Deleted");
        }
    }

    //function to confirm the item was purchased
    const confirmPurchase = async(itemId: Number, itemName: String, purchased: String) => {
        //if the item is not already purchased we can do a purchase on it
        if(purchased.toLowerCase() == "no") {
            const body = { rowNum: itemId, listId: props.id, item: null, assignedTo: null, purchased: 1 }

            const response = await post<any>("/api/lists/updateItem", body);

            if(response) {
                //update the list
                getItems();
                alert("Item was purchased");

                const inventoryBody = {itemName: itemName , houseId: props.houseId }

                //now update the inventory
                const inventoryResponse = await post<any>("/api/inventory/createInventory", inventoryBody);

                if(inventoryResponse) {
                    alert("Item successfully added to the inventory");
                }
            }
        }
        else {
            alert(`${itemName} has already been purchased`);
        }
    }

    //function to update the assignment
    const updateAssigment = async(itemId: Number, assignee: String) => {
        //call to update the backend
        const body = {  rowNum: itemId, listId: props.id, item: null, assignedTo: assignee, purchased: 0 };

        const response = await post<any>("/api/lists/updateItem", body);

        if(response) {
            alert(`Assignment updated to ${assignee}`);
        }
    }

    return (
        <ScrollView>

            <Text>{props.name}</Text>
            <Text>New Entry: </Text>
            <TextInput style={styles.textAreaFormat} placeholder="Type New List Entry Here" onChangeText={text => setItem(text)}></TextInput>
            <Button title="Add Item To List" onPress={addItem} /> 

            
            <View style={styles.tableContainer}>
                
                <View style={styles.tableHead}>

                    <View style={styles.tableRow}>
                        <Text style={styles.tableCaption}>Purchased</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCaption}>Item</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCaption}>Assigned To</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCaption}>Purchased</Text>
                    </View>

                </View>

                {
                    listItems.map((item, index) => 
                        <View key={"viewnode_row"+index} style={styles.tableBody}>
                            <View key={item.item+"purchaseButtonnode"} style={styles.tableRow}>
                                <Pressable key={item.item+"purchaseButton_"} onPress={() => {confirmPurchase(item.itemId, item.item, item.purchased)}}><Text style={styles.button}>Confirm Purchase</Text></Pressable>
                            </View>
                            <View key={item.item+"viewnode"} style={styles.tableRow}>
                                <Text key={item.item+"textnode"} style={styles.tableData}>{item.item}</Text>
                            </View>
                            <View key={item.item+"AssignedToviewnode"} style={styles.tableRow}>
                                
                                <Dropdown
                                    options={["Roomate1", "Roomate2"]}
                                    onOptionSelect={option => updateAssigment(item.itemId, option)}
                                    customStyle={{
                                        containerStyle: styles.dropdown,
                                        selectedOptionStyle: styles.selectedOption,
                                    }}
                                    placeholder={`${item.AssignedTo}`}
                                />

                            </View>
                            <View key={item.item+"purchasedviewnode"} style={styles.tableRow}>
                                <Text key={item.item+"purchasedtextnode"} style={styles.tableData}>{item.purchased}</Text>
                            </View>
                            <Pressable key={"deleteRow_"+index} onPress={() => {deleteRow(item.itemId)}}><Text style={styles.button}>Delete Row</Text></Pressable>
                            
                        </View> 
                    )
                }
                

            </View>

            <StoreSearch />

        </ScrollView>
    )
}