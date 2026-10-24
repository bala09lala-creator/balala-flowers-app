// Показывает id чатов, куда добавлен бот, — нужен для TELEGRAM_CHAT_ID.
// Запуск: TELEGRAM_BOT_TOKEN=... node scripts/telegram-chat-id.mjs
// Перед запуском напишите любое сообщение в группе с ботом.
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('Задайте TELEGRAM_BOT_TOKEN');
  process.exit(1);
}

const me = await (await fetch(`https://api.telegram.org/bot${token}/getMe`)).json();
if (!me.ok) {
  console.error('Токен не подходит:', me.description);
  process.exit(1);
}
console.log(`Бот: @${me.result.username}`);

const updates = await (await fetch(`https://api.telegram.org/bot${token}/getUpdates`)).json();
const chats = new Map();
for (const u of updates.result ?? []) {
  const chat = (u.message ?? u.my_chat_member ?? u.channel_post)?.chat;
  if (chat) chats.set(chat.id, chat.title ?? [chat.first_name, chat.last_name].filter(Boolean).join(' '));
}
if (chats.size === 0) {
  console.log('Чатов не найдено. Добавьте бота в группу, напишите там сообщение и запустите снова.');
} else {
  for (const [id, title] of chats) console.log(`TELEGRAM_CHAT_ID=${id}  — ${title}`);
}
