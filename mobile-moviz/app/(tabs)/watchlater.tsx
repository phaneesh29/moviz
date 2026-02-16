import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "@/utils/api";
import { imgPosterSmall, COLORS } from "@/utils/constants";
import {
  getWatchLaterList,
  removeFromWatchLater,
  clearWatchLater,
  WatchLaterItem,
} from "@/utils/watchLater";
import SegmentedControl from "@/components/SegmentedControl";

const { width } = Dimensions.get("window");

type EnrichedItem = WatchLaterItem & {
  title?: string;
  name?: string;
  poster_path?: string | null;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
};

export default function WatchLaterScreen() {
  const router = useRouter();
  const [items, setItems] = useState<EnrichedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getWatchLaterList();
      // Fetch metadata for each item
      const enriched = await Promise.all(
        list.map(async (item) => {
          try {
            const endpoint =
              item.media_type === "movie"
                ? `/movie/get/${item.id}`
                : `/tv/get/${item.id}`;
            const res = await api.get(endpoint);
            return { ...item, ...(res.data?.results || {}) };
          } catch {
            return item;
          }
        })
      );
      setItems(enriched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  const handleRemove = async (id: string, mediaType: string) => {
    await removeFromWatchLater(id, mediaType);
    setItems((prev) =>
      prev.filter(
        (item) =>
          !(String(item.id) === String(id) && item.media_type === mediaType)
      )
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear Watch Later",
      "Are you sure you want to remove all items?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            await clearWatchLater();
            setItems([]);
          },
        },
      ]
    );
  };

  const filteredItems = items.filter((item) => {
    if (filter === "Movies") return item.media_type === "movie";
    if (filter === "TV") return item.media_type === "tv";
    return true;
  });

  const renderItem = ({ item }: { item: EnrichedItem }) => {
    const title = item.title || item.name || "Unknown";
    const year = (item.release_date || item.first_air_date || "").slice(0, 4);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push(
            (item.media_type === "movie"
              ? `/movie/${item.id}`
              : `/tv/${item.id}`) as any
          )
        }
        activeOpacity={0.7}
      >
        <View style={styles.cardImage}>
          {item.poster_path ? (
            <Image
              source={{ uri: `${imgPosterSmall}${item.poster_path}` }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons
                name="image-outline"
                size={28}
                color={COLORS.textMuted}
              />
            </View>
          )}
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>
              {item.media_type === "movie" ? "Movie" : "TV"}
            </Text>
          </View>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {title}
          </Text>
          {year ? <Text style={styles.cardYear}>{year}</Text> : null}
          {item.vote_average && item.vote_average > 0 && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={11} color={COLORS.star} />
              <Text style={styles.ratingText}>
                {item.vote_average.toFixed(1)}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => handleRemove(String(item.id), item.media_type)}
        >
          <Ionicons name="trash-outline" size={18} color={COLORS.error} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Watch Later</Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {items.length > 0 && (
        <SegmentedControl
          options={["All", "Movies", "TV"]}
          selected={filter}
          onSelect={setFilter}
        />
      )}

      {loading ? (
        <ActivityIndicator
          color={COLORS.primary}
          size="large"
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => `${item.id}-${item.media_type}`}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="bookmark-outline"
                size={56}
                color={COLORS.textMuted}
              />
              <Text style={styles.emptyTitle}>No items saved</Text>
              <Text style={styles.emptyText}>
                Bookmark movies and TV shows to watch later
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  header: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(239,68,68,0.15)",
  },
  clearText: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: "600",
  },
  list: {
    padding: 16,
  },
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardImage: {
    width: 85,
    height: 128,
    position: "relative",
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.surfaceLight,
  },
  typeBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "rgba(139,92,246,0.85)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    color: COLORS.text,
    fontSize: 9,
    fontWeight: "700",
  },
  cardInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardYear: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    color: COLORS.star,
    fontSize: 12,
    fontWeight: "600",
  },
  removeBtn: {
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
    gap: 8,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: "center",
  },
});
