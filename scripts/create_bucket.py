import os
from supabase import create_client, Client

url = "https://hapfzlnpjjhgcjjpmlvj.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhcGZ6bG5wampoZ2NqanBtbHZqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDI1MzU0NSwiZXhwIjoyMDg1ODI5NTQ1fQ.aYs2KkVqrl7oJMNJ7Ub_IVhSDxEUrF78yrn0V_1F0sQ"

supabase: Client = create_client(url, key)

try:
    print("Creating 'content-renders' bucket...")
    res = supabase.storage.create_bucket('content-renders', options={'public': True})
    print(f"Result: {res}")
except Exception as e:
    print(f"Error: {e}")
