import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Content is inside the app now
const BRAIN_DIR = path.join(process.cwd(), 'content');

export interface Doc {
  slug: string;
  category: string; // 'journal' | 'concepts'
  title: string;
  date?: string;
  content: string;
  excerpt?: string;
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
      excerpt: content.slice(0, 100).replace(/#/g, '') + '...'
    };
  }).sort((a, b) => {
      // Sort journals by date desc, concepts alpha
      if (category === 'journal') return b.slug.localeCompare(a.slug);
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
    };
  } catch (e) {
    return null;
  }
}
