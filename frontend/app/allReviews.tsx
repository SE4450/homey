import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import useAxios from "./hooks/useAxios";
import { Ionicons } from "@expo/vector-icons";

type AllReviewsRouteProp = RouteProp<{ params: { reviewType: string; itemId: number } }, "params">;

export default function AllReviewsScreen() {
  const route = useRoute<AllReviewsRouteProp>();
  const { reviewType, itemId } = route.params;
  const { get } = useAxios();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const response = await get<any>("/api/reviews", { reviewType, reviewedItemId: itemId });
    if (response) {
      setReviews(response.data);
    }
    setLoading(false);
  };

  const calculateAverage = () => {
    if (reviews.length === 0) return "N/A";
    let sum = 0;
    reviews.forEach((review) => (sum += review.score));
    return (sum / reviews.length).toFixed(1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reviews</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.reviewId.toString()}
          ListHeaderComponent={
            <Text style={styles.averageRating}>Average Rating: {calculateAverage()} / 5</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.reviewItem}>
              <Text style={styles.reviewScore}>Score: {item.score} / 5</Text>
              {item.description ? <Text style={styles.reviewDescription}>{item.description}</Text> : null}
            </View>
          )}
          ListEmptyComponent={<Text style={styles.noReviews}>No reviews available.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  backButton: { paddingLeft: 15 },
  headerTitle: { fontSize: 22, fontWeight: "bold", flex: 1, textAlign: "center" },
  loading: { marginTop: 20 },
  reviewItem: { padding: 20, borderBottomWidth: 1, borderBottomColor: "#eee" },
  reviewScore: { fontSize: 16, fontWeight: "bold" },
  reviewDescription: { fontSize: 14, marginTop: 5 },
  noReviews: { textAlign: "center", marginTop: 20, fontSize: 16 },
  averageRating: { fontSize: 18, fontWeight: "bold", textAlign: "center", marginVertical: 10 },
});
