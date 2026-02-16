import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Share,
  Alert,
  Linking,
  ActivityIndicator,
  StatusBar,
  BackHandler,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import type { WebViewNavigation } from "react-native-webview";
import * as ScreenOrientation from "expo-screen-orientation";
import api from "@/utils/api";
import {
  imgBackdrop,
  imgPosterLarge,
  COLORS,
  PLAYER_SERVERS,
} from "@/utils/constants";
import { isAdUrl, isAllowedUrl, AD_BLOCK_JS } from "@/utils/adBlocker";
import { addToWatchLater, isInWatchLater, removeFromWatchLater } from "@/utils/watchLater";
import CastCard from "@/components/CastCard";
import MediaRow from "@/components/MediaRow";
import { DetailSkeleton } from "@/components/Skeleton";

const { width } = Dimensions.get("window");

export default function MovieScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [movie, setMovie] = useState<any>(null);
  const [credits, setCredits] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inWatchLater, setInWatchLater] = useState(false);
  const [showAllCast, setShowAllCast] = useState(false);

  // Player state
  const [showPlayer, setShowPlayer] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [serverIndex, setServerIndex] = useState(0);
  const webViewRef = useRef<WebView>(null);

  const handleNavigationRequest = (request: WebViewNavigation): boolean => {
    const { url } = request;
    if (isAdUrl(url)) return false;
    if (!isAllowedUrl(url)) return false;
    return true;
  };

  const enterFullscreen = useCallback(async () => {
    setIsFullscreen(true);
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE
    );
  }, []);

  const exitFullscreen = useCallback(async () => {
    setIsFullscreen(false);
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP
    );
  }, []);

  // Handle Android back button in fullscreen
  useEffect(() => {
    if (!isFullscreen) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      exitFullscreen();
      return true;
    });
    return () => sub.remove();
  }, [isFullscreen, exitFullscreen]);

  // Reset orientation when leaving the screen
  useEffect(() => {
    return () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    };
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.get(`/movie/get/${id}`),
      api.get(`/movie/credits/${id}`),
      api.get(`/movie/recommendations/${id}`),
      api.get(`/movie/videos/${id}`),
    ])
      .then(([movieRes, creditsRes, recsRes, videosRes]) => {
        setMovie(movieRes.data?.results);
        setCredits(creditsRes.data?.results);
        setRecommendations(recsRes.data?.results?.results || []);
        setVideos(videosRes.data?.results?.results || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    isInWatchLater(id, "movie").then(setInWatchLater);
  }, [id]);

  const handleWatchLater = async () => {
    if (!id) return;
    if (inWatchLater) {
      await removeFromWatchLater(id, "movie");
      setInWatchLater(false);
    } else {
      await addToWatchLater(id, "movie");
      setInWatchLater(true);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out "${movie?.title}" on Vidoza!\nhttps://vidoza.vercel.app/movie/${id}`,
      });
    } catch {}
  };

  const handleTrailer = () => {
    const trailer = videos.find(
      (v: any) => v.type === "Trailer" && v.site === "YouTube"
    );
    if (trailer) {
      Linking.openURL(`https://www.youtube.com/watch?v=${trailer.key}`);
    } else {
      Alert.alert("No trailer available");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={["top"]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </SafeAreaView>
        <DetailSkeleton />
      </View>
    );
  }

  if (!movie) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Movie not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const cast = credits?.cast || [];
  const displayCast = showAllCast ? cast : cast.slice(0, 20);
  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null;

  const playerUrl = PLAYER_SERVERS[serverIndex].url("movie", id!);

  // ── Fullscreen player overlay ──
  if (isFullscreen) {
    return (
      <View style={styles.fullscreenContainer}>
        <StatusBar hidden />
        <WebView
          ref={webViewRef}
          source={{ uri: playerUrl }}
          style={{ flex: 1 }}
          allowsFullscreenVideo
          javaScriptEnabled
          domStorageEnabled
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback
          setSupportMultipleWindows={false}
          onShouldStartLoadWithRequest={handleNavigationRequest}
          injectedJavaScript={AD_BLOCK_JS}
          onNavigationStateChange={(navState) => {
            if (navState.url && isAdUrl(navState.url)) {
              webViewRef.current?.goBack();
            }
          }}
          userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        />
        {/* Floating controls */}
        <View style={styles.fullscreenTopBar}>
          <TouchableOpacity
            style={styles.fullscreenBtn}
            onPress={exitFullscreen}
          >
            <Ionicons name="contract" size={22} color="#fff" />
          </TouchableOpacity>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.fullscreenServers}
          >
            {PLAYER_SERVERS.map((s, i) => (
              <TouchableOpacity
                key={s.name}
                style={[
                  styles.fsServerBtn,
                  i === serverIndex && styles.fsServerBtnActive,
                ]}
                onPress={() => setServerIndex(i)}
              >
                <Text
                  style={[
                    styles.fsServerText,
                    i === serverIndex && styles.fsServerTextActive,
                  ]}
                >
                  {s.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden={false} barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Backdrop */}
        <View style={styles.backdropContainer}>
          {movie.backdrop_path ? (
            <Image
              source={{ uri: `${imgBackdrop}${movie.backdrop_path}` }}
              style={styles.backdrop}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.backdrop, { backgroundColor: COLORS.surfaceLight }]} />
          )}
          <LinearGradient
            colors={["transparent", COLORS.background]}
            style={styles.backdropGradient}
          />
          <SafeAreaView edges={["top"]} style={styles.topButtons}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={22} color={COLORS.text} />
            </TouchableOpacity>
            <View style={styles.topRight}>
              <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
                <Ionicons
                  name="share-outline"
                  size={22}
                  color={COLORS.text}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={handleWatchLater}
              >
                <Ionicons
                  name={inWatchLater ? "bookmark" : "bookmark-outline"}
                  size={22}
                  color={inWatchLater ? COLORS.primary : COLORS.text}
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* Movie Info */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            {movie.poster_path && (
              <Image
                source={{ uri: `${imgPosterLarge}${movie.poster_path}` }}
                style={styles.poster}
                resizeMode="cover"
              />
            )}
            <View style={styles.titleInfo}>
              <Text style={styles.title}>{movie.title}</Text>
              <View style={styles.metaRow}>
                {movie.release_date && (
                  <Text style={styles.metaText}>
                    {movie.release_date.slice(0, 4)}
                  </Text>
                )}
                {runtime && <Text style={styles.metaText}>{runtime}</Text>}
                {movie.vote_average > 0 && (
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={13} color={COLORS.star} />
                    <Text style={[styles.metaText, { color: COLORS.star }]}>
                      {movie.vote_average.toFixed(1)}
                    </Text>
                  </View>
                )}
              </View>
              {movie.genres && (
                <View style={styles.genreRow}>
                  {movie.genres.map((g: any) => (
                    <View key={g.id} style={styles.genreChip}>
                      <Text style={styles.genreText}>{g.name}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[
                styles.playButton,
                showPlayer && styles.playButtonActive,
              ]}
              onPress={() => setShowPlayer(!showPlayer)}
            >
              <Ionicons
                name={showPlayer ? "stop" : "play"}
                size={20}
                color={COLORS.text}
              />
              <Text style={styles.playButtonText}>
                {showPlayer ? "Close Player" : "Watch Now"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleTrailer}>
              <Ionicons name="videocam-outline" size={20} color={COLORS.text} />
              <Text style={styles.actionBtnText}>Trailer</Text>
            </TouchableOpacity>
          </View>

          {/* Inline Player */}
          {showPlayer && (
            <View style={styles.playerSection}>
              {/* Server selector */}
              <View style={styles.serverRow}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.serverScrollContent}
                >
                  {PLAYER_SERVERS.map((s, i) => (
                    <TouchableOpacity
                      key={s.name}
                      style={[
                        styles.serverBtn,
                        i === serverIndex && styles.serverBtnActive,
                      ]}
                      onPress={() => setServerIndex(i)}
                    >
                      <Text
                        style={[
                          styles.serverBtnText,
                          i === serverIndex && styles.serverBtnTextActive,
                        ]}
                      >
                        {s.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              {/* WebView player */}
              <View style={styles.playerContainer}>
                <WebView
                  ref={webViewRef}
                  source={{ uri: playerUrl }}
                  style={{ flex: 1 }}
                  allowsFullscreenVideo
                  javaScriptEnabled
                  domStorageEnabled
                  mediaPlaybackRequiresUserAction={false}
                  allowsInlineMediaPlayback
                  startInLoadingState
                  setSupportMultipleWindows={false}
                  onShouldStartLoadWithRequest={handleNavigationRequest}
                  injectedJavaScript={AD_BLOCK_JS}
                  onNavigationStateChange={(navState) => {
                    if (navState.url && isAdUrl(navState.url)) {
                      webViewRef.current?.goBack();
                    }
                  }}
                  userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                  renderLoading={() => (
                    <View
                      style={[StyleSheet.absoluteFill, styles.webviewLoading]}
                    >
                      <ActivityIndicator
                        size="large"
                        color={COLORS.primary}
                      />
                    </View>
                  )}
                />
                {/* Fullscreen toggle */}
                <TouchableOpacity
                  style={styles.fullscreenToggle}
                  onPress={enterFullscreen}
                >
                  <Ionicons name="expand" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}



          {/* Overview */}
          {movie.overview && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <Text style={styles.overview}>{movie.overview}</Text>
            </View>
          )}

          {/* Details grid */}
          <View style={styles.detailsGrid}>
            {movie.status && (
              <DetailItem label="Status" value={movie.status} />
            )}
            {movie.budget > 0 && (
              <DetailItem
                label="Budget"
                value={`$${(movie.budget / 1_000_000).toFixed(1)}M`}
              />
            )}
            {movie.revenue > 0 && (
              <DetailItem
                label="Revenue"
                value={`$${(movie.revenue / 1_000_000).toFixed(1)}M`}
              />
            )}
            {movie.original_language && (
              <DetailItem
                label="Language"
                value={movie.original_language.toUpperCase()}
              />
            )}
          </View>

          {/* IMDB Link */}
          {movie.imdb_id && (
            <TouchableOpacity
              style={styles.imdbBtn}
              onPress={() =>
                Linking.openURL(`https://www.imdb.com/title/${movie.imdb_id}`)
              }
            >
              <Text style={styles.imdbText}>View on IMDb</Text>
              <Ionicons name="open-outline" size={14} color={COLORS.star} />
            </TouchableOpacity>
          )}

          {/* Cast */}
          {cast.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cast</Text>
              <FlatList
                horizontal
                data={displayCast}
                keyExtractor={(item) => String(item.id) + (item.character || "")}
                renderItem={({ item }) => <CastCard person={item} />}
                showsHorizontalScrollIndicator={false}
              />
              {cast.length > 20 && (
                <TouchableOpacity
                  onPress={() => setShowAllCast(!showAllCast)}
                  style={styles.showMoreBtn}
                >
                  <Text style={styles.showMoreText}>
                    {showAllCast
                      ? "Show Less"
                      : `Show All (${cast.length})`}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Production Companies */}
          {movie.production_companies?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Production</Text>
              <View style={styles.companiesRow}>
                {movie.production_companies.map((c: any) => (
                  <View key={c.id} style={styles.companyChip}>
                    <Text style={styles.companyText}>{c.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <MediaRow title="More Like This" data={recommendations} />
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 12,
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  // Backdrop
  backdropContainer: {
    width: width,
    height: 280,
    position: "relative",
  },
  backdrop: {
    width: "100%",
    height: "100%",
  },
  backdropGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  topButtons: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  topRight: {
    flexDirection: "row",
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    margin: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
  },
  // Content
  content: {
    paddingHorizontal: 16,
    marginTop: -30,
  },
  titleRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 16,
  },
  poster: {
    width: 110,
    height: 165,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
  },
  titleInfo: {
    flex: 1,
    justifyContent: "flex-end",
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  metaText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  genreRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  genreChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceLight,
  },
  genreText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
  // Actions
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  playButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
  },
  playButtonText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceLight,
  },
  actionBtnText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
  },
  // WebView
  webviewLoading: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  // Inline player
  playerSection: {
    marginBottom: 20,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  playerContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    position: "relative",
  },
  fullscreenToggle: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 8,
    borderRadius: 8,
  },
  playButtonActive: {
    backgroundColor: COLORS.error,
  },
  // Fullscreen
  fullscreenContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  fullscreenTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  fullscreenBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  fullscreenServers: {
    gap: 6,
    alignItems: "center",
  },
  fsServerBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  fsServerBtnActive: {
    backgroundColor: COLORS.primary,
  },
  fsServerText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontWeight: "600",
  },
  fsServerTextActive: {
    color: "#fff",
  },
  serverRow: {
    backgroundColor: COLORS.surface,
    paddingVertical: 8,
  },
  serverScrollContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  serverBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  serverBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  serverBtnText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  serverBtnTextActive: {
    color: COLORS.text,
  },
  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
  },
  overview: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  // Details
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  detailItem: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: "45%",
  },
  detailLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 2,
  },
  detailValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
  },
  imdbBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "rgba(251, 191, 36, 0.15)",
    borderRadius: 8,
    marginBottom: 20,
  },
  imdbText: {
    color: COLORS.star,
    fontSize: 13,
    fontWeight: "600",
  },
  showMoreBtn: {
    alignSelf: "center",
    paddingVertical: 8,
    marginTop: 8,
  },
  showMoreText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  companiesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  companyChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLight,
  },
  companyText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },
});
