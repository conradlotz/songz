import { NextApiRequest, NextApiResponse } from 'next';
import { openDb } from '@/lib/db';
import bcrypt from 'bcrypt';

export default async function signup(req: NextApiRequest, res: NextApiResponse) {
  const { email, password } = req.body;
  const db = await openDb();

  const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
  if (user) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);

  res.status(201).json({ id: result.lastID });
}