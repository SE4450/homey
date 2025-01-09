import { View, ScrollView, StyleSheet, Text, TextInput, Button, Pressable } from "react-native";
import { useState, useEffect } from "react";
import { Dropdown } from 'react-native-element-dropdown';
import TextField from "../components/textField";

import useAxios from "../hooks/useAxios";

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
        const body = { id: props.userId };
        const response = await get<any>("/api/profile", body);

        if(response) {
            if(response.data[0].cleaningHabits != null) {
                setCleaningValue(response.data[0].cleaningHabits);
            }
            if(response.data[0].noiseLevel != null) {
                setNoiseValue(response.data[0].noiseLevel);
            }
            if(response.data[0].sleepStart != null) {
                setStartSleepValue(response.data[0].sleepStart);
            }
            if(response.data[0].sleepEnd != null) {
                setEndSleepValue(response.data[0].sleepEnd);
            }
            if(response.data[0].alergies != null) {
                setAllergiesValue(response.data[0].alergies);
            }
        }
    }

    const updateProfile = async() => {
        const body = {  cleaningHabits: cleaningValue,
                        noiseLevel: noiseValue,
                        sleepStart: startSleepValue,
                        sleepEnd: endSleepValue,
                        alergies: allergiesValue  };
        const response = await post<any>(`/api/profile/updateProfile/${props.userId}`, body);

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
                        <TextField placeholder={startSleepValue} onChangeText={text => setStartSleepValue(text)}></TextField>
                    </View>
                    <View style={styles.accountFormat}>
                        <Text>Sleep End: </Text>
                        <TextField placeholder={endSleepValue} onChangeText={text => setEndSleepValue(text)}></TextField>
                    </View>
                    <View style={styles.accountFormat}>
                        <Text>Allergies: </Text>
                        <TextField placeholder={allergiesValue} onChangeText={text => setAllergiesValue(text)}></TextField>
                    </View>
                    <Button title="Update Profile" onPress={updateProfile} /> 
                </View>
            }
        </ScrollView>
    )
}