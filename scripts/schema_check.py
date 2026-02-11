import psycopg2

db_url = "postgresql://postgres.vsbojiiuiqhnnsxkouqg:PostCore2026%21@aws-0-us-west-2.pooler.supabase.com:5432/postgres"

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    print("Checking Post table columns...")
    cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'Post'")
    cols = cur.fetchall()
    print(f"Post columns: {[c[0] for c in cols]}")
    
    print("\nChecking MetricsSnapshot table columns...")
    cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'MetricsSnapshot'")
    cols = cur.fetchall()
    print(f"MetricsSnapshot columns: {[c[0] for c in cols]}")
    
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
