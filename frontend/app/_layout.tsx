import { Stack } from "expo-router";
import { AuthProvider } from "./context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: "Sign In" }} />
        <Stack.Screen name="register" options={{ title: "Sign Up" }} />
        <Stack.Screen name="tenantHome" options={{ title: "Tenant Home" }} />
        <Stack.Screen name="landlordHome" options={{ title: "Landlord Home" }} />
        <Stack.Screen name="chores" options={{ title: "Chores" }} />
        <Stack.Screen name="addChores" options={{ title: "Add Chore" }} />
        <Stack.Screen name="choreDetails" options={{ title: "Chore Details" }} />
        <Stack.Screen name="addExpenses" options={{ title: "Add Expenses" }} />
        <Stack.Screen name="contacts" options={{ title: "Contacts" }} />
        <Stack.Screen name="conversation" options={{ title: "Conversation" }} />
        <Stack.Screen name="expenses" options={{ title: "Expenses" }} />
        <Stack.Screen name="profile" options={{ title: "Profile" }} />
        <Stack.Screen name="listDisplay" options={{ title: "Lists" }} />
        <Stack.Screen name="inventory" options={{ title: "Inventory" }} />
      </Stack>
    </AuthProvider>
  );
}
