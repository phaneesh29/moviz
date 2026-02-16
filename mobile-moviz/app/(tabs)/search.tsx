import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "@/utils/api";
import { imgPosterSmall, imgProfile, COLORS } from "@/utils/constants";
import SegmentedControl from "@/components/SegmentedControl";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("All");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);

  const performSearch = useCallback(
    async (q: string, p: number = 1, append: boolean = false) => {
      if (!q.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get("/search", {
          params: { query: q, page: p },
        });
        const wrapper = res.data?.results || {};
        const data = wrapper.results || [];
        setResults((prev) => (append ? [...prev, ...data] : data));
        setTotalPages(wrapper.total_pages || 1);
        setPage(p);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Debounced search
  const onChangeText = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      performSearch(text, 1, false);
    }, 600);
  };

  const loadMore = () => {
    if (loading || page >= totalPages) return;
    performSearch(query, page + 1, true);
  };

  // Filter results
  const filteredResults = results.filter((item) => {
    if (filter === "Movies") return item.media_type === "movie";
    if (filter === "TV") return item.media_type === "tv";
    if (filter === "People") return item.media_type === "person";
    return true;
  });

  useEffect(() => {
    // Auto-focus search input
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const renderItem = ({ item }: { item: any }) => {
    const isP = item.media_type === "person";
    const title = item.title || item.name || "Unknown";
    const imagePath = isP ? item.profile_path : item.poster_path;
    const year = (item.release_date || item.first_air_date || "").slice(0, 4);
    const rating = item.vote_average?.toFixed(1);

    const onPress = () => {
      if (item.media_type === "movie") router.push(`/movie/${item.id}` as any);
      else if (item.media_type === "tv") router.push(`/tv/${item.id}` as any);
      else if (item.media_type === "person") router.push(`/person/${item.id}` as any);
    };

    return (
      <TouchableOpacity
        style={styles.resultCard}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.resultImage,
            isP && styles.resultImagePerson,
          ]}
        >
          {imagePath ? (
            <Image
              source={{
                uri: `${isP ? imgProfile : imgPosterSmall}${imagePath}`,
              }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImg}>
              <Ionicons
                name={isP ? "person" : "image-outline"}
                size={28}
                color={COLORS.textMuted}
              />
            </View>
          )}
          {!isP && item.media_type && (
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>
                {item.media_type === "movie" ? "Movie" : "TV"}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.resultTitle} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.resultMeta}>
          {year ? <Text style={styles.yearText}>{year}</Text> : null}
          {!isP && rating && rating !== "0.0" && (
            <View style={styles.miniRating}>
              <Ionicons name="star" size={10} color={COLORS.star} />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
          )}
          {isP && item.known_for_department && (
            <Text style={styles.yearText}>{item.known_for_department}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={COLORS.textMuted} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Search movies, TV shows, people..."
          placeholderTextColor={COLORS.textMuted}
          value={query}
          onChangeText={onChangeText}
          returnKeyType="search"
          onSubmitEditing={() => performSearch(query, 1, false)}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setQuery("");
              setResults([]);
            }}
          >
            <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter */}
      {results.length > 0 && (
        <SegmentedControl
          options={["All", "Movies", "TV", "People"]}
          selected={filter}
          onSelect={setFilter}
        />
      )}

      {/* Results */}
      <FlatList
        data={filteredResults}
        keyExtractor={(item, index) => `${item.id}-${item.media_type}-${index}`}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.results}
        columnWrapperStyle={styles.columnWrapper}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !loading && query.length > 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="search-outline"
                size={48}
                color={COLORS.textMuted}
              />
              <Text style={styles.emptyText}>No results found</Text>
            </View>
          ) : !loading && query.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="search"
                size={48}
                color={COLORS.textMuted}
              />
              <Text style={styles.emptyText}>
                Search for movies, TV shows, or people
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading ? (
            <ActivityIndicator
              color={COLORS.primary}
              size="large"
              style={{ padding: 20 }}
            />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    padding: 0,
  },
  results: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  resultCard: {
    width: CARD_WIDTH,
  },
  resultImage: {
    width: "100%",
    height: CARD_WIDTH * 1.5,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: COLORS.surfaceLight,
    position: "relative",
  },
  resultImagePerson: {
    height: CARD_WIDTH * 1.2,
  },
  placeholderImg: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  resultTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 6,
    lineHeight: 17,
  },
  resultMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 3,
  },
  yearText: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  miniRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingText: {
    color: COLORS.star,
    fontSize: 11,
    fontWeight: "600",
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 15,
    textAlign: "center",
  },
});
