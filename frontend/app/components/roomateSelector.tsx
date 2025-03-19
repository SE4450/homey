import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, Alert, StyleSheet } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import useAxios from "../hooks/useAxios";
import useUser from "../hooks/useUser";
interface RoommateSelectorProps {
    groupId: string;
    onSelect: (roommateId: string) => void;
}
const RoommateSelector: React.FC<RoommateSelectorProps> = ({ groupId, onSelect }) => {
    const { user, userLoading } = useUser();
    const { get, error } = useAxios();
    const [roommates, setRoommates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [selectedRoommate, setSelectedRoommate] = useState<string | null>(null);
    useEffect(() => {
        if (!groupId) return;
        const fetchRoommates = async () => {
            setLoading(true);
            try {
                const response = await get<any>(`/api/groups/${groupId}/participants`);
                if (response) {
                    // Filter out the logged-in user
                    const filteredRoommates = response.data.filter((member: any) => member.id !== user?.id);
                    setRoommates(
                        filteredRoommates.map((roommate: any) => ({
                            label: `${roommate.firstName} ${roommate.lastName}`,
                            value: roommate.id,
                        }))
                    );
                }
            } catch (err) {
                Alert.alert("Error", "Failed to fetch roommates.");
            } finally {
                setLoading(false);
            }
        };
        fetchRoommates();
    }, [groupId, user]);
    useEffect(() => {
        if (error) {
            Alert.alert("Error", error);
        }
    }, [error]);
    if (loading || userLoading) {
        return <ActivityIndicator size="large" color="#4CAF50" />;
    }
    return (
        <View style={styles.container}>
            <Text style={styles.label}>Select a Roommate</Text>
            <DropDownPicker
                open={open}
                value={selectedRoommate}
                items={roommates}
                setOpen={setOpen}
                setValue={setSelectedRoommate}
                onChangeValue={(value) => {
                    if (value) {
                        onSelect(value);
                    }
                }}
                placeholder="Select a roommate"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
            />
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
    },
    dropdown: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
    },
    dropdownContainer: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
    },
});
export default RoommateSelector;
