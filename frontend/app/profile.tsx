import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Button,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { useState, useEffect } from "react";
import { Dropdown } from "react-native-element-dropdown";
import { useAuth } from "./context/AuthContext";
import { useLocalSearchParams } from "expo-router";
import TextField from "./components/textField";
import { useNavigation, useRoute, RouteProp, useIsFocused } from "@react-navigation/native";
import useAxios from "./hooks/useAxios";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { GroupStackParamList } from "./stacks/groupsStack";
import { StackNavigationProp } from "@react-navigation/stack";

type ProfileNavigationProp = StackNavigationProp<GroupStackParamList, "profile">;

const COLORS = {
  PRIMARY: "#4a90e2",
  SECONDARY: "#FF9800",
  WHITE: "#FFFFFF",
  BLACK: "#000000",
  TEXT: "#333333",
  LIGHT_GRAY: "#F5F5F5",
  LOGOUT: "#D32F2F",
};

//stylesheet for the component
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    elevation: 3,
    zIndex: 100,
  },
  backButton: {
    paddingLeft: 15,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    paddingRight: 35,
  },
  profilePopup: {
    padding: 20,
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
    margin: 15,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textAreaFormat: {
    height: 45,
    flex: 1,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 10,
  },
  accountFormat: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  labelText: {
    width: 120,
    fontSize: 16,
    color: COLORS.TEXT,
  },
  dropdown: {
    height: 45,
    flex: 1,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: COLORS.WHITE,
  },
  updateButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  updateButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: "bold",
  },
  userHeader: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: COLORS.TEXT,
    textAlign: "center",
  },
  logoutContainer: {
    width: "100%",
    alignItems: "center",
  },
  button: {
    width: "80%",
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.WHITE,
  },
});

type ProfileScreenProps = {
  groupId: string;
  role: string;
};

export default function Profile({ groupId, role }: ProfileScreenProps) {

  const [cleaningValue, setCleaningValue] = useState("");
  const [noiseValue, setNoiseValue] = useState("");
  const [startSleepValue, setStartSleepValue] = useState("");
  const [endSleepValue, setEndSleepValue] = useState("");
  const [allergiesValue, setAllergiesValue] = useState("");
  const isFocused = useIsFocused();

  const data = [
    { label: "Low", value: "Low" },
    { label: "Medium", value: "Medium" },
    { label: "High", value: "High" },
  ];

  const { post, get } = useAxios();
  const [user, setUser] = useState<any>({});
  const { userId, logout } = useAuth();
  const navigation = useNavigation<ProfileNavigationProp>();

  useEffect(() => {
    if (isFocused) {
      getProfile();
    }
  }, [isFocused]);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await get<any>(`/api/users/user/${userId}`);
      if (response) {
        setUser(response.data[0]);
      }
    };
    fetchUser();
  }, []);

  const getProfile = async () => {
    const response = await get<any>(`/api/profile/${groupId}?userId=${userId}`);

    if (response) {
      if (response.data[0].cleaningHabits != null) {
        setCleaningValue(response.data[0].cleaningHabits);
      }
      if (response.data[0].noiseLevel != null) {
        setNoiseValue(response.data[0].noiseLevel);
      }
      if (response.data[0].sleepStart != null) {
        setStartSleepValue(response.data[0].sleepStart);
      }
      if (response.data[0].sleepEnd != null) {
        setEndSleepValue(response.data[0].sleepEnd);
      }
      if (response.data[0].alergies != null) {
        setAllergiesValue(response.data[0].alergies);
      }
    }
  };

  const updateProfile = async () => {
    const body = {
      cleaningHabits: cleaningValue,
      noiseLevel: noiseValue,
      sleepStart: startSleepValue,
      sleepEnd: endSleepValue,
      alergies: allergiesValue,
      userId,
    };
    const response = await post<any>(`/api/profile/updateProfile/${groupId}`, body);

    if (response) {
      console.log(response.data)
      alert("Profile updated");

      //route back to the main page
      navigation.navigate("groups");
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("groups")}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Update Profile</Text>
      </View>
      <ScrollView style={{ backgroundColor: COLORS.LIGHT_GRAY }}>
        <View style={styles.profilePopup}>
          <View>
            <Text style={styles.userHeader}>{user.firstName} {user.lastName}</Text>
          </View>
          <View style={styles.accountFormat}>
            <Text style={styles.labelText}>Cleaning Habits:</Text>
            <Dropdown
              style={styles.dropdown}
              data={data}
              labelField="label"
              valueField="value"
              placeholder={cleaningValue || "Select"}
              value={cleaningValue}
              onChange={(item) => setCleaningValue(item.value)}
            />
          </View>
          <View style={styles.accountFormat}>
            <Text style={styles.labelText}>Noise Level:</Text>
            <Dropdown
              style={styles.dropdown}
              data={data}
              labelField="label"
              valueField="value"
              placeholder={noiseValue || "Select"}
              value={noiseValue}
              onChange={(item) => setNoiseValue(item.value)}
            />
          </View>
          <View style={styles.accountFormat}>
            <Text style={styles.labelText}>Sleep Start:</Text>
            <TextInput
              style={styles.textAreaFormat}
              placeholder="e.g. 8:00"
              value={startSleepValue}
              onChangeText={(text) => setStartSleepValue(text)}
            />
          </View>
          <View style={styles.accountFormat}>
            <Text style={styles.labelText}>Sleep End:</Text>
            <TextInput
              style={styles.textAreaFormat}
              placeholder="e.g. 10:00"
              value={endSleepValue}
              onChangeText={(text) => setEndSleepValue(text)}
            />
          </View>
          <View style={styles.accountFormat}>
            <Text style={styles.labelText}>Allergies:</Text>
            <TextInput
              style={styles.textAreaFormat}
              placeholder="List allergies"
              value={allergiesValue}
              onChangeText={(text) => setAllergiesValue(text)}
            />
          </View>
          <TouchableOpacity style={styles.updateButton} onPress={updateProfile}>
            <Text style={styles.updateButtonText}>Update Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
