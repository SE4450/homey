import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import Button from "./components/button";
import TextField from "./components/textField";
import CustomImagePicker from "./components/imagePicker";
import useAxios from "./hooks/useAxios";
import { Ionicons } from "@expo/vector-icons";
import { LandlordHomeStackParamList } from "./stacks/landlordHomeStack";
type AddEditPropertyImageRouteProp = RouteProp<LandlordHomeStackParamList, "addEditPropertyImage">;
type AddEditPropertyImageNavigationProp = StackNavigationProp<LandlordHomeStackParamList, "addEditPropertyImage">;
export default function AddEditPropertyImageScreen() {
    const route = useRoute<AddEditPropertyImageRouteProp>();
    const navigation = useNavigation<AddEditPropertyImageNavigationProp>();
    const { post, put } = useAxios();
    const { propertyId, mode, imageData } = route.params as { propertyId: string; mode: string; imageData: { label: string, description: string, image: string, id: string } };
    const [image, setImage] = useState<string>(imageData?.image || "");
    const [label, setLabel] = useState<string>(imageData?.label || "");
    const [description, setDescription] = useState<string>(imageData?.description || "");
    const [loading, setLoading] = useState(false);
    const handleSubmit = async () => {
        if (!label || !description || !image) {
            Alert.alert("Error", "Please fill in all fields and select an image.");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(image);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
                const base64Image = (reader.result as string).split(",")[1];
                const body = {
                    label,
                    description,
                    image: base64Image,
                };
                let apiResponse;
                if (mode === "add") {
                    apiResponse = await post(`/api/properties/${propertyId}/images`, body);
                } else if (mode === "update") {
                    apiResponse = await put(`/api/properties/${propertyId}/images/${imageData.id}`, body);
                }
                setLoading(false);
                if (apiResponse) {
                    Alert.alert("Success", `Image ${mode === "add" ? "added" : "updated"} successfully!`);
                    navigation.goBack();
                } else {
                    Alert.alert("Error", `Failed to ${mode === "add" ? "add" : "update"} image.`);
                }
            };
        } catch (error) {
            Alert.alert("Error", "Failed to process image. Please try again.");
            setLoading(false);
        }
    };
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} disabled={loading}>
                <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerText}>{mode === "add" ? "Add New Property Image" : "Edit Property Image"}</Text>
            <TextField
                placeholder="Label (e.g., Kitchen, Bedroom)"
                value={label}
                onChangeText={setLabel}
                disabled={loading}
            />
            <TextField
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                disabled={loading}
            />
            <CustomImagePicker image={image} onImageSelected={setImage} disabled={loading} />
            <Button
                text={loading ? "Submitting..." : mode === "add" ? "Add Image" : "Update Image"}
                onClick={handleSubmit}
                disabled={loading}
            />
        </ScrollView>
    );
}
const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 16, justifyContent: "center", backgroundColor: "#f5f5f5" },
    backButton: { position: "absolute", top: 40, left: 16, padding: 10 },
    headerText: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
});