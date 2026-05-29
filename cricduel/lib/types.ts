import type { Format } from "../constants/formats";

export interface Player {
  id: string;
  name: string;
  country: string;
  country_code: string | null;
  photo_url: string | null;
  cricinfo_id: number | null;
  dob: string | null;
  batting_style: string | null;
  bowling_style: string | null;
  formats: Format[];
  created_at: string;
  batting_stats?: BattingStat[];
  bowling_stats?: BowlingStat[];
  player_ratings?: PlayerRating[];
}

export interface BattingStat {
  id: string;
  player_id: string;
  format: Format;
  matches: number;
  innings: number;
  runs: number;
  not_outs: number;
  average: number | null;
  strike_rate: number | null;
  hundreds: number;
  fifties: number;
  highest_score: string | null;
}

export interface BowlingStat {
  id: string;
  player_id: string;
  format: Format;
  matches: number;
  wickets: number;
  average: number | null;
  economy: number | null;
  strike_rate: number | null;
  best_bowling: string | null;
  five_wickets: number;
}

export interface PlayerRating {
  id: string;
  player_id: string;
  format: Format;
  elo_rating: number;
}

export interface PlayerVote {
  id: string;
  user_id: string;
  player1_id: string;
  player2_id: string;
  winner_id: string;
  format: Format;
  created_at: string;
}

export interface EloResult {
  newWinnerRating: number;
  newLoserRating: number;
}
