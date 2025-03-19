import React, { useState, useEffect } from "react";
import { ActivityIndicator, Alert } from "react-native";
import useAxios from "./hooks/useAxios";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "expo-router";
import { NavigationIndependentTree } from "@react-navigation/native";
import { jwtDecode } from "jwt-decode";

// Import your stack navigators
import TenantHomeStack from "./stacks/tenantHomeStack";
import LandlordHomeStack from "./stacks/landlordHomeStack";

const COLORS = {
    PRIMARY: "#4CAF50",
    WHITE: "#FFFFFF",
    BLACK: "#000000",
    LIGHT_GRAY: "#F5F5F5",
    ERROR: "#D32F2F",
};

export default function AppNavigator() {
    const [user, setUser] = useState<any>(null);
    const { userToken, userId, userRole } = useAuth();
    const { get, error } = useAxios();
    const router = useRouter();

    useEffect(() => {
        if (error) {
            //Alert.alert("Error", error);
        }
    }, [error]);

    useEffect(() => {
        const fetchUser = async () => {
            if (userId) {
                const response = await get<any>(`/api/users/user/${userId}`);
                if (response) {
                    setUser(response.data[0]);
                }
            }
        };
        fetchUser();
    }, [userId]);

    useEffect(() => {
        if (userToken) {
            const decoded = jwtDecode<any>(userToken); // Decode only if userToken is not null
            console.log(decoded);
        } else {
            router.push("/login");
        }
    }, [userToken]);

    if (!userToken) {
        return <ActivityIndicator size="large" color={COLORS.PRIMARY} />;
    }

    return (
        <>
            {userRole === "tenant" ? (
                <NavigationIndependentTree>
                    <TenantHomeStack />
                </NavigationIndependentTree>
            ) : (
                <NavigationIndependentTree>
                    <LandlordHomeStack />
                </NavigationIndependentTree>
            )}
        </ >
    );
}