import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../constants/colors";

interface EloChipProps {
  rating: number;
  size?: "sm" | "md";
}

export function EloChip({ rating, size = "sm" }: EloChipProps) {
  const isElite = rating >= 1700;
  const isStrong = rating >= 1600;

  const chipColor = isElite
    ? Colors.gold
    : isStrong
    ? Colors.primaryLighter
    : Colors.textMuted;

  return (
    <View style={[styles.chip, { borderColor: chipColor }]}>
      <Text style={[styles.label, size === "md" && styles.labelMd, { color: chipColor }]}>
        ⚡ {rating}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignSelf: "flex-start",
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  labelMd: {
    fontSize: 13,
  },
});
