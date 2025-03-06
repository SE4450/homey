import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from './context/AuthContext';
import { useRouter } from 'expo-router';
import useAxios from './hooks/useAxios';

interface Group {
    id: number;
    name: string;
}

interface Property {
    id: number;
    name: string;
    address: string;
    imageUrl: string;
}

export default function LandlordHomeScreen() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const { userId, logout } = useAuth();
    const router = useRouter();
    const { get, post, error } = useAxios();

    useEffect(() => {
        fetchGroups();
        fetchProperties();
    }, []);

    useEffect(() => {
        if (error) {
            Alert.alert('Error', error);
        }
    }, [error]);

    const fetchGroups = async () => {
        const response = await get<any>('/api/groups');
        if (response) {
            setGroups(response.data);
        }
    };

    const fetchProperties = async () => {
        const response = await get<any>('/api/properties');
        if (response) {
            setProperties(response.data);
        }
    };

    const handleCreateGroup = async () => {
        const groupData = {
            name: "New Group",
            landlordId: userId
        };

        const response = await post<any>('/api/groups/create', groupData);
        if (response) {
            fetchGroups();
        }
    };

    const handleCreateProperty = async () => {
        const propertyData = {
            name: "New Property",
            address: "Property Address",
            landlordId: userId
        };

        const response = await post<any>('/api/properties/create', propertyData);
        if (response) {
            fetchProperties();
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    return (
        <View style={styles.root}>
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.profileSection}>
                        <Image
                            style={styles.profileImage}
                            source={{ uri: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?s=200&d=mp' }}
                        />
                        <View style={styles.profileInfo}>
                            <Text style={styles.welcomeText}>Welcome, [Landlord Name]</Text>
                            <Text style={styles.emailText}>landlord@example.com</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                <View style={styles.mainContent}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Manage Groups</Text>
                        <TouchableOpacity style={styles.createButton} onPress={handleCreateGroup}>
                            <Text style={styles.buttonText}>Create New Group</Text>
                        </TouchableOpacity>

                        <View style={styles.groupsList}>
                            {groups.map((group) => (
                                <View key={group.id} style={styles.groupItem}>
                                    <Text style={styles.groupName}>{group.name}</Text>
                                    <View style={styles.groupButtons}>
                                        <TouchableOpacity style={styles.editButton}>
                                            <Text style={styles.buttonText}>Edit</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.deleteButton}>
                                            <Text style={styles.buttonText}>Delete</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Manage Properties</Text>
                        <TouchableOpacity style={styles.createButton} onPress={handleCreateProperty}>
                            <Text style={styles.buttonText}>Create New Property</Text>
                        </TouchableOpacity>

                        <View style={styles.propertiesGrid}>
                            {properties.map((property) => (
                                <View key={property.id} style={styles.propertyCard}>
                                    <Image
                                        style={styles.propertyImage}
                                        source={{ uri: property.imageUrl || 'https://reico.ca/wp-content/uploads/2019/08/rent-to-own-homes-ontario.jpg' }}
                                    />
                                    <View style={styles.propertyDetails}>
                                        <Text style={styles.propertyName}>{property.name}</Text>
                                        <Text style={styles.propertyAddress}>{property.address}</Text>
                                        <TouchableOpacity style={styles.editButton}>
                                            <Text style={styles.buttonText}>Edit Details</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },
    container: {
        flex: 1,
        padding: 16
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 8,
        marginBottom: 20
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30
    },
    profileInfo: {
        gap: 5
    },
    welcomeText: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    emailText: {
        fontSize: 14,
        color: '#666'
    },
    logoutButton: {
        backgroundColor: '#ff4444',
        padding: 10,
        borderRadius: 6,
        marginBottom: 20,
        alignSelf: 'center',
        minWidth: 100,
        alignItems: 'center'
    },
    logoutText: {
        color: 'white',
        fontWeight: '600'
    },
    mainContent: {
        gap: 20
    },
    section: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15
    },
    createButton: {
        backgroundColor: '#4CAF50',
        padding: 12,
        borderRadius: 6,
        alignItems: 'center',
        marginBottom: 15
    },
    buttonText: {
        color: 'white',
        fontWeight: '600'
    },
    groupsList: {
        gap: 10
    },
    groupItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#f9f9f9',
        borderRadius: 6
    },
    groupName: {
        fontSize: 16,
        fontWeight: '500'
    },
    groupButtons: {
        flexDirection: 'row',
        gap: 10
    },
    editButton: {
        backgroundColor: '#2196F3',
        padding: 8,
        borderRadius: 6,
        minWidth: 70,
        alignItems: 'center'
    },
    deleteButton: {
        backgroundColor: '#ff4444',
        padding: 8,
        borderRadius: 6,
        minWidth: 70,
        alignItems: 'center'
    },
    propertiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15
    },
    propertyCard: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        overflow: 'hidden',
        width: '48%',
        marginBottom: 15
    },
    propertyImage: {
        width: '100%',
        height: 150
    },
    propertyDetails: {
        padding: 15,
        gap: 8
    },
    propertyName: {
        fontSize: 16,
        fontWeight: '600'
    },
    propertyAddress: {
        fontSize: 14,
        color: '#666'
    }
});