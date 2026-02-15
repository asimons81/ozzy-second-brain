'use client';

export const ADMIN_TOKEN_KEY = 'second-brain-admin-token';

export function readAdminToken(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(ADMIN_TOKEN_KEY)?.trim() ?? '';
}

export function writeAdminToken(value: string) {
  if (typeof window === 'undefined') return;
  if (value.trim()) {
    window.localStorage.setItem(ADMIN_TOKEN_KEY, value.trim());
  } else {
    window.localStorage.removeItem(ADMIN_TOKEN_KEY);
  }
}
