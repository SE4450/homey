import { View, ScrollView, StyleSheet, Text, TextInput, Button, Pressable } from "react-native";
import { useState, useEffect } from "react";
import { Dropdown } from 'react-native-element-dropdown';
import { useAuth } from "./context/AuthContext";
import { useLocalSearchParams } from "expo-router";
import TextField from "./components/textField";
import useAxios from "./hooks/useAxios";

//stylesheet for the component
const styles = StyleSheet.create({
    profilePopup : {
        borderColor: "black",
        borderWidth: 1,
        padding: 10,
        position: "fixed",
        backgroundColor: "white"
    },
    textAreaFormat : {
        height: 30,
        width: 150,
        marginBottom: 12,
        borderWidth: 1,
        backgroundColor: "white"
        
    },
    accountFormat : {
        flexDirection: "row",
        padding: 10
    },

    container: {
      backgroundColor: 'white',
      padding: 16,
    },
    dropdown: {
      height: 30,
      width:150,
      borderColor: 'gray',
      borderWidth: 0.5,
      borderRadius: 8,
      paddingHorizontal: 8,
      backgroundColor: "white"
    }
});

export default function Profile() {

    const [displayProfile, setDisplayProfile] = useState(false);
    const [cleaningValue, setCleaningValue] = useState("");
    const [noiseValue, setNoiseValue] = useState("");
    const [startSleepValue, setStartSleepValue] = useState("");
    const [endSleepValue, setEndSleepValue] = useState("");
    const [allergiesValue, setAllergiesValue] = useState("");
    const data = [
        { label: 'Low', value: 'Low' },
        { label: 'Medium', value: 'Medium' },
        { label: 'High', value: 'High' },
    ];

    const { post, get } = useAxios();
    const { userId } = useAuth();
    const { username } = useLocalSearchParams();

    useEffect(() => {
        getProfile();
    }, []);

    const getProfile = async () => {
        const body = { id: userId };
        const response = await get<any>("/api/profile", body);

        if (response) {
            if (response.data[0].cleaningHabits != null) {
                setCleaningValue(response.data[0].cleaningHabits);
            }
            if (response.data[0].noiseLevel != null) {
                setNoiseValue(response.data[0].noiseLevel);
            }
            if (response.data[0].sleepStart != null) {
                setStartSleepValue(response.data[0].sleepStart);
            }
            if (response.data[0].sleepEnd != null) {
                setEndSleepValue(response.data[0].sleepEnd);
            }
            if (response.data[0].alergies != null) {
                setAllergiesValue(response.data[0].alergies);
            }
        }
    }

    const updateProfile = async () => {
        const body = {
            cleaningHabits: cleaningValue,
            noiseLevel: noiseValue,
            sleepStart: startSleepValue,
            sleepEnd: endSleepValue,
            alergies: allergiesValue
        };
        const response = await post<any>(`/api/profile/updateProfile/${userId}`, body);

        if (response) {
            alert("Profile updated");
        }
    }

    return (
        <ScrollView>
            <View style={styles.profilePopup}>
                <View>
                    <Text>{username}</Text>
                </View>
                <View style={styles.accountFormat}>
                    <Text>Cleaning Habits: </Text>
                    <Dropdown style={styles.dropdown} data={data} labelField="label" valueField="value" placeholder={cleaningValue} value={cleaningValue} onChange={item => setCleaningValue(item.value)} />
                </View>
                <View style={styles.accountFormat}>
                    <Text>Noise Level: </Text>
                    <Dropdown style={styles.dropdown} data={data} labelField="label" valueField="value" placeholder={noiseValue} value={noiseValue} onChange={item => setNoiseValue(item.value)} />
                </View>
                <View style={styles.accountFormat}>
                    <Text>Sleep Start: </Text>
                    <TextInput style={styles.textAreaFormat} placeholder={startSleepValue} placeholderTextColor="black" onChangeText={text => setStartSleepValue(text)} />
                </View>
                <View style={styles.accountFormat}>
                    <Text>Sleep End: </Text>
                    <TextInput style={styles.textAreaFormat} placeholder={endSleepValue} placeholderTextColor="black" onChangeText={text => setEndSleepValue(text)} />
                </View>
                <View style={styles.accountFormat}>
                    <Text>Allergies: </Text>
                    <TextInput style={styles.textAreaFormat} placeholder={allergiesValue} placeholderTextColor="black" onChangeText={text => setAllergiesValue(text)} />
                </View>
                <Button title="Update Profile" onPress={updateProfile} />
            </View>
        </ScrollView>
    )
}