import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS } from "@/utils/constants";

type SegmentedControlProps = {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
};

export default function SegmentedControl({
  options,
  selected,
  onSelect,
}: SegmentedControlProps) {
  return (
    <View style={styles.container}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[styles.option, selected === option && styles.optionActive]}
          onPress={() => onSelect(option)}
        >
          <Text
            style={[
              styles.optionText,
              selected === option && styles.optionTextActive,
            ]}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: 3,
    marginHorizontal: 16,
    marginVertical: 10,
  },
  option: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  optionActive: {
    backgroundColor: COLORS.primary,
  },
  optionText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  optionTextActive: {
    color: COLORS.text,
    fontWeight: "700",
  },
});
