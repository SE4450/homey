// expenseRow.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface ExpenseRowProps {
  expense: any;
  role: "OwedTo" | "PaidBy";
  onComplete: (expenseId: number) => void;
}

const ExpenseRow: React.FC<ExpenseRowProps> = ({ expense, role, onComplete }) => {
  const handleCheckmarkPress = () => {
    onComplete(expense.id);
  };

  return (
    <View style={styles.row}>
      <TouchableOpacity onPress={handleCheckmarkPress}>
        <Text style={[styles.checkmark, { color: expense.completed ? "green" : "grey" }]}>
          {"\u2713"}
        </Text>
      </TouchableOpacity>
      <View style={styles.details}>
        <Text style={styles.expenseName}>{expense.expenseName}</Text>
        <Text style={styles.amount}>${expense.amount.toFixed(2)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  checkmark: {
    fontSize: 24,
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  expenseName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  amount: {
    fontSize: 14,
    color: "#555",
  },
});

export default ExpenseRow;
