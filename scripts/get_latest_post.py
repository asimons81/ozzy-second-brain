import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def get_latest_post_id():
    db_url = os.getenv("DIRECT_URL") or os.getenv("DATABASE_URL")
    if not db_url: return
    if "?pgbouncer=true" in db_url: db_url = db_url.replace("?pgbouncer=true", "")
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        cur.execute("SELECT id, text FROM \"Post\" ORDER BY created_at DESC LIMIT 1")
        row = cur.fetchone()
        if row:
            print(f"LATEST_POST_ID: {row[0]}")
            print(f"TEXT: {row[1]}")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_latest_post_id()
