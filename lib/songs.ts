import NodeCache from 'node-cache';
import { query, initializePool } from './db';
import { decrypt } from './encryption';

const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

// Initialize the database pool
initializePool();

export const getSongMatchup = async (encodedUserId: string): Promise<{ song1: any; song2: any } | null> => {
  try {
    const songs = await getSongs();
    const userId = parseInt(decrypt(encodedUserId), 10);
    const [song1, song2] = await getRandomSongs(songs, userId);
    
    if (song1 && song2) {
      return { song1, song2 };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error in getSongMatchup:', error);
    throw error;
  }
}

export const getSongs = async (): Promise<any[]> => {
  try {
    const cachedSongs = cache.get<any[]>('songs');
    if (cachedSongs) {
      console.log(cachedSongs.length);
      return cachedSongs;
    }
    const { rows: songs } = await query('SELECT * FROM songs LIMIT 100', []);
    cache.set('songs', songs);
    console.log(songs.length);
    return songs;
  } catch (error) {
    console.error('Error in getSongs:', error);
    throw error;
  }
};

const matchups = new Set<string>();
let lastIndex = 0;

const K = 32; // Elo constant

const calculateElo = (rating1: number, rating2: number, score: number): number => {
  const expectedScore = 1 / (1 + Math.pow(10, (rating2 - rating1) / 400));
  return rating1 + K * (score - expectedScore);
};

export const updateEloRatings = async (encodedUserId: string, winnerId: string, loserId: string): Promise<void> => {
  try {
    console.log('Updating Elo ratings for winner:', winnerId, 'and loser:', loserId);
    console.log('Encoded User ID:', encodedUserId);

    if (!winnerId || !loserId) {
      console.error('Missing winner or loser ID:', { winnerId, loserId });
      throw new Error('Winner ID and Loser ID must be provided');
    }

    // Fetch current Elo ratings
    const { rows: [winnerData] } = await query('SELECT rating FROM ratings WHERE song_uri = $1', [winnerId]);
    const { rows: [loserData] } = await query('SELECT rating FROM ratings WHERE song_uri = $1', [loserId]);
  
    const winnerCurrentRating = winnerData ? winnerData.rating : 1500;
    const loserCurrentRating = loserData ? loserData.rating : 1500;

    console.log('Current ratings:', { winnerCurrentRating, loserCurrentRating });

    const winnerNewRating = calculateElo(winnerCurrentRating, loserCurrentRating, 1);
    const loserNewRating = calculateElo(loserCurrentRating, winnerCurrentRating, 0);

    console.log('New ratings:', { winnerNewRating, loserNewRating });

    // Update or insert winner rating
    if (winnerData) {
      await query('UPDATE ratings SET rating = $1 WHERE song_uri = $2', [winnerNewRating, winnerId]);
    } else {
      await query('INSERT INTO ratings (song_uri, rating) VALUES ($1, $2)', [winnerId, winnerNewRating]);
    }

    // Update or insert loser rating
    if (loserData) {
      await query('UPDATE ratings SET rating = $1 WHERE song_uri = $2', [loserNewRating, loserId]);
    } else {
      await query('INSERT INTO ratings (song_uri, rating) VALUES ($1, $2)', [loserId, loserNewRating]);
    }

    // Update the cache
    const songs = await getSongs();
    const winner = songs.find((song) => song.track_uri === winnerId);
    const loser = songs.find((song) => song.track_uri === loserId);
    if (winner && loser) {
      winner.rating = winnerNewRating;
      loser.rating = loserNewRating;
      cache.set('songs', songs);
    } else {
      console.error('Could not find winner or loser in songs cache:', { winnerId, loserId });
    }

    const userId = parseInt(decrypt(encodedUserId), 10);
    await query('INSERT INTO user_matches (user_id, song1_uri, song2_uri) VALUES ($1, $2, $3)', [userId, winnerId, loserId]);
    
    console.log('Successfully updated Elo ratings and inserted user match');
  } catch (error) {
    console.error('Error in updateEloRatings:', error);
    throw error;
  }
};

async function getRandomSongs(songs: any[], userId: number): Promise<[any | null, any | null]> {
    try {
        // Fetch matched pairs from the database
        const { rows: matchedPairsRows } = await query(
            'SELECT song1_uri, song2_uri FROM user_matches WHERE user_id = $1',
            [userId]
        );
        const matchedPairs = new Set(matchedPairsRows.map((row: any) => [row.song1_uri, row.song2_uri].sort().join(',')));

        // Generate all possible combinations
        const allCombinations = [];
        for (let i = 0; i < songs.length; i++) {
            for (let j = i + 1; j < songs.length; j++) {
                allCombinations.push([songs[i]['track_uri'], songs[j]['track_uri']].sort().join(','));
            }
        }

        // Filter out matched pairs
        const availableCombinations = allCombinations.filter(combo => !matchedPairs.has(combo));

        if (availableCombinations.length === 0) {
            return [null, null]; // No more combinations available
        }

        // Choose a random combination
        const chosenPair = availableCombinations[Math.floor(Math.random() * availableCombinations.length)].split(',');

        // Find the corresponding song objects
        const song1 = songs.find(song => song.track_uri === chosenPair[0]) || null;
        const song2 = songs.find(song => song.track_uri === chosenPair[1]) || null;

        if (!song1?.track_uri || !song2?.track_uri) {
            console.error('Invalid song data:', { song1, song2 });
            return [null, null];
        }

        return [song1, song2];
    } catch (error) {
        console.error('Error in getRandomSongs:', error);
        throw error;
    }
}

export const getTopTracks = async (encodedUserId: string): Promise<any[]> => {
  try {
    const userId = parseInt(decrypt(encodedUserId), 10);
    
    const { rows: topTracks } = await query(`
      SELECT s.*, r.rating
      FROM songs s
      JOIN ratings r ON s.track_uri = r.song_uri
      WHERE r.song_uri IN (
        SELECT song1_uri FROM user_matches WHERE user_id = $1
        UNION
        SELECT song2_uri FROM user_matches WHERE user_id = $1
      )
      ORDER BY r.rating DESC
    `, [userId]);

    return topTracks;
  } catch (error) {
    console.error('Error in getTopTracks:', error);
    throw error;
  }
};