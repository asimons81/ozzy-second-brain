import psycopg2

db_url = "postgresql://postgres.vsbojiiuiqhnnsxkouqg:PostCore2026%21@aws-0-us-west-2.pooler.supabase.com:5432/postgres"

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute("SELECT id, video_url FROM \"Post\" WHERE id = '8bc4f8bf-5578-4554-9ad2-ece38a853535'")
    row = cur.fetchone()
    if row:
        print(f"ID: {row[0]}")
        print(f"VIDEO_URL: {row[1]}")
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
