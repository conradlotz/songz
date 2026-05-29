import type { EloResult } from "./types";

const K = 32;

function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

export function calculateElo(winnerRating: number, loserRating: number): EloResult {
  const expectedWinner = expectedScore(winnerRating, loserRating);
  const expectedLoser = expectedScore(loserRating, winnerRating);

  return {
    newWinnerRating: Math.round(winnerRating + K * (1 - expectedWinner)),
    newLoserRating: Math.round(loserRating + K * (0 - expectedLoser)),
  };
}
