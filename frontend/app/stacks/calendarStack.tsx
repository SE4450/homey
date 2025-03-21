import { createStackNavigator } from "@react-navigation/stack";

import Calendar from "../calendar";
import AddEvent from "../addEvent";
import EditEvent from "../editEvent";

export type CalendarStackParamList = {
  calendar: undefined;
  addEvent: undefined;
  editEvent: {
    id: number;
    title: string;
    eventDate: string;
    startTime: string;
    endTime: string;
    location: string;
    description: string;
  };
};

const CalendarStack = createStackNavigator<CalendarStackParamList>();

export default function CalendarStackScreen({ groupId, role }: any) {
  return (
    <CalendarStack.Navigator>
      <CalendarStack.Screen name="calendar" component={() => Calendar({ groupId, role })} options={{ headerShown: false }} />
      <CalendarStack.Screen name="addEvent" component={() => AddEvent({ groupId, role })} options={{ headerShown: false }} />
      <CalendarStack.Screen name="editEvent" component={EditEvent} options={{ headerShown: false }} />
    </CalendarStack.Navigator>
  );
}
