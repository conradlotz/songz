import { NextApiRequest, NextApiResponse } from 'next';
import { query, initializePool } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { setCookie } from 'nookies';
import { encrypt } from '@/lib/encryption';

// Initialize the database pool
initializePool();

export default async function signin(req: NextApiRequest, res: NextApiResponse) {
  const { email, password } = req.body;
  
  console.log('Signin attempt for email:', email);

  try {
    const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
    console.log('Query result:', rows);

    const user = rows[0];
    
    if (!user) {
      console.log('User not found in the database');
      return res.status(400).json({ error: 'User not found. Please check your email or sign up.' });
    }

    if (!user.user_id) {
      console.log('User found but user_id is missing');
      return res.status(400).json({ error: 'Invalid user data. Please contact support.' });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValid);

    if (!isValid) {
      console.log('Invalid password');
      return res.status(400).json({ error: 'Invalid password. Please try again.' });
    }
    
    const encryptedUserId = encrypt(user.user_id.toString());

    setCookie({ res }, 'cookie_authenticated', 'true', { maxAge: 30 * 24 * 60 * 60, path: '/' });
    setCookie({ res }, 'cookie_user_encrypt_id', encryptedUserId, { maxAge: 30 * 24 * 60 * 60, path: '/', httpOnly: true });

    console.log('Signin successful for user_id:', user.user_id);
    res.status(200).json({ success: true, encryptedUserId });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}