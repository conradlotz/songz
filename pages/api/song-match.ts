import { NextApiRequest, NextApiResponse } from 'next';
import { getSongMatchup, updateEloRatings } from '../../lib/songs';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const encryptedUserId = req.cookies.cookie_user_encrypt_id;

  if (!encryptedUserId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const matchup = await getSongMatchup(encryptedUserId);
      res.status(200).json(matchup);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get song matchup: ' + (error as Error).message });
    }
  } else if (req.method === 'POST') {
    const { winnerId, loserId } = req.body;
    try {
      if (winnerId && loserId) {
        await updateEloRatings(encryptedUserId, winnerId, loserId);
        res.status(200).json({ message: 'Elo ratings updated' });
      } else {
        res.status(400).json({ error: 'Invalid request body' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to update data: ' + (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};