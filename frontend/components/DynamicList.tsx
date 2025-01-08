// Dynamic Lists Component
import { View, ScrollView, StyleSheet, Text, TextInput, Button, Pressable } from "react-native";
import { useState, useEffect } from "react";

import useAxios from "../app/hooks/useAxios";
import StoreSearch from "../components/StoreSearch";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24, // Increased side margins
        paddingVertical: 16,
        backgroundColor: "#f8f9fa",
    },
    heading: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        marginVertical: 10,
        color: "#333",
    },
    textAreaFormat: {
        height: 48,
        marginVertical: 8,
        padding: 12,
        borderWidth: 1,
        borderRadius: 8,
        borderColor: "#ccc",
        backgroundColor: "white",
    },
    button: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: "#007bff",
        borderRadius: 8,
        textAlign: "center",
        color: "white",
        marginTop: 12,
    },
    table: {
        marginTop: 16,
    },
    tableHead: {
        flexDirection: "row",
        backgroundColor: "#007bff",
        borderRadius: 8,
        padding: 10,
    },
    tableRow: {
        flex: 1,
        paddingHorizontal: 8,
    },
    tableCaption: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
    },
    tableBody: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        backgroundColor: "white",
        borderRadius: 8,
        marginVertical: 4,
    },
    tableData: {
        fontSize: 14,
        flex: 1,
        textAlign: "center",
        color: "#333",
    },
    deleteButton: {
        fontSize: 14,
        color: "#dc3545",
        textDecorationLine: "underline",
        paddingHorizontal: 8,
    },
});

export default function DynamicList (props: { name: String, id: Number, type: String }) {
    const [listItems, setListItems] = useState([] as Array<{item: String, assignedTo: String, rowId: Number}>);
    const [item, setItem] = useState("");
    const [assignment, setAssignment] = useState("");

    const { post, get } = useAxios();

    useEffect(() => {
        getItems();
    }, []);

    const getItems = async () => {
        setListItems([]);
        const body = { listId: props.id };
        const response = await get<any>("/api/lists/items", body);

        if (response) {
            response.data.forEach((item: { listId: Number, rowId: Number, item: String, assignedTo: String, createdAt: String, updatedAt: String }) => {
                setListItems(l => [...l, { item: item.item, assignedTo: item.assignedTo, rowId: item.rowId }]);
            });
        }
    };

    const addItem = async () => {
        if (item !== "" && assignment !== "") {
            const body = { listId: props.id, item: item, assignedTo: assignment };
            const response = await post<any>("/api/lists/createItem", body);

            if (response) {
                getItems();
            }
        } else {
            alert("You must enter an item and an assignment");
        }
    };

    const deleteRow = async (deleteRowId: Number) => {
        const body = { listId: props.id, rowNum: deleteRowId };
        const response = await post<any>("/api/lists/deleteItem", body);

        if (response) {
            getItems();
            alert("Row Deleted");
        }
    };

    return (
        <ScrollView>
            <Text>{props.type} List</Text>
            <Text>New Entry:</Text>
            <TextInput
                style={styles.textAreaFormat}
                placeholder={`Add a ${props.type} item`}
                onChangeText={text => setItem(text)}
            ></TextInput>

            <Text>Assigned To:</Text>
            <TextInput
                style={styles.textAreaFormat}
                placeholder="Assign to..."
                onChangeText={text => setAssignment(text)}
            ></TextInput>
            <Button title={`Add ${props.type} Item`} onPress={addItem} />

            <View>
                <View style={styles.tableHead}>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCaption}>Item</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCaption}>Assigned To</Text>
                    </View>
                </View>

                {listItems.map((item, index) => (
                    <View key={"viewnode_row" + index} style={styles.tableBody}>
                        <View key={item.item + "viewnode"} style={styles.tableRow}>
                            <Text key={item.item + "textnode"} style={styles.tableData}>{item.item}</Text>
                        </View>
                        <View key={item.assignedTo.concat(item.item + "viewnode")} style={styles.tableRow}>
                            <Text key={item.assignedTo.concat(item.item + "textnode")} style={styles.tableData}>{item.assignedTo}</Text>
                        </View>
                        <Pressable key={"deleteRow_" + index} onPress={() => { deleteRow(item.rowId); }}><Text style={styles.button}>Delete</Text></Pressable>
                    </View>
                ))}
            </View>

            <StoreSearch />
        </ScrollView>
    );
}
