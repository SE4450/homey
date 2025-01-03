import { Stack } from "expo-router";
import { AuthProvider } from "./context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: "Sign In" }} />
        <Stack.Screen name="register" options={{ title: "Sign Up" }} />
        <Stack.Screen name="home" options={{ title: "Home" }} />
      </Stack>
    </AuthProvider>
  );
}