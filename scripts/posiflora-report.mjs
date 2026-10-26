// Ежедневная проверка продаж в Posiflora: у каждого заказа должны быть телефон клиента и источник.
// Запуск: POSIFLORA_URL=https://<магазин>.posiflora.com POSIFLORA_USERNAME=... POSIFLORA_PASSWORD=... \
//   node scripts/posiflora-report.mjs [ГГГГ-ММ-ДД] [--telegram]
// Без даты — сегодня по московскому времени. С --telegram отчёт уходит в чаты из TELEGRAM_CHAT_ID.
const TZ_OFFSET = '+03:00';

const base = process.env.POSIFLORA_URL?.trim().replace(/\/+$/, '').replace(/\/api$/, '');
const username = process.env.POSIFLORA_USERNAME?.trim();
const password = process.env.POSIFLORA_PASSWORD;
if (!base || !username || !password) {
  console.error('Задайте POSIFLORA_URL, POSIFLORA_USERNAME и POSIFLORA_PASSWORD');
  process.exit(1);
}

const args = process.argv.slice(2);
const sendTelegram = args.includes('--telegram');
const day = args.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a)) ?? new Date(Date.now() + 3 * 3600e3).toISOString().slice(0, 10);

const JSONAPI = 'application/vnd.api+json';
let token;

async function api(path, init = {}) {
  const res = await fetch(`${base}/api${path}`, {
    ...init,
    headers: { Accept: JSONAPI, 'Content-Type': JSONAPI, ...(token && { Authorization: `Bearer ${token}` }) },
  });
  if (!res.ok) throw new Error(`Posiflora ${res.status} ${path}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

const session = await api('/v1/sessions', {
  method: 'POST',
  body: JSON.stringify({ data: { type: 'sessions', attributes: { username, password } } }),
});
token = session.data?.attributes?.accessToken;
if (!token) throw new Error('Posiflora не вернула accessToken — проверьте логин и пароль');

// Справочники и связанные записи: из included, а чего нет — догружаем по id
const included = new Map();
const key = (r) => `${r.type}:${r.id}`;
const remember = (list) => list?.forEach((r) => included.set(key(r), r));

const orders = [];
for (let page = 1; ; page++) {
  const q = new URLSearchParams({
    'filter[createdAt][from]': `${day}T00:00:00${TZ_OFFSET}`,
    'filter[createdAt][to]': `${day}T23:59:59${TZ_OFFSET}`,
    include: 'customer,source,florist',
    'page[number]': String(page),
    'page[size]': '100',
  });
  const res = await api(`/v1/orders?${q}`);
  orders.push(...res.data);
  remember(res.included);
  if (res.data.length < 100 || !res.links?.next) break;
}

const sources = await api('/v1/order-sources');
remember(sources.data);

async function related(rel, path) {
  const ref = rel?.data;
  if (!ref) return null;
  if (!included.has(key(ref))) {
    try {
      remember([(await api(`${path}/${ref.id}`)).data]);
    } catch {
      return { id: ref.id, attributes: {} };
    }
  }
  return included.get(key(ref));
}

const rows = [];
for (const o of orders) {
  if (o.attributes.status === 'canceled') continue;
  const rel = o.relationships ?? {};
  const customer = await related(rel.customer, '/v1/customers');
  const source = await related(rel.source, '/v1/order-sources');
  const florist = await related(rel.florist, '/v1/worker');
  const phone = customer?.attributes?.phone?.trim();
  const problems = [];
  if (!customer) problems.push('нет клиента');
  else if (!phone || phone.replace(/\D/g, '').length < 10) problems.push('нет телефона клиента');
  if (!source) problems.push('нет источника');
  rows.push({
    no: o.attributes.docNo ?? o.id,
    sum: o.attributes.totalAmount,
    customer: customer?.attributes?.title ?? '—',
    phone: phone || '—',
    source: source?.attributes?.title ?? '—',
    florist: [florist?.attributes?.firstName, florist?.attributes?.lastName].filter(Boolean).join(' ') || '—',
    problems,
  });
}

const bad = rows.filter((r) => r.problems.length);
const lines = [`Продажи за ${day}: ${rows.length}, без телефона или источника: ${bad.length}`];
for (const r of bad) {
  lines.push(`№${r.no} · ${r.sum} ₽ · ${r.customer} · ${r.phone} · ${r.source} · флорист: ${r.florist} — ${r.problems.join(', ')}`);
}
if (rows.length && !bad.length) lines.push('Всё заполнено ✅');
const report = lines.join('\n');
console.log(report);
console.table(rows.map(({ problems, ...r }) => ({ ...r, ok: problems.length ? '❌' : '✅' })));

if (sendTelegram) {
  const tg = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chats = (process.env.TELEGRAM_CHAT_ID ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!tg || !chats.length) {
    console.error('Для --telegram задайте TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID');
    process.exit(1);
  }
  for (const chat_id of chats) {
    const res = await fetch(`https://api.telegram.org/bot${tg}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id, text: report }),
    });
    if (!res.ok) console.error(`Telegram ${chat_id}: ${res.status} ${await res.text()}`);
  }
}
