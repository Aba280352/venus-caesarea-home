// Usage: node make-pdf.mjs <html-file> <out-pdf> [width=1440]
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const [, , htmlFile, outPdf, w = '1440'] = process.argv;
const WIDTH = Number(w);
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 9340 + Math.floor(Math.random() * 50);
const profile = process.env.TEMP + '/venus-pdf-profile-' + port;
mkdirSync(profile, { recursive: true });

const proc = spawn(chrome, [
  '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  '--hide-scrollbars', '--no-first-run', '--disable-gpu', 'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let info;
for (let i = 0; i < 60; i++) {
  try { info = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (info.length) break; } catch {}
  await sleep(250);
}
const target = info.find((t) => t.type === 'page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
const send = (method, params = {}) => new Promise((res, rej) => {
  const i = ++id; pending.set(i, (d) => (d.error ? rej(new Error(method + ': ' + JSON.stringify(d.error))) : res(d.result)));
  ws.send(JSON.stringify({ id: i, method, params }));
});
const evalJs = async (expr) => (await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result.value;

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: 900, deviceScaleFactor: 1, mobile: false });
await send('Emulation.setEmulatedMedia', { media: 'screen' });
await send('Page.navigate', { url: pathToFileURL(htmlFile).href });
await sleep(2500);
await evalJs('document.fonts.ready.then(()=>true)');

// lazy images (e.g. the related-products carousel) never load off-screen: force eager and wait for all
const imgs = await evalJs(`(async()=>{const list=[...document.images];list.forEach(i=>{i.loading='eager';i.decoding='sync';if(i.dataset&&i.dataset.src&&!i.getAttribute('src'))i.src=i.dataset.src;});await Promise.all(list.map(i=>i.complete?1:new Promise(r=>{i.onload=i.onerror=r;setTimeout(r,8000)})));return list.map(i=>[i.complete&&i.naturalWidth>0,i.getAttribute('src')]).filter(x=>!x[0]);})()`);
console.log('images not loaded:', JSON.stringify(imgs));

// scroll through the page so lazy images / reveal-on-scroll content get rendered
await evalJs(`(async()=>{const h=document.documentElement.scrollHeight;for(let y=0;y<=h;y+=500){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,120));}window.scrollTo(0,0);await new Promise(r=>setTimeout(r,500));return true})()`);

// hide fixed floating UI (sticky order bar etc.) that would stamp over the content; keep the header
const hidden = await evalJs(`(()=>{const out=[];document.querySelectorAll('body *').forEach(el=>{const cs=getComputedStyle(el);if(cs.position==='fixed'&&!el.closest('header')&&!el.matches('header,.vns-header,[class*=header]')){out.push(el.className||el.tagName);el.style.setProperty('display','none','important');}});return out;})()`);
console.log('hidden fixed elements:', hidden);

// carousel tracks are moved with transform/animation, which Chrome's print path paints blank: freeze them
await evalJs(`document.querySelectorAll('.pcar-track').forEach(t=>{t.style.setProperty('transform','none','important');t.style.setProperty('animation','none','important');t.style.setProperty('transition','none','important');t.style.setProperty('will-change','auto','important');});document.querySelectorAll('.pcar-track').forEach((t,ti)=>{if(ti>0)t.style.setProperty('display','none','important');t.style.setProperty('width','100%','important');t.style.setProperty('position','static','important');[...t.children].forEach((c,ci)=>{if(ci>=4)c.style.setProperty('display','none','important');else{c.style.setProperty('flex','1 1 0','important');c.style.setProperty('width','auto','important');c.style.setProperty('min-width','0','important');}});});document.querySelectorAll('.pcar').forEach(p=>p.style.setProperty('overflow','visible','important'));document.querySelectorAll('.pcar-arrow').forEach(a=>a.style.setProperty('display','none','important'));document.querySelectorAll('.rec-img img').forEach(i=>{i.style.setProperty('transition','none','important');i.style.setProperty('will-change','auto','important');});true`);
if (process.env.DEBUG_SEL) {
  console.log(JSON.stringify(await evalJs(`(()=>{const el=document.querySelector(${JSON.stringify(process.env.DEBUG_SEL)});if(!el)return 'none';const out=[];let n=el;while(n&&n!==document.body){const cs=getComputedStyle(n);out.push([n.tagName+'.'+n.className,cs.opacity,cs.visibility,cs.display,cs.transform,cs.overflow,Math.round(n.getBoundingClientRect().width)+'x'+Math.round(n.getBoundingClientRect().height),cs.contentVisibility]);n=n.parentElement;}return out;})()`), null, 1));
}
const height = await evalJs(`Math.ceil(Math.max(document.documentElement.scrollHeight, document.body.scrollHeight))`);
const overflowX = await evalJs(`document.documentElement.scrollWidth - document.documentElement.clientWidth`);
console.log('page height px:', height, 'overflow-x:', overflowX);

const pdf = await send('Page.printToPDF', {
  printBackground: true, preferCSSPageSize: false, marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0,
  paperWidth: WIDTH / 96, paperHeight: (height + 2) / 96, pageRanges: '', scale: 1,
});
writeFileSync(outPdf, Buffer.from(pdf.data, 'base64'));
console.log('wrote', outPdf);
ws.close(); proc.kill();
