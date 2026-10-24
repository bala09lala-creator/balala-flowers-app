// Каталог берётся из магазина Tilda на balala-flowers.ru (см. src/server/tilda.ts).

export type Product = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  images: string[];
  // Короткое описание из Tilda (состав или срок изготовления)
  summary: string;
  description: string;
  mark?: string;
  categories: string[];
  // Страница товара на сайте
  url?: string;
};

export type Category = { id: string; title: string; tildaPartUid: string };

// Разделы магазина Tilda. Если в Tilda появится новый раздел — добавьте его сюда
// (uid раздела видно в коде страницы: storepart:'…').
export const CATEGORIES: Category[] = [
  { id: 'avtorskie', title: 'Авторские', tildaPartUid: '686835000102' },
  { id: 'rozy', title: 'Розы', tildaPartUid: '949360745572' },
  { id: 'tyulpany', title: 'Тюльпаны', tildaPartUid: '143598467862' },
  { id: 'piony', title: 'Пионы', tildaPartUid: '702034804322' },
  { id: 'sbornye', title: 'Сборные', tildaPartUid: '590842834102' },
  { id: 'gortenzii', title: 'Гортензии', tildaPartUid: '643484952692' },
  { id: 'hrizantemy', title: 'Хризантемы', tildaPartUid: '541094095562' },
  { id: 'alstromerii', title: 'Альстромерии', tildaPartUid: '229201090552' },
  { id: 'gipsofila', title: 'Гипсофила', tildaPartUid: '831916283022' },
  { id: 'diantus', title: 'Диантус', tildaPartUid: '710511333832' },
  { id: 'eustoma', title: 'Эустома', tildaPartUid: '173119605722' },
  { id: 'ekzotika', title: 'Экзотика', tildaPartUid: '923286954712' },
  { id: 'korziny', title: 'Корзины', tildaPartUid: '300352238252' },
  { id: 'svadebnye', title: 'Свадебные', tildaPartUid: '944738173212' },
  { id: 'rasteniya', title: 'Растения в горшках', tildaPartUid: '965168726942' },
  { id: 'sladkie', title: 'Сладкие подарки', tildaPartUid: '768527977392' },
  { id: 'shary', title: 'Шары', tildaPartUid: '640445770992' },
  { id: 'igrushki', title: 'Игрушки', tildaPartUid: '421704324542' },
  { id: 'otkrytki', title: 'Открытки', tildaPartUid: '167007150242' },
  { id: 'dopolnitelno', title: 'Дополнительно', tildaPartUid: '740266445362' },
];

export const PRICE_RANGES = [
  { id: 'all', title: 'Любая цена', min: 0, max: Infinity },
  { id: 'to3', title: 'до 3 000', min: 0, max: 3000 },
  { id: '3-5', title: '3 000 – 5 000', min: 3000, max: 5000 },
  { id: '5-15', title: '5 000 – 15 000', min: 5000, max: 15000 },
  { id: '15-25', title: '15 000 – 25 000', min: 15000, max: 25000 },
  { id: '25+', title: 'от 25 000', min: 25000, max: Infinity },
];

// Цветочные разделы — к ним идут подарки.
export const FLOWER_CATEGORIES = [
  'avtorskie', 'rozy', 'tyulpany', 'piony', 'sbornye', 'gortenzii', 'hrizantemy', 'alstromerii',
  'gipsofila', 'diantus', 'eustoma', 'ekzotika', 'korziny', 'svadebnye',
];

// Бесплатные подарки из раздела «Бонусы клиентам» в Tilda (товары с ценой 0).
// Любой другой товар с ценой 0 — ошибка на сайте, в приложении его нет.
export const GIFTS: { productId: string; name: string; forCategories: string[] }[] = [
  {
    productId: '188375525982',
    name: 'Инструкция по уходу за цветами Balala',
    forCategories: [...FLOWER_CATEGORIES, 'rasteniya'],
  },
  {
    productId: '741255691892',
    name: 'Лекарство для продления жизни цветов',
    forCategories: FLOWER_CATEGORIES,
  },
  { productId: '614564489592', name: 'Сумка-переноска для свадебного букета', forCategories: ['svadebnye'] },
];

export const GIFT_IDS = new Set(GIFTS.map((g) => g.productId));

// Подарки, положенные к товарам в корзине.
export function giftsFor(products: Pick<Product, 'categories'>[]): { productId: string; name: string }[] {
  return GIFTS.filter((g) => products.some((p) => p.categories.some((c) => g.forCategories.includes(c)))).map(
    ({ productId, name }) => ({ productId, name }),
  );
}

export type CatalogResponse = { products: Product[]; gifts: Product[]; updatedAt: string };

// Миниатюра с CDN Tilda — в разы легче оригинала.
export function thumbnail(url: string, width = 400): string {
  const m = url.match(/^https:\/\/static\.tildacdn\.com\/(.+)\/([^/]+)$/);
  return m ? `https://thb.tildacdn.com/${m[1]}/-/resize/${width}x/${m[2]}` : url;
}
