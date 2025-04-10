import React from "react";
import { TextInput, StyleSheet, TextStyle, ViewStyle, KeyboardTypeOptions } from "react-native";

type TextFieldProps = {
    placeholder?: string;
    customStyle?: {
        inputStyle?: TextStyle;
        containerStyle?: ViewStyle;
    };
    value?: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
    disabled?: boolean;
    keyboardType?: KeyboardTypeOptions; // New optional prop for numeric input
};

const TextField: React.FC<TextFieldProps> = ({
    placeholder = "",
    customStyle = {},
    value = "",
    onChangeText,
    secureTextEntry = false,
    disabled = false,
    keyboardType = "default", // Default keyboard type
}) => {
    return (
        <TextInput
            style={[styles.input, customStyle?.inputStyle, disabled && styles.disabledInput]}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            placeholderTextColor="#888"
            secureTextEntry={secureTextEntry}
            editable={!disabled}
            keyboardType={keyboardType} // Apply keyboardType prop
        />
    );
};

const styles = StyleSheet.create({
    input: {
        height: 40,
        borderColor: "gray",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        fontSize: 16,
        marginBottom: 10
    },
    disabledInput: {
        backgroundColor: "#e0e0e0",
        color: "#a0a0a0",
    },
});

export default TextField;
