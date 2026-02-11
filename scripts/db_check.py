import os
import psycopg2

db_url = "postgresql://postgres.vsbojiiuiqhnnsxkouqg:PostCore2026%21@aws-0-us-west-2.pooler.supabase.com:5432/postgres"

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute("SELECT id, text FROM \"Post\" ORDER BY created_at DESC LIMIT 1")
    row = cur.fetchone()
    if row:
        print(f"ID: {row[0]}")
        print(f"TEXT: {row[1]}")
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
