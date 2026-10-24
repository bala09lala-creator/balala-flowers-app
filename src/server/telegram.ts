import { requireEnv } from './env';

export function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function sendTelegram(html: string): Promise<void> {
  const token = requireEnv('TELEGRAM_BOT_TOKEN', process.env.TELEGRAM_BOT_TOKEN);
  const chatId = requireEnv('TELEGRAM_CHAT_ID', process.env.TELEGRAM_CHAT_ID);
  const base = process.env.TELEGRAM_API_URL ?? 'https://api.telegram.org';

  const res = await fetch(`${base}/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: html, parse_mode: 'HTML', disable_web_page_preview: true }),
  });
  if (!res.ok) {
    throw new Error(`Telegram error ${res.status}: ${await res.text()}`);
  }
}
