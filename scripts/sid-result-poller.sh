#!/bin/bash
# Sid's Result Poller 🏎️
# This script helps Sid push his finished renders back to the Shared Brain.

WATCH_DIR="notes/sid-queue"
RENDER_DIR="daily-ai-update/out"

echo "🚀 Sid's Result Poller started..."

while true; do
  # Look for completed tickets
  for ticket in $WATCH_DIR/ticket-*.json; do
    if grep -q '"status": "complete"' "$ticket"; then
      # Extract output filename
      FILENAME=$(grep '"output_name"' "$ticket" | cut -d'"' -f4)
      
      if [ -f "$RENDER_DIR/$FILENAME" ]; then
        echo "✅ Found completed render: $FILENAME"
        
        # Copy render to public/renders for the dashboard to see
        cp "$RENDER_DIR/$FILENAME" public/renders/
        
        # Add to git
        git add "$ticket" "public/renders/$FILENAME"
        git commit -m "chore(render): Sid completed $FILENAME"
        git push origin main
        
        echo "📤 Pushed result to Shared Brain."
      fi
    fi
  done
  
  sleep 60
done
