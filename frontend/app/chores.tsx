import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { Provider } from "react-redux";

import ScreenWrapper from "./components/common/screen-wrapper";
import { store } from "./redux/store";
import { COLORS } from "./theme/theme";
import { IMAGES, RANDOM_THUMBNAIL } from "./pictures/assets";

export default function HomeScreen() {

  const router = useRouter();

  const MOCKDATA = [
    {
      id: 1,
      banner: RANDOM_THUMBNAIL(),
      choreName: "DISHES", // Renamed
      ROOM: "KITCHEN", // Renamed
    },
    {
      id: 2,
      banner: RANDOM_THUMBNAIL(),
      choreName: "CLEAN", // Renamed
      ROOM: "LIVING ROOM", // Renamed
    },
    {
      id: 3,
      banner: RANDOM_THUMBNAIL(),
      choreName: "CLEAN", // Renamed
      ROOM: "DRIVEWAY", // Renamed
    },
  ];

  const styles = StyleSheet.create({
    addButtonText: {
      fontWeight: "700",
      color: COLORS.TEXT
    },
    addChoreButton: {
      position: "absolute",
      backgroundColor: COLORS.WHITE,
      paddingHorizontal: 25,
      paddingVertical: 12,
      borderRadius: 18,
      bottom: 0,
      left: 70
    },
    banner: {
      width: "150%",
      height: 200,
      resizeMode: "contain"
    },
    bannerContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "relative"
    },
    listWrapper: {
      marginBottom: 120,
      height: 420
    },
    choreName: {
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 6
    },
    room: {
      fontSize: 10,
      fontWeight: "600",
      marginLeft: 6
    },
    subHeading: {
      fontSize: 18,
      fontWeight: "700",
      color: COLORS.TEXT,
      marginBottom: 12
    },
    choreBanner: {
      height: 140,
      width: 140
    },
    choreCard: {
      backgroundColor: COLORS.WHITE,
      marginBottom: 12,
      padding: 8,
      borderRadius: 18
    },
    choreList: {
      justifyContent: "space-between"
    }
  });

  return (
    <Provider store={store}>
      <ScreenWrapper>
        <View style={styles.bannerContainer}>
          <Image source={IMAGES.HOMEY_BANNER} style={styles.banner} />
          <TouchableOpacity onPress={() => router.push("/addChores")}>
            <View style={styles.addChoreButton}>
              <Text style={styles.addButtonText}>Add Chore</Text>
            </View>
          </TouchableOpacity>
        </View>
        <Text style={styles.subHeading}>ACTIVE CHORES</Text>
        <View style={styles.listWrapper}>
          <FlatList
            data={MOCKDATA}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.choreList}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => router.push(`/choreDetails?id=${item.id}`)}
              >
                <View style={styles.choreCard}>
                  {item.banner ? (
                    <Image source={item.banner} style={styles.choreBanner} />
                  ) : (
                    <Text>No Image Available</Text>
                  )}
                  <Text style={styles.choreName}>{item.choreName}</Text>
                  <Text style={styles.room}>{item.ROOM}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </ScreenWrapper>
    </Provider>
  );
}
