import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import Form from "./components/form";
import TextField from "./components/textField";
import Button from "./components/button";
import useAxios from "./hooks/useAxios";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";

const LoginScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { post, loading, error } = useAxios();
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
    }
  }, [error]);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const body = username.includes("@")
      ? { email: username, password }
      : { username: username, password };
    const response = await post<any>("/api/users/login", body);

    if (response) {
      await login(response.data[0].token);
      router.push(`/groupNavigation`);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 95 : 70}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Form
          components={[
            <Text key="formHeader" style={styles.formHeader}>
              Sign In
            </Text>,
            <TextField
              key="username"
              placeholder="Username or Email"
              value={username}
              onChangeText={setUsername}
              customStyle={{
                inputStyle: {
                  width: 200,
                  borderColor: "blue",
                  borderWidth: 1,
                },
              }}
            />,
            <TextField
              key="password"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              customStyle={{
                inputStyle: {
                  width: 200,
                  borderColor: "green",
                  borderWidth: 1,
                },
              }}
            />,
            <Button
              key="loginButton"
              text={loading ? "Logging in..." : "Login"}
              disabled={loading}
              onClick={handleLogin}
              customStyle={{
                buttonStyle: {
                  backgroundColor: "blue",
                  padding: 10,
                },
                textStyle: {
                  color: "white",
                },
              }}
            />,
            <View key="signupText" style={styles.signUpContainer}>
              <Text style={styles.signUpText}>
                Don't have an account?{" "}
                <Text
                  style={styles.signUpLink}
                  onPress={() => router.push("/register")}
                >
                  Sign Up
                </Text>
              </Text>
            </View>,
          ]}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  formHeader: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  signUpContainer: {
    marginTop: 10,
  },
  signUpText: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
  },
  signUpLink: {
    color: "blue",
    fontWeight: "bold",
  },
});

export default LoginScreen;
