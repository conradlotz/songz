import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { Colors } from "../../constants/colors";
import { FormatTabs } from "../../components/FormatTabs";
import { PlayerCard } from "../../components/PlayerCard";
import type { Player } from "../../lib/types";
import type { Format } from "../../constants/formats";

const PAGE_SIZE = 20;

const COUNTRIES = [
  "All",
  "India",
  "Australia",
  "England",
  "Pakistan",
  "South Africa",
  "New Zealand",
  "Sri Lanka",
  "West Indies",
  "Bangladesh",
  "Afghanistan",
  "Zimbabwe",
];

export default function BrowseScreen() {
  const router = useRouter();
  const [format, setFormat] = useState<Format | "all">("all");
  const [country, setCountry] = useState("All");
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayers = useCallback(async (pageNum: number, reset: boolean) => {
    try {
      let query = supabase
        .from("players")
        .select(
          "*, batting_stats(*), bowling_stats(*), player_ratings(*)",
        )
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1)
        .order("name");

      if (format !== "all") {
        query = query.contains("formats", [format]);
      }
      if (country !== "All") {
        query = query.eq("country", country);
      }

      const { data, error: err } = await query;
      if (err) throw err;

      const results = (data ?? []) as Player[];
      setHasMore(results.length === PAGE_SIZE);

      if (reset) {
        setPlayers(results);
      } else {
        setPlayers((prev) => [...prev, ...results]);
      }
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load players");
    }
  }, [format, country]);

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    setLoading(true);
    fetchPlayers(0, true).finally(() => setLoading(false));
  }, [format, country, fetchPlayers]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(0);
    setHasMore(true);
    await fetchPlayers(0, true);
    setRefreshing(false);
  }, [fetchPlayers]);

  const onLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchPlayers(nextPage, false);
    setLoadingMore(false);
  }, [loadingMore, hasMore, page, fetchPlayers]);

  const renderPlayer = useCallback(({ item }: { item: Player }) => (
    <TouchableOpacity onPress={() => router.push(`/player/${item.id}`)}>
      <PlayerCard player={item} format={format !== "all" ? format : undefined} />
    </TouchableOpacity>
  ), [router, format]);

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={Colors.gold} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏏 CricDuel</Text>
        <Text style={styles.headerSubtitle}>Discover Cricket Legends</Text>
      </View>

      <FormatTabs selected={format} onSelect={setFormat} />

      {/* Country filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.countryFilter}
      >
        {COUNTRIES.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => setCountry(c)}
            style={[styles.countryChip, country === c && styles.countryChipActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.countryChipText, country === c && styles.countryChipTextActive]}>
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.gold} />
          <Text style={styles.loadingText}>Loading legends…</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={onRefresh}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : players.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.errorEmoji}>🏏</Text>
          <Text style={styles.errorText}>No players found</Text>
        </View>
      ) : (
        <FlatList
          data={players}
          renderItem={renderPlayer}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.gold}
            />
          }
        />
      )}
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
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: Colors.gold,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  countryFilter: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
    flexDirection: "row",
  },
  countryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  countryChipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primaryLighter,
  },
  countryChipText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "600",
  },
  countryChipTextActive: {
    color: Colors.text,
  },
  grid: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  row: {
    justifyContent: "flex-start",
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
  errorEmoji: {
    fontSize: 48,
  },
  errorText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
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
    fontSize: 14,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
