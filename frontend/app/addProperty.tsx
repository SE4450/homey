import React, { useState } from "react";
import {
    Alert,
    StyleSheet,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    Switch,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Button from "./components/button";
import Form from "./components/form";
import TextField from "./components/textField";
import CustomImagePicker from "./components/imagePicker";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { LandlordHomeStackParamList } from "./stacks/landlordHomeStack";
import { StackNavigationProp } from "@react-navigation/stack";

type LandlordAddPropertyScreenNavigationProp = StackNavigationProp<LandlordHomeStackParamList, "addProperty">;

const propertyTypes = ["Apartment", "House", "Condo", "Townhouse", "Studio", "Duplex", "Other"];

export default function AddPropertyScreen() {
    const [propertyData, setPropertyData] = useState({
        name: "",
        address: "",
        city: "",
        bedrooms: "",
        price: "",
        propertyType: propertyTypes[0],
        availability: true,
        propertyDescription: "",
        exteriorImage: null as string | null,
    });

    const navigation = useNavigation<LandlordAddPropertyScreenNavigationProp>();

    const handleNext = async () => {
        const { name, address, city, bedrooms, price, propertyType, exteriorImage, propertyDescription } = propertyData;

        if (!name || !address || !city || !bedrooms || !price || !propertyType || !exteriorImage || !propertyDescription) {
            Alert.alert("Error", "Please fill in all fields and select an exterior image.");
            return;
        }

        try {
            const response = await fetch(exteriorImage);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.readAsDataURL(blob);

            reader.onloadend = () => {
                propertyData.exteriorImage = (reader.result as string).split(",")[1];

                navigation.navigate("addPropertyImages", { propertyData });
            };
        } catch (error) {
            Alert.alert("Error", "Failed to process image. Please try again.");
        }
    };

    return (
        <View style={styles.root}>
            {/* Sticky Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Add a New Property</Text>
            </View>

            {/* Keyboard Avoiding View */}
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flexContainer}>
                <ScrollView contentContainerStyle={styles.container}>
                    <Form
                        components={[
                            <TextField
                                placeholder="Property Name"
                                value={propertyData.name}
                                onChangeText={(text) => setPropertyData({ ...propertyData, name: text })}
                            />,
                            <TextField
                                placeholder="Address"
                                value={propertyData.address}
                                onChangeText={(text) => setPropertyData({ ...propertyData, address: text })}
                            />,
                            <TextField
                                placeholder="City"
                                value={propertyData.city}
                                onChangeText={(text) => setPropertyData({ ...propertyData, city: text })}
                            />,
                            <TextField
                                placeholder="Bedrooms"
                                value={propertyData.bedrooms}
                                keyboardType="numeric"
                                onChangeText={(text) => setPropertyData({ ...propertyData, bedrooms: text })}
                            />,
                            <TextField
                                placeholder="Price ($)"
                                value={propertyData.price}
                                keyboardType="numeric"
                                onChangeText={(text) => setPropertyData({ ...propertyData, price: text })}
                            />,
                            <View>
                                <Text style={styles.label}>Property Type</Text>
                                <Picker
                                    selectedValue={propertyData.propertyType}
                                    onValueChange={(itemValue: string) => setPropertyData({ ...propertyData, propertyType: itemValue })}
                                    style={styles.picker}
                                >
                                    {propertyTypes.map((type) => (
                                        <Picker.Item key={type} label={type} value={type} />
                                    ))}
                                </Picker>
                            </View>,
                            <View style={styles.switchContainer}>
                                <Text style={styles.label}>Availability</Text>
                                <Switch
                                    value={propertyData.availability}
                                    onValueChange={(value) => setPropertyData({ ...propertyData, availability: value })}
                                />
                            </View>,
                            <View>
                                <Text style={styles.label}>Property Description</Text>
                                <TextInput
                                    style={styles.descriptionInput}
                                    placeholder="Enter property details..."
                                    multiline
                                    numberOfLines={4}
                                    value={propertyData.propertyDescription}
                                    onChangeText={(text) => setPropertyData({ ...propertyData, propertyDescription: text })}
                                />
                            </View>,
                            <Text style={styles.imageLabelText}>Select Exterior Image of the Property</Text>,
                            <CustomImagePicker
                                image={propertyData.exteriorImage}
                                onImageSelected={(uri) => setPropertyData({ ...propertyData, exteriorImage: uri })}
                            />,
                            <Button text="Next" onClick={handleNext} />,
                        ]}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#f5f5f5" },
    flexContainer: { flex: 1 },
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
    container: { flexGrow: 1, padding: 16, justifyContent: "center", backgroundColor: "#f5f5f5" },
    label: { fontSize: 16, fontWeight: "500", textAlign: "left", marginBottom: 8 },
    imageLabelText: { fontSize: 16, fontWeight: "500", textAlign: "left", marginBottom: 8 },
    picker: { height: 50, width: "100%", backgroundColor: "white", borderRadius: 8 },
    switchContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 150 },
    descriptionInput: {
        height: 100,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        backgroundColor: "white",
        textAlignVertical: "top",
    },
});