export const Colors = {
  background: "#0a1f0a",
  surface: "#0f2a0f",
  card: "#111f11",
  cardBorder: "#2d6b2d",
  primary: "#1a4a1a",
  primaryLight: "#2d6b2d",
  primaryLighter: "#3d8b3d",
  gold: "#d4af37",
  goldLight: "#e8c84a",
  goldDark: "#b8942a",
  text: "#f0f0f0",
  textSecondary: "#a0b0a0",
  textMuted: "#608060",
  error: "#ef4444",
  success: "#22c55e",
  white: "#ffffff",
  black: "#000000",
  overlay: "rgba(0,0,0,0.6)",
  glassBackground: "rgba(10, 31, 10, 0.85)",
  glassBorder: "rgba(45, 107, 45, 0.4)",
} as const;

export type ColorKey = keyof typeof Colors;
