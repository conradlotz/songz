// /lib/db.js

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db;

export async function openDb() {
  if (!db) {
    db = await open({
      filename: '/db/song_matches.db',
      driver: sqlite3.Database,
    });
  }
  return db;
}
