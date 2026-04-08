import sqlite3
DB_PATH = "backend/database/govcon.db"
def create_tables():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS opportunities (
                   id INTEGER PRIMARY KEY AUTOINCREMENT,
                   title TEXT NOT NULL,
                   agency TEXT NOT NULL,
                   naics_code TEXT,
                   set_aside TEXT,
                   deadline TEXT,
                   status TEXT DEFAULT 'Identified'
                   )
                   ''')
    conn.commit()
    conn.close()

if __name__ == "__main__":
    create_tables() 