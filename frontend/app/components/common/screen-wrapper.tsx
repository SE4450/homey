import React, { ReactNode } from "react";
import { StyleSheet, View, Platform } from "react-native";

interface ScreenWrapperProps {
  children?: ReactNode;
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ children }) => {
  return <View style={styles.screenWrapper}>{children}</View>;
};

export default ScreenWrapper;

const styles = StyleSheet.create({
  screenWrapper: {
    paddingTop: Platform.OS === "ios" ? 10 : 0,
    paddingHorizontal: 24,
    paddingBottom: 32,
    backgroundColor: "red",
    minHeight: "100%",
  },
});
