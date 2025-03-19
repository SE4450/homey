import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import useAxios from "./hooks/useAxios";
import { useIsFocused } from "@react-navigation/native";
import useUser from "./hooks/useUser";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAuth } from "./context/AuthContext";
import axios from "axios";
import { useRouter } from "expo-router";

const COLORS = {
  PRIMARY: "#4a90e2",
  SECONDARY: "#FF9800",
  WHITE: "#FFFFFF",
  BLACK: "#000000",
  TEXT: "#333333",
  LIGHT_GRAY: "#F5F5F5",
  LOGOUT: "#D32F2F",
  ALERT: "#F44336",
  CARD_BG: "#FFFFFF",
  LIGHT_PRIMARY: "#E8F5E9",
};

// Define the navigation param list type
type RootStackParamList = {
  Home: undefined;
  List: undefined;
  listDisplay: undefined;
  Inventory: undefined;
  calendar: undefined;
  Chores: undefined;
  Expenses: undefined
  // Add other screens as needed
};

// Define the navigation prop type
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// Add interfaces for Chore and ListItem
interface Chore {
  id: number;
  choreName: string;
  room: string;
  completed: boolean;
  dueDate?: string;
}

interface ListItem {
  itemId: number;
  item: string;
  listId: number;
  purchased: string;
}

// Update the greetings array to remove commas
const friendlyGreetings = [
  "Welcome",
  "Hey there",
  "Howdy",
  "What's up",
  "Yo",
  "Hi",
  "Hello",
  "Greetings",
  "Sup",
  "Hiya",
  "Good to see you",
  "Wassup",
];

type HomeScreenProps = {
  groupId: string;
  role: string;
};

