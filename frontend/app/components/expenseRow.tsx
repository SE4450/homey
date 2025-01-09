import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface ExpenseRowProps {
    expenseName: string;
    amount: number;
    userId: number;
    role: "OwedTo" | "PaidBy"; // "OwedTo" for expenses owed to the user, "PaidBy" for expenses the user owes
}

const ExpenseRow: React.FC<ExpenseRowProps> = ({ expenseName, amount, userId, role }) => {
    return (
        <View style={styles.row}>
            <Text style={styles.cell}>{expenseName}</Text>
            <Text style={styles.cell}>${amount.toFixed(2)}</Text>
            <Text style={styles.cell}>
                {role === "OwedTo" ? `Paid by: ${userId}` : `Owed to: ${userId}`}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    cell: {
        flex: 1,
        textAlign: "left",
    },
});

export default ExpenseRow;
