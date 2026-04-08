import sqlite3
DB_PATH = "backend/database/govcon.db"
def add_opportunity(title, agency, naics_code, set_aside, deadline):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
INSERT INTO opportunities (title, agency, naics_code, set_aside, deadline)
                   VALUES (?, ?, ?, ?, ?)
                   ''', (title, agency, naics_code, set_aside, deadline))
    conn.commit()
    conn.close()
def get_all_opportunities():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM opportunities")
    rows = cursor.fetchall()
    conn.close()
    return rows

if __name__ == "__main__":
    add_opportunity(
        "GSA Design Services RFP",
        "GSA",
        "541430",
        "WOSB",
        "2026-06-15"
    )
    opportunities = get_all_opportunities()
    for row in opportunities:
        print(row)
    