export type Format = "test" | "odi" | "t20i";

export const FORMATS: { key: Format | "all"; label: string; short: string }[] = [
  { key: "all", label: "All Formats", short: "ALL" },
  { key: "test", label: "Test", short: "TEST" },
  { key: "odi", label: "One Day International", short: "ODI" },
  { key: "t20i", label: "T20 International", short: "T20I" },
];

export const FORMAT_COLORS: Record<Format, string> = {
  test: "#d4af37",
  odi: "#4ade80",
  t20i: "#60a5fa",
};
