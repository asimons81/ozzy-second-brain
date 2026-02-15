'use client';

export const ADMIN_TOKEN_KEY = 'second-brain-admin-token';
export const ADMIN_TOKEN_FALLBACK_KEY = 'SECOND_BRAIN_ADMIN_TOKEN';

export function readAdminToken(): string {
  if (typeof window === 'undefined') return '';
  const primary = window.localStorage.getItem(ADMIN_TOKEN_KEY)?.trim() ?? '';
  if (primary) return primary;
  return window.localStorage.getItem(ADMIN_TOKEN_FALLBACK_KEY)?.trim() ?? '';
}

export function writeAdminToken(value: string) {
  if (typeof window === 'undefined') return;
  const normalized = value.trim();
  if (normalized) {
    window.localStorage.setItem(ADMIN_TOKEN_KEY, normalized);
    window.localStorage.setItem(ADMIN_TOKEN_FALLBACK_KEY, normalized);
  } else {
    window.localStorage.removeItem(ADMIN_TOKEN_KEY);
    window.localStorage.removeItem(ADMIN_TOKEN_FALLBACK_KEY);
  }
}
