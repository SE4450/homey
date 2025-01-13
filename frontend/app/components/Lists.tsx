import { View, ScrollView, StyleSheet, Text, TextInput, Button, Pressable, Alert } from "react-native";
import { useState, useEffect } from "react";

import useAxios from "../hooks/useAxios";
import StoreSearch from "./StoreSearch";

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


export default function Lists (props: {name: String, id: Number}) {
    //use states go here
    const [listItems, setListItems] = useState([] as Array<{item: String, AssignedTo: String, itemId: Number}>);
    const [item, setItem] = useState("");
    const [assignment, setAssignment] = useState("");

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

    //function to initalize the listItem array with anything in the database
    const getItems = async() => {
        //clear the set list items
        setListItems([]);
        //make a fetch request to get any items for the selected list
        const body = { listId: props.id }
        const response = await get<any>("/api/lists/items", body);

        if(response) {
            response.data.forEach((item: {listId: Number, itemId: Number, item: String, assignedTo: String, createdAt: String, updatedAt: String}) => {
                setListItems(l => [...l, {item: item.item, AssignedTo: item.assignedTo, itemId: item.itemId}]);
            });
        }
    }

    //function to add an item to the list
    const addItem = async() => {
        if(item != "" && assignment != "") {
            //make a fetch request to add the new item to the database
            const body = { listId: props.id, item: item, assignedTo: assignment };
            const response = await post<any>("/api/lists/createItem", body);

            if(response) {
                //add the new item and assignment to the table
                setListItems(l => [...l, {item: response.data.item, AssignedTo: response.data.assignedTo, itemId: response.data.itemId}]);
                //getItems();
            }
        }
        else {
            alert("You must enter an item and an assignment");
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

    return (
        <ScrollView>

            <Text>{props.name}</Text>
            <Text>New Entry: </Text>
            <TextInput style={styles.textAreaFormat} placeholder="Type New List Entry Here" onChangeText={text => setItem(text)}></TextInput>

            <Text>Assigned To: </Text>
            <TextInput style={styles.textAreaFormat} placeholder="Type List Assignment Here" onChangeText={text => setAssignment(text)}></TextInput>
            <Button title="Add Item To List" onPress={addItem} /> 

            
            <View>
                
                <View style={styles.tableHead}>

                    <View style={styles.tableRow}>
                        <Text style={styles.tableCaption}>Item</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCaption}>Assigned To</Text>
                    </View>

                </View>

                {
                    listItems.map((item, index) => 
                        <View key={"viewnode_row"+index} style={styles.tableBody}>

                            <View key={item.item+"viewnode"} style={styles.tableRow}>
                                <Text key={item.item+"textnode"} style={styles.tableData}>{item.item}</Text>
                            </View>
                            <View key={item.AssignedTo.concat(item.item+"viewnode")} style={styles.tableRow}>
                                <Text key={item.AssignedTo.concat(item.item+"textnode")} style={styles.tableData}>{item.AssignedTo}</Text>
                            </View>
                            <Pressable key={"deleteRow_"+index} onPress={() => {deleteRow(item.itemId)}}><Text style={styles.button}>Delete</Text></Pressable>
                        </View> 
                    )
                }
                

            </View>

            <StoreSearch />

        </ScrollView>
    )
}