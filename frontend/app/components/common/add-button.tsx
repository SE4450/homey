import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";

// Define the expected types for the props
interface AddButtonProps {
  buttonText?: string; // buttonText is optional
  onPress: () => void; // onPress should be a function that returns void
}

const AddButton: React.FC<AddButtonProps> = ({ buttonText, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.buttonContainer}>
        <Text>{buttonText ? buttonText : "ADD"}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default AddButton;

const styles = StyleSheet.create({
  buttonContainer: {
    padding: 10,
    backgroundColor: "#4CAF50", // Example styling for button
    borderRadius: 5,
    alignItems: "center",
  },
});
