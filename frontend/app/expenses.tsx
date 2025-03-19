// expenses.tsx
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    Button,
    FlatList,
    Alert,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator
} from "react-native";
import useAxios from "./hooks/useAxios";
import { useAuth } from "./context/AuthContext";
import ExpenseRow from "./components/expenseRow";
import RoommateSelector from "./components/roomateSelector";
import { useIsFocused } from "@react-navigation/native";
import useUser from "./hooks/useUser";

interface Expense {
    id: number;
    expenseName: string;
    amount: number;
    owedTo: number;
    paidBy: number;
    completed: boolean;
}

interface User {
    id: number;
    firstName: string;
    lastName: string;
}

interface SimplifiedDebt {
    userId: number;
    userName: string;
    netAmount: number;
    details: Expense[];
}

type ExpenseScreenProps = {
    groupId: string;
    role: string;
};

export default function ExpensesScreen({ groupId, role }: ExpenseScreenProps) {
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    // Replace Payee ID input with multi-select state
    const [selectedPayees, setSelectedPayees] = useState<number[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [expensesOwed, setExpensesOwed] = useState<Expense[]>([]);
    const [expensesOwe, setExpensesOwe] = useState<Expense[]>([]);
    const [simplifiedDebts, setSimplifiedDebts] = useState<SimplifiedDebt[]>([]);
    const { get, post, error, put } = useAxios();
    const { userId } = useAuth();
    const isFocused = useIsFocused();

    useEffect(() => {
        if (error) {
            Alert.alert("Error", error);
        }
    }, [error]);

    // Fetch expenses where the user is the payee or the payer
    const fetchExpenses = async () => {
        try {
            const responseOwed = await get<any>(`/api/expenses/${groupId}?owedTo=${userId}`);
            const responseOwe = await get<any>(`/api/expenses/${groupId}?paidBy=${userId}`);

            if (responseOwed) {
                setExpensesOwed(responseOwed.data);
            }

            if (responseOwe) {
                setExpensesOwe(responseOwe.data);
            }
            computeSimplifiedDebts(responseOwed?.data || [], responseOwe?.data || []);
        } catch (fetchError) {
            Alert.alert("Error", "Failed to fetch expenses.");
        }
    };

    // Fetch all users for the multi-select (excluding the current user)
    const fetchAllUsers = async () => {
        try {
            const response = await get<any>(`/api/groups/${groupId}/participants`);
            if (response) {
                const users = response.data.filter((user: User) => user.id !== Number(userId));
                setAllUsers(users);
            }
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    };

    useEffect(() => {
        if (isFocused) {
            fetchAllUsers();
            fetchExpenses();
        }
    }, [isFocused]);

    // Handle adding a new expense – create one expense row per selected payee with split amount
    const handleAddExpense = async () => {
        if (!name || !amount || selectedPayees.length === 0) {
            Alert.alert("Error", "All fields are required and at least one payee must be selected.");
            return;
        }
        const totalAmount = parseFloat(amount);
        if (isNaN(totalAmount) || totalAmount <= 0) {
            Alert.alert("Error", "Amount must be a positive number.");
            return;
        }
        const splitAmount = totalAmount / selectedPayees.length;

        try {
            for (const payeeId of selectedPayees) {
                await post("/api/expenses", {
                    groupId,
                    expenseName: name,
                    amount: splitAmount,
                    owedTo: userId,
                    paidBy: payeeId,
                });
            }
            Alert.alert("Success", "Expense(s) added successfully");
            setName("");
            setAmount("");
            setSelectedPayees([]);
            fetchExpenses();
        } catch (addError) {
            Alert.alert("Error", "Failed to add expense(s).");
        }
    };

    // Toggle payee selection for the multi-select
    const togglePayeeSelection = (id: number) => {
        setSelectedPayees((prev) =>
            prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
        );
    };

    // Handle expense completion via checkmark press in ExpenseRow
    const handleCompleteExpense = async (expenseId: number) => {
        await put(`/api/expenses/${expenseId}/complete`, {});
        fetchExpenses();
    };

    // Compute simplified debts based on expensesOwed and expensesOwe
    const computeSimplifiedDebts = (owed: Expense[], owe: Expense[]) => {
        const debtMap: { [key: number]: { net: number; details: Expense[] } } = {};

        // For expenses where you paid (owe), owedTo is the counterparty – add the amount
        owe.forEach((exp) => {
            const counterparty = exp.owedTo;
            if (!debtMap[counterparty]) {
                debtMap[counterparty] = { net: 0, details: [] };
            }
            debtMap[counterparty].net += exp.amount;
            debtMap[counterparty].details.push(exp);
        });

        // For expenses where you are owed (owed), paidBy is the counterparty – subtract the amount
        owed.forEach((exp) => {
            const counterparty = exp.paidBy;
            if (!debtMap[counterparty]) {
                debtMap[counterparty] = { net: 0, details: [] };
            }
            debtMap[counterparty].net -= exp.amount;
            debtMap[counterparty].details.push(exp);
        });

        const simplified: SimplifiedDebt[] = Object.entries(debtMap).map(([userIdStr, value]) => {
            const uid = parseInt(userIdStr, 10);
            const user = allUsers.find((u) => u.id === uid) || { firstName: "User", lastName: uid.toString() };
            return {
                userId: uid,
                userName: `${user.firstName} ${user.lastName}`,
                netAmount: value.net,
                details: value.details,
            };
        });

        setSimplifiedDebts(simplified);
    };

    // Render each simplified debt row with expandable details
    // Render each simplified debt row with all details visible
    const renderDebtRow = ({ item }: { item: SimplifiedDebt }) => {
        const displayAmount = Math.abs(item.netAmount).toFixed(2);
        const color = item.netAmount < 0 ? "red" : "green";

        return (
            <View>
                <View style={styles.debtRow}>
                    <Text style={{ fontWeight: "bold" }}>{item.userName}</Text>
                    <Text style={{ color }}>
                        {item.netAmount < 0 ? `-$${displayAmount}` : `$${displayAmount}`}
                    </Text>
                </View>
                <View style={styles.debtDetails}>
                    {item.details.map((exp, index) => (
                        <Text key={index} style={styles.debtDetailText}>
                            {exp.expenseName}: ${exp.amount.toFixed(2)}
                        </Text>
                    ))}
                </View>
            </View>
        );
    };


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
            <Text>Select Payees</Text>
            <View style={styles.payeeContainer}>
                {allUsers.map((user) => (
                    <TouchableOpacity
                        key={user.id}
                        style={[
                            styles.payeeButton,
                            selectedPayees.includes(user.id) && styles.payeeButtonSelected,
                        ]}
                        onPress={() => togglePayeeSelection(user.id)}
                    >
                        <Text>
                            {user.firstName} {user.lastName}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <Button title="Add Expense" onPress={handleAddExpense} />

            <Text style={styles.sectionHeader}>Owed to You</Text>
            <FlatList
                data={expensesOwed}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={<Text style={styles.emptyText}>No expenses owed to you.</Text>}
                renderItem={({ item }) => (
                    <ExpenseRow expense={item} role="OwedTo" onComplete={handleCompleteExpense} />
                )}
            />

            <Text style={styles.sectionHeader}>You Owe</Text>
            <FlatList
                data={expensesOwe}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={<Text style={styles.emptyText}>You do not owe any expenses.</Text>}
                renderItem={({ item }) => (
                    <ExpenseRow expense={item} role="PaidBy" onComplete={handleCompleteExpense} />
                )}
            />

            <Text style={styles.sectionHeader}>Simplified Debts</Text>
            <FlatList
                data={simplifiedDebts}
                keyExtractor={(item) => item.userId.toString()}
                ListEmptyComponent={<Text style={styles.emptyText}>No simplified debts.</Text>}
                renderItem={renderDebtRow}
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
    payeeContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginVertical: 8,
    },
    payeeButton: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 4,
        padding: 8,
        margin: 4,
    },
    payeeButtonSelected: {
        backgroundColor: "#d0f0c0",
    },
    debtRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 8,
        borderBottomWidth: 1,
        borderColor: "#ccc",
    },
    debtDetails: {
        backgroundColor: "#eef",
        padding: 8,
    },
    debtDetailText: {
        fontSize: 12,
        color: "#555",
    },
});