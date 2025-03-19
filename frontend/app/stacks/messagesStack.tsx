import { createStackNavigator } from "@react-navigation/stack";
import ContactsScreen from "../contacts";
import ConversationScreen from "../conversation";

export type MessageStackParamList = {
    contacts: undefined;
    conversation: { id: string; name: string };
};

const MessageStack = createStackNavigator<MessageStackParamList>();

export default function MessageStackScreen() {
    return (
        <MessageStack.Navigator>
            <MessageStack.Screen name="contacts" component={ContactsScreen} options={{
                headerShown: false
            }} />
            <MessageStack.Screen
                name="conversation"
                component={ConversationScreen}
                options={{
                    headerShown: false
                }}
            />
        </MessageStack.Navigator>
    );
}