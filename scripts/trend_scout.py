import os
import requests
import json
from datetime import datetime

# Shared Brain Paths
WORKSPACE = os.getcwd()
IDEAS_DIR = os.path.join(WORKSPACE, 'content', 'ideas')

def fetch_hn_trends():
    """Fetch top stories from Hacker News."""
    print("Fetching Hacker News trends...")
    top_stories_url = "https://hacker-news.firebaseio.com/v0/topstories.json"
    response = requests.get(top_stories_url)
    if response.status_code != 200:
        return []
    
    story_ids = response.json()[:20] # Get top 20
    stories = []
    
    for story_id in story_ids:
        story_url = f"https://hacker-news.firebaseio.com/v0/item/{story_id}.json"
        story_data = requests.get(story_url).json()
        if 'title' in story_data:
            stories.append(story_data)
    
    return stories

def save_idea(story):
    """Save an HN story as an idea file."""
    os.makedirs(IDEAS_DIR, exist_ok=True)
    
    idea_id = story['id']
    filename = f"Idea-hn-{idea_id}.md"
    filepath = os.path.join(IDEAS_DIR, filename)
    
    if os.path.exists(filepath):
        return # Skip if exists
    
    content = f"""# Idea: {story['title']}
- **Source:** Hacker News
- **URL:** {story.get('url', f"https://news.ycombinator.com/item?id={idea_id}")}
- **Fetched:** {datetime.utcnow().strftime('%Y-%m-%d %H:%M')} UTC
- **Score:** {story.get('score', 0)}

## Initial Thoughts
{story.get('title')} is currently trending on Hacker News. This could be a good candidate for a Reviewer-style post or a deep-dive in the newsletter.

## Draft Snippet
(To be filled by Ozzy during the drafting phase)
"""
    
    with open(filepath, 'w') as f:
        f.write(content)
    print(f"Saved: {filename}")

if __name__ == "__main__":
    trends = fetch_hn_trends()
    for story in trends:
        # Filter for AI/Agent keywords
        keywords = ['ai', 'agent', 'llm', 'gpt', 'model', 'anthropic', 'openai', 'rust', 'local']
        if any(kw in story['title'].lower() for kw in keywords):
            save_idea(story)
    
    print("Trend scout complete.")
