import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../constants/colors";

interface StatRowProps {
  label: string;
  value: string | number | null | undefined;
  highlight?: boolean;
}

export function StatRow({ label, value, highlight = false }: StatRowProps) {
  const displayValue = value == null || value === "" ? "—" : String(value);

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, highlight && styles.valueHighlight]}>
        {displayValue}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.glassBorder,
  },
  label: {
    fontSize: 11,
    color: Colors.textSecondary,
    flex: 1,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
  },
  valueHighlight: {
    color: Colors.gold,
  },
});
