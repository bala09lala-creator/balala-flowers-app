import type { PaymentStatus } from '../../../data/orders';
import { getPayment } from '../../../server/yookassa';

// Приложение спрашивает статус платежа после возврата со страницы оплаты.
export async function GET(_request: Request, { id }: Record<string, string>) {
  try {
    const payment = await getPayment(id);
    const body: PaymentStatus = { status: payment.status, orderId: payment.metadata?.orderId };
    return Response.json(body);
  } catch (error) {
    console.error('Payment status failed', error);
    return Response.json({ error: 'Не удалось проверить оплату' }, { status: 502 });
  }
}
