import React, { useState, useEffect } from "react";
import { View, Text, Button, ActivityIndicator, Alert } from "react-native";
import useAxios from "./hooks/useAxios";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "expo-router";
import Profile from "./components/Profile";

export default function HomeScreen() {
    const [user, setUser] = useState<any>({});
    const { userToken, userId, logout } = useAuth();
    const { get, error } = useAxios();
    const router = useRouter();

    useEffect(() => {
        if (error) {
            Alert.alert("Error", error);
        }
    }, [error]);

    useEffect(() => {
        const fetchUser = async () => {
            const response = await get<any>(`/api/users/user/${userId}`);
            if (response) {
                setUser(response.data[0]);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        if (!userToken) {
            router.push("/login");
        }
    }, [userToken]);

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    if (!userToken) {
        return <ActivityIndicator size="large" />;
    }

    return (
        <View>
            <Text>Welcome {user.firstName} {user.lastName}</Text>
            <Profile username={user.username} userId={userId}/>
            <Button title="Logout" onPress={handleLogout} />
        </View>
    );
}