import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ViewStyle,
} from "react-native";
import { useRouter } from "expo-router";
import { imgPosterSmall, COLORS } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.36;

type MediaCardProps = {
  item: any;
  size?: "small" | "large";
  style?: ViewStyle;
};

export default function MediaCard({ item, size = "small", style }: MediaCardProps) {
  const router = useRouter();
  const mediaType = item.media_type || (item.title ? "movie" : "tv");
  const title = item.title || item.name || "Unknown";
  const posterPath = item.poster_path;
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;
  const year = (item.release_date || item.first_air_date || "").slice(0, 4);

  const cardWidth = size === "large" ? width * 0.44 : CARD_WIDTH;
  const cardHeight = cardWidth * 1.5;

  const handlePress = () => {
    if (mediaType === "movie") {
      router.push(`/movie/${item.id}` as any);
    } else if (mediaType === "tv") {
      router.push(`/tv/${item.id}` as any);
    } else if (mediaType === "person") {
      router.push(`/person/${item.id}` as any);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width: cardWidth }, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[styles.imageContainer, { height: cardHeight }]}>
        {posterPath ? (
          <Image
            source={{ uri: `${imgPosterSmall}${posterPath}` }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="image-outline" size={36} color={COLORS.textMuted} />
          </View>
        )}
        {rating && (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={10} color={COLORS.star} />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        )}
        {mediaType && mediaType !== "person" && (
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>
              {mediaType === "movie" ? "Movie" : "TV"}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      {year ? <Text style={styles.year}>{year}</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
    marginBottom: 8,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: COLORS.surfaceLight,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.surfaceLight,
  },
  ratingBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "700",
  },
  typeBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(139,92,246,0.85)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: "700",
  },
  title: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 6,
    lineHeight: 17,
  },
  year: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
});
