import { View } from "react-native";
import DynamicList from "../components/DynamicList";

export default function ShoppingListPage() {
    return (
        <View>
            <DynamicList
                name="Shopping List"
                id={1}
                type="Shopping"
            />
            {/* <DynamicList name="Shopping List" id={1} type="Shopping" /> */}
        </View>
    );
}
