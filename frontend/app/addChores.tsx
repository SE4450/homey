import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Alert,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Dimensions,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import ScreenWrapper from "./components/common/screen-wrapper";
import { RANDOM_THUMBNAIL, THUMBNAILS } from "./pictures/assets";
import { COLORS } from "./theme/theme";
import AddButton from "./components/common/add-button";
import { useRouter } from "expo-router";
import axios from "axios";
import { useAuth } from "./context/AuthContext";
import useAxios from "./hooks/useAxios";
import { useNavigation } from "@react-navigation/native";
import { ChoresStackParamList } from "./stacks/choresStack";
import { StackNavigationProp } from "@react-navigation/stack";

type AddChoresScreenNavigationProp = StackNavigationProp<
  ChoresStackParamList,
  "addChore"
>;

// Update the Roommate interface to match your user data structure
interface Roommate {
  id: number;
  firstName: string;
  lastName: string;
}

const AddChore = ({ groupId, role }: any) => {
  const [choreBanner, setChoreBanner] = useState<any>(null);
  const [chore, setChore] = useState("");
  const [room, setRoom] = useState("");
  const [assignedTo, setAssignedTo] = useState<number | null>(null);
  const [selectedRoommateName, setSelectedRoommateName] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const navigation = useNavigation<AddChoresScreenNavigationProp>();
  const { userToken, userId } = useAuth();
  const { get } = useAxios();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  // Add a state to track the temporary date selection in the modal
  const [tempDate, setTempDate] = useState<Date | null>(null);

  // Add a state to track the current month for the custom date picker
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Add a state to track the year picker visibility
  const [showYearPicker, setShowYearPicker] = useState(false);

  useEffect(() => {
    const banner = RANDOM_THUMBNAIL();
    console.log("Banner:", banner);
    setChoreBanner(banner);

    // Fetch roommates when component mounts
    fetchRoommates();
  }, []);

  const fetchRoommates = async () => {
    try {
      // Fetch users from your API
      const response = await get<any>(`/api/groups/${groupId}/participants`);

      if (response && response.data) {
        setRoommates(response.data);
      }
    } catch (error) {
      console.error("Error fetching roommates:", error);
      Alert.alert("Error", "Failed to load roommates. Please try again.");
    }
  };

  const handleSelectRoommate = (roommate: Roommate) => {
    setAssignedTo(roommate.id);
    setSelectedRoommateName(`${roommate.firstName} ${roommate.lastName}`);
    setModalVisible(false);
  };

  // Generate dates for the selected month
  const generateDates = () => {
    const dates = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);

    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Get all days in the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      // Only include dates from today onwards
      if (date >= new Date(new Date().setHours(0, 0, 0, 0))) {
        dates.push(date);
      }
    }

    return dates;
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);

    // Don't allow going to past months
    const today = new Date();
    if (
      newMonth.getFullYear() < today.getFullYear() ||
      (newMonth.getFullYear() === today.getFullYear() &&
        newMonth.getMonth() < today.getMonth())
    ) {
      return;
    }

    setCurrentMonth(newMonth);
  };

  // Navigate to next month
  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);

    // Limit to 1 year in the future
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);

    if (newMonth <= maxDate) {
      setCurrentMonth(newMonth);
    }
  };

  // Format month and year for display
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  // Generate years (current year to current year + 5)
  const generateYears = () => {
    const years = [];
    const currentYear = new Date().getFullYear();

    for (let year = currentYear; year <= currentYear + 5; year++) {
      years.push(year);
    }

    return years;
  };

  // Select a specific year
  const selectYear = (year: number) => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(year);
    setCurrentMonth(newDate);
    setShowYearPicker(false);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Select a due date ";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateShort = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      weekday: "short",
    });
  };

  const handleAddChore = async () => {
    if (!chore.trim() || !room.trim()) {
      Alert.alert("Error", "Please enter both chore name and room");
      return;
    }

    setIsLoading(true);
    try {
      // Store a reference to the image (just a number 1-5)
      // This matches the keys in the THUMBNAILS object
      const bannerKey = Object.keys(THUMBNAILS)
        .map((key) => parseInt(key, 10))
        .find((key) => THUMBNAILS[key] === choreBanner);

      const payload: any = {
        choreName: chore,
        room: room,
        bannerImage: bannerKey || null,
        groupId,
      };

      // Only add assignedTo if it's provided
      if (assignedTo !== null) {
        payload.assignedTo = assignedTo;
      }

      // Only add dueDate if it's provided
      if (dueDate !== null) {
        payload.dueDate = dueDate.toISOString();
      }

      const response = await axios.post(`${API_URL}/api/chores`, payload, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 201) {
        Alert.alert("Success", "Chore added successfully", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error("Error adding chore:", error);
      Alert.alert("Error", "Failed to add chore. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.addChoreContainer}>
            {choreBanner && (
              <Image source={choreBanner} style={styles.banner} />
            )}
          </View>

          <View style={styles.form}>
            <View style={styles.formItem}>
              <Text style={styles.subHeading}>Chore Name</Text>
              <TextInput
                value={chore}
                onChangeText={(e: string) => setChore(e)}
                style={styles.input}
                placeholder="Enter chore name"
              />
            </View>

            <View style={styles.formItem}>
              <Text style={styles.subHeading}>Room</Text>
              <TextInput
                value={room}
                onChangeText={(e: string) => setRoom(e)}
                style={styles.input}
                placeholder="Enter room"
              />
            </View>

            <View style={styles.formItem}>
              <Text style={styles.subHeading}>Assign To</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.dropdownButtonText}>
                  {selectedRoommateName || "Select a roommate (optional)"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formItem}>
              <Text style={styles.subHeading}>Due Date</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dropdownButtonText}>
                  {formatDate(dueDate)}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <AddButton
                buttonText={isLoading ? "Adding..." : "Add Chore"}
                onPress={handleAddChore}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Roommate Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Roommate</Text>

            <FlatList
              data={roommates}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.roommateItem,
                    assignedTo === item.id && styles.selectedRoommateItem,
                  ]}
                  onPress={() => handleSelectRoommate(item)}
                >
                  <Text style={styles.roommateName}>
                    ID {item.id}, {item.firstName} {item.lastName}
                  </Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Custom Date Picker Modal for iOS */}
      {Platform.OS === "ios" && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.datePickerModalContainer}>
            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.datePickerCancel}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.datePickerTitle}>Select Due Date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.datePickerDone}>Done</Text>
                </TouchableOpacity>
              </View>

              {/* Month and Year navigation */}
              <View style={styles.monthNavigator}>
                <TouchableOpacity
                  onPress={goToPreviousMonth}
                  style={styles.monthNavButton}
                >
                  <Text style={styles.monthNavButtonText}>←</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowYearPicker(!showYearPicker)}
                  style={styles.yearSelectorButton}
                >
                  <Text style={styles.monthYearText}>
                    {formatMonthYear(currentMonth)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={goToNextMonth}
                  style={styles.monthNavButton}
                >
                  <Text style={styles.monthNavButtonText}>→</Text>
                </TouchableOpacity>
              </View>

              {/* Year Picker */}
              {showYearPicker ? (
                <View style={styles.yearPickerContainer}>
                  <FlatList
                    data={generateYears()}
                    keyExtractor={(item) => item.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.yearItem,
                          currentMonth.getFullYear() === item
                            ? styles.selectedYearItem
                            : null,
                        ]}
                        onPress={() => selectYear(item)}
                      >
                        <Text
                          style={[
                            styles.yearItemText,
                            currentMonth.getFullYear() === item
                              ? styles.selectedYearItemText
                              : null,
                          ]}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    )}
                    numColumns={3}
                    contentContainerStyle={styles.yearGrid}
                  />
                </View>
              ) : (
                /* Date list */
                <FlatList
                  data={generateDates()}
                  keyExtractor={(item) => item.toISOString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.dateItem,
                        dueDate &&
                          item.toDateString() === dueDate.toDateString()
                          ? styles.selectedDateItem
                          : null,
                      ]}
                      onPress={() => {
                        setDueDate(item);
                        setShowDatePicker(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dateItemText,
                          dueDate &&
                            item.toDateString() === dueDate.toDateString()
                            ? styles.selectedDateItemText
                            : null,
                        ]}
                      >
                        {formatDateShort(item)}
                      </Text>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <View style={styles.emptyDatesContainer}>
                      <Text style={styles.emptyDatesText}>
                        No available dates in this month
                      </Text>
                    </View>
                  }
                />
              )}
            </View>
          </View>
        </Modal>
      )}

      {/* Standard DateTimePicker for Android */}
      {Platform.OS === "android" && showDatePicker && (
        <DateTimePicker
          value={dueDate || new Date()}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}
    </ScreenWrapper>
  );
};

