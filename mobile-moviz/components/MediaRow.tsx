import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { COLORS } from "@/utils/constants";
import MediaCard from "./MediaCard";
import { Ionicons } from "@expo/vector-icons";

type MediaRowProps = {
  title: string;
  data: any[];
  onSeeAll?: () => void;
  size?: "small" | "large";
};

export default function MediaRow({
  title,
  data,
  onSeeAll,
  size = "small",
}: MediaRowProps) {
  if (!data || data.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll} style={styles.seeAll}>
            <Text style={styles.seeAllText}>See All</Text>
            <Ionicons
              name="chevron-forward"
              size={14}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        horizontal
        data={data}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => <MediaCard item={item} size={size} />}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
  },
  seeAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  seeAllText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  list: {
    paddingLeft: 16,
    paddingRight: 4,
  },
});
