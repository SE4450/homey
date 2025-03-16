import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native";
import { RouteProp, useNavigation, useRoute, useIsFocused } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import Button from "./components/button";
import TextField from "./components/textField";
import CustomImagePicker from "./components/imagePicker";
import useAxios from "./hooks/useAxios";
import { Ionicons } from "@expo/vector-icons";
import { LandlordHomeStackParamList } from "./stacks/landlordHomeStack";

type ViewEditPropertyRouteProp = RouteProp<LandlordHomeStackParamList, "viewEditProperty">;
type ViewEditPropertyNavigationProp = StackNavigationProp<LandlordHomeStackParamList, "viewEditProperty">;

export default function ViewEditPropertyScreen() {
    const route = useRoute<ViewEditPropertyRouteProp>();
    const navigation = useNavigation<ViewEditPropertyNavigationProp>();
    const { get, put, del } = useAxios();
    const { propertyId } = route.params;
    const isFocused = useIsFocused();

    const [property, setProperty] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (isFocused) {
            fetchPropertyDetails();
        }
    }, [isFocused]);

    const fetchPropertyDetails = async () => {
        setLoading(true);
        try {
            const propertyResponse = await get<any>(`/api/properties/${propertyId}`);

            if (!propertyResponse) {
                Alert.alert("Error", "Failed to fetch property details.");
                navigation.goBack();
                return;
            }

            const imagesResponse = await get<any>(`/api/properties/${propertyId}/images`);
            const extraImages = imagesResponse?.data || [];

            setProperty({
                ...propertyResponse.data,
                images: extraImages,
            });
        } catch (error) {
            Alert.alert("Error", "Failed to fetch property details.");
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProperty = async () => {
        setUpdating(true);

        try {
            const response = await fetch(property.exteriorImage);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.readAsDataURL(blob);

            reader.onloadend = async () => {
                const updatedProperty = {
                    name: property.name,
                    address: property.address,
                    exteriorImage: (reader.result as string).split(",")[1],
                };

                const response = await put<any>(`/api/properties/${propertyId}`, updatedProperty);
                setUpdating(false);

                if (response) {
                    Alert.alert("Success", "Property updated successfully!");
                    navigation.goBack(); // go back a screen on success
                } else {
                    Alert.alert("Error", "Failed to update property.");
                }
            };
        } catch (error) {
            Alert.alert("Error", "Failed to process image. Please try again.");
        }
    };

    const handleDeleteProperty = async () => {
        setUpdating(true);
        const response = await del<any>(`/api/properties/${propertyId}`);
        setUpdating(false);

        if (response) {
            Alert.alert("Success", "Property deleted successfully!");
            navigation.goBack();
        } else {
            Alert.alert("Error", "Failed to delete property.");
        }
    };

    const handleDeleteImage = async (imageId: string) => {
        setUpdating(true);
        const response = await del<any>(`/api/properties/${propertyId}/images/${imageId}`);
        setUpdating(false);

        if (response) {
            Alert.alert("Success", "Image deleted successfully!");
            fetchPropertyDetails();
        } else {
            Alert.alert("Error", "Failed to delete image.");
        }
    };

    const handleEditPropertyImage = (imageData: any) => {
        navigation.navigate("addEditPropertyImage", { propertyId, imageData, mode: "update" });
    };

    const handleAddPropertyImage = () => {
        navigation.navigate("addEditPropertyImage", { propertyId, mode: "add" });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} disabled={updating}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerText}>View & Edit Property</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <TextField
                    placeholder="Property Name"
                    value={property.name}
                    onChangeText={(text) => setProperty({ ...property, name: text })}
                    disabled={updating}
                />
                <TextField
                    placeholder="Property Address"
                    value={property.address}
                    onChangeText={(text) => setProperty({ ...property, address: text })}
                    disabled={updating}
                />

                <CustomImagePicker
                    image={property.exteriorImage}
                    onImageSelected={(uri) => setProperty({ ...property, exteriorImage: uri })}
                    disabled={updating}
                />

                <Button text={updating ? "Updating..." : "Update Property"} onClick={handleUpdateProperty} disabled={updating} />

                {/* New Delete Property Button */}
                <Button
                    text="Delete Property"
                    onClick={handleDeleteProperty}
                    disabled={updating}
                    customStyle={{
                        buttonStyle: { backgroundColor: "red" },
                        textStyle: { color: "white" },
                    }}
                />

                <Text style={styles.subHeader}>Property Images</Text>
                {property.images?.map((img: any, index: number) => (
                    <View key={index} style={styles.imageContainer}>
                        <Text style={styles.label}>{img.label}</Text>
                        <Text style={styles.description}>{img.description}</Text>

                        <Image source={{ uri: img.image }} style={styles.propertyImage} />

                        <View style={styles.imageActions}>
                            <Button text="Edit" onClick={() => handleEditPropertyImage(img)} disabled={updating} />
                            <Button text="Delete" onClick={() => handleDeleteImage(img.id)} disabled={updating} />
                        </View>
                    </View>
                ))}

                {property.images?.length < 10 && (
                    <Button text="Add New Image" onClick={handleAddPropertyImage} disabled={updating} />
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#f5f5f5" },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 50,
        paddingBottom: 10,
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        elevation: 3,
        zIndex: 100,
    },
    backButton: { paddingLeft: 15 },
    headerText: { fontSize: 22, fontWeight: "bold", flex: 1, textAlign: "center", paddingRight: 35 },
    scrollContainer: { flexGrow: 1, padding: 16, backgroundColor: "#f5f5f5", gap: 10 },
    subHeader: { fontSize: 18, fontWeight: "bold", marginTop: 20, marginBottom: 10 },
    imageContainer: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    label: { fontSize: 16, fontWeight: "bold", margin: 5 },
    description: { fontSize: 14, color: "#666", margin: 5, marginBottom: 10 },
    propertyImage: { width: "100%", height: 400, borderRadius: 8, marginBottom: 10 },
    imageActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
});