// পুরনো app-এর উপরের shared top bar (প্ল্যান §৬: Portal ধাপে ভেতরের design বদলাবে না).
// build.js প্রতিটা /apps/ HTML-এর কপিতে এই script বসায়; মূল ফাইলে হাত দেয় না.
// Shadow DOM ব্যবহার হয়, যাতে app-এর CSS আর bar-এর CSS একে অপরকে না ছোঁয়.
(function () {
  if (window.top !== window.self || document.getElementById('ielts-topbar')) return;
  var me = document.currentScript;
  var root = new URL('../', me.src);
  var hub = me.getAttribute('data-hub') || '';
  var title = me.getAttribute('data-title') || '';
  var HUBS = { reading: '📖 Reading', listening: '🎧 Listening', speaking: '🗣️ Speaking', writing: '✍️ Writing', foundation: '🌱 শূন্য থেকে' };

  function mount() {
    var host = document.createElement('div');
    host.id = 'ielts-topbar';
    host.style.cssText = 'all:initial;display:block;position:relative;z-index:2147483000';
    var sh = host.attachShadow({ mode: 'open' });
    var hubLink = HUBS[hub] ? '<a href="' + new URL('#/hub/' + hub, root).href + '">' + HUBS[hub] + '</a><span>›</span>' : '';
    sh.innerHTML =
      '<style>' +
      ':host{all:initial}' +
      '.bar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:6px 14px;background:#1b2130;color:#e7eaf2;' +
      'font:14px/1.4 "Hind Siliguri","Inter",system-ui,sans-serif}' +
      'a{color:#b9c8ff;text-decoration:none}a:hover{text-decoration:underline}' +
      '.home{font-weight:700;color:#fff}span{opacity:.6}.t{opacity:.9}' +
      '.x{margin-left:auto;background:none;border:0;color:#e7eaf2;cursor:pointer;font-size:16px}' +
      '</style>' +
      '<div class="bar"><a class="home" href="' + root.href + '">🏠 IELTS Master</a><span>›</span>' + hubLink +
      '<span class="t"></span><button class="x" title="bar লুকান" aria-label="bar লুকান">×</button></div>';
    sh.querySelector('.t').textContent = title;
    sh.querySelector('.x').addEventListener('click', function () { host.remove(); });
    document.body.insertBefore(host, document.body.firstChild);
  }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
