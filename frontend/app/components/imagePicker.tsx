import React from "react";
import { View, TouchableOpacity, Text, Image, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";

interface ImagePickerProps {
    image: string | null;
    onImageSelected: (imageUri: string) => void;
    disabled?: boolean; // New optional prop
}

export default function CustomImagePicker({ image, onImageSelected, disabled = false }: ImagePickerProps) {
    const pickImage = async () => {
        if (disabled) return; // Prevents action when disabled

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            onImageSelected(result.assets[0].uri);
        }
    };

    return (
        <View style={styles.container}>
            {image ? (
                <Image source={{ uri: image }} style={styles.imagePreview} />
            ) : (
                <Text style={styles.placeholderText}>No image selected</Text>
            )}
            <TouchableOpacity
                style={[styles.button, disabled && styles.disabledButton]}
                onPress={pickImage}
                disabled={disabled} // Disables button when true
            >
                <Text style={styles.buttonText}>{image ? "Change Image" : "Select Image"}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        marginVertical: 10,
    },
    imagePreview: {
        width: 150,
        height: 150,
        borderRadius: 8,
        marginBottom: 10,
    },
    placeholderText: {
        fontSize: 16,
        color: "#777",
        marginBottom: 10,
    },
    button: {
        backgroundColor: "#4CAF50",
        padding: 10,
        borderRadius: 6,
    },
    disabledButton: {
        backgroundColor: "#A5A5A5", // Gray out when disabled
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
    },
});