import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { imgProfile, COLORS } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";

type CastCardProps = {
  person: {
    id: number;
    name: string;
    character?: string;
    profile_path?: string | null;
    job?: string;
  };
};

export default function CastCard({ person }: CastCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/person/${person.id}` as any)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {person.profile_path ? (
          <Image
            source={{ uri: `${imgProfile}${person.profile_path}` }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="person" size={24} color={COLORS.textMuted} />
          </View>
        )}
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {person.name}
      </Text>
      {(person.character || person.job) && (
        <Text style={styles.role} numberOfLines={1}>
          {person.character || person.job}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 90,
    marginRight: 12,
    alignItems: "center",
  },
  imageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
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
  },
  name: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 6,
    textAlign: "center",
  },
  role: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 2,
    textAlign: "center",
  },
});
