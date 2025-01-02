import { View, ScrollView, StyleSheet, Text, TextInput, Button, Pressable } from "react-native";
import { useState, useEffect } from "react";
import { Dropdown } from 'react-native-element-dropdown';

import useAxios from "../app/hooks/useAxios";

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
        height: 33,
        width: 150,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        backgroundColor: "white"
    },
    accountFormat : {
        flexDirection: "row"
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

export default function Profile(props: {username: String, userId: any}) {
    //usestates
    const [displayProfile, setDisplayProfile] = useState(false);
    //useStates for dropdowns
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

    //once the page loads the users current profile settings
    useEffect(() => {
        getProfile();
    }, []);

    const getProfile = async() => {
        const body = { userId: props.userId };
        const response = await get<any>("/api/profile", body);

        if(response) {
            if(response.data.cleaningHabits != null) {
                setCleaningValue(response.data.cleaningHabits);
            }
            if(response.data.noiseLevel != null) {
                setNoiseValue(response.data.noiseLevel);
            }
            if(response.data.sleepStart != null) {
                setStartSleepValue(response.data.sleepStart);
            }
            if(response.data.sleepEnd != null) {
                setEndSleepValue(response.data.sleepEnd);
            }
            if(response.data.alergies != null) {
                setAllergiesValue(response.data.alergies);
            }
        }
    }

    const updateProfile = async() => {
        const body = {  cleaningHabits: cleaningValue,
                        noiseLevel: noiseValue,
                        sleepStart: startSleepValue,
                        sleepEnd: endSleepValue,
                        alergies: allergiesValue  };
        const response = await post<any>("/api/profile/updateProfile", body);

        if(response) {
            alert("Profile updated");
        }
    }

    return(
        <ScrollView>
            <View>
                <Button title={props.username + " profile"} onPress={() => setDisplayProfile(!displayProfile)}></Button>
            </View>

            { displayProfile &&
                <View style={styles.profilePopup}>
                    <View>
                        <Text>{props.username}</Text>
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
                        <TextInput style={styles.textAreaFormat} placeholder={startSleepValue} onChangeText={text => setStartSleepValue(text)}></TextInput>
                    </View>
                    <View style={styles.accountFormat}>
                        <Text>Sleep End: </Text>
                        <TextInput style={styles.textAreaFormat} placeholder={endSleepValue} onChangeText={text => setEndSleepValue(text)}></TextInput>
                    </View>
                    <View style={styles.accountFormat}>
                        <Text>Allergies: </Text>
                        <TextInput style={styles.textAreaFormat} placeholder={allergiesValue} onChangeText={text => setAllergiesValue(text)}></TextInput>
                    </View>
                    <Button title="Update Profile" onPress={updateProfile} /> 
                </View>
            }
        </ScrollView>
    )
}