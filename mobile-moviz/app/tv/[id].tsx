import CastCard from "@/components/CastCard";
import MediaRow from "@/components/MediaRow";
import { DetailSkeleton } from "@/components/Skeleton";
import { AD_BLOCK_JS, isAdUrl, isAllowedUrl } from "@/utils/adBlocker";
import api from "@/utils/api";
import {
  COLORS,
  imgBackdrop,
  imgPosterLarge,
  imgPosterSmall,
  PLAYER_SERVERS,
} from "@/utils/constants";
import {
  addToWatchLater,
  isInWatchLater,
  removeFromWatchLater,
} from "@/utils/watchLater";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  Linking,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { WebViewNavigation } from "react-native-webview";
import { WebView } from "react-native-webview";

const { width } = Dimensions.get("window");

export default function TvSeriesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [series, setSeries] = useState<any>(null);
  const [seasonData, setSeasonData] = useState<any>(null);
  const [episodeCredits, setEpisodeCredits] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inWatchLater, setInWatchLater] = useState(false);

  const [showPlayer, setShowPlayer] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
  const [serverIndex, setServerIndex] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showAllCast, setShowAllCast] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 4000);
  }, []);

  const handleNavigationRequest = (request: WebViewNavigation): boolean => {
    const { url } = request;
    if (isAdUrl(url)) return false;
    if (!isAllowedUrl(url)) return false;
    return true;
  };

  const enterFullscreen = useCallback(async () => {
    setIsFullscreen(true);
    resetControlsTimeout();
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE
    );
  }, [resetControlsTimeout]);

  const exitFullscreen = useCallback(async () => {
    setIsFullscreen(false);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP
    );
  }, []);

  const toggleControls = () => {
    if (showControls) {
      setShowControls(false);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    } else {
      resetControlsTimeout();
    }
  };

  // Handle Android back button in fullscreen
  useEffect(() => {
    if (!isFullscreen) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      exitFullscreen();
      return true;
    });
    return () => sub.remove();
  }, [isFullscreen, exitFullscreen]);

  // Reset orientation when leaving
  useEffect(() => {
    return () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    };
  }, []);

  // Fetch series details
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.get(`/tv/get/${id}`),
      api.get(`/tv/recommendations/${id}`),
      api.get(`/tv/videos/${id}`),
    ])
      .then(([seriesRes, recsRes, videosRes]) => {
        const seriesData = seriesRes.data?.results;
        setSeries(seriesData);
        setRecommendations(recsRes.data?.results?.results || []);
        setVideos(videosRes.data?.results?.results || []);
        // Set initial season
        const firstSeason = seriesData?.seasons?.find(
          (s: any) => s.season_number >= 1
        );
        if (firstSeason) setSelectedSeason(firstSeason.season_number);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    isInWatchLater(id, "tv").then(setInWatchLater);
  }, [id]);

  // Fetch season details
  useEffect(() => {
    if (!id || !selectedSeason) return;
    api
      .get(`/tv/season/${id}/${selectedSeason}`)
      .then((res) => {
        setSeasonData(res.data?.results);
        setSelectedEpisode(1);
      })
      .catch(console.error);
  }, [id, selectedSeason]);

  // Fetch episode credits
  useEffect(() => {
    if (!id || !selectedSeason || !selectedEpisode) return;
    api
      .get(`/tv/credits/${id}/${selectedSeason}/${selectedEpisode}`)
      .then((res) => setEpisodeCredits(res.data?.results))
      .catch(console.error);
  }, [id, selectedSeason, selectedEpisode]);

  const handleWatchLater = async () => {
    if (!id) return;
    if (inWatchLater) {
      await removeFromWatchLater(id, "tv");
      setInWatchLater(false);
    } else {
      await addToWatchLater(id, "tv");
      setInWatchLater(true);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out "${series?.name}" on Vidoza!\nhttps://vidoza.vercel.app/tv/${id}`,
      });
    } catch { }
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </SafeAreaView>
        <DetailSkeleton />
      </View>
    );
  }

  if (!series) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>TV Series not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const seasons = series.seasons?.filter((s: any) => s.season_number >= 1) || [];
  const episodes = seasonData?.episodes || [];
  const currentEpisode = episodes.find(
    (ep: any) => ep.episode_number === selectedEpisode
  );
  const cast = episodeCredits?.cast || [];
  const guestStars = episodeCredits?.guest_stars || [];
  const displayCast = showAllCast ? cast : cast.slice(0, 20);

  const playerUrl = PLAYER_SERVERS[serverIndex].url(
    "tv",
    id!,
    selectedSeason,
    selectedEpisode
  );

  // ── Fullscreen player overlay ──
  if (isFullscreen) {
    return (
      <View style={styles.fullscreenContainer}>
        <StatusBar hidden />
        <SafeAreaView style={{ flex: 1 }} edges={['left', 'right', 'bottom']}>
          {/* WebView wrapper to detect taps */}
          <View style={{ flex: 1, position: 'relative' }}>
            <WebView
              ref={webViewRef}
              source={{ uri: playerUrl }}
              style={{ flex: 1, backgroundColor: 'black' }}
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
            {/* Transparent overlay to catch taps when WebView doesn't consume them. 
                Using a full-screen absolute touchable to toggle controls */}
            <TouchableOpacity
              activeOpacity={1}
              style={[StyleSheet.absoluteFill, { backgroundColor: 'transparent' }]}
              onPress={toggleControls}
            />
          </View>

          {/* Floating controls */}
          {showControls && (
            <View style={styles.fullscreenTopBar}>
              <TouchableOpacity
                style={styles.fullscreenBtn}
                onPress={exitFullscreen}
              >
                <Ionicons name="contract" size={22} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.fullscreenLabel} numberOfLines={1}>
                S{selectedSeason} E{selectedEpisode}
              </Text>
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
                    onPress={() => {
                      setServerIndex(i);
                      resetControlsTimeout();
                    }}
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
          )}
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden={false} barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Backdrop */}
        <View style={styles.backdropContainer}>
          {series.backdrop_path ? (
            <Image
              source={{ uri: `${imgBackdrop}${series.backdrop_path}` }}
              style={styles.backdrop}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[styles.backdrop, { backgroundColor: COLORS.surfaceLight }]}
            />
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

        {/* Series Info */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            {series.poster_path && (
              <Image
                source={{ uri: `${imgPosterLarge}${series.poster_path}` }}
                style={styles.poster}
                resizeMode="cover"
              />
            )}
            <View style={styles.titleInfo}>
              <Text style={styles.title}>{series.name}</Text>
              <View style={styles.metaRow}>
                {series.first_air_date && (
                  <Text style={styles.metaText}>
                    {series.first_air_date.slice(0, 4)}
                  </Text>
                )}
                {series.number_of_seasons > 0 && (
                  <Text style={styles.metaText}>
                    {series.number_of_seasons} Season
                    {series.number_of_seasons > 1 ? "s" : ""}
                  </Text>
                )}
                {series.vote_average > 0 && (
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={13} color={COLORS.star} />
                    <Text style={[styles.metaText, { color: COLORS.star }]}>
                      {series.vote_average.toFixed(1)}
                    </Text>
                  </View>
                )}
              </View>
              {series.genres && (
                <View style={styles.genreRow}>
                  {series.genres.map((g: any) => (
                    <View key={g.id} style={styles.genreChip}>
                      <Text style={styles.genreText}>{g.name}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Actions */}
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
              <Ionicons
                name="videocam-outline"
                size={20}
                color={COLORS.text}
              />
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

          {/* Season & Episode selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Season</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.selectorRow}
            >
              {seasons.map((s: any) => (
                <TouchableOpacity
                  key={s.season_number}
                  style={[
                    styles.selectorBtn,
                    selectedSeason === s.season_number &&
                    styles.selectorBtnActive,
                  ]}
                  onPress={() => setSelectedSeason(s.season_number)}
                >
                  <Text
                    style={[
                      styles.selectorText,
                      selectedSeason === s.season_number &&
                      styles.selectorTextActive,
                    ]}
                  >
                    S{s.season_number}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Episodes */}
          {episodes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Episodes</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.episodeList}
              >
                {episodes.map((ep: any) => (
                  <TouchableOpacity
                    key={ep.episode_number}
                    style={[
                      styles.episodeCard,
                      selectedEpisode === ep.episode_number &&
                      styles.episodeCardActive,
                    ]}
                    onPress={() => setSelectedEpisode(ep.episode_number)}
                  >
                    {ep.still_path ? (
                      <Image
                        source={{
                          uri: `${imgPosterSmall}${ep.still_path}`,
                        }}
                        style={styles.episodeImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        style={[
                          styles.episodeImage,
                          { backgroundColor: COLORS.surfaceLight },
                        ]}
                      >
                        <Ionicons
                          name="film-outline"
                          size={20}
                          color={COLORS.textMuted}
                        />
                      </View>
                    )}
                    <Text style={styles.episodeNumber}>
                      E{ep.episode_number}
                    </Text>
                    <Text style={styles.episodeName} numberOfLines={2}>
                      {ep.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}



          {/* Overview */}
          {(currentEpisode?.overview || series.overview) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <Text style={styles.overview}>
                {currentEpisode?.overview || series.overview}
              </Text>
            </View>
          )}

          {/* Cast */}
          {cast.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cast</Text>
              <FlatList
                horizontal
                data={displayCast}
                keyExtractor={(item) =>
                  String(item.id) + (item.character || "")
                }
                renderItem={({ item }) => <CastCard person={item} />}
                showsHorizontalScrollIndicator={false}
              />
              {cast.length > 20 && (
                <TouchableOpacity
                  onPress={() => setShowAllCast(!showAllCast)}
                  style={styles.showMoreBtn}
                >
                  <Text style={styles.showMoreText}>
                    {showAllCast ? "Show Less" : `Show All (${cast.length})`}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Guest Stars */}
          {guestStars.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Guest Stars</Text>
              <FlatList
                horizontal
                data={guestStars.slice(0, 20)}
                keyExtractor={(item) =>
                  String(item.id) + (item.character || "")
                }
                renderItem={({ item }) => <CastCard person={item} />}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          )}

          {/* Created by */}
          {series.created_by?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Created By</Text>
              <FlatList
                horizontal
                data={series.created_by}
                keyExtractor={(item: any) => String(item.id)}
                renderItem={({ item }) => <CastCard person={item} />}
                showsHorizontalScrollIndicator={false}
              />
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
  // Season/Episode selectors
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
  },
  selectorRow: {
    gap: 8,
  },
  selectorBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectorBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  selectorText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  selectorTextActive: {
    color: COLORS.text,
  },
  episodeList: {
    gap: 10,
  },
  episodeCard: {
    width: 150,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 2,
    borderColor: "transparent",
  },
  episodeCardActive: {
    borderColor: COLORS.primary,
  },
  episodeImage: {
    width: "100%",
    height: 85,
    justifyContent: "center",
    alignItems: "center",
  },
  episodeNumber: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 6,
    marginLeft: 8,
  },
  episodeName: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "500",
    marginHorizontal: 8,
    marginTop: 2,
    marginBottom: 8,
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
    marginRight: 8,
  },
  fullscreenLabel: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
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
  overview: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
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
});
