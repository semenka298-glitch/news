import http from 'node:http';
import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SOURCES, CATEGORIES } from './sources.js';
import { fetchFeed, categorize, dedupe } from './feed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const REFRESH_MS = 10 * 60 * 1000;
const MAX_AGE = 48 * 3600 * 1000;

let state = { news: [], updatedAt: null, sources: SOURCES.map((s) => ({ id: s.id, name: s.name, ok: null, count: 0, error: null })), rawCount: 0 };
let refreshing = false;

async function refresh() {
  if (refreshing) return;
  refreshing = true;
  const t0 = Date.now();
  const status = [];
  const all = [];
  const queue = [...SOURCES];
  const worker = async () => { for (let src; (src = queue.shift());) await load(src); };
  const load = async (src) => {
    try {
      let items;
      try { items = await fetchFeed(src); } catch { items = await fetchFeed(src, 25000); } // одна повторная попытка
      for (const it of items) {
        if (Date.now() - it.ts > MAX_AGE || it.ts > Date.now() + 3600e3) continue;
        all.push({ ...it, srcId: src.id, srcName: src.name, category: categorize(it, src) });
      }
      status.push({ id: src.id, name: src.name, ok: true, count: items.length, error: null });
    } catch (e) {
      status.push({ id: src.id, name: src.name, ok: false, count: 0, error: e.cause?.code || e.message });
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
  const news = dedupe(all);
  const order = new Map(SOURCES.map((s, i) => [s.id, i]));
  status.sort((a, b) => order.get(a.id) - order.get(b.id));
  if (news.length) state = { news, updatedAt: Date.now(), sources: status, rawCount: all.length };
  else state.sources = status;
  refreshing = false;
  const ok = status.filter((s) => s.ok).length;
  console.log(`[${new Date().toLocaleTimeString()}] источников: ${ok}/${SOURCES.length}, записей: ${all.length}, уникальных: ${news.length}, ${Date.now() - t0} мс`);
}

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const json = (obj) => { res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(obj)); };

  if (url.pathname === '/api/news') {
    const cat = url.searchParams.get('category');
    const q = (url.searchParams.get('q') || '').toLowerCase().trim();
    const limit = Math.min(+url.searchParams.get('limit') || 60, 200);
    const offset = +url.searchParams.get('offset') || 0;
    let list = state.news;
    const counts = {};
    for (const n of list) counts[n.category] = (counts[n.category] || 0) + 1;
    if (q) list = list.filter((n) => (n.title + ' ' + n.desc).toLowerCase().includes(q));
    if (cat && cat !== 'all') list = list.filter((n) => n.category === cat);
    return json({ total: list.length, items: list.slice(offset, offset + limit), counts, categories: CATEGORIES, updatedAt: state.updatedAt, refreshing });
  }
  if (url.pathname === '/news.json') return json({ updatedAt: state.updatedAt, categories: CATEGORIES, rawCount: state.rawCount, sources: state.sources, news: state.news });
  if (url.pathname === '/api/sources') return json({ rawCount: state.rawCount, unique: state.news.length, sources: state.sources });
  if (url.pathname === '/api/refresh' && req.method === 'POST') { refresh(); return json({ started: true }); }

  const file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  const full = path.join(__dirname, 'public', path.normalize(file));
  if (!full.startsWith(path.join(__dirname, 'public'))) { res.writeHead(403); return res.end(); }
  try {
    const data = await fs.readFile(full);
    res.writeHead(200, { 'content-type': MIME[path.extname(full)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404); res.end('Not found');
  }
});

process.on('uncaughtException', (e) => console.error('uncaught:', e));
process.on('unhandledRejection', (e) => console.error('unhandled:', e));

server.listen(PORT, () => console.log(`Новости: http://localhost:${PORT}`));
refresh();
setInterval(refresh, REFRESH_MS);
