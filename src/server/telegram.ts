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

export async function sendTelegram(html: string, buttons: TelegramButton[] = []): Promise<void> {
  const token = requireEnv('TELEGRAM_BOT_TOKEN', process.env.TELEGRAM_BOT_TOKEN);
  const chatId = requireEnv('TELEGRAM_CHAT_ID', process.env.TELEGRAM_CHAT_ID);
  const base = process.env.TELEGRAM_API_URL ?? 'https://api.telegram.org';

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
  if (!res.ok) {
    throw new Error(`Telegram error ${res.status}: ${await res.text()}`);
  }
}
