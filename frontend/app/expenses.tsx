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
    Modal,
} from "react-native";
import useAxios from "./hooks/useAxios";
import { useAuth } from "./context/AuthContext";
import ExpenseRow from "./components/expenseRow";
import { useIsFocused } from "@react-navigation/native";
import useUser from "./hooks/useUser";

interface Expense {
    id: number;
    expenseName: string;
    amount: number;
    owedTo: number;
    paidBy: number;
    completed: boolean;
    createdAt?: string;
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
    const [selectedPayees, setSelectedPayees] = useState<number[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [expensesOwed, setExpensesOwed] = useState<Expense[]>([]);
    const [expensesOwe, setExpensesOwe] = useState<Expense[]>([]);
    const [simplifiedDebts, setSimplifiedDebts] = useState<SimplifiedDebt[]>([]);
    const [historyVisible, setHistoryVisible] = useState(false);
    const [historyExpenses, setHistoryExpenses] = useState<Expense[]>([]);
    const { get, post, error, put } = useAxios();
    const { userId } = useAuth();
    const isFocused = useIsFocused();
    const [userMap, setUserMap] = useState<Record<number, string>>({});

    // Fetch all users and store them in a lookup map
    const fetchUserMap = async () => {
        try {
            const response = await get<any>("/api/users");
            if (response?.data) {
                const map = response.data.reduce((acc: Record<number, string>, user: User) => {
                    acc[user.id] = `${user.firstName} ${user.lastName}`;
                    return acc;
                }, {});
                setUserMap(map);
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
        }
    };

    useEffect(() => {
        if (error) {
            //Alert.alert("Error", error);
        }
        fetchUserMap();
    }, [error]);

    // Fetch expenses where the user is the payee or the payer (excluding completed expenses)
    const fetchExpenses = async () => {
        try {
            const responseOwed = await get<any>(`/api/expenses/${groupId}?owedTo=${userId}`);
            const responseOwe = await get<any>(`/api/expenses/${groupId}?paidBy=${userId}`);

            let owedData: Expense[] = responseOwed ? responseOwed.data : [];
            let oweData: Expense[] = responseOwe ? responseOwe.data : [];

            // Filter out completed expenses for the main screen
            owedData = owedData.filter(exp => !exp.completed);
            oweData = oweData.filter(exp => !exp.completed);

            setExpensesOwed(owedData);
            setExpensesOwe(oweData);
            computeSimplifiedDebts(owedData, oweData);
        } catch (fetchError) {
            //Alert.alert("Error", "Failed to fetch expenses.");
        }
    };

    // Fetch history (all expenses, including completed ones)
    const fetchHistory = async () => {
        try {
            const responseOwed = await get<any>(`/api/expenses/${groupId}?owedTo=${userId}`);
            const responseOwe = await get<any>(`/api/expenses/${groupId}?paidBy=${userId}`);

            const owedData: Expense[] = responseOwed ? responseOwed.data : [];
            const oweData: Expense[] = responseOwe ? responseOwe.data : [];

            // Merge and sort by creation date (descending)
            const merged = [...owedData, ...oweData].sort((a, b) => {
                return new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime();
            });
            setHistoryExpenses(merged);
        } catch (error) {
            //Alert.alert("Error", "Failed to fetch history.");
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

    // Function to complete all expenses in a simplified debt row
    const handleCompleteSimplifiedDebt = async (details: Expense[]) => {
        try {
            await Promise.all(details.map(exp => put(`/api/expenses/${exp.id}/complete`, {})));
            fetchExpenses();
        } catch (error) {
            Alert.alert("Error", "Failed to complete all debts.");
        }
    };

    // Simplified Debt Row component with expandable details and Complete All button
    const SimplifiedDebtRow = ({ item, onCompleteAll }: { item: SimplifiedDebt, onCompleteAll: (details: Expense[]) => void }) => {
        const [expanded, setExpanded] = useState(false);
        return (
            <TouchableOpacity onPress={() => setExpanded(!expanded)}>
                <View style={styles.debtRow}>
                    <Text style={{ fontWeight: "bold" }}>{item.userName}</Text>
                    <Text style={{ color: item.netAmount < 0 ? "red" : "green" }}>
                        {item.netAmount < 0
                            ? `-$${Math.abs(item.netAmount).toFixed(2)}`
                            : `$${item.netAmount.toFixed(2)}`}
                    </Text>
                </View>
                {expanded && (
                    <View style={styles.debtDetails}>
                        {item.details.map((exp, index) => (
                            <Text key={index} style={styles.debtDetailText}>
                                {exp.expenseName}: ${exp.amount.toFixed(2)}
                            </Text>
                        ))}
                        {item.netAmount > 0 && (
                            <TouchableOpacity
                                style={styles.completeAllButton}
                                onPress={() => onCompleteAll(item.details)}
                            >
                                <Text style={styles.completeAllButtonText}>Complete All</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header row with Add Expense title and History button */}
            <View style={styles.headerRow}>
                <Text style={styles.header}>Add Expense</Text>
                <TouchableOpacity
                    onPress={() => {
                        setHistoryVisible(true);
                        fetchHistory();
                    }}
                >
                    <Text style={styles.historyButton}>History</Text>
                </TouchableOpacity>
            </View>

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
                renderItem={({ item }) => (
                    <SimplifiedDebtRow item={item} onCompleteAll={handleCompleteSimplifiedDebt} />
                )}
            />

            {/* History Modal */}
            <Modal
                visible={historyVisible}
                animationType="slide"
                onRequestClose={() => setHistoryVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <Text style={styles.modalHeader}>Debt History</Text>
                    <FlatList
                        data={historyExpenses}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.historyRow}>
                                <Text>ID: {item.id}</Text>
                                <Text>Name: {item.expenseName}</Text>
                                <Text>Amount: ${item.amount.toFixed(2)}</Text>
                                <Text>Owed To: {userMap[item.owedTo] || "Landlord"}</Text>
                                <Text>Paid By: {userMap[item.paidBy] || "Landlord"}</Text>
                                <Text>Completed: {item.completed ? "Yes" : "No"}</Text>
                                <Text>Date: {item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A"}</Text>
                            </View>
                        )}
                        ListEmptyComponent={<Text style={styles.emptyText}>No history available.</Text>}
                    />
                    <Button title="Close" onPress={() => setHistoryVisible(false)} />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: "#f9f9f9",
        flex: 1,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
    },
    historyButton: {
        fontSize: 16,
        color: "blue",
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
    completeAllButton: {
        backgroundColor: "#cce5ff",
        padding: 8,
        marginTop: 8,
        borderRadius: 4,
        alignSelf: "flex-start",
    },
    completeAllButtonText: {
        color: "#007bff",
        fontWeight: "bold",
    },
    modalContainer: {
        flex: 1,
        padding: 16,
        backgroundColor: "#fff",
    },
    modalHeader: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
    },
    historyRow: {
        padding: 8,
        borderBottomWidth: 1,
        borderColor: "#ccc",
        marginBottom: 8,
    },
});

