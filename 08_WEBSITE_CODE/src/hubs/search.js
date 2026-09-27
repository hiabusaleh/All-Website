import { esc } from '../shell/ui.js';
import { search } from '../shell/search.js';

const KIND = { hub: 'অংশ', app: 'app', skill: 'skill', page: 'পাতা' };

export function renderSearch(ctx, q) {
  const results = q ? search(ctx.searchIndex, q) : [];
  return `
    <header class="page-head accent-brand">
      <div><p class="eyebrow">Search</p><h1>খুঁজুন</h1></div>
    </header>
    ${q ? `<p class="muted">“${esc(q)}”-এর জন্য ${results.length}টা ফল</p>` : '<p class="muted">উপরের বক্সে লিখুন: skill-এর নাম, alias (যেমন R-S14), app বা অংশের নাম।</p>'}
    <ul class="results">
      ${results.map((r) => `
        <li>
          <a href="${esc(r.href)}">
            <span class="badge">${esc(KIND[r.kind] || r.kind)}</span>
            <strong>${esc(r.title)}</strong>
            <span class="muted">${esc(r.sub || '')}</span>
          </a>
        </li>`).join('')}
    </ul>`;
}
