import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../lib/supabase";
import { Colors } from "../../constants/colors";
import { FORMAT_COLORS } from "../../constants/formats";
import { EloChip } from "../../components/EloChip";
import type { Format } from "../../constants/formats";

interface RankedPlayer {
  id: string;
  name: string;
  country: string;
  country_code: string | null;
  photo_url: string | null;
  elo_rating: number;
  rank: number;
}

const FORMATS: Format[] = ["test", "odi", "t20i"];
const FORMAT_LABELS: Record<Format, string> = { test: "TEST", odi: "ODI", t20i: "T20I" };

const FLAG_MAP: Record<string, string> = {
  IN: "🇮🇳", AU: "🇦🇺", GB: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", ZA: "🇿🇦",
  PK: "🇵🇰", NZ: "🇳🇿", LK: "🇱🇰", WI: "🏏",
};

function getRankEmoji(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function LeaderboardScreen() {
  const router = useRouter();
  const [format, setFormat] = useState<Format>("test");
  const [players, setPlayers] = useState<RankedPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const { data, error: err } = await supabase
        .from("player_ratings")
        .select("elo_rating, player_id, format, players(id, name, country, country_code, photo_url)")
        .eq("format", format)
        .order("elo_rating", { ascending: false })
        .limit(100);

      if (err) throw err;

      const ranked: RankedPlayer[] = (data ?? []).map((row, idx) => {
        const p = row.players as { id: string; name: string; country: string; country_code: string | null; photo_url: string | null } | null;
        return {
          id: p?.id ?? row.player_id,
          name: p?.name ?? "Unknown",
          country: p?.country ?? "",
          country_code: p?.country_code ?? null,
          photo_url: p?.photo_url ?? null,
          elo_rating: row.elo_rating,
          rank: idx + 1,
        };
      });

      setPlayers(ranked);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load leaderboard");
    }
  }, [format]);

  useEffect(() => {
    setLoading(true);
    fetchLeaderboard().finally(() => setLoading(false));
  }, [format, fetchLeaderboard]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLeaderboard();
    setRefreshing(false);
  }, [fetchLeaderboard]);

  const renderItem = useCallback(({ item }: { item: RankedPlayer }) => {
    const flag = item.country_code ? FLAG_MAP[item.country_code] ?? "🏏" : "🏏";
    const isTopThree = item.rank <= 3;

    return (
      <TouchableOpacity
        style={[styles.row, isTopThree && styles.rowTopThree]}
        onPress={() => router.push(`/player/${item.id}`)}
        activeOpacity={0.7}
      >
        <Text style={[styles.rank, isTopThree && styles.rankTopThree]}>
          {getRankEmoji(item.rank)}
        </Text>

        <View style={styles.avatar}>
          {item.photo_url ? (
            <Image
              source={{ uri: item.photo_url }}
              style={styles.avatarImage}
              contentFit="cover"
            />
          ) : (
            <LinearGradient
              colors={[Colors.primary, Colors.background]}
              style={[styles.avatarImage, styles.avatarFallback]}
            >
              <Text style={styles.avatarInitials}>{getInitials(item.name)}</Text>
            </LinearGradient>
          )}
        </View>

        <View style={styles.playerInfo}>
          <Text style={styles.playerName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.playerCountry}>
            {flag} {item.country}
          </Text>
        </View>

        <EloChip rating={item.elo_rating} size="md" />
      </TouchableOpacity>
    );
  }, [router]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏆 Rankings</Text>
        <Text style={styles.headerSub}>Best players by Elo rating</Text>
      </View>

      {/* Format tabs */}
      <View style={styles.formatRow}>
        {FORMATS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFormat(f)}
            style={[
              styles.formatBtn,
              format === f && { backgroundColor: FORMAT_COLORS[f], borderColor: FORMAT_COLORS[f] },
            ]}
          >
            <Text style={[styles.formatBtnText, format === f && styles.formatBtnTextActive]}>
              {FORMAT_LABELS[f]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.gold} />
          <Text style={styles.loadingText}>Loading rankings…</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={onRefresh}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={players}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.id}-${item.rank}`}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.errorText}>No ratings yet — start duelling!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: "900", color: Colors.gold },
  headerSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  formatRow: { flexDirection: "row", paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  formatBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1,
    borderColor: Colors.cardBorder, alignItems: "center", backgroundColor: Colors.surface,
  },
  formatBtnText: { fontSize: 11, fontWeight: "700", color: Colors.textMuted, letterSpacing: 0.5 },
  formatBtnTextActive: { color: Colors.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { color: Colors.textSecondary, fontSize: 14 },
  errorText: { color: Colors.textSecondary, fontSize: 14, textAlign: "center" },
  retryBtn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryBtnText: { color: Colors.gold, fontWeight: "700" },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  row: {
    flexDirection: "row", alignItems: "center", paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.cardBorder,
    gap: 12,
  },
  rowTopThree: { backgroundColor: "rgba(212,175,55,0.05)", borderRadius: 12, paddingHorizontal: 8 },
  rank: { fontSize: 14, color: Colors.textMuted, width: 36, textAlign: "center", fontWeight: "700" },
  rankTopThree: { fontSize: 20 },
  avatar: { width: 44, height: 44, borderRadius: 22, overflow: "hidden" },
  avatarImage: { width: 44, height: 44, borderRadius: 22 },
  avatarFallback: { justifyContent: "center", alignItems: "center" },
  avatarInitials: { fontSize: 14, fontWeight: "800", color: Colors.goldDark },
  playerInfo: { flex: 1 },
  playerName: { fontSize: 14, fontWeight: "700", color: Colors.text },
  playerCountry: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
});
