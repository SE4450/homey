import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, FlatList, Alert, StyleSheet } from "react-native";
import useAxios from "./hooks/useAxios";
import { useAuth } from "./context/AuthContext";
import ExpenseRow from "./components/expenseRow"; // Import the new component

interface Expense {
    id: number;
    expenseName: string;
    amount: number;
    owedTo: number;
    paidBy: number;
}

export default function ExpensesScreen() {
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [payeeId, setPayeeId] = useState("");
    const [expensesOwed, setExpensesOwed] = useState<any>([]);
    const [expensesOwe, setExpensesOwe] = useState<any>([]);
    const { get, post, error } = useAxios();
    const { userId } = useAuth();

    // Alert any error received from the Axios hook
    useEffect(() => {
        if (error) {
            Alert.alert("Error", error);
        }
    }, [error]);

    // Fetch expenses where the user is the payee (owed to the user) or the payer (user owes)
    const fetchExpenses = async () => {
        try {
            const responseOwed = await get<any>(`/api/expenses?owedTo=${userId}`);
            const responseOwe = await get<any>(`/api/expenses?paidBy=${userId}`);

            if (responseOwed) {
                setExpensesOwed(responseOwed.data); // Ensure the state is updated correctly
                console.log(responseOwed);
            }

            if (responseOwe) {
                setExpensesOwe(responseOwe.data); // Ensure the state is updated correctly
                console.log(responseOwe);
            }
        } catch (fetchError) {
            Alert.alert("Error", "Failed to fetch expenses.");
        }
    };

    // Handle adding a new expense
    const handleAddExpense = async () => {
        if (!name || !amount || !payeeId) {
            Alert.alert("Error", "All fields are required");
            return;
        }
        try {
            const response = await post("/api/expenses", {
                expenseName: name,
                amount: parseFloat(amount),
                owedTo: userId,
                paidBy: parseInt(payeeId, 10),
            });
            if (response) {
                Alert.alert("Success", "Expense added successfully");
                setName(""); // Clear input fields
                setAmount("");
                setPayeeId("");
                fetchExpenses(); // Re-fetch expenses after adding
            }
        } catch (addError) {
            Alert.alert("Error", "Failed to add expense.");
        }
    };

    // Fetch expenses when the component mounts
    useEffect(() => {
        fetchExpenses();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Add Expense</Text>
            <Text>Name</Text>
            <TextInput
                placeholder="Name"
                value={name}
                onChangeText={setName}
                style={styles.input}
            />
            <Text>Amount ($)</Text>
            <TextInput
                placeholder="Amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                style={styles.input}
            />
            <Text>Payee ID</Text>
            <TextInput
                placeholder="Payee ID"
                value={payeeId}
                onChangeText={setPayeeId}
                style={styles.input}
            />
            <Button title="Add Expense" onPress={handleAddExpense} />

            <Text style={styles.sectionHeader}>Owed to You</Text>
            <FlatList
                data={expensesOwed}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={<Text style={styles.emptyText}>No expenses owed to you.</Text>}
                renderItem={({ item }) => (
                    <ExpenseRow
                        expenseName={item.expenseName}
                        amount={item.amount}
                        userId={item.paidBy}
                        role="OwedTo"
                    />
                )}
            />

            <Text style={styles.sectionHeader}>You Owe</Text>
            <FlatList
                data={expensesOwe}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={<Text style={styles.emptyText}>You do not owe any expenses.</Text>}
                renderItem={({ item }) => (
                    <ExpenseRow
                        expenseName={item.expenseName}
                        amount={item.amount}
                        userId={item.owedTo}
                        role="PaidBy"
                    />
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: "#f9f9f9",
        flex: 1,
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 4,
        padding: 8,
        marginVertical: 8,
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        textAlign: "center",
        marginVertical: 16,
        color: "#888",
    },
});
