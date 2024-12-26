import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

type ButtonProps = {
    text: string;
    onClick: () => void;
    disabled?: boolean;
    customStyle?: {
        buttonStyle?: ViewStyle;
        disabledButtonStyle?: ViewStyle;
        textStyle?: TextStyle;
    };
};

const Button: React.FC<ButtonProps> = ({
    text,
    onClick,
    disabled = false,
    customStyle = {},
}) => {
    return (
        <TouchableOpacity
            style={[styles.button, customStyle?.buttonStyle, disabled && (styles.disabledButton || customStyle?.disabledButtonStyle)]}
            onPress={onClick}
            disabled={disabled}
        >
            <Text style={[styles.text, customStyle?.textStyle]}>{text}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: "#007BFF",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: "center",
    },
    disabledButton: {
        backgroundColor: "gray",
    },
    text: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
    }
});

export default Button;
