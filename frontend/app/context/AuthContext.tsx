import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import * as SecureStore from "expo-secure-store";
type AuthContextType = {
    userToken: string | null;
    userId: string | null;
    userRole: string | null;
    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
};
const defaultAuthContext: AuthContextType = {
    userToken: null,
    userId: null,
    userRole: null,
    login: async () => { },
    logout: async () => { },
};
const AuthContext = createContext<AuthContextType>(defaultAuthContext);
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userToken, setUserToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    useEffect(() => {
        const loadToken = async () => {
            const token = await SecureStore.getItemAsync("jwt");
            const expiration = await SecureStore.getItemAsync("jwt_expiration");
            if (token && expiration) {
                const currentTime = new Date().getTime();
                if (currentTime < parseInt(expiration, 10)) {
                    const decoded = jwtDecode<any>(token);
                    setUserId(decoded.id);
                    setUserRole(decoded.role);
                    setUserToken(token);
                } else {
                    await SecureStore.deleteItemAsync("jwt");
                    await SecureStore.deleteItemAsync("jwt_expiration");
                    setUserId(null);
                    setUserRole(null);
                    setUserToken(null);
                }
            }
        };
        loadToken();
    }, []);
    const login = async (token: string) => {
        const decoded = jwtDecode<any>(token);
        await SecureStore.setItemAsync("jwt", token);
        await SecureStore.setItemAsync("jwt_expiration", decoded.exp.toString());
        setUserId(decoded.userId);
        setUserRole(decoded.role);
        setUserToken(token);
    };
    const logout = async () => {
        await SecureStore.deleteItemAsync("jwt");
        await SecureStore.deleteItemAsync("jwt_expiration");
        setUserId(null);
        setUserRole(null);
        setUserToken(null);
    };
    return (
        <AuthContext.Provider value={{ userToken, userId, userRole, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
export const useAuth = () => useContext(AuthContext);
