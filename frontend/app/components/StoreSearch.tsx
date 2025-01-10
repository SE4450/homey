import { View, ScrollView, StyleSheet, Text, TextInput, Button, Pressable } from "react-native";
import { useState } from "react";

import useAxios from "../hooks/useAxios";

//stylesheet for the component
const styles = StyleSheet.create({
    textAreaFormat : {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        backgroundColor: "white"
    },
});

export default function StoreSearch(){
    //use effects
    const [itemToCompare, setItemToCompare] = useState("");
    const [foundItems, setFoundItems] = useState([] as Array<{itemName: String, store: String, price: String}>);

    const { post, get } = useAxios();

    //sample of what the items would look like
    //let items = [{itemName: "apples", store: "Loblaws", price: "$2.00"}, {itemName: "apples", store: "Costco", price: "$1.50"}, {itemName: "apples", store: "Farm boy", price: "$2.00"}, ]

    //return all the searched results from the database
    const compareItem = async() => {
        setFoundItems([]);
        if(itemToCompare != "") {
            const body = { itemName: itemToCompare.toLowerCase() }
            const response = await get<any>(`/api/stores/getEntries`, body);

            if(response) {
                for(const item of response.data) {
                    setFoundItems(i => [...i, {itemName: item.itemName, store: item.store, price: item.price}]);
                }
            }
        }
        else {
            alert("You must enter an item before searching");
        }
    }

    return(
        <View>
            <Text>Search Item: </Text>
            <TextInput style={styles.textAreaFormat} placeholder="Type Item Here" onChangeText={text => setItemToCompare(text)}></TextInput>
            <Button title="Click To See Where You Can Buy This Item" onPress={compareItem} /> 

            {
                foundItems.map((item, index) => 
                    <View key={item.itemName.concat(item.store+"viewnode")}>
                        <Text key={item.itemName.concat(item.store+"textnode")}>{item.itemName} {item.store} {item.price}</Text>
                    </View>
                )
            }
        </View>
    )
}