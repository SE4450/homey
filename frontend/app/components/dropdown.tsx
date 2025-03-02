import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";

type DropdownProps = {
    options: string[];
    customStyle?: {
        containerStyle?: object;
        dropdownStyle?: object;
        optionStyle?: object;
        selectedOptionStyle?: object;
    };
    onOptionSelect: (selected: string) => void;
    placeholder?: string;  //this line was added
};

const Dropdown: React.FC<DropdownProps> = ({
    options,
    customStyle = {},
    onOptionSelect,
    placeholder,  //this was added for a placeholder value
}) => {
    //set the inital value of the dropdown
    let initalVal = "";
    if(placeholder == null) {
        initalVal = options[0];
    }
    else {
        initalVal = placeholder;
    }

    const [selectedOption, setSelectedOption] = useState(initalVal);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleOptionSelect = (option: string) => {
        setSelectedOption(option);
        setIsDropdownOpen(false);
        onOptionSelect(option);
    };

    return (
        <View style={[styles.container, customStyle?.containerStyle]}>
            <TouchableOpacity
                style={[styles.selectedOption, customStyle?.selectedOptionStyle]}
                onPress={() => setIsDropdownOpen(!isDropdownOpen)}
            >
                <Text>{selectedOption}</Text>
            </TouchableOpacity>
            {isDropdownOpen && (
                <View style={[styles.dropdown, customStyle?.dropdownStyle]}>
                    <FlatList
                        data={options}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.option, customStyle?.optionStyle]}
                                onPress={() => handleOptionSelect(item)}
                            >
                                <Text>{item}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 200,
    },
    selectedOption: {
        borderWidth: 1,
        borderColor: "gray",
        borderRadius: 8,
        padding: 10,
        backgroundColor: "#fff",
    },
    dropdown: {
        marginTop: 5,
        borderWidth: 1,
        borderColor: "gray",
        borderRadius: 8,
        backgroundColor: "#fff",
        maxHeight: 150,
    },
    option: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
});

export default Dropdown;
