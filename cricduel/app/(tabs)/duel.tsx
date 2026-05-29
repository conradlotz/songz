import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../lib/supabase";
import { calculateElo } from "../../lib/elo";
import { Colors } from "../../constants/colors";
import { FormatTabs } from "../../components/FormatTabs";
import { PlayerCard } from "../../components/PlayerCard";
import { useAuth } from "../_layout";
import type { Player } from "../../lib/types";
import type { Format } from "../../constants/formats";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function DuelScreen() {
  const { session } = useAuth();
  const [format, setFormat] = useState<Format>("test");
  const [players, setPlayers] = useState<[Player, Player] | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voteCount, setVoteCount] = useState(0);
  const [winnerIdx, setWinnerIdx] = useState<0 | 1 | null>(null);

  const leftScale = useSharedValue(1);
  const rightScale = useSharedValue(1);
  const leftOpacity = useSharedValue(1);
  const rightOpacity = useSharedValue(1);
  const crownOpacity = useSharedValue(0);
  const crownScale = useSharedValue(0.5);

  const crownSide = useSharedValue<number>(0);

  const leftStyle = useAnimatedStyle(() => ({
    transform: [{ scale: leftScale.value }],
    opacity: leftOpacity.value,
  }));

  const rightStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rightScale.value }],
    opacity: rightOpacity.value,
  }));

  const crownStyle = useAnimatedStyle(() => ({
    opacity: crownOpacity.value,
    transform: [{ scale: crownScale.value }],
    left: crownSide.value === 0 ? 8 : SCREEN_WIDTH / 2 + 8,
  }));

  const fetchDuel = useCallback(async () => {
    setLoading(true);
    setError(null);
    setWinnerIdx(null);
    leftOpacity.value = 1;
    rightOpacity.value = 1;
    leftScale.value = 1;
    rightScale.value = 1;

    try {
      let query = supabase
        .from("players")
        .select("*, batting_stats(*), bowling_stats(*), player_ratings(*)")
        .contains("formats", [format])
        .limit(50);

      const { data, error: err } = await query;
      if (err) throw err;
      if (!data || data.length < 2) throw new Error("Not enough players for a duel");

      const shuffled = [...data].sort(() => Math.random() - 0.5);
      setPlayers([shuffled[0] as Player, shuffled[1] as Player]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load duel");
    } finally {
      setLoading(false);
    }
  }, [format, leftOpacity, rightOpacity, leftScale, rightScale]);

  useEffect(() => {
    fetchDuel();
  }, [format, fetchDuel]);

  const loadNext = useCallback(() => {
    fetchDuel();
  }, [fetchDuel]);

  const handleVote = useCallback(
    async (winnerIndex: 0 | 1) => {
      if (!players || voting) return;
      setVoting(true);

      const winner = players[winnerIndex];
      const loser = players[winnerIndex === 0 ? 1 : 0];

      const winnerRating =
        winner.player_ratings?.find((r) => r.format === format)?.elo_rating ?? 1500;
      const loserRating =
        loser.player_ratings?.find((r) => r.format === format)?.elo_rating ?? 1500;

      const { newWinnerRating, newLoserRating } = calculateElo(winnerRating, loserRating);

      // Animate
      crownSide.value = winnerIndex;
      if (winnerIndex === 0) {
        leftScale.value = withSpring(1.05);
        rightOpacity.value = withTiming(0.3, { duration: 400 });
      } else {
        rightScale.value = withSpring(1.05);
        leftOpacity.value = withTiming(0.3, { duration: 400 });
      }
      crownOpacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(1, { duration: 800 }),
        withTiming(0, { duration: 400 }),
      );
      crownScale.value = withSequence(
        withSpring(1.2),
        withTiming(1, { duration: 200 }),
        withTiming(0.5, { duration: 400 }),
      );

      setWinnerIdx(winnerIndex);

      try {
        // Upsert winner rating
        await supabase.from("player_ratings").upsert(
          { player_id: winner.id, format, elo_rating: newWinnerRating },
          { onConflict: "player_id,format" },
        );
        // Upsert loser rating
        await supabase.from("player_ratings").upsert(
          { player_id: loser.id, format, elo_rating: newLoserRating },
          { onConflict: "player_id,format" },
        );
        // Record vote
        if (session?.user) {
          await supabase.from("player_votes").insert({
            user_id: session.user.id,
            player1_id: players[0].id,
            player2_id: players[1].id,
            winner_id: winner.id,
            format,
          });
        }
        setVoteCount((c) => c + 1);
      } catch {
        // Non-critical — rating update failed but we still continue
      }

      setTimeout(() => {
        setVoting(false);
        runOnJS(loadNext)();
      }, 1200);
    },
    [players, voting, format, session, loadNext,
      leftScale, rightScale, leftOpacity, rightOpacity,
      crownOpacity, crownScale, crownSide],
  );

  const formatOptions: Format[] = ["test", "odi", "t20i"];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚔️ Duel</Text>
        <Text style={styles.headerSub}>Who's the greater player?</Text>
        <Text style={styles.voteCount}>{voteCount} votes today</Text>
      </View>

      {/* Format tabs (only cricket formats, no "all") */}
      <View style={styles.formatRow}>
        {formatOptions.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFormat(f)}
            style={[styles.formatBtn, format === f && styles.formatBtnActive]}
          >
            <Text style={[styles.formatBtnText, format === f && styles.formatBtnTextActive]}>
              {f.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.gold} />
          <Text style={styles.loadingText}>Finding opponents…</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchDuel}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : players ? (
        <View style={styles.duelContainer}>
          {/* Crown animation overlay */}
          <Animated.Text style={[styles.crown, crownStyle]}>👑</Animated.Text>

          {/* VS badge */}
          <View style={styles.vsBadge}>
            <LinearGradient colors={[Colors.gold, Colors.goldDark]} style={styles.vsGradient}>
              <Text style={styles.vsText}>VS</Text>
            </LinearGradient>
          </View>

          {/* Cards row */}
          <View style={styles.cardsRow}>
            <Animated.View style={leftStyle}>
              <PlayerCard player={players[0]} format={format} size="duel" />
            </Animated.View>
            <Animated.View style={rightStyle}>
              <PlayerCard player={players[1]} format={format} size="duel" />
            </Animated.View>
          </View>

          {/* Vote buttons */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.voteBtn, voting && styles.voteBtnDisabled]}
              onPress={() => handleVote(0)}
              disabled={voting}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[Colors.gold, Colors.goldDark]}
                style={styles.voteBtnGradient}
              >
                <Text style={styles.voteBtnText} numberOfLines={1}>
                  {winnerIdx === 0 ? "👑 " : ""}
                  {players[0].name.split(" ").slice(-1)[0]}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.voteBtn, voting && styles.voteBtnDisabled]}
              onPress={() => handleVote(1)}
              disabled={voting}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[Colors.gold, Colors.goldDark]}
                style={styles.voteBtnGradient}
              >
                <Text style={styles.voteBtnText} numberOfLines={1}>
                  {winnerIdx === 1 ? "👑 " : ""}
                  {players[1].name.split(" ").slice(-1)[0]}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.skipBtn} onPress={fetchDuel} disabled={voting}>
            <Text style={styles.skipBtnText}>Skip this matchup →</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: Colors.gold,
  },
  headerSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  voteCount: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
  },
  formatRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  formatBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: "center",
    backgroundColor: Colors.surface,
  },
  formatBtnActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  formatBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  formatBtnTextActive: {
    color: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  errorEmoji: { fontSize: 40 },
  errorText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryBtnText: {
    color: Colors.gold,
    fontWeight: "700",
  },
  duelContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  crown: {
    position: "absolute",
    fontSize: 36,
    top: 0,
    zIndex: 10,
  },
  vsBadge: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 5,
    top: 80,
    left: 0,
    right: 0,
    alignItems: "center",
    pointerEvents: "none",
  },
  vsGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  vsText: {
    fontSize: 13,
    fontWeight: "900",
    color: Colors.background,
  },
  cardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 2,
  },
  voteBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  voteBtnDisabled: {
    opacity: 0.5,
  },
  voteBtnGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  voteBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.background,
    letterSpacing: 0.3,
  },
  skipBtn: {
    marginTop: 16,
    alignItems: "center",
    paddingVertical: 8,
  },
  skipBtnText: {
    color: Colors.textMuted,
    fontSize: 13,
  },
});
