import { View, ScrollView, StyleSheet, Text, TextInput, Button, Pressable } from "react-native";
import { useState, useEffect } from "react";
import useAxios from "../app/hooks/useAxios";
import StoreSearch from "../components/StoreSearch";

const styles = StyleSheet.create({
    scrollView: { margin: 20 },
    container: { flex: 1, paddingHorizontal: 24, paddingVertical: 16, backgroundColor: "#f8f9fa" },
    heading: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginVertical: 10, color: "#333" },
    textAreaFormat: { height: 48, marginVertical: 8, padding: 12, borderWidth: 1, borderRadius: 8, borderColor: "#ccc", backgroundColor: "white" },
    button: { fontSize: 16, paddingVertical: 12, paddingHorizontal: 16, backgroundColor: "#007bff", borderRadius: 8, textAlign: "center", color: "white", marginTop: 12 },
    table: { marginTop: 16 },
    tableHead: { flexDirection: "row", backgroundColor: "#007bff", borderRadius: 8, padding: 10 },
    tableRow: { flex: 1, paddingHorizontal: 8 },
    tableCaption: { color: "white", fontWeight: "bold", textAlign: "center" },
    tableBody: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: "#ddd", backgroundColor: "white", borderRadius: 8, marginVertical: 4 },
    tableData: { fontSize: 14, flex: 1, textAlign: "center", color: "#333" },
    deleteButton: { fontSize: 14, color: "#dc3545", textDecorationLine: "underline", paddingHorizontal: 8 },
});

export default function DynamicList(props: { name: String; id: Number; type: String }) {
    const [listItems, setListItems] = useState([] as any[]);
    const [fields, setFields] = useState({} as any); // Stores dynamic form fields
    const [formData, setFormData] = useState({} as any);

    const { post, get } = useAxios();

    useEffect(() => {
        // Set fields dynamically based on the type
        switch (props.type) {
            case "Shopping":
            case "Chores":
                setFields({
                    item: { placeholder: "Item Name", type: "text" },
                    assignedTo: { placeholder: "Assigned To", type: "text" },
                });
                break;
            case "Expense":
                setFields({
                    expense: { placeholder: "Expense Description", type: "text" },
                    amount: { placeholder: "Amount", type: "number" },
                    payer: { placeholder: "Payer Name", type: "text" },
                });
                break;
            default:
                setFields({});
        }
        getItems();
    }, [props.type]);

    const getItems = async () => {
        setListItems([]);
        const body = { listId: props.id };
        const response = await get<any>("/api/lists/items", body);

        if (response) {
            setListItems(response.data);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev: { [key: string]: string | number }) => ({ ...prev, [field]: value }));
    };

    const addItem = async () => {
        // Ensure all fields are filled
        const requiredFields = Object.keys(fields);
        const isFormValid = requiredFields.every(field => formData[field]);
    
        if (!isFormValid) {
            alert("Please fill in all required fields.");
            return;
        }
    
        try {
            const body = { listId: props.id, ...formData };
            const response = await post<any>("/api/lists/createItem", body);
    
            if (response?.status === "success") {
                getItems(); // Refresh list items
                setFormData({}); // Clear the form
            } else {
                alert(response?.message || "Failed to add the item. Please try again.");
            }
        } catch (error) {
            alert("An error occurred while adding the item.");
            console.error(error);
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
            <Text style={styles.heading}>{props.type} List</Text>
            <View>
                {Object.keys(fields).map((field, index) => (
                    <View key={index}>
                        <Text>{fields[field].placeholder}:</Text>
                        <TextInput
                            style={styles.textAreaFormat}
                            placeholder={fields[field].placeholder}
                            keyboardType={fields[field].type === "number" ? "numeric" : "default"}
                            value={formData[field] || ""}
                            onChangeText={(text) => handleInputChange(field, text)}
                        />
                    </View>
                ))}
                <Button title={`Add ${props.type} Item`} onPress={addItem} />
            </View>

            <View style={styles.table}>
                <View style={styles.tableHead}>
                    {Object.keys(fields).map((field, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={styles.tableCaption}>{field}</Text>
                        </View>
                    ))}
                </View>

                {listItems.map((item, index) => (
                    <View key={index} style={styles.tableBody}>
                        {Object.keys(fields).map((field, fieldIndex) => (
                            <View key={fieldIndex} style={styles.tableRow}>
                                <Text style={styles.tableData}>{item[field]}</Text>
                            </View>
                        ))}
                        <Pressable onPress={() => deleteRow(item.rowId)}>
                            <Text style={styles.deleteButton}>Delete</Text>
                        </Pressable>
                    </View>
                ))}
            </View>

            <StoreSearch />
        </ScrollView>
    );
}
