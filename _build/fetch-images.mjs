// Downloads the product/article photos listed in image-manifest.json from the live store into assets/shop/.
// Run after build.mjs:  node _build/fetch-images.mjs   (skips files that already exist)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, 'image-manifest.json'), 'utf8'));
const todo = Object.entries(manifest).filter(([f]) => !fs.existsSync(path.join(ROOT, f)));
// drop photos that are no longer referenced
const keep = new Set(Object.keys(manifest).map((k) => path.basename(k)));
for (const name of fs.readdirSync(path.join(ROOT, 'assets', 'shop'))) if (!keep.has(name)) fs.unlinkSync(path.join(ROOT, 'assets', 'shop', name));
console.log(`${Object.keys(manifest).length} images in manifest, ${todo.length} to download`);

let done = 0, failed = [], bytes = 0;
const worker = async () => {
  for (let job; (job = todo.shift());) {
    const [file, url] = job;
    try {
      const res = await fetch(url);
      if (!res.ok || !(res.headers.get('content-type') || '').startsWith('image/')) throw new Error('HTTP ' + res.status);
      const buf = Buffer.from(await res.arrayBuffer());
      fs.mkdirSync(path.dirname(path.join(ROOT, file)), { recursive: true });
      // PNG sources are saved aside and converted to a resized JPEG below
      fs.writeFileSync(path.join(ROOT, /\.png(\?|$)/i.test(url) ? file.replace(/\.jpg$/, '.src.png') : file), buf);
      bytes += buf.length; done++;
    } catch (e) { failed.push(file + ' ← ' + url + ' (' + e.message + ')'); }
  }
};
await Promise.all(Array.from({ length: 6 }, worker));
if (done) execFileSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(import.meta.dirname, 'png2jpg.ps1'), path.join(ROOT, 'assets', 'shop')], { stdio: 'inherit' });
console.log(`downloaded ${done} (${(bytes / 1048576).toFixed(1)} MB), failed ${failed.length}`);
failed.forEach((f) => console.log('  ' + f));
