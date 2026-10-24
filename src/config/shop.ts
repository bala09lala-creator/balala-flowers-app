// Данные магазина (с сайтов balala-flowers.ru и balala-flowers-revolution.ru).
export const SHOP = {
  name: 'Balala',
  slogan: 'Доставка цветов в Черкесске',
  tagline: 'Цвети, душа моя',
  city: 'Черкесск',
  phone: '+7 905 423-32-30',
  whatsapp: '79054233230',
  telegram: 'balala_flowers_cherk',
  instagram: 'balala_flowers_cherk',
  vk: 'balala_flowers',
  address: 'г. Черкесск, ул. Горького, 2',
  addressHint: 'Напротив гимназии № 9, не заезжая во двор дома. В навигаторе ищите «Balala».',
  // Карточка магазина в Яндекс Картах
  mapsUrl: 'https://yandex.ru/maps/org/balala/151539260980/',
  hours: 'Ежедневно 9:00 — 21:00',
  holidayHours: 'В праздники до 23:00: 14 февраля, 8 марта, 24 ноября',
  // Доставка по Черкесску: платная, бесплатно от суммы заказа freeDeliveryFrom.
  deliveryPrice: 250,
  freeDeliveryFrom: 7000,
  // За пределы Черкесска доставка всегда платная. null — стоимость уточняет менеджер.
  outsideDeliveryPrice: null as number | null,
  legal: 'ИП Тамбиев Н.И., ИНН 091693479183, ОГРНИП 324090000019859',
  website: 'https://balala-flowers.ru',
};
