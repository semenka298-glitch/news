import { fetch, Agent } from 'undici';
import { CATEGORIES, KEYWORDS, TAG_MAP } from './sources.js';

const agent = new Agent({ connect: { timeout: 30000 } });

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', laquo: '«', raquo: '»', ndash: '–', mdash: '—', hellip: '…' };

function decodeEntities(s) {
  return s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

function clean(s = '') {
  s = s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  s = decodeEntities(s);
  s = s.replace(/<[^>]+>/g, ' ');
  s = decodeEntities(s); // двойное экранирование
  return s.replace(/\s+/g, ' ').trim();
}

function tag(block, name) {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? m[1] : '';
}

function attr(block, name, a) {
  const m = block.match(new RegExp(`<${name}\\b[^>]*?\\b${a}="([^"]+)"`, 'i'));
  return m ? decodeEntities(m[1]) : '';
}

function findImage(block) {
  let img = attr(block, 'enclosure', 'url') || attr(block, 'media:content', 'url') || attr(block, 'media:thumbnail', 'url');
  const type = attr(block, 'enclosure', 'type');
  if (img && type && !type.startsWith('image')) img = '';
  if (!img) {
    const m = decodeEntities(block.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')).match(/<img[^>]+src=["']([^"']+)["']/i);
    if (m) img = m[1];
  }
  return /^https?:\/\//.test(img) ? img : '';
}

export function parseFeed(xml) {
  const blocks = xml.match(/<(item|entry)[\s>][\s\S]*?<\/\1>/gi) || [];
  const out = [];
  for (const b of blocks) {
    const title = clean(tag(b, 'title'));
    let link = clean(tag(b, 'link')) || attr(b, 'link', 'href') || clean(tag(b, 'guid'));
    const desc = clean(tag(b, 'description') || tag(b, 'summary') || tag(b, 'content:encoded') || tag(b, 'content'));
    const dateStr = clean(tag(b, 'pubDate') || tag(b, 'published') || tag(b, 'updated') || tag(b, 'dc:date'));
    let ts = Date.parse(dateStr);
    if (!Number.isFinite(ts)) ts = Date.now();
    const tags = [...b.matchAll(/<category[^>]*>([\s\S]*?)<\/category>/gi)].map((m) => clean(m[1])).filter(Boolean);
    if (!title || !/^https?:\/\//.test(link)) continue;
    out.push({ title, link, desc: desc.slice(0, 400), ts, tags, image: findImage(b) });
  }
  return out;
}

export async function fetchFeed(src, timeoutMs = 30000) {
  const res = await fetch(src.url, {
    dispatcher: agent,
    signal: AbortSignal.timeout(timeoutMs),
    headers: { 'user-agent': 'Mozilla/5.0 (compatible; NewsAggregator/1.0)', accept: 'application/rss+xml, application/xml, text/xml, */*' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = new Uint8Array(await res.arrayBuffer());
  const head = new TextDecoder('latin1').decode(buf.slice(0, 300));
  const enc = (head.match(/encoding=["']([\w-]+)["']/i) || (res.headers.get('content-type') || '').match(/charset=([\w-]+)/i) || [])[1] || 'utf-8';
  let xml;
  try { xml = new TextDecoder(enc).decode(buf); } catch { xml = new TextDecoder('utf-8').decode(buf); }
  const items = parseFeed(xml);
  if (!items.length) throw new Error('нет записей в ленте');
  return items;
}

// ---------- Категоризация ----------
export function categorize(item, src) {
  if (src.cat) return src.cat;
  for (const t of item.tags) {
    for (const [re, cat] of TAG_MAP) if (re.test(t)) return cat;
  }
  const text = ` ${item.title} ${item.desc} `.toLowerCase();
  let best = null, bestScore = 0;
  for (const cat of CATEGORIES) {
    const words = KEYWORDS[cat];
    if (!words) continue;
    let score = 0;
    for (const w of words) {
      if (text.includes(w)) score += item.title.toLowerCase().includes(w) ? 2 : 1;
    }
    if (score > bestScore) { bestScore = score; best = cat; }
  }
  return best || 'Общество';
}

// ---------- Дедупликация ----------
const STOP = new Set(['что', 'как', 'это', 'для', 'при', 'про', 'над', 'под', 'или', 'его', 'она', 'они', 'из-за', 'после', 'чтобы', 'будет', 'были', 'стал', 'стала', 'также', 'тоже', 'уже', 'ещё', 'еще', 'нового', 'новый']);

function tokens(title) {
  const words = title.toLowerCase().replace(/ё/g, 'е').replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/);
  const set = new Set();
  for (const w of words) {
    if (w.length < 3 || STOP.has(w)) continue;
    set.add(w.length > 5 ? w.slice(0, 5) : w.length > 4 ? w.slice(0, 4) : w); // грубый стемминг: учитываем падежные окончания
  }
  return set;
}

function similarity(a, b) {
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  const minSize = Math.min(a.size, b.size);
  if (!minSize) return 0;
  const jaccard = inter / (a.size + b.size - inter);
  const overlap = inter / minSize;
  return Math.max(jaccard, overlap * 0.85); // overlap ловит случай «короткий заголовок вложен в длинный»
}

function normUrl(u) {
  try {
    const x = new URL(u);
    return (x.hostname.replace(/^www\./, '') + x.pathname.replace(/\/$/, '')).toLowerCase();
  } catch { return u; }
}

const THRESHOLD = 0.6;
const TIME_WINDOW = 48 * 3600 * 1000;

/** Объединяет повторы: возвращает уникальные новости, у каждой — список источников (`sources`). */
export function dedupe(items) {
  items = [...items].sort((a, b) => a.ts - b.ts);
  const clusters = [];
  const byUrl = new Map();
  const index = new Map(); // токен -> кластеры

  for (const it of items) {
    const key = normUrl(it.link);
    it._tok = tokens(it.title);
    let target = byUrl.get(key);

    if (!target && it._tok.size >= 3) {
      const cand = new Map();
      for (const t of it._tok) for (const c of index.get(t) || []) cand.set(c, (cand.get(c) || 0) + 1);
      let bestSim = 0;
      for (const [c, shared] of cand) {
        if (shared < 3 || Math.abs(c.ts - it.ts) > TIME_WINDOW) continue;
        if (c.srcIds.has(it.srcId)) continue; // два материала одного издания — не повтор
        const s = similarity(it._tok, c._tok);
        if (s >= THRESHOLD && s > bestSim) { bestSim = s; target = c; }
      }
    }

    if (target) {
      target.srcIds.add(it.srcId);
      target.sources.push({ id: it.srcId, name: it.srcName, link: it.link });
      if (!target.image && it.image) target.image = it.image;
      if (it.desc.length > target.desc.length) target.desc = it.desc;
      byUrl.set(key, target);
    } else {
      const c = {
        id: Buffer.from(key).toString('base64url').slice(0, 24),
        title: it.title, link: it.link, desc: it.desc, ts: it.ts, image: it.image,
        category: it.category, _tok: it._tok,
        srcIds: new Set([it.srcId]),
        sources: [{ id: it.srcId, name: it.srcName, link: it.link }],
      };
      clusters.push(c);
      byUrl.set(key, c);
      for (const t of it._tok) {
        if (!index.has(t)) index.set(t, []);
        index.get(t).push(c);
      }
    }
  }

  return clusters
    .map(({ _tok, srcIds, ...c }) => c)
    .sort((a, b) => b.ts - a.ts);
}
