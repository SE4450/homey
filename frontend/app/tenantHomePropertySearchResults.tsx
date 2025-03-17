import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import useAxios from "./hooks/useAxios";
import TextField from "./components/textField";
import Button from "./components/button";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { TenantHomeStackParamList } from "./stacks/tenantHomeStack";

type TenantHomePropertySearchResultsNavigationProp = StackNavigationProp<TenantHomeStackParamList, "propertySearchResults">;

export default function TenantHomePropertySearchResultsScreen() {
    const navigation = useNavigation<TenantHomePropertySearchResultsNavigationProp>();
    const { get, error } = useAxios();

    const [city, setCity] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [propertyType, setPropertyType] = useState("");
    const [bedrooms, setBedrooms] = useState("");
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const propertyTypes = ["Any", "Apartment", "House", "Condo", "Townhouse", "Studio", "Duplex"];

    useEffect(() => {
        if (error) {
            Alert.alert("Error", error);
        }
    }, [error]);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const response = await get<any>("/api/properties/search", {
                city: city || undefined,
                maxPrice: maxPrice ? parseInt(maxPrice, 10) : undefined,
                propertyType: propertyType !== "Any" ? propertyType : undefined,
                bedrooms: bedrooms ? parseInt(bedrooms, 10) : undefined,
            });

            if (!response || response.data.length === 0) {
                Alert.alert("No results", "No properties match your search.");
                setProperties([]);
            } else {
                setProperties(response.data);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to fetch properties.");
        } finally {
            setLoading(false);
        }
    };

    const propertyRows = [];
    for (let i = 0; i < properties.length; i += 2) {
        propertyRows.push(properties.slice(i, i + 2));
    }

    return (
        <View style={styles.root}>
            {/* Sticky Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Search Properties</Text>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.container}>
                    <View style={styles.inputContainer}>
                        <TextField placeholder="City" value={city} onChangeText={setCity} />
                        <View style={styles.inputSpacing} />
                        <TextField placeholder="Max Price ($)" keyboardType="numeric" value={maxPrice} onChangeText={setMaxPrice} />
                        <View style={styles.inputSpacing} />
                        <TextField placeholder="Min Rooms" keyboardType="numeric" value={bedrooms} onChangeText={setBedrooms} />
                        <View style={styles.inputSpacing} />

                        <Text style={styles.label}>Property Type</Text>
                        <Picker selectedValue={propertyType} onValueChange={setPropertyType} style={styles.picker}>
                            {propertyTypes.map((type) => (
                                <Picker.Item key={type} label={type} value={type} />
                            ))}
                        </Picker>
                    </View>

                    <Button text="Search" onClick={fetchProperties} />

                    {/* Loading Indicator */}
                    {loading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#0000ff" />
                        </View>
                    )}

                    {/* Display Search Results */}
                    {properties.length > 0 && (
                        <View>
                            <Text style={styles.subHeader}>Results</Text>

                            {/* Grid Layout - Two Columns */}
                            {propertyRows.map((row, rowIndex) => (
                                <View key={rowIndex} style={styles.propertyRow}>
                                    {row.map((property) => {
                                        return (
                                            <TouchableOpacity
                                                key={property.id}
                                                style={styles.propertyCard}
                                                onPress={() => navigation.navigate("propertyDetails", { property })}
                                            >
                                                <Image style={styles.propertyImage} source={{ uri: property.exteriorImage }} />
                                                <View style={styles.propertyDetails}>
                                                    <Text style={styles.propertyName}>{property.name}</Text>
                                                    <Text style={styles.propertyType}>{property.propertyType}</Text>
                                                    <Text style={styles.propertyAddress}>
                                                        {property.address}, {property.city}
                                                    </Text>
                                                    <Text style={styles.propertyInfo}>Bedrooms: {property.bedrooms}</Text>
                                                    <Text style={styles.propertyPrice}>${property.price} / month</Text>
                                                    <Text style={styles.propertyLandlord}>
                                                        Landlord: {property.landlord.name}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                    {/* If the row has only one property, add an empty view to align grid */}
                                    {row.length === 1 && <View style={[styles.propertyCard, { backgroundColor: "transparent" }]} />}
                                </View>
                            ))}
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
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
    backButton: {
        paddingLeft: 15,
    },
    headerText: {
        fontSize: 22,
        fontWeight: "bold",
        flex: 1,
        textAlign: "center",
        paddingRight: 35,
    },
    container: {
        flexGrow: 1,
        padding: 16,
    },
    inputContainer: {
        backgroundColor: "white",
        padding: 15,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 20,
    },
    inputSpacing: {
        height: 15, // Spacing between input fields
    },
    label: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 8,
    },
    picker: {
        height: 200,
        width: "100%",
        backgroundColor: "white",
        borderRadius: 8,
        marginBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    subHeader: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 20,
        marginBottom: 10,
    },
    propertyRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
    },
    propertyCard: {
        backgroundColor: "#fff",
        borderRadius: 8,
        overflow: "hidden",
        width: "48%", // Ensures two cards per row
        marginBottom: 15,
        elevation: 3,
    },
    propertyImage: {
        width: "100%",
        height: 150,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    propertyDetails: {
        padding: 10,
    },
    propertyName: {
        fontSize: 16,
        fontWeight: "bold",
    },
    propertyType: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#555",
    },
    propertyAddress: {
        fontSize: 14,
        color: "#666",
    },
    propertyInfo: {
        fontSize: 14,
        color: "#444",
    },
    propertyLandlord: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#555",
        marginTop: 5,
    },
    propertyPrice: {
        fontSize: 14,
        fontWeight: "bold",
        marginTop: 5,
        color: "#4CAF50",
    },
});