export type Category = 'all' | 'bouquets' | 'roses' | 'boxes' | 'plants';

export type Product = {
  id: string;
  name: string;
  price: number;
  category: Exclude<Category, 'all'>;
  description: string;
  composition: string;
  // Пока фото нет — показываем эмодзи на цветном фоне.
  // Когда появятся фотографии, укажите ссылку в поле image.
  emoji: string;
  tint: string;
  image?: string;
  popular?: boolean;
};

export const CATEGORIES: { id: Category; title: string }[] = [
  { id: 'all', title: 'Все' },
  { id: 'bouquets', title: 'Букеты' },
  { id: 'roses', title: 'Розы' },
  { id: 'boxes', title: 'В коробке' },
  { id: 'plants', title: 'Растения' },
];

export const PRODUCTS: Product[] = [
  {
    id: 'spring-mood',
    name: 'Весеннее настроение',
    price: 3200,
    category: 'bouquets',
    description: 'Нежный сборный букет в пастельных тонах. Отличный подарок без повода.',
    composition: 'Тюльпаны, кустовая роза, эвкалипт, упаковка',
    emoji: '💐',
    tint: '#FDE2EA',
    popular: true,
  },
  {
    id: 'red-roses-25',
    name: '25 красных роз',
    price: 5900,
    category: 'roses',
    description: 'Классика, которая всегда работает. Розы высотой 60 см.',
    composition: 'Роза Red Naomi — 25 шт., лента',
    emoji: '🌹',
    tint: '#FAD4D8',
    popular: true,
  },
  {
    id: 'white-roses-15',
    name: '15 белых роз',
    price: 3900,
    category: 'roses',
    description: 'Элегантный монобукет из белых роз.',
    composition: 'Роза Playa Blanca — 15 шт., упаковка',
    emoji: '🤍',
    tint: '#F3F1EE',
  },
  {
    id: 'tulips-box',
    name: 'Тюльпаны в коробке',
    price: 2800,
    category: 'boxes',
    description: 'Яркая шляпная коробка с тюльпанами — стоит долго и удобно дарить.',
    composition: 'Тюльпаны — 21 шт., шляпная коробка, флористическая губка',
    emoji: '🌷',
    tint: '#FFE4D6',
    popular: true,
  },
  {
    id: 'peony-box',
    name: 'Пионы в коробке',
    price: 6500,
    category: 'boxes',
    description: 'Пышные пионовидные розы и пионы в коробке.',
    composition: 'Пионы, пионовидная роза, гипсофила, коробка',
    emoji: '🌸',
    tint: '#FCE1F0',
  },
  {
    id: 'sunflowers',
    name: 'Солнечный',
    price: 2500,
    category: 'bouquets',
    description: 'Подсолнухи и полевые цветы — заряд летнего настроения.',
    composition: 'Подсолнухи, ромашки, зелень, крафт',
    emoji: '🌻',
    tint: '#FFF1C9',
  },
  {
    id: 'orchid',
    name: 'Орхидея фаленопсис',
    price: 3400,
    category: 'plants',
    description: 'Живое растение в керамическом горшке. Цветёт несколько месяцев.',
    composition: 'Фаленопсис, 2 цветоноса, кашпо',
    emoji: '🪷',
    tint: '#EEE3FA',
  },
  {
    id: 'succulents',
    name: 'Сад суккулентов',
    price: 1900,
    category: 'plants',
    description: 'Композиция из суккулентов, не требующая сложного ухода.',
    composition: 'Эхеверия, хавортия, седум, декоративный грунт',
    emoji: '🌵',
    tint: '#E1F2E3',
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
