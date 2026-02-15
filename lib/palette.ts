import 'server-only';

import { getAllDocs } from '@/lib/brain';
import { getSystemLinks } from '@/lib/systems';
import type { PaletteActionId, PaletteItem } from '@/lib/palette-types';

function navItems(): PaletteItem[] {
  return [
    {
      id: 'nav-now',
      title: 'Now',
      subtitle: 'Operational dashboard',
      href: '/',
      group: 'Navigate',
      kind: 'link',
      keywords: 'home dashboard now',
    },
    {
      id: 'nav-activity',
      title: 'Activity',
      subtitle: 'Merged timeline',
      href: '/activity',
      group: 'Navigate',
      kind: 'link',
      keywords: 'timeline feed activity',
    },
    {
      id: 'nav-renders',
      title: 'Renders',
      subtitle: 'Output library',
      href: '/renders',
      group: 'Navigate',
      kind: 'link',
      keywords: 'videos outputs renders',
    },
    {
      id: 'nav-docs',
      title: 'Docs',
      subtitle: 'Category landing',
      href: '/docs',
      group: 'Navigate',
      kind: 'link',
      keywords: 'docs notes categories',
    },
    {
      id: 'nav-tags',
      title: 'Tags',
      subtitle: 'Browse by tag',
      href: '/tags',
      group: 'Navigate',
      kind: 'link',
      keywords: 'tags taxonomy',
    },
    {
      id: 'nav-ideas',
      title: 'Ideas Pipeline',
      subtitle: 'Mission Control',
      href: '/ideas',
      group: 'Navigate',
      kind: 'link',
      keywords: 'ideas workflow mission control',
    },
    {
      id: 'nav-graph',
      title: 'Graph',
      subtitle: 'Activity graph stub',
      href: '/activity',
      group: 'Navigate',
      kind: 'link',
      keywords: 'graph backlinks connections',
    },
  ];
}

function createAction(id: PaletteActionId, title: string, subtitle: string, keywords: string): PaletteItem {
  return {
    id: `create-${id}`,
    title,
    subtitle,
    group: 'Create',
    kind: 'action',
    actionId: id,
    keywords,
  };
}

function createItems(): PaletteItem[] {
  return [
    createAction('new-note', 'New Note', 'Open Quick Capture', 'new note capture'),
    createAction('new-idea', 'New Idea', 'Quick Capture in ideas', 'new idea pipeline'),
    createAction('new-journal', 'New Journal Entry', 'Quick Capture in journal', 'new journal entry'),
  ];
}

function systemsItems(): PaletteItem[] {
  return getSystemLinks().map((system) => ({
    id: `system-${system.label.toLowerCase()}`,
    title: system.label,
    subtitle: system.href,
    href: system.href,
    group: 'Systems',
    kind: 'external',
    keywords: `${system.label} ${system.href}`,
  }));
}

function stripMarkdown(content: string) {
  return content
    .replace(/^---[\s\S]*?---/m, '')
    .replace(/[#*_`~\[\]()>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function docItems(): Promise<PaletteItem[]> {
  return (await getAllDocs()).map((doc) => ({
    id: `doc-${doc.category}-${doc.slug}`,
    title: doc.title,
    subtitle: doc.modified ?? doc.date ?? doc.slug,
    href: `/docs/${encodeURIComponent(doc.category)}/${encodeURIComponent(doc.slug)}`,
    group: `Docs/${doc.category}`,
    kind: 'link',
    keywords: `${doc.title} ${doc.category} ${doc.slug}`,
    searchBody: stripMarkdown(doc.content).slice(0, 300),
  }));
}

export async function getPaletteItems(): Promise<PaletteItem[]> {
  return [...navItems(), ...createItems(), ...systemsItems(), ...(await docItems())];
}
