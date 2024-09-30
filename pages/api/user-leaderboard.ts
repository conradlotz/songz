import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { rows } = await query(`
      SELECT u.name, COUNT(*) as selections
        FROM user_matches um
        JOIN users u ON um.user_id = u.user_id
        GROUP BY u.user_id, u.name
        ORDER BY selections DESC
    `);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching user leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}