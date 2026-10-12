const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const sourcePath = process.argv[2] || path.join(root, 'source/archcase-orange-glass.html');
const out = path.resolve(process.argv[3] || path.join(root, '../downloads/html'));
const basename = process.argv[4] || 'archcase';
const webApp = 'https://archcase-iphone-atlas.cuddlyshell7.chatgpt.site';
const source = fs.readFileSync(sourcePath, 'utf8');
const dataText = source.match(/<script id="archcase-data" type="application\/json">([\s\S]*?)<\/script>/)[1];
const data = JSON.parse(dataText);
const esc = text => String(text ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeLink = value => /^https?:\/\//i.test(value || '') ? esc(value) : '#';
// Render once at build time: even a viewer that strips every script can show this map.
const geo = vm.createContext({});
for (const asset of ['d3-array.min.js', 'd3-geo.min.js', 'topojson-client.min.js']) {
  vm.runInContext(fs.readFileSync(path.join(root,'assets/vendor',asset),'utf8'), geo);
}
const atlas = JSON.parse(fs.readFileSync(path.join(root,'assets/data/countries-110m.json'),'utf8'));
const countries = geo.topojson.feature(atlas, atlas.objects.countries);
const projection = geo.d3.geoNaturalEarth1().fitExtent([[12,12],[948,478]], {type:'Sphere'});
const draw = geo.d3.geoPath(projection).digits(2);
const staticMap = `<figure class="preview-map"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 490" role="img" aria-label="世界案例分布概览 / World case overview"><rect width="960" height="490" fill="#eee9de"/><g fill="#dad4c7" stroke="#fffaf2" stroke-width=".65">${countries.features.map(c=>`<path d="${draw(c)}"/>`).join('')}</g><g fill="#b55b2b" fill-opacity=".85" stroke="#fffaf2" stroke-width=".7">${data.cases.map(c=>{const [x,y]=projection([c.longitude,c.latitude]);return `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="3"><title>${esc(c.name)}</title></circle>`;}).join('')}</g></svg><figcaption>案例分布概览 · 静态地图<br><span lang="en">Case locations · Static overview</span></figcaption></figure>`;
const groups = data.categories.map((category, index) => {
  const cases = data.cases.filter(c => c.category === category.name);
  return `<section id="preview-category-${index}"><h2>${esc(category.name)} <small>${cases.length}</small></h2>${cases.length ? cases.map(c => `<article class="preview-case"><h3><a href="${safeLink(c.url)}" target="_blank" rel="noopener noreferrer">${esc(c.name.replaceAll('_', ' · '))}</a></h3><p>${esc(c.architect)}</p><p>${esc(c.year)} · ${esc(c.address)}</p></article>`).join('\n') : '<p>暂无案例 / No cases yet.</p>'}</section>`;
});
const fallback = `
  <!-- Static content remains readable when a file preview does not execute scripts. -->
  <section class="local-preview" aria-label="静态案例索引 / Static case index">
    <header><p class="preview-eyebrow">ARCHCASE / LOCAL FILE PREVIEW</p><h1>建筑案例地图<span>Architecture Atlas</span></h1></header>
    ${staticMap}
    <div class="preview-notice"><h2>此处显示静态预览</h2><p>如果此提示持续显示，交互程序尚未启动，当前查看器可能不支持运行脚本。下方的地图概览与案例索引仍可阅读。</p><p>iPhone／iPad 使用完整地图、搜索与筛选，请在 Safari 打开网页版。联网后也可从 Safari 分享菜单将它添加到主屏幕。</p><p lang="en">This is the static preview. If it remains visible, the interactive app has not started; your viewer may not run scripts. On iPhone or iPad, open the web app in Safari for the full map, search and filters.</p><a class="preview-open" href="${webApp}" target="_blank" rel="noopener">打开网页版 / Open web app ↗</a><p class="preview-url">${webApp}</p></div>
    <p class="preview-intro">以下为 ${data.cases.length} 个案例的静态索引，可直接滚动阅读；全文链接需要联网及相应访问权限。<br><span lang="en">Static index of ${data.cases.length} cases. Full notes require a connection and any necessary access permissions.</span></p>
    <nav aria-label="案例分类 / Categories">${data.categories.map((c,i) => `<a href="#preview-category-${i}">${esc(c.name)}</a>`).join('')}</nav>
    ${groups.join('\n')}
  </section>
`;
const css = `
  <style id="archcase-static-preview">
    html:not(.archcase-interactive) .atlas{display:none!important}
    html.archcase-interactive .local-preview{display:none!important}
    html:not(.archcase-interactive),html:not(.archcase-interactive) body{height:auto;min-height:100%;overflow:auto}
    .local-preview{max-width:900px;margin:0 auto;padding:32px 22px 64px;color:#302b24;background:#f5f1e7;line-height:1.65;overflow-wrap:anywhere}
    .local-preview .preview-eyebrow{font:10px/1.6 ui-monospace,monospace;letter-spacing:2px;color:#a34d23}
    .local-preview .preview-open{display:block;margin-top:16px;padding:12px 16px;border-radius:14px;text-align:center;background:#a95128;color:#fff;text-decoration:none;font-size:14px}.local-preview .preview-url{font-size:11px;color:#71685c;overflow-wrap:anywhere}.web-app-link{color:var(--accent,#a95128);font-size:12px;text-underline-offset:3px}.network-status .web-app-link{display:block;margin-top:12px}.tile-warning{display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center}.tile-warning>span{flex-basis:100%}.tile-warning.is-overview{color:var(--muted);border-color:var(--line)}
    .local-preview .preview-map{margin:0 0 22px;border:1px solid #ddd3c2;border-radius:18px;overflow:hidden;background:#eee9de}.local-preview .preview-map svg{display:block;width:100%;height:auto}.local-preview figcaption{padding:8px 14px 12px;font-size:12px;color:#71685c}
    .local-preview h1{margin:12px 0 26px;font-size:26px;line-height:1.35;letter-spacing:1px}.local-preview h1 span{display:block;font:14px/1.8 system-ui,sans-serif;letter-spacing:.3px;color:#776958}
    .local-preview .preview-notice{border:1px solid #decdb7;background:#fffaf2;border-radius:20px;padding:20px}.local-preview h2{margin:0 0 12px;font-size:18px}.local-preview p{margin:8px 0}.local-preview [lang=en]{color:#71685c;font-size:13px}
    .local-preview .preview-intro{margin:22px 0}.local-preview nav{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:28px}.local-preview nav a{padding:8px 12px;border:1px solid #d8cbb8;border-radius:20px;background:#fffaf2;color:#7c452a;text-decoration:none;font-size:12px}
    .local-preview>section{margin-top:30px;scroll-margin-top:18px}.local-preview small{font-size:12px;color:#a34d23}.local-preview .preview-case{border-top:1px solid #ddd3c2;padding:14px 0}.local-preview h3{font-size:15px;line-height:1.55;margin:0 0 6px}.local-preview h3 a{color:#7c452a;text-decoration:none}.local-preview article p{font-size:13px;color:#6c6255;margin:3px 0}
    @media(min-width:700px){.local-preview{padding:44px 48px 80px}.local-preview h1{font-size:32px}}
  </style>
`;
let html = source.replace('</head>', css + '</head>').replace('<body>', '<body>' + fallback);
function replaceOnce(from, to) {
  if (!html.includes(from)) throw Error('Missing source anchor: ' + from.slice(0,100));
  html = html.replace(from, to);
}
replaceOnce('Object.assign(translations, {', `Object.assign(translations, {"打开网页版 ↗":"Open web app ↗","加载街道地图":"Load street map","离线世界概览":"Offline world overview","当前显示世界概览；街道细节需要联网。":"Showing the world overview. Street details require a connection.","世界概览可用，当前无法连接街道服务。":"World overview ready. The street service cannot be reached.",`);
replaceOnce('<button class="map-button" id="retry-map" hidden>重试地图</button>', `<button class="map-button" id="retry-map" hidden>重试地图</button><a class="web-app-link" href="${webApp}" target="_blank" rel="noopener">打开网页版 ↗</a>`);
replaceOnce('<button id="retry-base">重试底图</button>', `<button id="retry-base">加载街道地图</button><a class="web-app-link" href="${webApp}" target="_blank" rel="noopener">打开网页版 ↗</a>`);

// All map code and styles execute directly from this document. No CDN, data-URL
// script injection, remote JSON, or local-file fetch is required to start it.
const assetFiles = {
  'leaflet@1.9.4/dist/leaflet.css':'leaflet.css',
  'leaflet.markercluster@1.5.3/dist/MarkerCluster.css':'MarkerCluster.css',
  'leaflet@1.9.4/dist/leaflet.js':'leaflet.js',
  'leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js':'leaflet.markercluster.js',
  'topojson-client@3.1.0/dist/topojson-client.min.js':'topojson-client.min.js',
  'd3-array@3.2.4/dist/d3-array.min.js':'d3-array.min.js',
  'd3-geo@3.1.1/dist/d3-geo.min.js':'d3-geo.min.js'
};
let inlineStyles='', inlineScripts='';
for (const [remote, file] of Object.entries(assetFiles)) {
  let content = fs.readFileSync(path.join(root,'assets/vendor',file),'utf8');
  content = content.replace(/\n?\/\/[#@] sourceMappingURL=.*$/gm,'');
  if (file.endsWith('.css')) {
    content = content.replace(/url\(images\/([^)]*)\)/g, (_, image) => 'url(data:image/png;base64,' + fs.readFileSync(path.join(root,'assets/vendor/images',image)).toString('base64') + ')');
    inlineStyles += `<style data-bundled-asset="${remote}">${content.replace(/<\/style/gi,'<\\/style')}</style>\n`;
  } else {
    inlineScripts += `<script data-bundled-asset="${remote}">${content.replace(/<\/script/gi,'<\\/script')}</script>\n`;
  }
}
html = html.replace(/^\s*<link rel="(?:preconnect|preload)"[^>]*>\r?\n/gm,'');
// Preserve application CSS priority over Leaflet's stylesheet.
html = html.replace('<style>', inlineStyles + '<style>');
replaceOnce('  <script>\n    (() => {', inlineScripts + '  <script>\n    (() => {');
replaceOnce(`      async function dependency(path, kind) {
        try { await loadAsset('https://cdn.jsdelivr.net/npm/' + path, kind); }
        catch (_) { await loadAsset('https://unpkg.com/' + path, kind); }
      }`, `      const bundledAssets = ${JSON.stringify(Object.keys(assetFiles))};
      async function dependency(path) {
        if (!bundledAssets.includes(path)) throw new Error('Unknown bundled resource');
      }`);
replaceOnce(`          let atlas;
          try { atlas = await loadWorldJson('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json'); }
          catch (_) { atlas = await loadWorldJson('https://unpkg.com/world-atlas@2.0.2/countries-110m.json'); }`, '          const atlas = ' + JSON.stringify(atlas) + ';');
replaceOnce('      async function loadBase() {', `      let streetsRequested = ARCHCASE_PREFER_STREETS;
      async function loadBase() {`);
replaceOnce("        streetLoading = true; $('retry-base').disabled = true; setStatus('base-caption', '在线街道底图载入中…');", `        streetLoading = true; $('retry-base').disabled = true;
        await loadWorld();
        $('base-warning').classList.remove('is-overview');
        if (!streetsRequested || navigator.onLine === false) {
          if (worldLayer) map.setMaxZoom(6);
          setStatus('base-caption', worldLayer ? '离线世界概览' : '底图未加载');
          setStatus('base-warning-text', worldLayer ? '当前显示世界概览；街道细节需要联网。' : '底图暂时无法加载，案例位置和列表仍可浏览。');
          $('base-warning').classList.toggle('is-overview', !!worldLayer);
          $('base-warning').hidden = false;
          streetLoading = false; $('retry-base').disabled = false; return;
        }
        setStatus('base-caption', worldLayer ? '世界概览底图' : '在线街道底图载入中…');`);
replaceOnce("worldLayer ? '街道底图未加载，已切换世界概览。'", "worldLayer ? '世界概览可用，当前无法连接街道服务。'");
replaceOnce("      $('retry-base').addEventListener('click', loadBase);", "      $('retry-base').addEventListener('click', () => { streetsRequested = true; loadBase(); });");
// Reveal the atlas before its mobile sheet and map measure their containers.
// Waiting until startMap() leaves cached sheet dimensions based on display:none.
replaceOnce('      const sourceCases =', "      document.documentElement.classList.add('archcase-interactive');\n      const sourceCases =");
if (html.match(/<script id="archcase-data" type="application\/json">([\s\S]*?)<\/script>/)[1] !== dataText) throw Error('Case data changed');
for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) if (!match[1].includes('application/json')) new vm.Script(match[2]);
fs.mkdirSync(out,{recursive:true});
const licenses = fs.readdirSync(path.join(root,'assets/licenses')).sort().map(file => file+'\n'+fs.readFileSync(path.join(root,'assets/licenses',file),'utf8')).join('\n\n');
html = html.replace('</body>', '<!--\nARCHCASE: runtime, world overview, case index and no-script preview are embedded.\nStreet tiles and external notes require internet.\nTHIRD-PARTY LICENSE NOTICES\n' + licenses.replaceAll('--','—') + '\n-->\n</body>');
for (const offline of [false, true]) {
  const built = html.replace('ARCHCASE_PREFER_STREETS', String(!offline));
  for (const match of built.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) if (!match[1].includes('application/json')) new vm.Script(match[2]);
  const file = path.join(out, basename + (offline ? '-offline' : '') + '.html');
  fs.writeFileSync(file,built);
  console.log(JSON.stringify({file,cases:data.cases.length,categories:data.categories.length,bytes:Buffer.byteLength(built),defaultMap:offline?'world overview':'online streets with embedded overview'}));
}
if (fs.readFileSync(sourcePath,'utf8') !== source) throw Error('Source was unexpectedly changed');
