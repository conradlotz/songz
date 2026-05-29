import React, { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../constants/colors";
import { FORMAT_COLORS } from "../constants/formats";
import { EloChip } from "./EloChip";
import { StatRow } from "./StatRow";
import type { Player, BattingStat, BowlingStat } from "../lib/types";
import type { Format } from "../constants/formats";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface PlayerCardProps {
  player: Player;
  format?: Format;
  size?: "grid" | "duel";
  showElo?: boolean;
}

const FLAG_MAP: Record<string, string> = {
  IN: "🇮🇳",
  AU: "🇦🇺",
  GB: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  ZA: "🇿🇦",
  PK: "🇵🇰",
  NZ: "🇳🇿",
  LK: "🇱🇰",
  WI: "🏏",
  BD: "🇧🇩",
  AF: "🇦🇫",
  ZW: "🇿🇼",
  IE: "🇮🇪",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getBatStat(player: Player, format?: Format): BattingStat | undefined {
  if (!player.batting_stats) return undefined;
  if (format) return player.batting_stats.find((s) => s.format === format);
  return player.batting_stats[0];
}

function getBowlStat(player: Player, format?: Format): BowlingStat | undefined {
  if (!player.bowling_stats) return undefined;
  if (format) return player.bowling_stats.find((s) => s.format === format);
  return player.bowling_stats[0];
}

function getElo(player: Player, format?: Format): number {
  if (!player.player_ratings) return 1500;
  if (format) {
    const r = player.player_ratings.find((r) => r.format === format);
    return r?.elo_rating ?? 1500;
  }
  const ratings = player.player_ratings;
  if (!ratings.length) return 1500;
  return Math.round(ratings.reduce((a, b) => a + b.elo_rating, 0) / ratings.length);
}

export function PlayerCard({ player, format, size = "grid", showElo = true }: PlayerCardProps) {
  const flip = useSharedValue(0);
  const isFlipped = useSharedValue(false);

  const cardWidth = size === "duel" ? (SCREEN_WIDTH - 48) / 2 : (SCREEN_WIDTH - 48) / 2;
  const cardHeight = size === "duel" ? 260 : 220;

  const handleFlip = useCallback(() => {
    const toValue = isFlipped.value ? 0 : 1;
    isFlipped.value = !isFlipped.value;
    flip.value = withTiming(toValue, {
      duration: 350,
      easing: Easing.out(Easing.cubic),
    });
  }, [flip, isFlipped]);

  const frontStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flip.value, [0, 1], [0, 180]);
    const opacity = interpolate(flip.value, [0, 0.49, 0.5, 1], [1, 1, 0, 0]);
    return {
      transform: [{ perspective: 1200 }, { rotateY: `${rotateY}deg` }],
      opacity,
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flip.value, [0, 1], [180, 360]);
    const opacity = interpolate(flip.value, [0, 0.49, 0.5, 1], [0, 0, 1, 1]);
    return {
      transform: [{ perspective: 1200 }, { rotateY: `${rotateY}deg` }],
      opacity,
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    };
  });

  const bat = getBatStat(player, format);
  const bowl = getBowlStat(player, format);
  const elo = getElo(player, format);
  const flag = player.country_code ? FLAG_MAP[player.country_code] ?? "🏏" : "🏏";

  const formatBadges = format
    ? [format]
    : player.formats.slice(0, 2);

  return (
    <TouchableOpacity
      onPress={handleFlip}
      activeOpacity={1}
      style={[styles.wrapper, { width: cardWidth, height: cardHeight }]}
    >
      {/* FRONT */}
      <Animated.View style={[styles.card, { width: cardWidth, height: cardHeight }, frontStyle]}>
        {player.photo_url ? (
          <Image
            source={{ uri: player.photo_url }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <LinearGradient
            colors={[Colors.primary, Colors.background]}
            style={StyleSheet.absoluteFillObject}
          >
            <View style={styles.initialsContainer}>
              <Text style={styles.initials}>{getInitials(player.name)}</Text>
            </View>
          </LinearGradient>
        )}

        {/* Gradient overlay */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.85)"]}
          style={[StyleSheet.absoluteFillObject, styles.photoOverlay]}
          start={{ x: 0, y: 0.4 }}
          end={{ x: 0, y: 1 }}
        />

        {/* Format badges top-left */}
        <View style={styles.badgesRow}>
          {formatBadges.map((f) => (
            <View key={f} style={[styles.formatBadge, { borderColor: FORMAT_COLORS[f] }]}>
              <Text style={[styles.formatBadgeText, { color: FORMAT_COLORS[f] }]}>
                {f.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>

        {/* Bottom info */}
        <View style={styles.bottomInfo}>
          <Text style={styles.playerName} numberOfLines={1}>{player.name}</Text>
          <View style={styles.countryRow}>
            <Text style={styles.flag}>{flag}</Text>
            <Text style={styles.country}>{player.country}</Text>
          </View>
          {showElo && <EloChip rating={elo} />}
        </View>

        {/* Flip hint */}
        <View style={styles.flipHint}>
          <Text style={styles.flipHintText}>tap for stats</Text>
        </View>
      </Animated.View>

      {/* BACK */}
      <Animated.View style={[styles.card, styles.cardBack, { width: cardWidth, height: cardHeight }, backStyle]}>
        <LinearGradient
          colors={[Colors.surface, Colors.background]}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.backContent}>
          <View style={styles.backHeader}>
            <Text style={styles.backName} numberOfLines={1}>{player.name}</Text>
            <Text style={styles.backFlag}>{flag}</Text>
          </View>

          {bat && bat.matches > 0 && (
            <View style={styles.statsSection}>
              <Text style={styles.statsSectionTitle}>🏏 BATTING</Text>
              <StatRow label="Mat" value={bat.matches} />
              <StatRow label="Runs" value={bat.runs} highlight />
              <StatRow label="Avg" value={bat.average?.toFixed(2)} highlight />
              <StatRow label="SR" value={bat.strike_rate?.toFixed(1)} />
              <StatRow label="100s / 50s" value={`${bat.hundreds} / ${bat.fifties}`} />
              <StatRow label="HS" value={bat.highest_score} />
            </View>
          )}

          {bowl && bowl.wickets > 0 && (
            <View style={styles.statsSection}>
              <Text style={styles.statsSectionTitle}>⚡ BOWLING</Text>
              <StatRow label="Wkts" value={bowl.wickets} highlight />
              <StatRow label="Avg" value={bowl.average?.toFixed(2)} />
              <StatRow label="Econ" value={bowl.economy?.toFixed(2)} />
              <StatRow label="Best" value={bowl.best_bowling} highlight />
              <StatRow label="5W" value={bowl.five_wickets} />
            </View>
          )}

          {(!bat || bat.matches === 0) && (!bowl || bowl.wickets === 0) && (
            <View style={styles.noStats}>
              <Text style={styles.noStatsText}>No stats available</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    margin: 6,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.card,
  },
  cardBack: {
    borderColor: Colors.primaryLight,
  },
  initialsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    fontSize: 48,
    fontWeight: "900",
    color: Colors.goldDark,
    opacity: 0.5,
  },
  photoOverlay: {
    borderRadius: 16,
  },
  badgesRow: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    gap: 4,
  },
  formatBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  formatBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  bottomInfo: {
    position: "absolute",
    bottom: 28,
    left: 10,
    right: 10,
    gap: 4,
  },
  playerName: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.white,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  countryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  flag: {
    fontSize: 12,
  },
  country: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  flipHint: {
    position: "absolute",
    bottom: 8,
    right: 10,
  },
  flipHintText: {
    fontSize: 9,
    color: Colors.textMuted,
    fontStyle: "italic",
  },
  backContent: {
    flex: 1,
    padding: 10,
    gap: 6,
  },
  backHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    paddingBottom: 6,
  },
  backName: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.gold,
    flex: 1,
  },
  backFlag: {
    fontSize: 16,
  },
  statsSection: {
    gap: 2,
  },
  statsSectionTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 3,
    marginTop: 4,
  },
  noStats: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noStatsText: {
    color: Colors.textMuted,
    fontSize: 12,
  },
});
