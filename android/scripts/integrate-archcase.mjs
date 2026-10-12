import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const project = fileURLToPath(new URL('../', import.meta.url));
const original = await readFile(path.join(project, 'source/archcase-orange-glass.html'), 'utf8');
const data = JSON.parse(original.match(/<script id="archcase-data"[^>]*>([\s\S]*?)<\/script>/)[1]);
let html = original;

function replaceOnce(before, after) {
  if (html.split(before).length !== 2) throw new Error(`Source changed: expected one occurrence of ${before.slice(0, 100)}`);
  html = html.replace(before, after);
}

replaceOnce('width=device-width,initial-scale=1,interactive-widget=resizes-content', 'width=device-width,initial-scale=1,viewport-fit=cover,interactive-widget=resizes-content');
// CDN dependencies are shipped locally; online street tiles remain optional.
html = html.replace(/^\s*<link rel="(?:preconnect|preload)"[^>]*>\r?\n/gm, '');
replaceOnce('</head>', '  <link rel="stylesheet" href="./native.css">\n  <script type="module" src="./native.js"></script>\n</head>');
replaceOnce(`        try { await loadAsset('https://cdn.jsdelivr.net/npm/' + path, kind); }\n        catch (_) { await loadAsset('https://unpkg.com/' + path, kind); }`,
  `        await loadAsset(new URL('./vendor/' + path, location.href).href, kind);`);
replaceOnce(`          try { atlas = await loadWorldJson('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json'); }\n          catch (_) { atlas = await loadWorldJson('https://unpkg.com/world-atlas@2.0.2/countries-110m.json'); }`,
  `          atlas = await loadWorldJson(new URL('./vendor/world-atlas@2.0.2/countries-110m.json', location.href).href);`);
replaceOnce(`        streetLoading = true; $('retry-base').disabled = true; setStatus('base-caption', '在线街道底图载入中…');`,
  `        streetLoading = true; $('retry-base').disabled = true;
        await loadWorld();
        setStatus('base-caption', worldLayer ? '世界概览底图' : '在线街道底图载入中…');`);
replaceOnce(`          for (const source of streetSources) {`, `          for (const source of navigator.onLine === false ? [] : streetSources) {`);
replaceOnce(`      $('retry-base').addEventListener('click', loadBase);`,
  `      $('retry-base').addEventListener('click', loadBase);
      window.addEventListener('online', loadBase);
      window.addEventListener('offline', loadBase);`);

// Check all original classic scripts without executing the supplied document.
for (const [i, script] of [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].entries()) {
  if (!/type=|src=/.test(script[1])) new vm.Script(script[2], { filename: `archcase-inline-${i}.js` });
}
const integratedData = JSON.parse(html.match(/<script id="archcase-data"[^>]*>([\s\S]*?)<\/script>/)[1]);
if (JSON.stringify(data) !== JSON.stringify(integratedData)) throw new Error('Case data changed during integration.');
await writeFile(path.join(project, 'web/index.html'), html);

const files = [
  ['leaflet', '1.9.4', 'dist/leaflet.css'],
  ['leaflet', '1.9.4', 'dist/leaflet.js'],
  ['leaflet', '1.9.4', 'dist/images/layers.png'],
  ['leaflet', '1.9.4', 'dist/images/layers-2x.png'],
  ['leaflet', '1.9.4', 'dist/images/marker-icon.png'],
  ['leaflet', '1.9.4', 'dist/images/marker-icon-2x.png'],
  ['leaflet', '1.9.4', 'dist/images/marker-shadow.png'],
  ['leaflet.markercluster', '1.5.3', 'dist/MarkerCluster.css'],
  ['leaflet.markercluster', '1.5.3', 'dist/leaflet.markercluster.js'],
  ['topojson-client', '3.1.0', 'dist/topojson-client.min.js'],
  ['d3-array', '3.2.4', 'dist/d3-array.min.js'],
  ['d3-geo', '3.1.1', 'dist/d3-geo.min.js'],
  ['world-atlas', '2.0.2', 'countries-110m.json'],
];
for (const [pkg, version, resource] of files) {
  const destination = path.join(project, 'web/public/vendor', `${pkg}@${version}`, resource);
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(path.join(project, 'node_modules', pkg, resource), destination);
}
for (const pkg of ['leaflet', 'leaflet.markercluster', 'topojson-client', 'd3-array', 'd3-geo', 'world-atlas']) {
  const metadata = JSON.parse(await readFile(path.join(project, 'node_modules', pkg, 'package.json'), 'utf8'));
  const directory = path.join(project, 'web/public/vendor', `${pkg}@${metadata.version}`);
  // All six packages include their upstream license file.
  const licenseName = pkg === 'leaflet.markercluster' ? 'MIT-LICENCE.txt' : 'LICENSE';
  await copyFile(path.join(project, 'node_modules', pkg, licenseName), path.join(directory, 'LICENSE.txt'));
}
// Vite also bundles Capacitor JavaScript; keep the MIT notices with the app.
await mkdir(path.join(project, 'web/public/licenses'), { recursive: true });
for (const pkg of ['core', 'app', 'android']) {
  await copyFile(path.join(project, 'node_modules/@capacitor', pkg, 'LICENSE'),
    path.join(project, 'web/public/licenses', `capacitor-${pkg}.txt`));
}
console.log(JSON.stringify({ cases: data.cases.length, categories: data.categories.length, resources: files.length, sourcePreserved: true }));
