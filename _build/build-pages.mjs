// Assembles the hand-written pages (pages/*.html) with the generated header + footer into root-level preview files.
//   node _build/build-pages.mjs
// pages/<name>.html is the Elementor block for the page body; <name>.html at the root is the full preview.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const TITLES = { subscribers: 'Venus Flower Club – מנויי פרחים | ונוס קיסריה', product: 'זר חרציות ענק | ונוס קיסריה' };

const index = read('index.html');
const head = index.slice(0, index.indexOf('<body')).replace(/<title>.*?<\/title>/, '<title>__TITLE__</title>');
const header = read('sections/00-header.html');
const footer = read('sections/99-footer.html');

for (const f of fs.readdirSync(path.join(ROOT, 'pages')).filter((n) => n.endsWith('.html'))) {
  const name = f.replace(/\.html$/, '');
  const out = [head.replace('__TITLE__', TITLES[name] || name), '<body class="vns-body">', header, read('pages/' + f), footer, '<script src="./venus.js"></script>', '</body>', '</html>', ''].join('\n');
  fs.writeFileSync(path.join(ROOT, name + '.html'), out);
  console.log('Built ' + name + '.html');
}
