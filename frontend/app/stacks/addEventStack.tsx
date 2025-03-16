import { createStackNavigator } from "@react-navigation/stack";
import Calendar from "../calendar";
import AddEvent from "../addEvent";

export type CalendarStackParamList = {
    calendar: undefined;
    addEvent: undefined;
};

const CalendarStack = createStackNavigator<CalendarStackParamList>();

export default function CalendarStackScreen() {
    return (
        <CalendarStack.Navigator>
            <CalendarStack.Screen name="calendar" component={Calendar} options={{
                headerShown: false
            }} />
            <CalendarStack.Screen
                name="addEvent"
                component={AddEvent}
                options={{
                    headerShown: false
                }}
            />
        </CalendarStack.Navigator>
    );
}