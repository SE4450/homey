import React from "react";
import { TextInput, StyleSheet, TextStyle, ViewStyle } from "react-native";

type TextFieldProps = {
    placeholder?: string;
    customStyle?: {
        inputStyle?: TextStyle;
        containerStyle?: ViewStyle;
    };
    value?: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
};

const TextField: React.FC<TextFieldProps> = ({
    placeholder = "",
    customStyle = {},
    value = "",
    onChangeText,
    secureTextEntry = false,
}) => {
    return (
        <TextInput
            style={[styles.input, customStyle?.inputStyle]}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            placeholderTextColor="#888"
            secureTextEntry={secureTextEntry}
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
    },
});

export default TextField;
