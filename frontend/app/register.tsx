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
import Dropdown from "./components/dropdown";
import useAxios from "./hooks/useAxios";
import { useRouter } from "expo-router";
import validator from "validator";
import passwordValidator from "password-validator";

const RegisterScreen = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("tenant");
    const { post, loading, error } = useAxios();
    const router = useRouter();

    useEffect(() => {
        if (error) {
            Alert.alert("Error", "\n" + error);
        }
    }, [error]);

    const schema = new passwordValidator();
    schema
        .is().min(8)
        .is().max(100)
        .has().uppercase()
        .has().lowercase()
        .has().digits(1)
        .has().symbols(1)
        .has().not().spaces();

    const validatePassword = (password: string) => {
        const result = schema.validate(password, { details: true });
        if (Array.isArray(result) && result.length > 0) {
            return {
                isValid: false,
                failedRules: result,
            };
        }
        return {
            isValid: true,
            failedRules: [],
        };
    };

    const handleRegister = async () => {
        const errors = [];

        if (!firstName || firstName.length < 2) {
            errors.push("First name must be at least 2 characters");
        }

        if (!lastName || lastName.length < 2) {
            errors.push("Last name must be at least 2 characters");
        }

        if (!email || !validator.isEmail(email)) {
            errors.push("Please provide a valid email address");
        }

        if (!username || username.length < 6) {
            errors.push("Username must be at least 6 characters long");
        }

        const passwordValidation = validatePassword(password);
        if (!password || !passwordValidation.isValid) {
            const failures = passwordValidation.failedRules
                .map((rule, index) => `${index + 1}. ${rule.message.replace("string", "password")}`)
                .join("\n");
            errors.push(`Password validation failed:\n\n${failures}`);
        }

        if (errors.length > 0) {
            Alert.alert("Error", "\n" + errors.join("\n\n"));
            return;
        }

        const body = {
            firstName,
            lastName,
            email,
            username,
            password,
            role,
        };

        const response = await post("/api/users/", body);

        if (response) {
            Alert.alert(
                "Registration Successful",
                "Please check your email to verify your account"
            );
            router.push("/login");
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
                            Sign Up
                        </Text>,
                        <View key="nameContainer" style={styles.nameContainer}>
                            <Text style={styles.dropdownLabel}>Name</Text>
                            <View key="nameFields" style={styles.row}>
                                <TextField
                                    placeholder="First"
                                    value={firstName}
                                    onChangeText={setFirstName}
                                    customStyle={{
                                        inputStyle: styles.firstName,
                                        containerStyle: styles.inputContainer,
                                    }}
                                />
                                <TextField
                                    placeholder="Last"
                                    value={lastName}
                                    onChangeText={setLastName}
                                    customStyle={{
                                        inputStyle: styles.lastName,
                                        containerStyle: styles.inputContainer,
                                    }}
                                />
                            </View>
                        </View>,
                        <View key="roleDropdown" style={styles.dropdownContainer}>
                            <Text style={styles.dropdownLabel}>Role</Text>
                            <Dropdown
                                options={["tenant", "landlord"]}
                                onOptionSelect={setRole}
                                customStyle={{
                                    containerStyle: styles.dropdown,
                                    selectedOptionStyle: styles.selectedOption,
                                }}
                            />
                        </View>,
                        <TextField
                            key="email"
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            customStyle={{
                                inputStyle: styles.input,
                                containerStyle: styles.fullWidthInput,
                            }}
                        />,
                        <TextField
                            key="username"
                            placeholder="Username"
                            value={username}
                            onChangeText={setUsername}
                            customStyle={{
                                inputStyle: styles.input,
                                containerStyle: styles.fullWidthInput,
                            }}
                        />,
                        <TextField
                            key="password"
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={true}
                            customStyle={{
                                inputStyle: styles.input,
                                containerStyle: styles.fullWidthInput,
                            }}
                        />,
                        <Button
                            key="registerButton"
                            text={loading ? "Registering..." : "Register"}
                            disabled={loading}
                            onClick={handleRegister}
                            customStyle={{
                                buttonStyle: styles.button,
                                textStyle: styles.buttonText,
                            }}
                        />,
                        <View key="signinText" style={styles.signInContainer}>
                            <Text style={styles.signInText}>
                                Already have an account?{" "}
                                <Text style={styles.signInLink} onPress={() => router.push("/login")}>
                                    Sign In
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
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "95%",
    },
    inputContainer: {
        flex: 1,
    },
    nameContainer: {
        width: "100%",
    },
    firstName: {
        borderColor: "gray",
        borderWidth: 1,
        borderRadius: 8,
        width: "50%",
        marginRight: 8,
    },
    lastName: {
        borderColor: "gray",
        borderWidth: 1,
        borderRadius: 8,
        width: "50%",
        marginLeft: 8,
    },
    fullWidthInput: {
        width: "100%",
        marginBottom: 16,
    },
    input: {
        borderColor: "gray",
        borderWidth: 1,
        padding: 8,
        borderRadius: 8,
        width: "100%",
    },
    dropdownContainer: {
        marginBottom: 16,
        width: "100%",
    },
    dropdownLabel: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 8,
    },
    dropdown: {
        width: "100%",
    },
    selectedOption: {
        backgroundColor: "lightgray",
        padding: 8,
        borderRadius: 8,
    },
    button: {
        backgroundColor: "blue",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginTop: 16,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    signInContainer: {
        marginTop: 10,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    signInText: {
        fontSize: 14,
        color: "gray",
        textAlign: "center",
    },
    signInLink: {
        fontSize: 14,
        color: "blue",
        fontWeight: "bold",
    },
});

export default RegisterScreen;