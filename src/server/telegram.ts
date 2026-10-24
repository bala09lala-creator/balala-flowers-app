import { requireEnv } from './env';

export function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export type TelegramButton = { text: string; url: string };

// Телефон в международном формате без «+»: 8 900… → 7900…
export function phoneDigits(phone: string): string {
  const d = phone.replace(/\D/g, '');
  return d.length === 11 && d.startsWith('8') ? `7${d.slice(1)}` : d.length === 10 ? `7${d}` : d;
}

// Кнопки, чтобы менеджер связался с заказчиком в одно касание.
export function contactButtons(phone: string): TelegramButton[] {
  const d = phoneDigits(phone);
  if (d.length < 11) return [];
  return [
    { text: '💬 WhatsApp', url: `https://wa.me/${d}` },
    { text: '✈️ Telegram', url: `https://t.me/+${d}` },
  ];
}

// TELEGRAM_CHAT_ID может содержать несколько id через запятую: группа, рабочий аккаунт и т.д.
export function chatIds(value: string): string[] {
  return value
    .split(/[,;\s]+/)
    .map((id) => id.trim())
    .filter(Boolean);
}

// Отправляет сообщение во все чаты. Ошибка — только если не доставлено никуда,
// чтобы заказ не потерялся из-за одного недоступного чата.
export async function sendTelegram(html: string, buttons: TelegramButton[] = []): Promise<void> {
  const token = requireEnv('TELEGRAM_BOT_TOKEN', process.env.TELEGRAM_BOT_TOKEN);
  const ids = chatIds(requireEnv('TELEGRAM_CHAT_ID', process.env.TELEGRAM_CHAT_ID));
  const base = process.env.TELEGRAM_API_URL ?? 'https://api.telegram.org';

  const results = await Promise.allSettled(
    ids.map(async (chatId) => {
      const res = await fetch(`${base}/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: html,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
          ...(buttons.length ? { reply_markup: { inline_keyboard: [buttons] } } : {}),
        }),
      });
      if (!res.ok) throw new Error(`Telegram error for chat ${chatId}: ${res.status} ${await res.text()}`);
    }),
  );

  const failed = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
  failed.forEach((f) => console.error(f.reason));
  if (failed.length === ids.length) throw new Error('Telegram: сообщение не доставлено ни в один чат');
}
