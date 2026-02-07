import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Content is inside the app now
const BRAIN_DIR = path.join(process.cwd(), 'content');

export interface Doc {
  slug: string;
  category: string;
  title: string;
  date?: string;
  content: string;
  excerpt?: string;
  // Render specific metadata
  type?: 'trend' | 'captions' | 'experiment';
  video?: string;
  thumbnail?: string;
  prompt?: string;
  model?: string;
  seed?: number;
  tags?: string[];
  brief?: string;
  journal?: string;
}

export function getCategories() {
  if (!fs.existsSync(BRAIN_DIR)) return [];
  return fs.readdirSync(BRAIN_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

export function getDocsByCategory(category: string): Doc[] {
  const catPath = path.join(BRAIN_DIR, category);
  if (!fs.existsSync(catPath)) return [];

  const files = fs.readdirSync(catPath).filter(f => f.endsWith('.md'));

  return files.map(file => {
    const filePath = path.join(catPath, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    const slug = file.replace('.md', '');

    // Heuristic for title if not in frontmatter
    let title = data.title;
    if (!title) {
      const h1Match = content.match(/^#\s+(.+)$/m);
      title = h1Match ? h1Match[1] : slug.replace(/-/g, ' ');
    }

    return {
      slug,
      category,
      title,
      date: data.date,
      content,
      excerpt: content.slice(0, 100).replace(/#/g, '') + '...',
      // Add extra metadata
      ...data
    };
  }).sort((a, b) => {
      // Sort renders and journals by date desc
      if (category === 'journal' || category === 'renders') {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        if (dateA !== dateB) return dateB - dateA;
        return b.slug.localeCompare(a.slug);
      }
      return a.slug.localeCompare(b.slug);
  });
}

export function getDoc(category: string, slug: string): Doc | null {
  try {
    const filePath = path.join(BRAIN_DIR, category, `${slug}.md`);
    if (!fs.existsSync(filePath)) return null;
    
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    
    let title = data.title;
    if (!title) {
      const h1Match = content.match(/^#\s+(.+)$/m);
      title = h1Match ? h1Match[1] : slug.replace(/-/g, ' ');
    }

    return {
      slug,
      category,
      title,
      date: data.date,
      content,
      ...data
    };
  } catch {
    return null;
  }
}
