export type BrainCategory = {
  key: string;
  title: string;
  dir: string;
  icon: string;
  defaultTemplate: string;
};

export const categories: BrainCategory[] = [
  {
    key: 'ideas',
    title: 'Ideas',
    dir: 'content/ideas',
    icon: 'Zap',
    defaultTemplate: '## Context\n\n## Why now\n\n## Next step\n',
  },
  {
    key: 'briefs',
    title: 'Briefs',
    dir: 'content/briefs',
    icon: 'Rocket',
    defaultTemplate: '## Snapshot\n\n## Signals\n\n## Actions\n',
  },
  {
    key: 'renders',
    title: 'Renders',
    dir: 'content/renders',
    icon: 'TrendingUp',
    defaultTemplate: '## Asset\n\n## Notes\n\n## Next publish step\n',
  },
  {
    key: 'journal',
    title: 'Journal',
    dir: 'content/journal',
    icon: 'Calendar',
    defaultTemplate: '## Shipped\n\n## Learned\n\n## Next\n',
  },
  {
    key: 'newsletter-drafts',
    title: 'Newsletter Drafts',
    dir: 'content/newsletter-drafts',
    icon: 'Book',
    defaultTemplate: '## Theme\n\n## Outline\n\n## CTA\n',
  },
  {
    key: 'concepts',
    title: 'Concepts',
    dir: 'content/concepts',
    icon: 'Lightbulb',
    defaultTemplate: '## Problem\n\n## Approach\n\n## Risks\n',
  },
  {
    key: 'templates',
    title: 'Templates',
    dir: 'content/templates',
    icon: 'Copy',
    defaultTemplate: '## Template\n\n## Inputs\n\n## Usage\n',
  },
  {
    key: 'tools',
    title: 'Tools',
    dir: 'content/tools',
    icon: 'Wrench',
    defaultTemplate: '## Purpose\n\n## Setup\n\n## Ops notes\n',
  },
  {
    key: 'builds',
    title: 'Builds',
    dir: 'content/builds',
    icon: 'Hammer',
    defaultTemplate: '## Goal\n\n## Build notes\n\n## Status\n',
  },
];

const categoryMap = new Map(categories.map((category) => [category.key, category]));

export function getCategoryByKey(key: string) {
  return categoryMap.get(key);
}

export function isKnownCategory(key: string) {
  return categoryMap.has(key);
}

export function getCategoryKeys() {
  return categories.map((category) => category.key);
}
