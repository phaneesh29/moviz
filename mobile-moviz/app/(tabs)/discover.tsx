import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "@/utils/api";
import { COLORS } from "@/utils/constants";
import SegmentedControl from "@/components/SegmentedControl";
import GenreChips from "@/components/GenreChips";
import MediaCard from "@/components/MediaCard";

const { width } = Dimensions.get("window");
const CARD_GAP = 12;
const CARD_WIDTH = (width - 32 - CARD_GAP) / 2;

const SORT_OPTIONS = [
  { label: "Popular", value: "popularity.desc" },
  { label: "Top Rated", value: "vote_average.desc" },
  { label: "Newest", value: "primary_release_date.desc" },
  { label: "Oldest", value: "primary_release_date.asc" },
];

export default function DiscoverScreen() {
  const [mediaType, setMediaType] = useState("Movie");
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [results, setResults] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch genres
  useEffect(() => {
    api
      .get("/discover/genres")
      .then((res) => {
        const genreData = res.data?.results || {};
        const movieGenres = genreData.movie || [];
        const tvGenres = genreData.tv || [];
        // Merge unique
        const allGenres = [...movieGenres];
        tvGenres.forEach((g: any) => {
          if (!allGenres.find((e: any) => e.id === g.id)) {
            allGenres.push(g);
          }
        });
        setGenres(allGenres);
      })
      .catch(console.error);
  }, []);

  const fetchDiscover = useCallback(
    async (p: number = 1, append: boolean = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const endpoint =
        mediaType === "Movie" ? "/discover/movies" : "/discover/tv";
      const params: any = { page: p, sort_by: sortBy };
      if (selectedGenre) params.with_genres = selectedGenre;

      try {
        const res = await api.get(endpoint, { params });
        const wrapper = res.data?.results || {};
        const data = wrapper.results || [];
        setResults((prev) => (append ? [...prev, ...data] : data));
        setTotalPages(wrapper.total_pages || 1);
        setPage(p);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [mediaType, sortBy, selectedGenre]
  );

  useEffect(() => {
    fetchDiscover(1, false);
  }, [fetchDiscover]);

  const loadMore = () => {
    if (loadingMore || loading || page >= totalPages) return;
    fetchDiscover(page + 1, true);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.header}>Discover</Text>

      {/* Media type toggle */}
      <SegmentedControl
        options={["Movie", "TV"]}
        selected={mediaType}
        onSelect={(val) => {
          setMediaType(val);
          setSelectedGenre(null);
        }}
      />

      {/* Sort */}
      <View style={styles.sortRow}>
        {SORT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.sortBtn,
              sortBy === opt.value && styles.sortBtnActive,
            ]}
            onPress={() => setSortBy(opt.value)}
          >
            <Text
              style={[
                styles.sortText,
                sortBy === opt.value && styles.sortTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Genre chips */}
      <GenreChips
        genres={genres}
        selected={selectedGenre}
        onSelect={setSelectedGenre}
      />

      {/* Results */}
      {loading ? (
        <ActivityIndicator
          color={COLORS.primary}
          size="large"
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <MediaCard
                item={{
                  ...item,
                  media_type: mediaType === "Movie" ? "movie" : "tv",
                }}
                size="large"
                style={{ marginRight: 0 }}
              />
            </View>
          )}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.columnWrapper}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No results found</Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                color={COLORS.primary}
                size="small"
                style={{ padding: 20 }}
              />
            ) : null
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
  header: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "800",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    letterSpacing: -0.3,
  },
  sortRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 6,
  },
  sortBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: "#333",
  },
  sortBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sortText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  sortTextActive: {
    color: COLORS.text,
    fontWeight: "700",
  },
  grid: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 4,
  },
  columnWrapper: {
    gap: CARD_GAP,
    marginBottom: 16,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    flex: 1,
    maxWidth: CARD_WIDTH,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 15,
  },
});
