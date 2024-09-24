import { NextApiRequest, NextApiResponse } from 'next';
import { openDb } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { setCookie } from 'nookies';
import { encrypt } from '@/lib/encryption';

export default async function signin(req: NextApiRequest, res: NextApiResponse) {
  const { email, password } = req.body;
  const db = await openDb();

  const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
  if (!user || !user.user_id) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }

  const encryptedUserId = encrypt(user.user_id.toString());

  setCookie({ res }, 'cookie_authenticated', 'true', { maxAge: 30 * 24 * 60 * 60, path: '/' });
  setCookie({ res }, 'cookie_user_encrypt_id', encryptedUserId, { maxAge: 30 * 24 * 60 * 60, path: '/', httpOnly: true });

  res.status(200).json({ success: true, encryptedUserId });
}