import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { Colors } from "../constants/colors";
import { FORMATS } from "../constants/formats";
import type { Format } from "../constants/formats";

interface FormatTabsProps {
  selected: Format | "all";
  onSelect: (format: Format | "all") => void;
}

export function FormatTabs({ selected, onSelect }: FormatTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FORMATS.map((fmt) => {
        const isActive = selected === fmt.key;
        return (
          <TouchableOpacity
            key={fmt.key}
            onPress={() => onSelect(fmt.key)}
            style={[styles.tab, isActive && styles.tabActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {fmt.short}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexDirection: "row",
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.surface,
  },
  tabActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    letterSpacing: 0.8,
  },
  tabTextActive: {
    color: Colors.background,
  },
});
