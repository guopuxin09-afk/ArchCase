const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const source = path.join(root, 'source/archcase-orange-glass.html');
const vendors = {
  'leaflet@1.9.4/dist/leaflet.css': 'vendor/leaflet.css',
  'leaflet@1.9.4/dist/leaflet.js': 'vendor/leaflet.js',
  'leaflet.markercluster@1.5.3/dist/MarkerCluster.css': 'vendor/MarkerCluster.css',
  'leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js': 'vendor/leaflet.markercluster.js',
  'topojson-client@3.1.0/dist/topojson-client.min.js': 'vendor/topojson-client.min.js',
  'd3-array@3.2.4/dist/d3-array.min.js': 'vendor/d3-array.min.js',
  'd3-geo@3.1.1/dist/d3-geo.min.js': 'vendor/d3-geo.min.js',
  'world-atlas@2.0.2/countries-110m.json': 'data/countries-110m.json',
  'leaflet@1.9.4/LICENSE': 'licenses/leaflet.txt',
  'leaflet.markercluster@1.5.3/MIT-LICENCE.txt': 'licenses/leaflet-markercluster.txt',
  'topojson-client@3.1.0/LICENSE': 'licenses/topojson-client.txt',
  'd3-array@3.2.4/LICENSE': 'licenses/d3-array.txt',
  'd3-geo@3.1.1/LICENSE': 'licenses/d3-geo.txt',
  'world-atlas@2.0.2/LICENSE': 'licenses/world-atlas.txt',
  'leaflet@1.9.4/dist/images/marker-icon.png': 'vendor/images/marker-icon.png',
  'leaflet@1.9.4/dist/images/marker-icon-2x.png': 'vendor/images/marker-icon-2x.png',
  'leaflet@1.9.4/dist/images/marker-shadow.png': 'vendor/images/marker-shadow.png',
  'leaflet@1.9.4/dist/images/layers.png': 'vendor/images/layers.png',
  'leaflet@1.9.4/dist/images/layers-2x.png': 'vendor/images/layers-2x.png'
};
async function copyAsset(remote, local) {
  const file = path.join(dist, local);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.copyFile(path.join(root, 'assets', local), file);
}
function replaceOnce(html, from, to) {
  if (!html.includes(from)) throw Error('Source anchor missing: ' + from.slice(0,90));
  return html.replace(from,to);
}
async function build() {
  await fs.mkdir(dist, {recursive:true});
  for (let i=0;i<Object.entries(vendors).length;i+=6) await Promise.all(Object.entries(vendors).slice(i,i+6).map(([r,l])=>copyAsset(r,l)));
  let html = await fs.readFile(source,'utf8');
  const originalData = html.match(/<script id="archcase-data" type="application\/json">([\s\S]*?)<\/script>/)[1];
  html = replaceOnce(html,'initial-scale=1,interactive-widget=resizes-content','initial-scale=1,viewport-fit=cover,interactive-widget=resizes-content');
  html = replaceOnce(html,'  <meta name="color-scheme"',`  <!-- ARCHCASE_PWA_SHELL -->
  <meta name="description" content="ArchCase 建筑案例地图：按建筑、地点、年代和分类探索建筑案例。">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-title" content="ArchCase">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="format-detection" content="telephone=no">
  <link rel="manifest" href="./manifest.webmanifest" crossorigin="use-credentials">
  <link rel="apple-touch-icon" sizes="180x180" href="./icons/apple-touch-icon.png">
  <link rel="icon" type="image/svg+xml" href="./icons/icon.svg">
  <script src="./pwa.js" defer></script>
  <meta name="color-scheme"`);
  html = html.replace('  <link rel="preconnect" href="https://cdn.jsdelivr.net">\n','');
  html = replaceOnce(html,'</style>\n</head>','</style>\n  <link rel="stylesheet" href="./pwa.css">\n</head>');
  for (const [remote,local] of Object.entries(vendors)) html=html.split('href="https://cdn.jsdelivr.net/npm/'+remote+'"').join('href="./'+local+'"');
  html = replaceOnce(html,`      async function dependency(path, kind) {
        try { await loadAsset('https://cdn.jsdelivr.net/npm/' + path, kind); }
        catch (_) { await loadAsset('https://unpkg.com/' + path, kind); }
      }`,`      const localAssets = ${JSON.stringify(vendors)};
      async function dependency(path, kind) {
        if (!localAssets[path]) throw new Error('Unknown application resource');
        await loadAsset('./' + localAssets[path], kind);
      }`);
  html = replaceOnce(html,`          let atlas;
          try { atlas = await loadWorldJson('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json'); }
          catch (_) { atlas = await loadWorldJson('https://unpkg.com/world-atlas@2.0.2/countries-110m.json'); }`,`          const atlas = await loadWorldJson('./data/countries-110m.json');`);
  html = replaceOnce(html,`credentials: 'omit', referrerPolicy: 'no-referrer'`,`credentials: 'same-origin', referrerPolicy: 'strict-origin-when-cross-origin'`);
  html = replaceOnce(html,`        streetLoading = true; $('retry-base').disabled = true; setStatus('base-caption', '在线街道底图载入中…');`,`        if (!navigator.onLine) {
          await loadWorld();
          if (worldLayer) map.setMaxZoom(6);
          setStatus('base-caption', '离线世界概览');
          setStatus('base-warning-text', worldLayer ? '离线模式：世界概览与案例搜索可用。' : '离线底图未能加载，案例搜索仍可使用。');
          $('base-warning').hidden = !!worldLayer;
          return;
        }
        streetLoading = true; $('retry-base').disabled = true; setStatus('base-caption', '在线街道底图载入中…');`);
  html = replaceOnce(html,`          for (const source of streetSources) {`,`          for (const source of streetSources) {
            if (!navigator.onLine) break;`);
  html = replaceOnce(html,`          if (streetLayer) {
            map.setMaxZoom(19);`,`          if (streetLayer && navigator.onLine) {
            map.setMaxZoom(19);`);
  html = replaceOnce(html,`          } else {
            await loadWorld();`,`          } else {
            if (streetLayer) { map.removeLayer(streetLayer); streetLayer = null; }
            await loadWorld();`);
  html = replaceOnce(html,`          loadBase();`,`          loadWorld().then(loadBase);`);
  html = replaceOnce(html,`      $('retry-base').addEventListener('click', loadBase);`,`      $('retry-base').addEventListener('click', loadBase);
      window.addEventListener('online', loadBase);
      window.addEventListener('offline', loadBase);`);
  html = replaceOnce(html,`      const translations = {`,`      const translations = {"离线世界概览":"Offline world overview","离线模式：世界概览与案例搜索可用。":"Offline: world overview and case search are available.","离线底图未能加载，案例搜索仍可使用。":"Offline overview unavailable. Case search still works.",`);
  html = replaceOnce(html,`<div class="map-top"><span`,`<div class="map-top"><button class="map-button pwa-install" id="pwa-install" type="button" aria-haspopup="dialog">安装</button><span class="pwa-state" id="pwa-state" role="status" hidden></span><button class="map-button" id="pwa-update" type="button" hidden>更新</button><span`);
  html = replaceOnce(html,`  <!--ARCHCASE_DATA_START-->`,`  <dialog class="pwa-dialog" id="pwa-dialog" aria-labelledby="pwa-dialog-title">
    <button class="pwa-dialog-close" id="pwa-dialog-close" type="button" aria-label="关闭安装说明">×</button>
    <img class="pwa-dialog-icon" src="./icons/apple-touch-icon.png" width="64" height="64" alt="">
    <p class="pwa-eyebrow">ARCHCASE / WEB APP</p>
    <h2 id="pwa-dialog-title">添加到 iPhone 主屏幕</h2>
    <p class="pwa-dialog-intro" id="pwa-dialog-intro">用 Safari 打开地图后：</p>
    <ol id="pwa-steps"><li>点击 Safari 的「分享」按钮。</li><li>选择「添加到主屏幕」。</li><li>如有「作为网页 App 打开」，保持开启，再点击「添加」。</li></ol>
    <p class="pwa-cache-info" id="pwa-cache-info" role="status">正在准备离线内容…</p>
    <p class="pwa-dialog-note" id="pwa-dialog-note">首次联网打开并完成缓存后，可离线搜索案例、查看世界概览。街道底图、GitHub 案例笔记、原 Notion 笔记和周边地图需要联网。</p>
    <button class="map-button pwa-confirm" id="pwa-confirm" type="button">知道了</button>
  </dialog>
  <!--ARCHCASE_DATA_START-->`);
  if (html.match(/<script id="archcase-data" type="application\/json">([\s\S]*?)<\/script>/)[1]!==originalData) throw Error('Case data changed');
  await fs.writeFile(path.join(dist,'index.html'),html);
  for (const file of ['pwa.css','pwa.js']) await fs.copyFile(path.join(__dirname,file),path.join(dist,file));
  const manifest={id:'./',name:'ArchCase · 建筑案例地图',short_name:'ArchCase',description:'建筑案例地理索引，可离线搜索案例与浏览世界概览。',lang:'zh-Hans',start_url:'./',scope:'./',display:'standalone',background_color:'#f5f1e7',theme_color:'#f5f1e7',categories:['education','reference'],icons:[{src:'./icons/icon-192.png',sizes:'192x192',type:'image/png',purpose:'any'},{src:'./icons/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'},{src:'./icons/icon-maskable-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'}]};
  await fs.writeFile(path.join(dist,'manifest.webmanifest'),JSON.stringify(manifest,null,2)+'\n');
  await fs.mkdir(path.join(dist,'icons'),{recursive:true});
  const icon=`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" fill="#f5f1e7"/><circle cx="256" cy="254" r="181" fill="#f1e7d6"/><g stroke="#ddcfbb" fill="none" stroke-width="2"><path d="M84 164h344M76 254h360M84 344h344M164 83v342M254 72v362M344 83v342"/></g><path d="M159 336V211l97-68 97 68v125H159Z" fill="#b95522"/><path d="M178 326V222l78-55 78 55v104H178Z" fill="#fffaf0"/><path d="M221 326v-76h70v76M256 183v37M192 234h31M289 234h31" stroke="#b95522" stroke-width="16" fill="none"/><circle cx="365" cy="138" r="17" fill="#b95522"/><circle cx="365" cy="138" r="30" stroke="#b95522" stroke-width="2" fill="none" opacity=".3"/></svg>`;
  await fs.writeFile(path.join(dist,'icons/icon.svg'),icon);
  for (const name of ['apple-touch-icon.png','icon-192.png','icon-512.png','icon-maskable-512.png']) await fs.copyFile(path.join(root,'assets/icons',name),path.join(dist,'icons',name));
  await fs.writeFile(path.join(dist,'licenses/README.txt'),'Local libraries retain the licenses in this folder. World boundaries: world-atlas 2.0.2, sourced from Natural Earth public-domain cartography. Street tiles remain external online services and are not cached by this app.\nhttps://www.naturalearthdata.com/about/terms-of-use/\n');
  // Useful on static hosts that recognize _headers; the app does not depend on it.
  await fs.writeFile(path.join(dist,'_headers'),'/sw.js\n  Cache-Control: no-cache\n  Content-Type: application/javascript; charset=utf-8\n/manifest.webmanifest\n  Cache-Control: no-cache\n  Content-Type: application/manifest+json; charset=utf-8\n/index.html\n  Cache-Control: no-cache\n');
  async function files(dir,base='') {let out=[];for(const ent of await fs.readdir(dir,{withFileTypes:true})) {const rel=path.posix.join(base,ent.name);if(ent.isDirectory()) out.push(...await files(path.join(dir,ent.name),rel));else out.push(rel);}return out;}
  const precache=(await files(dist)).filter(f=>!f.startsWith('licenses/')&&!['_headers','sw.js'].includes(f)).sort();
  const hash=crypto.createHash('sha256');for(const f of precache)hash.update(await fs.readFile(path.join(dist,f)));
  const revision=hash.digest('hex').slice(0,16);
  const sw=(await fs.readFile(path.join(__dirname,'sw-template.js'),'utf8')).replace('__REVISION__',revision).replace('__PRECACHE__',JSON.stringify(precache));
  new vm.Script(sw);await fs.writeFile(path.join(dist,'sw.js'),sw);
  for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) if(!match[1].includes('application/json'))new vm.Script(match[2]);
  const data=JSON.parse(originalData);
  console.log(JSON.stringify({cases:data.cases.length,categories:data.categories.length,precacheFiles:precache.length,revision,dist},null,2));
}
build().catch(e=>{console.error(e);process.exitCode=1;});
