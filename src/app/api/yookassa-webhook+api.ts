import { formatPrice } from '../../utils/format';
import { sendTelegram } from '../../server/telegram';
import { getPayment } from '../../server/yookassa';

// Адрес для уведомлений в личном кабинете ЮKassa: https://<ваш-домен>/api/yookassa-webhook
// События: payment.succeeded и payment.canceled.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const paymentId = body?.object?.id;
  if (typeof paymentId !== 'string') {
    return Response.json({ error: 'bad request' }, { status: 400 });
  }

  try {
    // Уведомления ЮKassa не подписаны, поэтому статус перепроверяем через API.
    const payment = await getPayment(paymentId);
    const orderId = payment.metadata?.orderId ?? '—';
    const amount = formatPrice(Number(payment.amount.value));

    if (payment.status === 'succeeded') {
      await sendTelegram(`✅ <b>Заказ №${orderId} оплачен</b> — ${amount}`);
    } else if (payment.status === 'canceled') {
      await sendTelegram(`❌ Оплата заказа №${orderId} не прошла (${amount}). Свяжитесь с покупателем и отправьте реквизиты.`);
    }
    return Response.json({ ok: true });
  } catch (error) {
    console.error('Webhook failed', error);
    // Ошибка → ЮKassa повторит уведомление позже.
    return Response.json({ error: 'failed' }, { status: 500 });
  }
}
