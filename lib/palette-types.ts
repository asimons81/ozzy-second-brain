export type PaletteActionId = 'new-note' | 'new-idea' | 'new-journal';

export type PaletteItem = {
  id: string;
  title: string;
  subtitle?: string;
  href?: string;
  group: string;
  kind: 'link' | 'external' | 'action';
  actionId?: PaletteActionId;
  keywords?: string;
};

