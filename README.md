# Balala — мобильное приложение цветочного магазина

Приложение для iOS и Android на [Expo](https://expo.dev) (React Native + TypeScript).

![Экраны](docs/screens.png)

## Что умеет

- **Каталог из Tilda**: все товары с сайта [balala-flowers.ru](https://balala-flowers.ru) — фото, цены,
  старые цены, описания, разделы. Меняете товар в Tilda — через 10 минут он меняется в приложении.
- **Фильтры**: поиск, разделы (розы, пионы, авторские, корзины…) и цена, как на сайте.
- **Карточка товара**: галерея фото, описание, добавление в корзину.
- **Оформление заказа** как на сайте: доставка по Черкесску (250 ₽, бесплатно от 7 000 ₽),
  за пределы Черкесска (всегда платно, цена по населённому пункту — `src/data/settlements.ts`)
  или самовывоз, получатель,
  адрес с подъездом и этажом, дата и время, записка, фото букета перед отправкой в WhatsApp/Telegram.
- **Оплата** картой онлайн через ЮKassa (скидка на букеты: 3% до 5 000 ₽, 5% дороже — `src/utils/discount.ts`)
  или при получении.
- **Заказы приходят в Telegram**, об онлайн-оплате тоже приходит уведомление.
- **Контакты**: телефон, WhatsApp, Telegram, Instagram, ВКонтакте, часы работы.

Дизайн и фирменный стиль — по сайту [balala-flowers-revolution.ru](https://balala-flowers-revolution.ru):
бордовый, кремовый и зелёный, шрифты Playfair Display и Inter, логотип-орнамент и ковёр на главной.

## Запуск

```bash
npm install
npx expo start
```

Отсканируйте QR-код приложением **Expo Go** на телефоне — приложение откроется сразу.
`npx expo start --web` открывает его в браузере.

## Как настроить под свой магазин

| Что | Где |
| --- | --- |
| Товары, цены, фото | в Tilda, как обычно |
| Телефон, адрес, часы, стоимость доставки | `src/config/shop.ts` |
| Разделы каталога (если в Tilda появился новый) | `src/data/catalog.ts` |
| Цвета и шрифты | `src/theme.ts` |
| Название, иконка, идентификатор приложения | `app.json`, `assets/` |

## Как устроены заказы и оплата

```
Tilda (каталог) ──► сервер (src/app/api, EAS Hosting) ──► приложение
Приложение ──► сервер ──► Telegram: «Новый заказ №…»
                     │
                     └─► ЮKassa: платёж ──► покупатель платит ──► уведомление ──► Telegram: «✅ оплачен»
```

- Приложение отправляет на сервер только состав заказа. Сервер сам берёт актуальные цены из Tilda
  и отправляет заказ в Telegram.
- При онлайн-оплате сервер создаёт платёж в ЮKassa. Покупатель платит на странице ЮKassa
  (карта, СБП, SberPay) и возвращается в приложение.
- Ключи Telegram и ЮKassa хранятся **только на сервере** и в приложение не попадают.

### 1. Telegram-бот

Заказы присылает бот [@Balala_app_bot](https://t.me/Balala_app_bot).

1. Возьмите токен бота у [@BotFather](https://t.me/BotFather): `/mybots` → `@Balala_app_bot` → «API Token».
   Токен выглядит как `123456789:AAH…` — его нужно скопировать целиком, вместе с частью до двоеточия.
2. Создайте группу для заказов (например, «Заказы Balala»), добавьте в неё @Balala_app_bot и напишите любое сообщение.
3. Узнайте id группы: `TELEGRAM_BOT_TOKEN=<токен> npm run telegram:chat-id` — скрипт напечатает
   `TELEGRAM_CHAT_ID=-100…`. Или откройте `https://api.telegram.org/bot<ТОКЕН>/getUpdates` и найдите `"chat":{"id":…}`.

Под каждым заказом бот показывает кнопки «WhatsApp» и «Telegram», чтобы написать заказчику в одно касание.

**Несколько получателей.** В `TELEGRAM_CHAT_ID` можно указать несколько id через запятую — например,
группу и рабочий аккаунт: `-1001234567890,123456789`. Чтобы бот мог писать в личный аккаунт,
с этого аккаунта нужно один раз открыть [@Balala_app_bot](https://t.me/Balala_app_bot) и нажать «Старт». Если какой-то чат недоступен,
заказ всё равно уйдёт в остальные.

### 2. ЮKassa

1. В [личном кабинете](https://yookassa.ru/my) → «Интеграция» → «Ключи API» возьмите `shopId`
   и секретный ключ. Для проверки сначала используйте тестовый магазин.
2. В разделе «Интеграция» → «HTTP-уведомления» укажите адрес
   `https://<ваш-домен>/api/yookassa-webhook` и включите события `payment.succeeded` и `payment.canceled`.
3. Если подключены «Чеки от ЮKassa» или онлайн-касса, поставьте `YOOKASSA_SEND_RECEIPT=true`
   и выберите ставку НДС в `YOOKASSA_VAT_CODE`.

### 3. Переменные окружения

Скопируйте `.env.example` в `.env` и заполните (файл `.env` не попадает в git).
При разработке `npx expo start` поднимает и приложение, и сервер.

### 4. Публикация сервера

Каждую переменную из `.env.example` добавьте в окружение production (видимость `sensitive`:
значение скрыто в логах; тип `secret` в EAS Hosting не работает):

```bash
npx eas-cli@latest env:set --name TELEGRAM_BOT_TOKEN --value '<токен>' --environment production --visibility sensitive
npx eas-cli@latest env:set --name TELEGRAM_CHAT_ID --value '<id через запятую>' --environment production --visibility sensitive
# …и так же YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY и остальные

npx expo export --platform web
npx eas-cli@latest deploy --prod --environment production
```

То же можно сделать на [expo.dev](https://expo.dev): проект → Project settings → Environment variables →
Add Variables. После любого изменения переменных сервер нужно опубликовать заново (две последние команды).

Полученный адрес (например, `https://balala-flowers.expo.app`) укажите в `EXPO_PUBLIC_API_URL`
перед сборкой приложения и в настройках уведомлений ЮKassa.

## Публикация в App Store и Google Play

Через [EAS](https://docs.expo.dev/eas/): `npx eas-cli@latest build` и `npx eas-cli@latest submit`.
Нужны аккаунты Apple Developer (99 $/год) и Google Play Console (25 $ разово).
