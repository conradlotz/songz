import { NextApiRequest, NextApiResponse } from 'next';
import { query, initializePool, testConnection } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { setCookie } from 'nookies';
import { encrypt } from '@/lib/encryption';

// Initialize the database pool
initializePool();

export default async function signup(req: NextApiRequest, res: NextApiResponse) {
  const { name, email, password } = req.body;
  console.log('Signup attempt for:', { name, email });

  try {
    // Test the database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      return res.status(500).json({ error: 'Unable to connect to the database' });
    }

    // Check if the user already exists
    const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user
    const result = await query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING user_id',
      [name, email, hashedPassword]
    );

    const newUserId = result.rows[0].user_id;

    const encryptedUserId = encrypt(newUserId.toString());

    setCookie({ res }, 'cookie_authenticated', 'true', { maxAge: 30 * 24 * 60 * 60, path: '/' });
    setCookie({ res }, 'cookie_user_encrypt_id', encryptedUserId, { maxAge: 30 * 24 * 60 * 60, path: '/', httpOnly: true });

    res.status(201).json({ success: true, encryptedUserId });
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}