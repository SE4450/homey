import { View, StyleSheet, Text, TextInput, Pressable } from "react-native";
import { useState, useEffect } from "react";

import useAxios from "./hooks/useAxios";
import { useAuth } from "./context/AuthContext";
import Lists from "../components/Lists";

const styles = StyleSheet.create({
    textAreaFormat: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        backgroundColor: "white"
    },
    displayedLists: {

    },
    listFormat: {
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
    const [createdList, setCreatedList] = useState("" as String);
    const [listID, setListID] = useState(0 as Number);
    const [lists, setLists] = useState([] as Array<{ name: String, id: Number }>);

    const { post, get } = useAxios();
    const { userId } = useAuth();

    useEffect(() => {
        usersLists();
    }, []);

    const usersLists = async () => {
        const response = await get<any>(`/api/lists?userId=${userId}`);

        if (response) {
            setLists([]);
            for (const list of response.data) {
                setLists(l => [...l, { name: list.listName, id: list.listId }]);
            }
        }
    }

    const createList = async () => {
        const body = { userId: userId, listName: createdList }
        const response = await post<any>("/api/lists/createList", body)

        if (response) {
            usersLists();
        }
    }

    const displayList = async (ListName: String, ID: Number) => {
        setListName(ListName);
        setListID(ID);
        setListView(!listView);
        setList(!list);
    }

    return (
        <View>
            {
                listView &&
                <View>
                    <Text>New List Name:</Text>
                    <TextInput style={styles.textAreaFormat} placeholder="Type New List Entry Here" onChangeText={text => setCreatedList(text)}></TextInput>
                    <Pressable onPress={() => createList()}><Text>Create List</Text></Pressable>
                    {lists.map((list) =>
                        <View style={styles.displayedLists} key={list.name + "view"}>
                            <Pressable key={list.name + "button"} style={styles.listFormat} onPress={() => displayList(list.name, list.id)}><Text style={styles.textFormat}>{list.name}</Text></Pressable>
                        </View>
                    )}
                </View>
            }

            {
                list &&
                <View>
                    <Pressable onPress={() => displayList("", 0)}><Text>Back</Text></Pressable>
                    <Lists name={listName} id={listID} />
                </View>
            }
        </View>
    )
}