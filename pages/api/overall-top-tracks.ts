import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { rows } = await query(`
        SELECT s.*, r.rating
            FROM songs s
            JOIN ratings r ON s.track_uri = r.song_uri
            WHERE r.song_uri IN (
                SELECT song1_uri FROM user_matches
                UNION
                SELECT song2_uri FROM user_matches
            )
            ORDER BY r.rating DESC
                LIMIT 100
    `);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching overall top tracks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}