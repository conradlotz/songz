import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../lib/supabase";
import { Colors } from "../../constants/colors";
import { FORMAT_COLORS } from "../../constants/formats";
import { StatRow } from "../../components/StatRow";
import { EloChip } from "../../components/EloChip";
import type { Player } from "../../lib/types";
import type { Format } from "../../constants/formats";

const FLAG_MAP: Record<string, string> = {
  IN: "🇮🇳", AU: "🇦🇺", GB: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", ZA: "🇿🇦",
  PK: "🇵🇰", NZ: "🇳🇿", LK: "🇱🇰", WI: "🏏",
};

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function PlayerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFormat, setActiveFormat] = useState<Format>("test");

  useEffect(() => {
    if (!id) return;

    supabase
      .from("players")
      .select("*, batting_stats(*), bowling_stats(*), player_ratings(*)")
      .eq("id", id)
      .single()
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message);
        } else {
          const p = data as Player;
          setPlayer(p);
          if (p.formats.length > 0) setActiveFormat(p.formats[0]);
        }
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.gold} />
      </View>
    );
  }

  if (error || !player) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error ?? "Player not found"}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const flag = player.country_code ? FLAG_MAP[player.country_code] ?? "🏏" : "🏏";
  const bat = player.batting_stats?.find((s) => s.format === activeFormat);
  const bowl = player.bowling_stats?.find((s) => s.format === activeFormat);
  const elo = player.player_ratings?.find((r) => r.format === activeFormat)?.elo_rating ?? 1500;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hero image */}
        <View style={styles.heroContainer}>
          {player.photo_url ? (
            <Image
              source={{ uri: player.photo_url }}
              style={styles.heroImage}
              contentFit="cover"
            />
          ) : (
            <LinearGradient
              colors={[Colors.primary, Colors.background]}
              style={styles.heroImage}
            >
              <Text style={styles.heroInitials}>{getInitials(player.name)}</Text>
            </LinearGradient>
          )}
          <LinearGradient
            colors={["transparent", Colors.background]}
            style={styles.heroGradient}
            start={{ x: 0, y: 0.3 }}
            end={{ x: 0, y: 1 }}
          />

          {/* Player info overlay */}
          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{player.name}</Text>
            <View style={styles.heroMeta}>
              <Text style={styles.heroFlag}>{flag}</Text>
              <Text style={styles.heroCountry}>{player.country}</Text>
            </View>
            <View style={styles.heroBadges}>
              {player.formats.map((f) => (
                <View key={f} style={[styles.formatBadge, { borderColor: FORMAT_COLORS[f] }]}>
                  <Text style={[styles.formatBadgeText, { color: FORMAT_COLORS[f] }]}>
                    {f.toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Info section */}
        <View style={styles.infoSection}>
          {player.batting_style && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Batting</Text>
              <Text style={styles.infoValue}>{player.batting_style}</Text>
            </View>
          )}
          {player.bowling_style && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Bowling</Text>
              <Text style={styles.infoValue}>{player.bowling_style}</Text>
            </View>
          )}
          {player.dob && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Born</Text>
              <Text style={styles.infoValue}>
                {new Date(player.dob).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </Text>
            </View>
          )}
        </View>

        {/* Format tabs */}
        <View style={styles.formatTabs}>
          {player.formats.map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setActiveFormat(f)}
              style={[
                styles.formatTab,
                activeFormat === f && { backgroundColor: FORMAT_COLORS[f], borderColor: FORMAT_COLORS[f] },
              ]}
            >
              <Text style={[styles.formatTabText, activeFormat === f && { color: Colors.background }]}>
                {f.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Elo rating */}
        <View style={styles.eloRow}>
          <Text style={styles.eloLabel}>Elo Rating ({activeFormat.toUpperCase()})</Text>
          <EloChip rating={elo} size="md" />
        </View>

        {/* Batting stats */}
        {bat && (
          <View style={styles.statsCard}>
            <Text style={styles.statsSectionTitle}>🏏 Batting — {activeFormat.toUpperCase()}</Text>
            <StatRow label="Matches" value={bat.matches} />
            <StatRow label="Innings" value={bat.innings} />
            <StatRow label="Runs" value={bat.runs} highlight />
            <StatRow label="Average" value={bat.average?.toFixed(2)} highlight />
            <StatRow label="Strike Rate" value={bat.strike_rate?.toFixed(1)} />
            <StatRow label="Hundreds" value={bat.hundreds} />
            <StatRow label="Fifties" value={bat.fifties} />
            <StatRow label="Highest Score" value={bat.highest_score} highlight />
            <StatRow label="Not Outs" value={bat.not_outs} />
          </View>
        )}

        {/* Bowling stats */}
        {bowl && bowl.wickets > 0 && (
          <View style={styles.statsCard}>
            <Text style={styles.statsSectionTitle}>⚡ Bowling — {activeFormat.toUpperCase()}</Text>
            <StatRow label="Matches" value={bowl.matches} />
            <StatRow label="Wickets" value={bowl.wickets} highlight />
            <StatRow label="Average" value={bowl.average?.toFixed(2)} />
            <StatRow label="Economy" value={bowl.economy?.toFixed(2)} />
            <StatRow label="Strike Rate" value={bowl.strike_rate?.toFixed(1)} />
            <StatRow label="Best Bowling" value={bowl.best_bowling} highlight />
            <StatRow label="Five Wicket Hauls" value={bowl.five_wickets} />
          </View>
        )}

        {!bat && !bowl && (
          <View style={styles.noStats}>
            <Text style={styles.noStatsText}>No stats available for {activeFormat.toUpperCase()}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 40 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  errorText: { color: Colors.textSecondary, fontSize: 14 },
  backBtn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  backBtnText: { color: Colors.gold, fontWeight: "700" },
  heroContainer: { height: 300, position: "relative" },
  heroImage: { width: "100%", height: 300, justifyContent: "center", alignItems: "center" },
  heroInitials: { fontSize: 72, fontWeight: "900", color: Colors.goldDark, opacity: 0.5 },
  heroGradient: { ...StyleSheet.absoluteFillObject },
  heroInfo: { position: "absolute", bottom: 20, left: 16, right: 16 },
  heroName: { fontSize: 28, fontWeight: "900", color: Colors.white, textShadowColor: "rgba(0,0,0,0.8)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  heroFlag: { fontSize: 18 },
  heroCountry: { fontSize: 14, color: Colors.textSecondary, fontWeight: "600" },
  heroBadges: { flexDirection: "row", gap: 6, marginTop: 8 },
  formatBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  formatBadgeText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  infoSection: { marginHorizontal: 16, marginTop: 16, backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.cardBorder, overflow: "hidden" },
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.cardBorder },
  infoLabel: { fontSize: 12, color: Colors.textMuted, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: "600" },
  infoValue: { fontSize: 13, color: Colors.text, fontWeight: "600" },
  formatTabs: { flexDirection: "row", marginHorizontal: 16, marginTop: 16, gap: 8 },
  formatTab: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: Colors.cardBorder, alignItems: "center", backgroundColor: Colors.surface },
  formatTabText: { fontSize: 11, fontWeight: "700", color: Colors.textMuted, letterSpacing: 0.5 },
  eloRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginHorizontal: 16, marginTop: 16, padding: 12, backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.cardBorder },
  eloLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: "600" },
  statsCard: { margin: 16, marginBottom: 0, padding: 14, backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: Colors.cardBorder },
  statsSectionTitle: { fontSize: 13, fontWeight: "800", color: Colors.textSecondary, letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" },
  noStats: { margin: 16, padding: 24, backgroundColor: Colors.surface, borderRadius: 14, alignItems: "center" },
  noStatsText: { color: Colors.textMuted, fontSize: 14 },
});
