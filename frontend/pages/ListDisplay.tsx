import { View, ScrollView, StyleSheet, Text, TextInput, Button, Pressable } from "react-native";
import { useState, useEffect } from "react";

import useAxios from "../app/hooks/useAxios";
import { useAuth } from "../app/context/AuthContext";
import Lists from "../components/Lists";

const styles = StyleSheet.create({
    displayedLists: {
        
    },
    listFormat : {
        borderWidth: 5,
        width: 250,
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

        if(response) {
            for(const list of response.data) {
                setLists(l => [...l, {name: list.listName, id: list.listId}]);
            }
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
        <View>

            {
                listView && 
                <View>
                    {lists.map((list) => 
                        <View style={styles.displayedLists} key={list.name+"view"}>
                            <Pressable key={list.name+"button"} style={styles.listFormat} onPress={() => displayList(list.name, list.id)}><Text style={styles.textFormat}>{list.name}</Text></Pressable>
                        </View>
                    )}
                </View>
            }

            {
                list &&
                <View>
                    <Pressable onPress={() => displayList("", 0)}><Text>Back</Text></Pressable>
                    <Lists name={listName} id={listID}/>
                </View>
            }
        </View>
    )
}