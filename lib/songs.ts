import NodeCache from 'node-cache';
import { openDb } from './db';
import { decrypt } from './encryption';

const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

export const getSongMatchup = async (encodedUserId: string): Promise<{ song1: any; song2: any } | null> => {
  try {
    const database = await openDb();
    const songs = await getSongs();
    const userId = parseInt(decrypt(encodedUserId), 10);
    const [song1, song2] = await getRandomSongs(database, songs, userId);
    
    if (song1 && song2) {
      // console.log(song1, song2);
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
    const database = await openDb();
    const songs = await database.all('SELECT * FROM songs');
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
    const database = await openDb();
    
    // Fetch current Elo ratings
    const winnerData = await database.get('SELECT rating FROM ratings WHERE song_uri = ?', winnerId);
    const loserData = await database.get('SELECT rating FROM ratings WHERE song_uri = ?', loserId);
    
    const winnerCurrentRating = winnerData ? winnerData.rating : 1500;
    const loserCurrentRating = loserData ? loserData.rating : 1500;

    const winnerNewRating = calculateElo(winnerCurrentRating, loserCurrentRating, 1);
    const loserNewRating = calculateElo(loserCurrentRating, winnerCurrentRating, 0);

    console.log(winnerNewRating, loserNewRating);

    // Insert or update winner rating
    if (!winnerData) {
      await database.run('INSERT INTO ratings (song_uri, rating) VALUES (?, ?)', winnerId, winnerNewRating);
    } else {
      await database.run('UPDATE ratings SET rating = ? WHERE song_uri = ?', winnerNewRating, winnerId);
    }

    // Insert or update loser rating
    if (!loserData) {
      await database.run('INSERT INTO ratings (song_uri, rating) VALUES (?, ?)', loserId, loserNewRating);
    } else {
      await database.run('UPDATE ratings SET rating = ? WHERE song_uri = ?', loserNewRating, loserId);
    }

    // Update the cache
    const songs = await getSongs();
    const winner = songs.find((song) => song['Track URI'] === winnerId);
    const loser = songs.find((song) => song['Track URI'] === loserId);
    if (winner && loser) {
      winner.rating = winnerNewRating;
      loser.rating = loserNewRating;
      cache.set('songs', songs);
    }

    const userId = parseInt(decrypt(encodedUserId), 10);
    await database.run('INSERT INTO user_matches (user_id, song1_uri, song2_uri) VALUES (?, ?, ?)', userId, winnerId, loserId);
  } catch (error) {
    console.error('Error in updateEloRatings:', error);
    throw error;
  }
};

async function getRandomSongs(database: any, songs: any[], userId: number): Promise<[any | null, any | null]> {
    try {
        // Fetch matched pairs from the database
        const matchedPairsRows = await database.all(
            'SELECT song1_uri, song2_uri FROM user_matches WHERE user_id = ?',
            [userId]
        );
        const matchedPairs = new Set(matchedPairsRows.map((row: any) => [row.song1_uri, row.song2_uri].sort().join(',')));

        // Generate all possible combinations
        const allCombinations = [];
        for (let i = 0; i < songs.length; i++) {
            for (let j = i + 1; j < songs.length; j++) {
                allCombinations.push([songs[i]['Track URI'], songs[j]['Track URI']].sort().join(','));
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
        const song1 = songs.find(song => song['Track URI'] === chosenPair[0]) || null;
        const song2 = songs.find(song => song['Track URI'] === chosenPair[1]) || null;

        return [song1, song2];
    } catch (error) {
        console.error('Error in getRandomSongs:', error);
        throw error;
    }
}

export const getTopTracks = async (encodedUserId: string): Promise<any[]> => {
  try {
    const database = await openDb();
    const userId = parseInt(decrypt(encodedUserId), 10);
    
    const topTracks = await database.all(`
      SELECT s.*, r.rating
      FROM songs s
      JOIN ratings r ON s."Track URI" = r.song_uri
      WHERE r.song_uri IN (
        SELECT song1_uri FROM user_matches WHERE user_id = ?
        UNION
        SELECT song2_uri FROM user_matches WHERE user_id = ?
      )
      ORDER BY r.rating DESC
      LIMIT 100
    `, [userId, userId]);

    return topTracks;
  } catch (error) {
    console.error('Error in getTopTracks:', error);
    throw error;
  }
};
