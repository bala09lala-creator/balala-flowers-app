import { CATEGORIES, Product } from '../data/catalog';

// Общий раздел «Каталог» на balala-flowers.ru — в нём все товары магазина.
const CATALOG_PART_UID = '250985871402';
const CATALOG_REC_ID = '1100713786';
const SITE = 'https://balala-flowers.ru';
const CACHE_MS = 10 * 60 * 1000;

type TildaProduct = {
  uid: string;
  title: string;
  price: string;
  priceold: string;
  text: string;
  descr: string;
  mark: string;
  gallery: string;
  partuids: string;
  url: string;
};

type TildaResponse = { products: TildaProduct[]; nextslice?: number };

const partToCategory = new Map(CATEGORIES.map((c) => [c.tildaPartUid, c.id]));

export function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&amp;/g, '&')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function parseJson<T>(value: string, fallback: T): T {
  try {
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function toNumber(value: string): number {
  return Number(String(value ?? '').replace(',', '.')) || 0;
}

export function normalize(p: TildaProduct): Product | null {
  const price = toNumber(p.price);
  // Товары без цены в Tilda показываются «по запросу» — в приложении их не продаём.
  if (price <= 0) return null;
  const oldPrice = toNumber(p.priceold);
  const images = parseJson<{ img: string }[]>(p.gallery, [])
    .map((g) => g.img)
    .filter(Boolean);
  const partUids = parseJson<(string | number)[]>(p.partuids, []).map(String);
  // Убираем SEO-текст, который Tilda добавляет к каждому описанию.
  const description = htmlToText(p.text).split(/В ассортименте нашего магазина/)[0].trim();

  return {
    id: String(p.uid),
    name: htmlToText(p.title),
    price,
    oldPrice: oldPrice > price ? oldPrice : undefined,
    images,
    summary: htmlToText(p.descr),
    description,
    mark: p.mark || undefined,
    categories: partUids.flatMap((uid) => partToCategory.get(uid) ?? []),
    url: p.url || undefined,
  };
}

async function fetchSlice(slice: number): Promise<TildaResponse> {
  const url = new URL('https://store.tildaapi.com/api/getproductslist/');
  url.search = new URLSearchParams({
    storepartuid: CATALOG_PART_UID,
    recid: CATALOG_REC_ID,
    c: String(Date.now()),
    getparts: 'true',
    getoptions: 'true',
    slice: String(slice),
    size: '500',
  }).toString();
  const res = await fetch(url, { headers: { Referer: `${SITE}/katalog` } });
  if (!res.ok) throw new Error(`Tilda error ${res.status}`);
  return res.json() as Promise<TildaResponse>;
}

let cache: { at: number; products: Product[] } | null = null;

export async function getCatalog(): Promise<Product[]> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.products;

  const raw: TildaProduct[] = [];
  let slice: number | undefined = 1;
  // Ограничение на случай ошибки в ответе Tilda.
  for (let i = 0; slice && i < 20; i++) {
    const data: TildaResponse = await fetchSlice(slice);
    raw.push(...data.products);
    slice = data.nextslice;
  }

  const products = raw.flatMap((p) => normalize(p) ?? []);
  cache = { at: Date.now(), products };
  return products;
}

export async function getProductsById(): Promise<Map<string, Product>> {
  return new Map((await getCatalog()).map((p) => [p.id, p]));
}
