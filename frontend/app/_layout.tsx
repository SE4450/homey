import { Stack } from "expo-router";
import { AuthProvider } from "./context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: "Sign In" }} />
        <Stack.Screen name="register" options={{ title: "Sign Up" }} />
        <Stack.Screen name="home" options={{ title: "Home" }} />
        <Stack.Screen name="chores" options={{ title: "Active Chores" }} />
        <Stack.Screen name="add-chore" options={{ title: "Add Chore" }} />
        <Stack.Screen
          name="chore-details"
          options={{ title: "Chore Details" }}
        />
        <Stack.Screen name="add-expenses" options={{ title: "Add Expenses" }} />
        <Stack.Screen
          name="dailyexpenses"
          options={{ title: "Daily Expenses" }}
        />
        <Stack.Screen name="contacts" options={{ title: "Contacts" }} />
        <Stack.Screen name="conversation" options={{ title: "Conversation" }} />
        <Stack.Screen name="expenses" options={{ title: "Expenses" }} />
      </Stack>
    </AuthProvider>
  );
}
