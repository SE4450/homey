import { View } from "react-native";
import DynamicList from "../components/DynamicList";

export default function ChoresListPage() {
    return (
        <View>
            <DynamicList name="Chores List" id={2} type="Chores" />
        </View>
    );
}
