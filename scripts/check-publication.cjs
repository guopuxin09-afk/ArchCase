const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const collection = JSON.parse(fs.readFileSync(path.join(root, 'data/collection.json'), 'utf8'));
function walk(dir, prefix = '') {
  return fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => {
    const rel = path.posix.join(prefix, e.name);
    if (e.name === '.git') return [];
    if (e.isSymbolicLink()) throw Error('Unexpected symbolic link: ' + rel);
    return e.isDirectory() ? walk(path.join(dir,e.name),rel) : [rel];
  });
}
const files = walk(root).filter(p=>!p.startsWith('.git/'));
const privatePaths = files.filter(p => /(^|\/)(node_modules|\.tools|\.gradle|\.openai|\.obsidian)(\/|$)|(^|\/)local\.properties$|\.(keystore|jks|pem)$|(^|\/)\.env(?:\.|$)/i.test(p));
assert.equal(privatePaths.length, 0, 'Private or local configuration count=' + privatePaths.length + '; first paths=' + JSON.stringify(privatePaths.slice(0,8)));
for (const note of collection.original_notes) {
  const bytes = fs.readFileSync(path.join(root,note.path));
  assert.equal(bytes.length,note.bytes,note.path + ': changed byte length');
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),note.sha256,note.path + ': changed content');
}
assert.equal(collection.original_notes.length,305);
assert.equal(collection.original_notes.filter(n=>n.path.startsWith('notes/00 Cases/')).length,221);
assert.equal(collection.original_notes.filter(n=>n.path.startsWith('notes/01 Architect/')).length,84);
assert.equal(collection.categories.length,12);
assert.equal(collection.categories.reduce((sum,c)=>sum+c.cases,0),221);
const sensitive = [];
const missingLinks = [];
const secretPatterns = [/(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}/,/github_pat_[A-Za-z0-9_]{50,}/,/sk-[A-Za-z0-9_-]{24,}/,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/];
for (const rel of files) {
  if (!/\.(md|html|json|webmanifest|js|cjs|mjs|css|xml|gradle|properties|ps1|yml|yaml|txt)$/i.test(rel)) continue;
  const content = fs.readFileSync(path.join(root,rel),'utf8');
  if (secretPatterns.some(pattern=>pattern.test(content))) sensitive.push({path:rel,type:'credential-pattern'});
  if (/[A-Z]:[\\/]Users[\\/][^\\/]+[\\/]/i.test(content)) sensitive.push({path:rel,type:'machine-user-path'});
  if (/\.openai[\\/]hosting\.json|appgprj_[A-Za-z0-9]+|appgdep_[A-Za-z0-9]+/.test(content)) sensitive.push({path:rel,type:'private-hosting-metadata'});
  if (rel.endsWith('.md')) {
    for (const match of content.matchAll(/\]\(([^\n]+?)\)/g)) {
      let target = match[1].replace(/^<|>$/g,'').split(' "')[0];
      if (/^[a-z][a-z\d+.-]*:|^#|^\/\//i.test(target)) continue;
      target = target.split('#')[0];
      if (!target) continue;
      try { target = decodeURIComponent(target); } catch { missingLinks.push({path:rel,target:'invalid URI encoding'}); continue; }
      if (!fs.existsSync(path.resolve(root,path.posix.dirname(rel),target))) missingLinks.push({path:rel,target});
    }
  }
}
assert.deepEqual(sensitive, [], 'Publication scan findings: ' + JSON.stringify(sensitive));
assert.deepEqual(missingLinks, [], 'Broken local Markdown links: ' + JSON.stringify(missingLinks));
for (const rel of ['downloads/html/archcase.html','downloads/html/archcase-offline.html','web/dist/index.html','android/source/archcase-orange-glass.html']) {
  const text=fs.readFileSync(path.join(root,rel),'utf8');
  const data=JSON.parse(text.match(/<script id="archcase-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(data.cases.length,221,rel);
  assert.equal(data.categories.length,12,rel);
  for (const item of data.cases) {
    const link=new URL(item.url);
    assert.equal(link.origin,'https://github.com',item.name);
    const prefix='/guopuxin09-afk/ArchCase/blob/main/';
    assert.ok(link.pathname.startsWith(prefix),item.name);
    const file=decodeURIComponent(link.pathname.slice(prefix.length));
    assert.ok(fs.existsSync(path.join(root,file)),item.name+': missing public case target');
  }
}
const apkPath=path.join(root,'android/apk/archcase-debug.apk');
const apkHash=crypto.createHash('sha256').update(fs.readFileSync(apkPath)).digest('hex');
assert.equal(fs.readFileSync(apkPath+'.sha256','utf8').trim().split(/\s+/)[0],apkHash);
console.log(JSON.stringify({original_notes_verified:305,case_notes:221,architect_directory_notes:84,categories:12,public_detail_targets:221,local_markdown_links:'passed',private_config_and_credential_patterns:'no matches',apk_sha256:apkHash,total_files:files.length},null,2));
