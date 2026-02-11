import psycopg2

db_url = "postgresql://postgres.vsbojiiuiqhnnsxkouqg:PostCore2026%21@aws-0-us-west-2.pooler.supabase.com:5432/postgres"

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    print("Adding video_url column to Post table...")
    cur.execute('ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "video_url" TEXT;')
    
    conn.commit()
    print("Column added successfully.")
    
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
