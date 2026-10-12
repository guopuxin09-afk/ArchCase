const fs = require('node:fs/promises');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const output = path.resolve(root, '../downloads/html');
const assets = {
  'leaflet@1.9.4/dist/leaflet.css': 'vendor/leaflet.css',
  'leaflet@1.9.4/dist/leaflet.js': 'vendor/leaflet.js',
  'leaflet.markercluster@1.5.3/dist/MarkerCluster.css': 'vendor/MarkerCluster.css',
  'leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js': 'vendor/leaflet.markercluster.js',
  'topojson-client@3.1.0/dist/topojson-client.min.js': 'vendor/topojson-client.min.js',
  'd3-array@3.2.4/dist/d3-array.min.js': 'vendor/d3-array.min.js',
  'd3-geo@3.1.1/dist/d3-geo.min.js': 'vendor/d3-geo.min.js',
};
async function build() {
  let html = await fs.readFile(path.join(root,'source/archcase-orange-glass.html'),'utf8');
  const sourceData = html.match(/<script id="archcase-data" type="application\/json">([\s\S]*?)<\/script>/)[1];
  const embedded = {};
  for (const [remote, local] of Object.entries(assets)) {
    let content = await fs.readFile(path.join(root,'assets',local));
    if (local.endsWith('.css')) {
      let css=content.toString('utf8');
      for(const image of ['layers.png','layers-2x.png','marker-icon.png','marker-icon-2x.png','marker-shadow.png']) {
        const imageData=await fs.readFile(path.join(root,'assets/vendor/images',image));
        css=css.replaceAll('images/'+image,'data:image/png;base64,'+imageData.toString('base64'));
      }
      content=Buffer.from(css);
    }
    embedded[remote]='data:'+(local.endsWith('.css')?'text/css':'text/javascript')+';base64,'+content.toString('base64');
  }
  html=html.replace(/^\s*<link rel="(?:preconnect|preload)"[^>]*>\r?\n/gm,'');
  const before=`      async function dependency(path, kind) {
        try { await loadAsset('https://cdn.jsdelivr.net/npm/' + path, kind); }
        catch (_) { await loadAsset('https://unpkg.com/' + path, kind); }
      }`;
  if(!html.includes(before))throw Error('Source dependency anchor missing');
  html=html.replace(before,`      const embeddedAssets = ${JSON.stringify(embedded)};
      async function dependency(path, kind) {
        if (!embeddedAssets[path]) throw new Error('Unknown embedded application resource');
        await loadAsset(embeddedAssets[path], kind);
      }`);
  const atlas=JSON.parse(await fs.readFile(path.join(root,'assets/data/countries-110m.json'),'utf8'));
  const beforeAtlas=`          let atlas;
          try { atlas = await loadWorldJson('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json'); }
          catch (_) { atlas = await loadWorldJson('https://unpkg.com/world-atlas@2.0.2/countries-110m.json'); }`;
  if(!html.includes(beforeAtlas))throw Error('Source atlas anchor missing');
  html=html.replace(beforeAtlas,'          const atlas = '+JSON.stringify(atlas)+';');
  html=html.replace("        streetLoading = true; $('retry-base').disabled = true; setStatus('base-caption', '在线街道底图载入中…');",`        streetLoading = true; $('retry-base').disabled = true;
        await loadWorld();
        setStatus('base-caption', worldLayer ? '世界概览底图' : '在线街道底图载入中…');`);
  html=html.replace('          for (const source of streetSources) {','          for (const source of navigator.onLine === false ? [] : streetSources) {');
  const licenses=[];
  for(const file of (await fs.readdir(path.join(root,'assets/licenses'))).sort())licenses.push(file+'\n'+await fs.readFile(path.join(root,'assets/licenses',file),'utf8'));
  html=html.replace('</body>','<!--\nARCHCASE STANDALONE: libraries and world overview embedded; online street tiles and external notes still require internet.\nTHIRD-PARTY LICENSE NOTICES\n'+licenses.join('\n\n').replaceAll('--','—')+'\n-->\n</body>');
  if(html.match(/<script id="archcase-data" type="application\/json">([\s\S]*?)<\/script>/)[1]!==sourceData)throw Error('Case data changed');
  for(const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!script[1].includes('application/json'))new vm.Script(script[2]);
  await fs.mkdir(output,{recursive:true});
  await fs.writeFile(path.join(output,'archcase-offline.html'),html);
  console.log(JSON.stringify({file:'downloads/html/archcase-offline.html',bytes:Buffer.byteLength(html),cases:JSON.parse(sourceData).cases.length,embeddedRuntime:true}));
}
build().catch(e=>{console.error(e);process.exitCode=1;});
