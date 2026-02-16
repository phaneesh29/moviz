import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { COLORS } from "@/utils/constants";

type GenreChipsProps = {
  genres: { id: number; name: string }[];
  selected?: number | null;
  onSelect: (id: number | null) => void;
};

export default function GenreChips({ genres, selected, onSelect }: GenreChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={{ flexGrow: 0,marginBottom:10 }}
    >
      <TouchableOpacity
        style={[styles.chip, !selected && styles.chipActive]}
        onPress={() => onSelect(null)}
      >
        <Text style={[styles.chipText, !selected && styles.chipTextActive]}>
          All
        </Text>
      </TouchableOpacity>
      {genres.map((genre) => (
        <TouchableOpacity
          key={genre.id}
          style={[styles.chip, selected === genre.id && styles.chipActive]}
          onPress={() => onSelect(genre.id)}
        >
          <Text
            style={[
              styles.chipText,
              selected === genre.id && styles.chipTextActive,
            ]}
          >
            {genre.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    height: 28,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: "#333",
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  chipTextActive: {
    color: COLORS.text,
    fontWeight: "700",
  },
});
