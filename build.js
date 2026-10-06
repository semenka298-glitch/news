// Собирает новости из всех лент и пишет site/news.json + копирует страницу в site/.
// Запускается GitHub Actions по расписанию (см. .github/workflows/update.yml).
import fs from 'node:fs/promises';
import { SOURCES, CATEGORIES } from './sources.js';
import { fetchFeed, categorize, dedupe } from './feed.js';

const MAX_AGE = 48 * 3600 * 1000;
const all = [];
const status = [];
const queue = [...SOURCES];

async function load(src) {
  try {
    let items;
    try { items = await fetchFeed(src); } catch { items = await fetchFeed(src, 40000); }
    for (const it of items) {
      if (Date.now() - it.ts > MAX_AGE || it.ts > Date.now() + 3600e3) continue;
      all.push({ ...it, srcId: src.id, srcName: src.name, category: categorize(it, src) });
    }
    status.push({ name: src.name, ok: true, count: items.length });
  } catch (e) {
    status.push({ name: src.name, ok: false, error: e.cause?.code || e.message });
  }
}
await Promise.all(Array.from({ length: 6 }, async () => { for (let s; (s = queue.shift());) await load(s); }));

const news = dedupe(all).slice(0, 2000).map((n) => ({ ...n, desc: n.desc.slice(0, 220) }));
const ok = status.filter((s) => s.ok).length;
console.log(`источников: ${ok}/${SOURCES.length}, записей: ${all.length}, уникальных: ${news.length}`);
if (ok < 5 || news.length < 50) { console.error('Слишком мало данных — публикацию отменяю'); process.exit(1); }

await fs.mkdir('site', { recursive: true });
await fs.writeFile('site/news.json', JSON.stringify({ updatedAt: Date.now(), categories: CATEGORIES, rawCount: all.length, sources: status, news }));
await fs.copyFile('public/index.html', 'site/index.html');
