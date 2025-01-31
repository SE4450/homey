import { View, ScrollView, StyleSheet, Text, TextInput, Button, Pressable, Alert } from "react-native";
import { useState, useEffect } from "react";

import useAxios from "../app/hooks/useAxios";
import { useAuth } from "../app/context/AuthContext";
import Lists from "./components/Lists";

const styles = StyleSheet.create({
    textAreaFormat : {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        backgroundColor: "white"
    },
    displayedLists: {
        
    },
    listFormat : {
        width: 200,
        borderWidth: 2,
        backgroundColor: "white",
        
    },
    textFormat: {
        fontSize: 40,
        padding: 10,
    }
});

export default function ListDisplay() {
    const [listView, setListView] = useState(true);
    const [list, setList] = useState(false);
    const [listName, setListName] = useState("" as String);
    const [createdList, setCreatedList] = useState("" as String);
    const [listID, setListID] = useState(0 as Number);
    //variable that will hold the names of all the user created lists
    const [lists, setLists] = useState([] as Array<{name: String, id: Number}>);

    const { post, get } = useAxios();
    const { userToken, userId } = useAuth();

    //sample data to test
    //let data = [{name: "list1", id: 1}, {name: "list2", id: 2}, {name: "list3", id: 3}];

    useEffect(() => {
        usersLists();
    }, []);

    //function called in the useEffect to load all the users created lists
    const usersLists = async() => {
        //fetch request goes here
        const response = await get<any>(`/api/lists?userId=${userId}`);

        //clear the array
        setLists([]);

        if(response) {
            for(const list of response.data) {
                setLists(l => [...l, {name: list.listName, id: list.listId}]);
            }
        }
    }

    //function to create a new list
    const createList = async() => {
        if(createdList != "") {
            const body = { userId: userId, listName: createdList }
            const response = await post<any>("/api/lists/createList", body)

            if(response) {
                usersLists();
            }
        }
        else {
            alert("You must add a name for a list");
        }
        setCreatedList("");
        
    }

    //function for the delete alert
    const deleteConfirmation = async(listId: Number, listName: String) => {
        Alert.alert('Delete List', `Do you want to delete the list ${listName}`, [
            {
                text: "Yes",
                onPress: () => deleteList(listId)
            },
            {
                text: "No",
            },
        ])
    }

    //function to delete a list
    const deleteList = async(listId: Number) => {

        const body = { listId: listId }

        const response = await post<any>("/api/lists/deleteList", body);

        if(response) {
            usersLists();
            alert("The list has been deleted");
        }
    }

    //function to display the selected list
    const displayList = async(ListName: String, ID: Number) => {
        setListName(ListName);
        setListID(ID);
        setListView(!listView);
        setList(!list);
    }



    return(
        <ScrollView>

            {
                listView && 
                <View>
                    <Text>New List Name:</Text>
                    <TextInput style={styles.textAreaFormat} placeholder="Type New List Entry Here" onChangeText={text => setCreatedList(text)}></TextInput>
                    <Button title="Create List" onPress={() => createList()}></Button>
                    {lists.map((list) => 
                        <View style={styles.displayedLists} key={list.name+"view"}>
                            <Pressable key={list.name+"button"} style={styles.listFormat} onPress={() => displayList(list.name, list.id)} onLongPress={() => deleteConfirmation(list.id, list.name)}><Text style={styles.textFormat}>{list.name}</Text></Pressable>
                        </View>
                    )}
                </View>
            }

            {
                list &&
                <View>
                    <Pressable onPress={() => displayList("", 0)}><Text>Back</Text></Pressable>
                    <Lists name={listName} id={listID} houseId={userId}/>
                </View>
            }
        </ScrollView>
    )
}