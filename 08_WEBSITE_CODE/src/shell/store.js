// localStorage-এর নিরাপদ wrapper: private window বা blocked storage-এ সাইট যেন না ভাঙে.

const mem = new Map();
const memStorage = {
  get length() { return mem.size; },
  key: (i) => [...mem.keys()][i] ?? null,
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => { mem.set(k, String(v)); },
  removeItem: (k) => { mem.delete(k); },
};

function pick() {
  try {
    const ls = globalThis.localStorage;
    const probe = '__ielts_probe__';
    ls.setItem(probe, '1');
    ls.removeItem(probe);
    return ls;
  } catch {
    return memStorage;
  }
}

export const storage = pick();
export const persistent = storage !== memStorage;

export function get(key, fallback = null) {
  const raw = storage.getItem(key);
  if (raw === null) return fallback;
  try { return JSON.parse(raw); } catch { return raw; }
}

export function set(key, value) {
  try {
    storage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function allKeys() {
  const out = [];
  for (let i = 0; i < storage.length; i++) out.push(storage.key(i));
  return out.sort();
}

// প্রতিটা key কোন module-এর — নতুন prefix আর পুরনো নাম দুটোই চেনা হয়.
const MODULE_OF = [
  [/^L\.|^ielts_(lt|drill|syn)|^(navstate|shopt|smopt|vaultoff|vtheme|vfs)$/, 'listening'],
  [/^R\.|^ielts_ft/, 'reading'],
  [/^V\.|^ielts_vocab/, 'vocab'],
  [/^S\.|^sg\./, 'speaking'],
  [/^W\./, 'writing'],
  [/^ui\.|^meta\./, 'site'],
];

export function moduleOf(key) {
  for (const [re, mod] of MODULE_OF) if (re.test(key)) return mod;
  return 'other';
}

export const EXPORT_APP = 'ielts-master';

export function exportAll() {
  const data = {};
  for (const k of allKeys()) data[k] = storage.getItem(k);
  return { app: EXPORT_APP, version: 1, exported_at: new Date().toISOString(), data };
}

/** Import: শুধু যোগ বা বদল হয়, কিছু মোছা হয় না. */
export function importAll(payload, { overwrite = false } = {}) {
  if (!payload || payload.app !== EXPORT_APP || typeof payload.data !== 'object') {
    throw new Error('এটা IELTS Master-এর progress ফাইল নয়।');
  }
  let added = 0, replaced = 0, kept = 0;
  for (const [k, v] of Object.entries(payload.data)) {
    if (typeof v !== 'string') continue;
    const cur = storage.getItem(k);
    if (cur === null) { storage.setItem(k, v); added++; }
    else if (cur === v) kept++;
    else if (overwrite) { storage.setItem(k, v); replaced++; }
    else kept++;
  }
  return { added, replaced, kept };
}
