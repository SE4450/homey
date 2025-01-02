import React from "react";
import { View, StyleSheet } from "react-native";

type FormProps = {
    components: React.ReactNode[]; // Array of components to render
};

const Form: React.FC<FormProps> = ({ components }) => {
    return (
        <View style={styles.container}>
            {components.map((component, index) => (
                <View key={index} style={styles.field}>
                    {component}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: "#fff",
        borderRadius: 8,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    field: {
        marginBottom: 16,
    },
});

export default Form;
