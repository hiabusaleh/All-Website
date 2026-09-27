// localStorage key migration (প্ল্যান §৭).
// পুরনো key কখনো মোছা হয় না। Portal ধাপে পুরনো app-গুলো পুরনো key-তেই লেখে,
// তাই প্রতিবার সাইট খুললে পুরনো → নতুন sync হয়। কিন্তু নতুন engine যদি নতুন key
// নিজে বদলে থাকে, তাহলে সেটা আর overwrite হয় না।

export const META_KEY = 'meta.migrate';

const VAULT_KEYS = ['navstate', 'shopt', 'smopt', 'vaultoff', 'vtheme', 'vfs'];

export const RULES = [
  { prefix: 'ielts_lt::', to: 'L.test::' },
  { exact: 'ielts_drill', to: 'L.drill' },
  { prefix: 'ielts_syn::', to: 'L.syn::' },
  ...VAULT_KEYS.map((k) => ({ exact: k, to: `L.vault.${k}` })),
  { prefix: 'ielts_ft::', to: 'R.test::' },
  { prefix: 'ielts_vocab::', to: 'V.learned::' },
  { prefix: 'sg.', to: 'S.' },
];

/** পুরনো key-এর নতুন নাম; migrate করার দরকার না থাকলে null. */
export function newKeyFor(key) {
  for (const r of RULES) {
    if (r.exact !== undefined && key === r.exact) return r.to;
    if (r.prefix !== undefined && key.startsWith(r.prefix) && key.length > r.prefix.length) {
      return r.to + key.slice(r.prefix.length);
    }
  }
  return null;
}

/** ছোট, স্থির fingerprint (FNV-1a) — পুরো value meta-তে কপি না করে তুলনার জন্য. */
export function fingerprint(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return `${str.length}:${h.toString(36)}`;
}

function keysOf(storage) {
  const out = [];
  for (let i = 0; i < storage.length; i++) out.push(storage.key(i));
  return out;
}

/**
 * storage: Web Storage-এর মতো যেকোনো object (length, key, getItem, setItem).
 * ফল: { copied, updated, skipped } — প্রতিটা [oldKey, newKey]-এর তালিকা.
 */
export function migrate(storage, now = new Date()) {
  let meta;
  try { meta = JSON.parse(storage.getItem(META_KEY) || 'null'); } catch { meta = null; }
  if (!meta || typeof meta !== 'object') meta = { v: 1, synced: {} };
  if (!meta.synced) meta.synced = {};

  const report = { copied: [], updated: [], skipped: [] };
  for (const oldKey of keysOf(storage)) {
    const newKey = newKeyFor(oldKey);
    if (!newKey) continue;
    const src = storage.getItem(oldKey);
    if (src === null) continue;
    const cur = storage.getItem(newKey);
    const srcFp = fingerprint(src);

    if (cur === null) {
      storage.setItem(newKey, src);
      meta.synced[newKey] = srcFp;
      report.copied.push([oldKey, newKey]);
    } else if (cur === src) {
      meta.synced[newKey] = srcFp;
    } else if (meta.synced[newKey] === fingerprint(cur)) {
      // নতুন key আগের sync-এর পর আর বদলায়নি, তাই পুরনো app-এর নতুন ডেটা নেওয়া নিরাপদ.
      storage.setItem(newKey, src);
      meta.synced[newKey] = srcFp;
      report.updated.push([oldKey, newKey]);
    } else {
      // নতুন engine নিজে নতুন key বদলেছে — হাত দেওয়া হবে না.
      report.skipped.push([oldKey, newKey]);
    }
  }

  meta.last = now.toISOString();
  storage.setItem(META_KEY, JSON.stringify(meta));
  return report;
}
