import { createStackNavigator } from "@react-navigation/stack";
import Chores from "../chores";
import AddChores from "../addChores";
import ChoreDetails from "../choreDetails";

export type ChoresStackParamList = {
  chores: undefined;
  addChore: undefined;
  choreDetails: {
    id: string;
    choreName: string;
    room: string;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
    bannerImage: string | null;
    assignedTo: string | null;
    assigneeName: string | null;
  };
};

const ChoresStack = createStackNavigator<ChoresStackParamList>();

export default function ChoresStackScreen() {
  return (
    <ChoresStack.Navigator>
      <ChoresStack.Screen
        name="chores"
        component={Chores}
        options={{
          headerShown: false,
        }}
      />
      <ChoresStack.Screen
        name="addChore"
        component={AddChores}
        options={{
          headerShown: false,
        }}
      />
      <ChoresStack.Screen
        name="choreDetails"
        component={ChoreDetails}
        options={{
          headerShown: false,
        }}
      />
    </ChoresStack.Navigator>
  );
}
