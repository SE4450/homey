import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useState, useEffect } from "react";
import { StarRatingDisplay } from "react-native-star-rating-widget";
import { useAuth } from "./context/AuthContext";
import useAxios from "./hooks/useAxios";
import { useRouter } from "expo-router";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { ReviewStackParamList } from "./stacks/reviewsStack";
import { StackNavigationProp } from "@react-navigation/stack";
type ReviewScreenNavigationProp = StackNavigationProp<
  ReviewStackParamList,
  "mainProfile"
>;
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
  accountRatingFormat: {
    alignItems: "center",
    marginBottom: 30,
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
  scoreHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: COLORS.TEXT,
    textAlign: "center",
  },
  buttonContainer: {
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
export default function MainProfileDisplay() {
  const [avgScoreValue, setAvgScoreValue] = useState(0);
  const [cleaningValue, setCleaningValue] = useState("");
  const [noiseValue, setNoiseValue] = useState("");
  const [startSleepValue, setStartSleepValue] = useState("");
  const [endSleepValue, setEndSleepValue] = useState("");
  const [allergiesValue, setAllergiesValue] = useState("");
  const { post, get } = useAxios();
  const [user, setUser] = useState<any>({});
  const { userId, logout } = useAuth();
  const navigation = useNavigation<ReviewScreenNavigationProp>();
  const isFocused = useIsFocused();
  const router = useRouter();
  useEffect(() => {
    if(isFocused) {
        getProfile();
        getAvgUserScore();
    }
  }, [isFocused]);
  useEffect(() => {
    //currently needed to get the user id
    const fetchUser = async () => {
      const response = await get<any>(`/api/users/user/${userId}`);
      if (response) {
        setUser(response.data[0]);
      }
    };
    fetchUser();
  }, []);
  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };
  const getProfile = async () => {
    const body = { id: userId };
    const response = await get<any>("/api/profile", body);
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
  const getAvgUserScore = async() => {
    const response = await get<any>(`/api/reviews?reviewType=user&reviewedItemId=${userId}`);
    if(response){
      let avgScore = 0;
      if(response.data.length != 0) {
        for(let i = 0; i < response.data.length; i++) {
          avgScore += response.data[i].score;
        }
        avgScore = Math.round((avgScore / response.data.length) * 100) / 100
        setAvgScoreValue(avgScore);
      }
    }
  }
  return (
    <ScrollView style={{ backgroundColor: COLORS.LIGHT_GRAY }}>
      <View style={styles.profilePopup}>
        <View>
          <Text style={styles.userHeader}>{user.username}</Text>
        </View>
        <View style={styles.accountRatingFormat}>
          <StarRatingDisplay rating={avgScoreValue} starSize={50}/>
          <Text style={styles.scoreHeader}>Average Rating: {avgScoreValue}</Text>
        </View>
        <View style={styles.accountFormat}>
          <Text style={styles.labelText}>Cleaning Habits: {cleaningValue}</Text>
        </View>
        <View style={styles.accountFormat}>
          <Text style={styles.labelText}>Noise Level: {noiseValue}</Text>
        </View>
        <View style={styles.accountFormat}>
          <Text style={styles.labelText}>Sleep Start (A.M.): {startSleepValue}</Text>
        </View>
        <View style={styles.accountFormat}>
          <Text style={styles.labelText}>Sleep End (P.M.): {endSleepValue}</Text>
        </View>
        <View style={styles.accountFormat}>
          <Text style={styles.labelText}>Allergies: {allergiesValue}</Text>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: COLORS.PRIMARY }]}
          onPress={() => navigation.navigate("editProfile")}
        >
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: COLORS.PRIMARY  }]}
          onPress={() => navigation.navigate("displayReview")}
        >
          <Text style={styles.buttonText}>Understand Your Score</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: COLORS.PRIMARY  }]}
          onPress={() => navigation.navigate("reviewSelection")}
        >
          <Text style={styles.buttonText}>Review Your Roomates</Text>
        </TouchableOpacity>
      </View>
      {/* THE FOLLOWING 2 VIEWS NEED TO BE UPDATED TO HAVE THE APPROPRIATE LANDLORD ID AND HOUSE ID!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: COLORS.PRIMARY  }]}
          onPress={() => navigation.navigate("review", { reviewName: "Landlord", reviewType: "user", itemId: 1 })}
        >
          <Text style={styles.buttonText}>Review Your Landlord</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: COLORS.PRIMARY  }]}
          onPress={() => navigation.navigate("review", { reviewName: "House", reviewType: "property", itemId: 1 })}
        >
          <Text style={styles.buttonText}>Review Your House</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: COLORS.LOGOUT }]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
