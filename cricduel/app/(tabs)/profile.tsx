import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../lib/supabase";
import { Colors } from "../../constants/colors";
import { useAuth } from "../_layout";

interface VoteHistoryItem {
  id: string;
  created_at: string;
  format: string;
  winner: { name: string } | null;
  player1: { name: string } | null;
  player2: { name: string } | null;
}

interface UserStats {
  totalVotes: number;
  testVotes: number;
  odiVotes: number;
  t20iVotes: number;
}

export default function ProfileScreen() {
  const { session } = useAuth();
  const [votes, setVotes] = useState<VoteHistoryItem[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalVotes: 0, testVotes: 0, odiVotes: 0, t20iVotes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const displayName =
    session?.user?.user_metadata?.display_name as string | undefined
    ?? session?.user?.email?.split("@")[0]
    ?? "Cricket Fan";

  const fetchProfile = useCallback(async () => {
    if (!session?.user) return;

    try {
      const { data, error: err } = await supabase
        .from("player_votes")
        .select(
          `id, created_at, format,
           winner:winner_id(name),
           player1:player1_id(name),
           player2:player2_id(name)`,
        )
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (err) throw err;

      const rows = (data ?? []) as VoteHistoryItem[];
      setVotes(rows);

      const s: UserStats = {
        totalVotes: rows.length,
        testVotes: rows.filter((v) => v.format === "test").length,
        odiVotes: rows.filter((v) => v.format === "odi").length,
        t20iVotes: rows.filter((v) => v.format === "t20i").length,
      };
      setStats(s);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    }
  }, [session]);

  useEffect(() => {
    setLoading(true);
    fetchProfile().finally(() => setLoading(false));
  }, [fetchProfile]);

  const handleSignOut = useCallback(() => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => supabase.auth.signOut(),
      },
    ]);
  }, []);

  const renderVote = useCallback(({ item }: { item: VoteHistoryItem }) => {
    const p1Name = Array.isArray(item.player1) ? item.player1[0]?.name : item.player1?.name;
    const p2Name = Array.isArray(item.player2) ? item.player2[0]?.name : item.player2?.name;
    const winnerName = Array.isArray(item.winner) ? item.winner[0]?.name : item.winner?.name;
    const date = new Date(item.created_at).toLocaleDateString();

    return (
      <View style={styles.voteRow}>
        <View style={styles.voteMain}>
          <Text style={styles.voteMatchup} numberOfLines={1}>
            {p1Name ?? "?"} vs {p2Name ?? "?"}
          </Text>
          <Text style={styles.voteWinner}>👑 {winnerName ?? "?"}</Text>
        </View>
        <View style={styles.voteMeta}>
          <Text style={styles.voteFormat}>{item.format.toUpperCase()}</Text>
          <Text style={styles.voteDate}>{date}</Text>
        </View>
      </View>
    );
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header card */}
      <LinearGradient colors={[Colors.primary, Colors.background]} style={styles.profileCard}>
        <Text style={styles.avatar}>🏏</Text>
        <Text style={styles.displayName}>{displayName}</Text>
        <Text style={styles.email}>{session?.user?.email}</Text>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{stats.totalVotes}</Text>
          <Text style={styles.statLabel}>Total Votes</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: "#d4af37" }]}>{stats.testVotes}</Text>
          <Text style={styles.statLabel}>Test</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: "#4ade80" }]}>{stats.odiVotes}</Text>
          <Text style={styles.statLabel}>ODI</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: "#60a5fa" }]}>{stats.t20iVotes}</Text>
          <Text style={styles.statLabel}>T20I</Text>
        </View>
      </View>

      {/* Vote history */}
      <Text style={styles.sectionTitle}>Recent Votes</Text>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.gold} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={votes}
          renderItem={renderVote}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.voteList}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>No votes yet — start duelling! ⚔️</Text>
            </View>
          }
        />
      )}

      {/* Sign out */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  profileCard: {
    padding: 24, alignItems: "center", margin: 16, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  avatar: { fontSize: 48, marginBottom: 8 },
  displayName: { fontSize: 22, fontWeight: "800", color: Colors.gold },
  email: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  statsRow: {
    flexDirection: "row", marginHorizontal: 16, marginBottom: 16,
    backgroundColor: Colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  statBox: {
    flex: 1, paddingVertical: 14, alignItems: "center",
    borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: Colors.cardBorder,
  },
  statNum: { fontSize: 20, fontWeight: "900", color: Colors.text },
  statLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 2, textTransform: "uppercase" },
  sectionTitle: {
    fontSize: 14, fontWeight: "700", color: Colors.textSecondary,
    paddingHorizontal: 16, marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase",
  },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  errorText: { color: Colors.textSecondary, fontSize: 14, textAlign: "center" },
  emptyText: { color: Colors.textMuted, fontSize: 14, textAlign: "center" },
  voteList: { paddingHorizontal: 16, paddingBottom: 100 },
  voteRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.cardBorder,
  },
  voteMain: { flex: 1, marginRight: 8 },
  voteMatchup: { fontSize: 13, color: Colors.text, fontWeight: "600" },
  voteWinner: { fontSize: 12, color: Colors.gold, marginTop: 2 },
  voteMeta: { alignItems: "flex-end" },
  voteFormat: { fontSize: 10, color: Colors.textMuted, fontWeight: "700", letterSpacing: 0.5 },
  voteDate: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  signOutBtn: {
    margin: 16, paddingVertical: 16, borderRadius: 14, alignItems: "center",
    borderWidth: 1, borderColor: Colors.error, backgroundColor: "rgba(239,68,68,0.1)",
  },
  signOutText: { color: Colors.error, fontWeight: "700", fontSize: 15 },
});
