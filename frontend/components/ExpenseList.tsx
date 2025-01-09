import { View } from "react-native";
import DynamicList from "./DynamicList";

export default function ShoppingListPage() {
    return (
        <View>
            {/* <DynamicList name="Expense List" id={2} type="Expense" /> */}
            <DynamicList
                name="Expense List"
                id={2}
                type="Expense"
            />

        </View>
    );
}
