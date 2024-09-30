// /lib/db.js

import pg from 'pg';

const { Pool } = pg;

let pool;

export async function initializePool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    pool = new Pool({
      connectionString: connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20, // maximum number of clients in the pool
      idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
      connectionTimeoutMillis: 2000, // how long to wait when connecting a new client
    });

    // The pool will emit an error on behalf of any idle clients
    // it contains if a backend error or network partition happens
    pool.on('error', (err, client) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }
}

export async function query(text, params) {
  if (!pool) {
    await initializePool();
  }
  const client = await pool.connect();
  try {
    // console.log('Executing query:', text);
    // console.log('Query params:', params);
    const result = await client.query(text, params);
    console.log('Query executed successfully');
    return result;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function openDb() {
  if (!pool) {
    await initializePool();
  }
  return pool;
}

export async function testConnection() {
  try {
    const { rows } = await query('SELECT NOW()');
    console.log('Database connection successful. Current time:', rows[0].now);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}
