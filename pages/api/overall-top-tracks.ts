import { NextApiRequest, NextApiResponse } from 'next';
import { getOverallTopTracks } from '@/lib/songs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const encryptedUserId = req.cookies.cookie_user_encrypt_id;

  if (!encryptedUserId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const topTracks = await getOverallTopTracks(encryptedUserId);
      res.status(200).json(topTracks);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get top tracks: ' + (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};