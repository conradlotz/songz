// /lib/db.js

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db;

const databaseDirectory = __dirname + '/db/song_matches.db';

export async function openDb() {
  if (!db) {
    db = await open({
      filename: databaseDirectory,
      driver: sqlite3.Database,
    });
  }
  return db;
}
