import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "@/utils/api";
import { imgProfile, imgPosterSmall, COLORS } from "@/utils/constants";
import { DetailSkeleton } from "@/components/Skeleton";
import SegmentedControl from "@/components/SegmentedControl";
import MediaCard from "@/components/MediaCard";

const { width } = Dimensions.get("window");

export default function PersonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [person, setPerson] = useState<any>(null);
  const [credits, setCredits] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showFullBio, setShowFullBio] = useState(false);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.get(`/people/get/${id}`),
      api.get(`/people/credits/${id}`),
    ])
      .then(([personRes, creditsRes]) => {
        setPerson(personRes.data?.results);
        setCredits(creditsRes.data?.results);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

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

  if (!person) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Person not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Combine and sort filmography
  const allCredits: any[] = [];
  if (credits?.cast) {
    credits.cast.forEach((c: any) =>
      allCredits.push({ ...c, media_type: c.media_type || "movie" })
    );
  }
  if (credits?.crew) {
    credits.crew.forEach((c: any) =>
      allCredits.push({ ...c, media_type: c.media_type || "movie" })
    );
  }

  // Deduplicate
  const seen = new Set<string>();
  const uniqueCredits = allCredits.filter((c) => {
    const key = `${c.id}-${c.media_type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Filter
  const filteredCredits = uniqueCredits
    .filter((c) => {
      if (filter === "Movies") return c.media_type === "movie";
      if (filter === "TV") return c.media_type === "tv";
      return true;
    })
    .sort((a, b) => {
      const dateA = a.release_date || a.first_air_date || "";
      const dateB = b.release_date || b.first_air_date || "";
      return dateB.localeCompare(dateA);
    });

  const genderLabel = person.gender === 1 ? "Female" : person.gender === 2 ? "Male" : "Unknown";

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <SafeAreaView edges={["top"]} style={styles.topBar}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </SafeAreaView>

        {/* Profile */}
        <View style={styles.profileSection}>
          <View style={styles.photoContainer}>
            {person.profile_path ? (
              <Image
                source={{ uri: `${imgProfile}${person.profile_path}` }}
                style={styles.photo}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="person" size={48} color={COLORS.textMuted} />
              </View>
            )}
          </View>
          <Text style={styles.name}>{person.name}</Text>
          {person.known_for_department && (
            <Text style={styles.department}>
              {person.known_for_department}
            </Text>
          )}
        </View>

        {/* Personal details */}
        <View style={styles.detailsGrid}>
          <DetailItem label="Gender" value={genderLabel} />
          {person.birthday && (
            <DetailItem label="Born" value={person.birthday} />
          )}
          {person.deathday && (
            <DetailItem label="Died" value={person.deathday} />
          )}
          {person.place_of_birth && (
            <DetailItem label="Birthplace" value={person.place_of_birth} />
          )}
        </View>

        {/* External links */}
        <View style={styles.linksRow}>
          {person.imdb_id && (
            <TouchableOpacity
              style={styles.externalBtn}
              onPress={() =>
                Linking.openURL(`https://www.imdb.com/name/${person.imdb_id}`)
              }
            >
              <Text style={styles.externalBtnText}>IMDb</Text>
              <Ionicons name="open-outline" size={12} color={COLORS.star} />
            </TouchableOpacity>
          )}
          {person.homepage && (
            <TouchableOpacity
              style={styles.externalBtn}
              onPress={() => Linking.openURL(person.homepage)}
            >
              <Text style={styles.externalBtnText}>Website</Text>
              <Ionicons name="open-outline" size={12} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Biography */}
        {person.biography ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Biography</Text>
            <Text
              style={styles.biography}
              numberOfLines={showFullBio ? undefined : 6}
            >
              {person.biography}
            </Text>
            {person.biography.length > 300 && (
              <TouchableOpacity
                onPress={() => setShowFullBio(!showFullBio)}
                style={styles.showMoreBtn}
              >
                <Text style={styles.showMoreText}>
                  {showFullBio ? "Show Less" : "Read More"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}

        {/* Also Known As */}
        {person.also_known_as?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Also Known As</Text>
            <View style={styles.akaRow}>
              {person.also_known_as.map((name: string, i: number) => (
                <View key={i} style={styles.akaChip}>
                  <Text style={styles.akaText}>{name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Filmography */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Filmography ({filteredCredits.length})
          </Text>
          <SegmentedControl
            options={["All", "Movies", "TV"]}
            selected={filter}
            onSelect={setFilter}
          />
          <View style={styles.filmGrid}>
            {filteredCredits.map((item) => (
              <MediaCard key={`${item.id}-${item.media_type}`} item={item} />
            ))}
          </View>
          {filteredCredits.length === 0 && (
            <Text style={styles.emptyText}>No credits found</Text>
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
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
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
  // Profile
  profileSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  photoContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    overflow: "hidden",
    backgroundColor: COLORS.surfaceLight,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  department: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  // Details
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  detailItem: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: "45%",
    flex: 1,
  },
  detailLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 2,
  },
  detailValue: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
  },
  linksRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  externalBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
  },
  externalBtnText: {
    color: COLORS.star,
    fontSize: 13,
    fontWeight: "600",
  },
  // Sections
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 10,
  },
  biography: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  showMoreBtn: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    marginTop: 4,
  },
  showMoreText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  akaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  akaChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceLight,
  },
  akaText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  filmGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
  },
});
