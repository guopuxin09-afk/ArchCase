import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../www/', import.meta.url));
const external = [];

async function inspect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) { await inspect(filename); continue; }
    if (!/\.(html|css)$/i.test(entry.name)) continue;
    const source = await readFile(filename, 'utf8');
    // Runtime fetches/API calls cannot be established by static inspection.
    const patterns = entry.name.endsWith('.html')
      ? [/<(?:script|img|iframe|audio|video|source|embed|input)\b[^>]*\bsrc\s*=\s*["']((?:https?:)?\/\/[^"']+)["']/gi,
         /<link\b[^>]*\bhref\s*=\s*["']((?:https?:)?\/\/[^"']+)["']/gi,
         /\bsrcset\s*=\s*["']([^"']*(?:https?:)?\/\/[^"']*)["']/gi]
      : [/url\(\s*["']?((?:https?:)?\/\/[^\s)'";]+)/gi,
         /@import\s*["']((?:https?:)?\/\/[^"']+)["']/gi];
    for (const pattern of patterns) {
      for (const match of source.matchAll(pattern)) external.push(`${path.relative(root, filename)}: ${match[1]}`);
    }
  }
}

await inspect(root);
if (external.length) {
  console.error('External page resources detected. Bundle them locally for offline use:\n' + external.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Offline resource check passed: no external HTML/CSS resources found. Runtime network requests still require review.');
}
