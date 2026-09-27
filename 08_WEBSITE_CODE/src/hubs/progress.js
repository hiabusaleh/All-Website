import { esc, bn } from '../shell/ui.js';
import { allKeys, moduleOf, exportAll, importAll, persistent, storage } from '../shell/store.js';
import { migrate } from '../shell/migrate.js';

const MOD_LABEL = {
  listening: '🎧 Listening', reading: '📖 Reading', speaking: '🗣️ Speaking',
  vocab: '🔤 Vocabulary', writing: '✍️ Writing', site: '⚙ সাইট', other: 'অন্যান্য',
};

export function renderProgress() {
  const groups = {};
  for (const k of allKeys()) (groups[moduleOf(k)] ||= []).push(k);
  const order = Object.keys(MOD_LABEL).filter((m) => groups[m]);

  return `
    <header class="page-head accent-brand">
      <div class="hub-icon big" aria-hidden="true">📊</div>
      <div>
        <p class="eyebrow">Progress</p>
        <h1>আমার progress</h1>
        <p class="lead">সব progress এই browser-এ থাকে। অন্য কম্পিউটার বা browser-এ নিতে Export আর Import করুন। কিছুই মোছা হয় না।</p>
      </div>
    </header>

    ${persistent ? '' : '<div class="panel notice warn">এই browser-এ storage বন্ধ আছে (private window?)। এখানে যা করবেন, পাতা বন্ধ করলে হারিয়ে যাবে।</div>'}

    <section class="panel-row">
      <div class="panel">
        <h2>Export / Import</h2>
        <p>Export করলে সব key একটা <code>.json</code> ফাইলে নামবে। Import করলে নতুন key যোগ হয়; একই key-এ আলাদা মান থাকলে আপনি না বললে বদলাবে না।</p>
        <div class="btn-row">
          <button class="btn" data-act="export">⬇ Export</button>
          <label class="btn btn-ghost">⬆ Import<input type="file" accept="application/json,.json" data-act="import" hidden></label>
          <label class="check"><input type="checkbox" data-act="overwrite"> মিল না হলে ফাইলের মান রাখুন</label>
        </div>
        <p class="result" data-out="io" role="status"></p>
      </div>
      <div class="panel">
        <h2>পুরনো পাতার progress আনা</h2>
        <p>কম্পিউটারে ফাইল হিসেবে খোলা পুরনো পাতার progress এই সাইট সরাসরি পড়তে পারে না। তাই:</p>
        <ol>
          <li><a href="tools/progress-export.html" download>progress-export.html</a> নামিয়ে <code>G:\\IELTS</code>-এ রাখুন।</li>
          <li>যে browser-এ পুরনো পাতা খুলতেন, সেই browser-এ ফাইলটা খুলে Export চাপুন।</li>
          <li>এখানে Import করুন। নতুন নামে কপি নিজে থেকেই হবে।</li>
        </ol>
        <button class="btn btn-ghost" data-act="migrate">পুরনো key আবার কপি করুন</button>
        <p class="result" data-out="mig" role="status"></p>
      </div>
    </section>

    <h2 class="section-title">সংরক্ষিত key</h2>
    ${order.length ? order.map((m) => `
      <details class="keys">
        <summary>${esc(MOD_LABEL[m])} <span class="badge">${bn(groups[m].length)}</span></summary>
        <ul>${groups[m].map((k) => `<li><code>${esc(k)}</code></li>`).join('')}</ul>
      </details>`).join('') : '<p class="muted">এখনো কোনো progress সংরক্ষিত হয়নি।</p>'}
  `;
}

export function bindProgress(root, rerender) {
  const out = (name, msg) => { const el = root.querySelector(`[data-out="${name}"]`); if (el) el.textContent = msg; };

  root.querySelector('[data-act="export"]')?.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(exportAll(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ielts-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    out('io', 'Export হয়েছে।');
  });

  root.querySelector('[data-act="import"]')?.addEventListener('change', async (ev) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    try {
      const overwrite = root.querySelector('[data-act="overwrite"]')?.checked;
      const r = importAll(JSON.parse(await file.text()), { overwrite });
      const m = migrate(storage);
      out('io', `নতুন ${bn(r.added)}টা, বদলানো ${bn(r.replaced)}টা, আগের মতো ${bn(r.kept)}টা। নতুন নামে কপি: ${bn(m.copied.length + m.updated.length)}টা।`);
      setTimeout(rerender, 1500);
    } catch (e) {
      out('io', `Import হয়নি: ${e.message}`);
    }
  });

  root.querySelector('[data-act="migrate"]')?.addEventListener('click', () => {
    const m = migrate(storage);
    out('mig', `কপি ${bn(m.copied.length)}টা, হালনাগাদ ${bn(m.updated.length)}টা, নতুন engine-এর বদলানো বলে রেখে দেওয়া ${bn(m.skipped.length)}টা।`);
  });
}
