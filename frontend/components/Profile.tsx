import { View, ScrollView, StyleSheet, Text, TextInput, Button, Pressable } from "react-native";
import { useState } from "react";
import { Dropdown } from 'react-native-element-dropdown';

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

export default function Profile() {
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

    const updateProfile = async() => {

        alert("Profile updated");
    }

    return(
        <ScrollView>
            <View>
                <Button title="Profile" onPress={() => setDisplayProfile(!displayProfile)}></Button>
            </View>

            { displayProfile &&
                <View style={styles.profilePopup}>
                    <View>
                        <Text>Username</Text>
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