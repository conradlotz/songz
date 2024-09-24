import sqlite3

def truncate_all_tables(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Get all table names
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()

    # Truncate each table
    for table in tables:
        table_name = table[0]
        cursor.execute(f"DELETE FROM {table_name};")
        print(f"Truncated table: {table_name}")

    # Commit changes and close connection
    conn.commit()
    conn.close()

    print("All tables have been truncated.")

if __name__ == "__main__":
    db_path = 'song_matches.db'  # Update this path if necessary
    truncate_all_tables(db_path)