import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  RefreshControl,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import api from "@/utils/api";
import { imgBackdrop, imgPosterSmall, COLORS } from "@/utils/constants";
import MediaRow from "@/components/MediaRow";
import { HeroSkeleton, CardSkeleton } from "@/components/Skeleton";
import SegmentedControl from "@/components/SegmentedControl";

const { width, height } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [trendingMovies, setTrendingMovies] = useState<any[]>([]);
  const [trendingTV, setTrendingTV] = useState<any[]>([]);
  const [latestMovies, setLatestMovies] = useState<any[]>([]);
  const [latestTV, setLatestTV] = useState<any[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [timeWindow, setTimeWindow] = useState("day");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const heroTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [moviesRes, tvRes, latestMovieRes, latestTvRes] =
        await Promise.all([
          api.get('/trending/movies', { params: { time_window: timeWindow } }),
          api.get('/trending/tv', { params: { time_window: timeWindow } }),
          api.get("/movie/latest"),
          api.get("/tv/latest"),
        ]);
      setTrendingMovies(moviesRes.data?.results?.results || []);
      setTrendingTV(tvRes.data?.results?.results || []);
      setLatestMovies(
        latestMovieRes.data?.results ? [latestMovieRes.data.results] : []
      );
      setLatestTV(
        latestTvRes.data?.results ? [latestTvRes.data.results] : []
      );
    } catch (err) {
      console.error("Failed to fetch home data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeWindow]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  // Hero auto-rotate
  useEffect(() => {
    if (trendingMovies.length < 2) return;
    heroTimer.current = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % Math.min(trendingMovies.length, 8));
    }, 8000);
    return () => {
      if (heroTimer.current) clearInterval(heroTimer.current);
    };
  }, [trendingMovies]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const heroItem = trendingMovies[heroIndex];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Hero Section */}
        {loading ? (
          <View style={{ paddingTop: insets.top }}>
            <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 }}>
              <Text style={styles.appTitle}>Vidoza</Text>
            </View>
            <HeroSkeleton />
          </View>
        ) : heroItem ? (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push(`/movie/${heroItem.id}` as any)}
          >
            <ImageBackground
              source={{
                uri: `${imgBackdrop}${heroItem.backdrop_path}`,
              }}
              style={styles.hero}
              resizeMode="cover"
            >
              <LinearGradient
                colors={["transparent", "rgba(10,10,10,0.7)", COLORS.background]}
                style={styles.heroGradient}
              >
                <SafeAreaView edges={["top"]} style={styles.heroTopBar}>
                  <Text style={styles.appTitle}>Vidoza</Text>
                </SafeAreaView>
                <View style={styles.heroContent}>
                  <Text style={styles.heroTitle}>
                    {heroItem.title || heroItem.name}
                  </Text>
                  <View style={styles.heroMeta}>
                    {heroItem.vote_average > 0 && (
                      <View style={styles.heroRating}>
                        <Ionicons name="star" size={14} color={COLORS.star} />
                        <Text style={styles.heroRatingText}>
                          {heroItem.vote_average.toFixed(1)}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.heroYear}>
                      {(
                        heroItem.release_date || heroItem.first_air_date || ""
                      ).slice(0, 4)}
                    </Text>
                  </View>
                  <Text style={styles.heroOverview} numberOfLines={2}>
                    {heroItem.overview}
                  </Text>
                </View>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>
        ) : (
          <View style={{ paddingTop: insets.top, paddingHorizontal: 20, paddingBottom: 12 }}>
            <Text style={styles.appTitle}>Vidoza</Text>
          </View>
        )}

        {/* Hero dots */}
        {trendingMovies.length > 1 && (
          <View style={styles.dotsContainer}>
            {trendingMovies.slice(0, 8).map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === heroIndex && styles.dotActive]}
              />
            ))}
          </View>
        )}

        {/* Time window toggle */}
        <SegmentedControl
          options={["Today", "This Week"]}
          selected={timeWindow === "day" ? "Today" : "This Week"}
          onSelect={(val) => setTimeWindow(val === "Today" ? "day" : "week")}
        />

        {/* Trending Movies */}
        {loading ? (
          <View style={{ marginTop: 16, marginBottom: 24 }}>
            <Text style={styles.sectionTitle}>Trending Movies</Text>
            <CardSkeleton />
          </View>
        ) : (
          <MediaRow title="Trending Movies" data={trendingMovies} />
        )}

        {/* Trending TV */}
        {loading ? (
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.sectionTitle}>Trending TV Shows</Text>
            <CardSkeleton />
          </View>
        ) : (
          <MediaRow title="Trending TV Shows" data={trendingTV} />
        )}

        {/* Just Added */}
        {!loading && latestMovies.length > 0 && (
          <MediaRow title="Just Added Movies" data={latestMovies} />
        )}
        {!loading && latestTV.length > 0 && (
          <MediaRow title="Just Added TV" data={latestTV} />
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  hero: {
    width: width,
    height: 420,
  },
  heroGradient: {
    flex: 1,
    justifyContent: "flex-end",
  },
  heroTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  heroContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  heroRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  heroRatingText: {
    color: COLORS.star,
    fontSize: 14,
    fontWeight: "700",
  },
  heroYear: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  heroOverview: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 8,
    marginBottom: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textMuted,
  },
  dotActive: {
    backgroundColor: COLORS.primary,
    width: 18,
    borderRadius: 3,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
});