export default AddChore;

const styles = StyleSheet.create({
  addChoreContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    padding: 20,
  },
  banner: {
    height: 240,
    width: "100%",
    resizeMode: "cover",
    marginBottom: 20,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  form: {
    padding: 20,
  },
  formItem: {
    marginBottom: 15,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 10,
    marginTop: 10,
    borderRadius: 5,
  },
  subHeading: {
    fontSize: 20,
    fontWeight: "600",
  },
  dropdownButton: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 10,
    marginTop: 10,
    borderRadius: 5,
    justifyContent: "center",
  },
  dropdownButtonText: {
    color: "#555",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  roommateItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedRoommateItem: {
    backgroundColor: "#e6f7ff",
  },
  roommateName: {
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#555",
  },
  buttonContainer: {
    marginTop: 20,
  },
  datePickerModalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  datePickerContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    maxHeight: Dimensions.get("window").height * 0.6,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  datePickerCancel: {
    color: "red",
    fontSize: 16,
  },
  datePickerDone: {
    color: "blue",
    fontSize: 16,
    fontWeight: "600",
  },
  dateItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  selectedDateItem: {
    backgroundColor: "#e6f7ff",
  },
  dateItemText: {
    fontSize: 16,
  },
  selectedDateItemText: {
    fontWeight: "bold",
    color: "blue",
  },
  monthNavigator: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#f8f8f8",
  },
  monthNavButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#e6e6e6",
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  monthNavButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  yearSelectorButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#f0f0f0",
  },
  monthYearText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  yearPickerContainer: {
    padding: 10,
  },
  yearGrid: {
    paddingVertical: 10,
  },
  yearItem: {
    flex: 1,
    padding: 15,
    margin: 5,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    backgroundColor: "#f0f0f0",
  },
  selectedYearItem: {
    backgroundColor: "#e6f7ff",
    borderWidth: 1,
    borderColor: "#1890ff",
  },
  yearItemText: {
    fontSize: 16,
  },
  selectedYearItemText: {
    fontWeight: "bold",
    color: "#1890ff",
  },
  emptyDatesContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyDatesText: {
    fontSize: 16,
    color: "#888",
  },
});
