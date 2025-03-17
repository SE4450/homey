import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Button,
  Pressable,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";

import useAxios from "../app/hooks/useAxios";
import { useAuth } from "../app/context/AuthContext";
import Lists from "./components/Lists";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  textAreaFormat: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    backgroundColor: "white",
    borderColor: "#ddd",
    fontSize: 16,
  },
  createButton: {
    backgroundColor: "#4a90e2",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  createButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  listsContainer: {
    marginTop: 10,
  },
  listItem: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  listName: {
    fontSize: 18,
    fontWeight: "500",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    marginLeft: 4,
    color: "#4a90e2",
  },
  emptyListMessage: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginTop: 40,
  },
});

export default function ListDisplay() {
  const [listView, setListView] = useState(true);
  const [list, setList] = useState(false);
  const [listName, setListName] = useState("" as String);
  const [createdList, setCreatedList] = useState("" as String);
  const [listID, setListID] = useState(0 as Number);
  //variable that will hold the names of all the user created lists
  const [lists, setLists] = useState([] as Array<{ name: String; id: Number }>);

  const { post, get } = useAxios();
  const { userToken, userId } = useAuth();

  //sample data to test
  //let data = [{name: "list1", id: 1}, {name: "list2", id: 2}, {name: "list3", id: 3}];

  useEffect(() => {
    usersLists();
  }, []);

  //function called in the useEffect to load all the users created lists
  const usersLists = async () => {
    //fetch request goes here
    const response = await get<any>(`/api/lists?userId=${userId}`);

    //clear the array
    setLists([]);

    if (response) {
      for (const list of response.data) {
        setLists((l) => [...l, { name: list.listName, id: list.listId }]);
      }
    }
  };

  //function to create a new list
  const createList = async () => {
    if (createdList != "") {
      const body = { userId: userId, listName: createdList };
      const response = await post<any>("/api/lists/createList", body);

      if (response) {
        usersLists();
      }
    } else {
      alert("You must add a name for a list");
    }
    setCreatedList("");
  };

  //function for the delete alert
  const deleteConfirmation = async (listId: Number, listName: String) => {
    Alert.alert("Delete List", `Do you want to delete the list ${listName}`, [
      {
        text: "Yes",
        onPress: () => deleteList(listId),
      },
      {
        text: "No",
      },
    ]);
  };

  //function to delete a list
  const deleteList = async (listId: Number) => {
    const body = { listId: listId };

    const response = await post<any>("/api/lists/deleteList", body);

    if (response) {
      usersLists();
      alert("The list has been deleted");
    } else {
      alert("You must add a name for a list");
    }
    setCreatedList("");
  };

  //function to display the selected list
  const displayList = async (ListName: String, ID: Number) => {
    setListName(ListName);
    setListID(ID);
    setListView(!listView);
    setList(!list);
  };

  return (
    <ScrollView style={styles.container}>
      {listView && (
        <View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>New List Name:</Text>
            <TextInput
              style={styles.textAreaFormat}
              placeholder="Enter list name"
              value={createdList.toString()}
              onChangeText={(text) => setCreatedList(text)}
            />
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => createList()}
            >
              <Text style={styles.createButtonText}>Create List</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.listsContainer}>
            {lists.length > 0 ? (
              lists.map((list) => (
                <TouchableOpacity
                  key={list.name.toString()}
                  style={styles.listItem}
                  onPress={() => displayList(list.name, list.id)}
                  onLongPress={() => deleteConfirmation(list.id, list.name)}
                >
                  <Text style={styles.listName}>{list.name}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#888" />
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyListMessage}>
                No lists yet. Create your first list above!
              </Text>
            )}
          </View>
        </View>
      )}

      {list && (
        <View>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => displayList("", 0)}
          >
            <Ionicons name="arrow-back" size={18} color="#4a90e2" />
            <Text style={styles.backButtonText}>Back to Lists</Text>
          </TouchableOpacity>
          <Lists name={listName} id={listID} houseId={userId} />
        </View>
      )}
    </ScrollView>
  );
}