export default function HomeScreen({ groupId, role }: HomeScreenProps) {
  const [inventoryAlert, setInventoryAlert] = useState([] as Array<{ itemName: String }>);
  const { user, userLoading, userError } = useUser();
  const router = useRouter();
  const { get, error } = useAxios();
  const isFocused = useIsFocused();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState(
    [] as Array<{
      id: number;
      title: string;
      eventDate: string;
      startTime?: string;
      endTime?: string;
    }>
  );
  const [assignedChores, setAssignedChores] = useState<Chore[]>([]);
  const [houseSummary, setHouseSummary] = useState({
    pendingChores: 0,
    totalOwed: 0,
  });
  const [loading, setLoading] = useState(true);
  const { userToken, userId } = useAuth();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    if (error) {
      //Alert.alert("Error", error);
    }
  }, [error]);

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  const loadData = async () => {
    lowInventoryAlert();
    fetchUpcomingEvents();
    fetchAssignedItems();
    fetchHouseSummary();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setGreeting(getRandomGreeting());
    await loadData();
    setLastRefreshed(new Date());
    setRefreshing(false);
  };

  const fetchUpcomingEvents = async () => {
    setUpcomingEvents([]);

    try {
      // Check if the API endpoint exists before making the request
      const response = await axios.get(`${API_URL}/api/calendar/upcoming/${groupId}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        // Add this to prevent axios from throwing an error on 404
        validateStatus: function (status) {
          return status < 500; // Resolve only if the status code is less than 500
        },
      });

      // If we got a 404, just treat it as empty data
      if (response.status === 404) {
        console.log("Calendar API endpoint not found, treating as empty data");
        return;
      }

      if (
        response &&
        response.data &&
        Array.isArray(response.data.data) &&
        response.data.data.length > 0
      ) {
        setUpcomingEvents(
          response.data.data.map((event: any) => ({
            id: event.id,
            title: event.title,
            eventDate: event.eventDate,
            startTime: event.startTime,
            endTime: event.endTime,
          }))
        );
      }
    } catch (error) {
      // Just log the error, don't show an alert
      console.error("Error fetching upcoming events:", error);
    }
  };

  const lowInventoryAlert = async () => {
    setInventoryAlert([]);

    const response = await get<any>(
      `/api/inventory/getLowItem/${groupId}?quantity=1&quantity=0`
    );

    if (response) {
      response.data.forEach(
        (item: {
          itemId: Number;
          houseId: Number;
          itemName: String;
          quantity: Number;
        }) => {
          setInventoryAlert((l) => [...l, { itemName: item.itemName }]);
        }
      );
    }
  };

  // Fetch assigned chores and list items
  useEffect(() => {
    if (userToken && isFocused) {
      fetchAssignedItems();
      fetchHouseSummary();
    }
  }, [userToken, isFocused]);

  const fetchAssignedItems = async () => {
    setLoading(true);
    try {
      // Fetch chores assigned to the user
      const choresResponse = await axios.get(
        `${API_URL}/api/chores/${groupId}?assignedTo=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (choresResponse.data.status === "success") {
        // Filter only active (not completed) chores
        const activeChores = choresResponse.data.data.filter(
          (chore: Chore) => !chore.completed
        );
        setAssignedChores(activeChores);
      }
    } catch (error) {
      console.error("Error fetching assigned chores:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHouseSummary = async () => {
    try {
      // Fetch pending chores count
      let pendingChores = 0;
      try {
        const choresResponse = await axios.get(
          `${API_URL}/api/chores/${groupId}?assignedTo=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );

        if (choresResponse.data.status === "success") {
          pendingChores = choresResponse.data.data.filter(
            (chore: Chore) => !chore.completed
          ).length;
        }
      } catch (choresError) {
        console.error("Error fetching chores:", choresError);
      }

      // Fetch expenses data
      let totalOwed = 0;
      try {
        const expensesResponse = await axios.get(
          `${API_URL}/api/expenses/${groupId}?paidBy=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
            // Let 404 pass through instead of throwing an error
            validateStatus: (status) => status < 500,
          }
        );

        // If 404, treat it as no data
        if (expensesResponse.status === 404) {
          console.log(
            "Expenses endpoint not found or no expenses for this user. Treating total owed as 0."
          );
        } else if (
          expensesResponse.data.status === "success" &&
          expensesResponse.data.data
        ) {
          totalOwed = expensesResponse.data.data.reduce(
            (sum: number, expense: any) => sum + parseFloat(expense.amount),
            0
          );
        }
      } catch (expensesError) {
        // If some other error occurred (>= 500), you still catch it here
        console.error("Error fetching expenses:", expensesError);
      }

      // Update the state with the data we were able to fetch
      setHouseSummary({
        pendingChores,
        totalOwed,
      });
    } catch (error) {
      console.error("Error in fetchHouseSummary:", error);
    }
  };

  // Render a to-do item (either chore or list item)
  const renderToDoItem = (title: string, description: string, type: string) => (
    <View style={styles.todoItem}>
      <View style={styles.todoContent}>
        <Text style={styles.todoTitle}>{title}</Text>
        <Text style={styles.todoDescription}>{description}</Text>
      </View>
      <View
        style={[
          styles.todoType,
          type === "chore" ? styles.choreType : styles.listType,
        ]}
      >
        <Text style={styles.todoTypeText}>{type}</Text>
      </View>
    </View>
  );

  // Add this function to get a random greeting
  const getRandomGreeting = () => {
    const randomIndex = Math.floor(Math.random() * friendlyGreetings.length);
    return friendlyGreetings[randomIndex];
  };

  // Update the greeting whenever the screen is focused or refreshed
  useEffect(() => {
    if (isFocused) {
      setGreeting(getRandomGreeting());
    }
  }, [isFocused]);

  if (userLoading) return <ActivityIndicator size="large" color="#0000ff" />;
  if (userError) return <Text>Error: {userError}</Text>;
  if (!user) return <Text>No user found.</Text>;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.heading}>Homeys</Text>
        <Text style={styles.welcomeText}>
          <Text style={styles.greeting}>{greeting}</Text>{" "}
          <Text style={styles.userName}>
            {user.firstName} {user.lastName}
          </Text>
        </Text>

        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionHeading}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate(role == "tenant" ? "List" : "Expenses")}
            >
              <Icon
                name={role == "tenant" ? "format-list-bulleted" : "account-cash"}
                size={22}
                color={COLORS.WHITE}
              />
              <Text style={styles.actionButtonText}>{role == "tenant" ? "Create List" : "Add Expense"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("Chores")}
            >
              <Icon name="broom" size={22} color={COLORS.WHITE} />
              <Text style={styles.actionButtonText}>Add Chore</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("calendar")}
            >
              <Icon name="calendar-plus" size={22} color={COLORS.WHITE} />
              <Text style={styles.actionButtonText}>New Event</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.exitGroupButton} onPress={() => router.push("/homeNavigation")}>
          <Text style={styles.exitGroupButtonText}>Exit Group</Text>
        </TouchableOpacity>
        {inventoryAlert.length != 0 && (
          <View style={styles.alertContainer}>
            <Text style={styles.alertHeading}>Alerts</Text>
            <Text style={styles.alertHeader}>Low Inventory:</Text>
            {inventoryAlert.map((item) => (
              <Text key={item.itemName + "textnode"} style={styles.alertText}>
                {item.itemName}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.cardContainer}>
          <Text style={styles.sectionHeading}>Your To-Dos</Text>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.PRIMARY} />
          ) : assignedChores.length === 0 ? (
            <Text style={styles.emptyMessage}>You have no assigned chores</Text>
          ) : (
            <View style={styles.todoList}>
              {/* Render chores */}
              {assignedChores.map((chore) => (
                <TouchableOpacity
                  key={`chore-${chore.id}`}
                  onPress={() =>
                    navigation.navigate("Chores", {
                      screen: "choreDetails",
                      params: {
                        id: chore.id.toString(),
                        choreName: chore.choreName,
                        room: chore.room,
                        completed: chore.completed,
                      },
                    } as any)
                  }
                >
                  {renderToDoItem(
                    chore.choreName,
                    `Room: ${chore.room}${chore.dueDate
                      ? ` • Due: ${new Date(
                        chore.dueDate
                      ).toLocaleDateString()}`
                      : ""
                    }`,
                    "chore"
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Upcoming Events Section */}
        <View style={styles.cardContainer}>
          <Text style={styles.sectionHeading}>Upcoming Events</Text>
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <Icon
                  name="calendar-month"
                  size={24}
                  color={COLORS.PRIMARY}
                  style={styles.cardIcon}
                />
                <View>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDate}>
                    {event.eventDate}{" "}
                    {event.startTime && `at ${event.startTime}`}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyEventCard}>
              <Icon
                name="calendar-blank"
                size={24}
                color={COLORS.TEXT + "80"}
                style={styles.cardIcon}
              />
              <Text style={styles.emptyEventText}>
                No upcoming events within 48 hours
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardContainer}>
          <Text style={styles.sectionHeading}>House Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Icon name="broom" size={22} color={COLORS.TEXT} />
              <Text style={styles.summaryText}>
                Pending Chores: {houseSummary.pendingChores}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Icon name="cash" size={22} color={COLORS.TEXT} />
              <Text style={styles.summaryText}>
                Total Owed: ${houseSummary.totalOwed.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.lastRefreshedText}>
          Last updated: {lastRefreshed.toLocaleTimeString()}
        </Text>
      </View>
    </ScrollView>
  );
}

const TEXT_LIGHT = COLORS.TEXT + "80";

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  header: {
    marginBottom: 30,
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 18,
    color: COLORS.TEXT,
    marginBottom: 10,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    textAlign: "center",
  },
  greeting: {
    fontWeight: "600",
    color: COLORS.PRIMARY,
    fontStyle: "italic",
  },
  userName: {
    fontWeight: "bold",
    color: COLORS.TEXT,
  },
  heading: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.PRIMARY,
    paddingBottom: 10,
  },
  quickActionsContainer: {
    width: "100%",
    marginVertical: 15,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.TEXT,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  actionButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
    flexDirection: "column",
    justifyContent: "center",
  },
  actionButtonText: {
    color: COLORS.WHITE,
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 5,
  },
  alertContainer: {
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    backgroundColor: COLORS.WHITE,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  alertHeading: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.ALERT,
    marginBottom: 5,
  },
  alertHeader: {
    fontSize: 20,
    fontWeight: "bold",
  },
  alertText: {
    fontSize: 20,
  },
  cardContainer: {
    width: "100%",
    marginVertical: 10,
  },
  eventCard: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  cardIcon: {
    marginRight: 15,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.TEXT,
  },
  eventDate: {
    fontSize: 14,
    color: COLORS.SECONDARY,
    marginTop: 5,
  },
  summaryCard: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 8,
    padding: 15,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryItem: {
    fontSize: 16,
    marginVertical: 8,
    color: COLORS.TEXT,
    flexDirection: "row",
    alignItems: "center",
  },
  summaryText: {
    fontSize: 16,
    marginLeft: 10,
    color: COLORS.TEXT,
  },
  todoList: {
    marginTop: 10,
  },
  todoItem: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  todoContent: {
    flex: 1,
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.TEXT,
    marginBottom: 4,
  },
  todoDescription: {
    fontSize: 14,
    color: TEXT_LIGHT,
  },
  todoType: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginLeft: 10,
  },
  choreType: {
    backgroundColor: "#E3F2FD",
  },
  listType: {
    backgroundColor: "#F1F8E9",
  },
  todoTypeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  emptyMessage: {
    textAlign: "center",
    marginTop: 20,
    color: TEXT_LIGHT,
    fontSize: 16,
  },
  emptyEventCard: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyEventText: {
    fontSize: 14,
    color: COLORS.TEXT + "80",
    marginLeft: 10,
  },
  lastRefreshedText: {
    fontSize: 12,
    color: COLORS.TEXT + "80",
    textAlign: "center",
    marginTop: 5,
    marginBottom: 10,
  },
  exitGroupButton: {
    backgroundColor: "#D32F2F",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
    alignSelf: "center",
    width: "80%",
  },
  exitGroupButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
