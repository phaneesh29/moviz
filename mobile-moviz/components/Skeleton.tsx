import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { COLORS } from "@/utils/constants";

const { width } = Dimensions.get("window");

export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.card}>
          <View style={styles.cardImage} />
          <View style={styles.cardTitle} />
          <View style={styles.cardSubtitle} />
        </View>
      ))}
    </View>
  );
}

export function DetailSkeleton() {
  return (
    <View style={styles.detailContainer}>
      <View style={styles.backdrop} />
      <View style={styles.detailContent}>
        <View style={styles.detailTitle} />
        <View style={styles.detailMeta} />
        <View style={styles.detailDesc} />
        <View style={styles.detailDesc2} />
      </View>
    </View>
  );
}

export function HeroSkeleton() {
  return (
    <View style={styles.heroContainer}>
      <View style={styles.heroBg} />
      <View style={styles.heroContent}>
        <View style={styles.heroTitle} />
        <View style={styles.heroSubtitle} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: width * 0.36,
  },
  cardImage: {
    width: "100%",
    height: width * 0.36 * 1.5,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
  },
  cardTitle: {
    width: "80%",
    height: 12,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceLight,
    marginTop: 8,
  },
  cardSubtitle: {
    width: "50%",
    height: 10,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceLight,
    marginTop: 4,
  },
  // Detail
  detailContainer: {
    flex: 1,
  },
  backdrop: {
    width: "100%",
    height: 250,
    backgroundColor: COLORS.surfaceLight,
  },
  detailContent: {
    padding: 16,
  },
  detailTitle: {
    width: "60%",
    height: 24,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceLight,
    marginBottom: 12,
  },
  detailMeta: {
    width: "40%",
    height: 14,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceLight,
    marginBottom: 16,
  },
  detailDesc: {
    width: "100%",
    height: 12,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceLight,
    marginBottom: 8,
  },
  detailDesc2: {
    width: "85%",
    height: 12,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceLight,
  },
  // Hero
  heroContainer: {
    width: "100%",
    height: 420,
    backgroundColor: COLORS.surfaceLight,
  },
  heroBg: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
  },
  heroContent: {
    position: "absolute",
    bottom: 40,
    left: 16,
  },
  heroTitle: {
    width: 200,
    height: 28,
    borderRadius: 6,
    backgroundColor: COLORS.surface,
    marginBottom: 8,
  },
  heroSubtitle: {
    width: 140,
    height: 14,
    borderRadius: 4,
    backgroundColor: COLORS.surface,
  },
});
