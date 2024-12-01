import { Text, View } from "react-native";

import Lists from ".././components/Lists"
import ListDisplay from ".././pages/ListDisplay"
//import Profile from ".././components/Profile"

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ListDisplay />
      {/*<Profile />*/}
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
