// Theme আর লেখার আকার (প্ল্যান §৬). পছন্দ থাকে ui.* key-এ.
import { get, set } from './store.js';

export const THEMES = [
  { id: 'auto', label: 'স্বয়ংক্রিয়' },
  { id: 'light', label: 'হালকা' },
  { id: 'dark', label: 'গাঢ়' },
  { id: 'sepia', label: 'সেপিয়া' },
  { id: 'contrast', label: 'উচ্চ কনট্রাস্ট' },
];

export const FONT_SIZES = [
  { id: 'sm', label: 'ছোট', px: 15 },
  { id: 'md', label: 'মাঝারি', px: 17 },
  { id: 'lg', label: 'বড়', px: 19 },
  { id: 'xl', label: 'অনেক বড়', px: 21 },
];

export function currentTheme() { return get('ui.theme', 'auto'); }
export function currentSize() { return get('ui.fontSize', 'md'); }

export function applyTheme(id = currentTheme()) {
  const root = document.documentElement;
  if (id === 'auto') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', id);
  set('ui.theme', id);
}

export function applySize(id = currentSize()) {
  const size = FONT_SIZES.find((s) => s.id === id) || FONT_SIZES[1];
  document.documentElement.style.setProperty('--fs-base', `${size.px}px`);
  set('ui.fontSize', size.id);
}

export function initTheme() {
  applyTheme();
  applySize();
}
