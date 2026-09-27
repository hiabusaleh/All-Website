// পুরো সাইটের search. index তৈরি করে build.js (data/search-index.json).

let index = null;

export async function loadIndex(base = './data/search-index.json') {
  if (index) return index;
  const res = await fetch(base);
  index = await res.json();
  return index;
}

export function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFC')
    .replace(/[‌‍]/g, '')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

/** প্রতিটা শব্দ কোথাও না কোথাও মিলতে হবে; শিরোনামে মিললে বেশি নম্বর. */
export function search(entries, query, limit = 30) {
  const terms = normalize(query).split(' ').filter(Boolean);
  if (!terms.length) return [];
  const scored = [];
  for (const e of entries) {
    const title = normalize(e.title);
    const hay = `${title} ${normalize(e.sub)} ${normalize((e.keywords || []).join(' '))}`;
    let score = 0;
    let ok = true;
    for (const t of terms) {
      if (!hay.includes(t)) { ok = false; break; }
      if (title.startsWith(t)) score += 5;
      else if (title.includes(t)) score += 3;
      else score += 1;
    }
    if (ok) scored.push({ e, score });
  }
  scored.sort((a, b) => b.score - a.score || a.e.title.localeCompare(b.e.title));
  return scored.slice(0, limit).map((s) => s.e);
}
