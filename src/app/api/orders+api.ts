import type { OrderResponse } from '../../data/orders';
import { SHOP } from '../../config/shop';
import { orderMessage, validateOrder } from '../../server/orders';
import { sendTelegram } from '../../server/telegram';
import { getProductsById } from '../../server/tilda';
import { createPayment } from '../../server/yookassa';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  let catalog;
  try {
    catalog = await getProductsById();
  } catch (error) {
    console.error('Catalog failed', error);
    return Response.json({ error: 'Каталог временно недоступен. Попробуйте позже.' }, { status: 502 });
  }
  const result = validateOrder(body, catalog);
  if ('error' in result) {
    return Response.json({ error: result.error }, { status: 400 });
  }
  const { order } = result;

  try {
    const response: OrderResponse = { orderId: order.id, total: order.total };

    if (order.payment === 'online') {
      const returnUrl = new URL('/api/payment-return', request.url);
      returnUrl.searchParams.set('orderId', order.id);
      if (order.returnUrl) returnUrl.searchParams.set('to', order.returnUrl);

      const payment = await createPayment({
        orderId: order.id,
        amount: order.total,
        returnUrl: returnUrl.toString(),
        description: `Заказ №${order.id} в ${SHOP.name}`,
        customerPhone: order.customer.phone,
        items: [
          ...order.lines.map((l) => ({
            description: l.product.name,
            quantity: l.quantity,
            price: l.product.price,
            subject: 'commodity' as const,
          })),
          ...(order.delivery > 0
            ? [{ description: 'Доставка', quantity: 1, price: order.delivery, subject: 'service' as const }]
            : []),
        ],
      });
      response.paymentId = payment.id;
      response.confirmationUrl = payment.confirmation?.confirmation_url;
    }

    await sendTelegram(orderMessage(order));
    return Response.json(response);
  } catch (error) {
    console.error('Order failed', error);
    return Response.json({ error: 'Не удалось оформить заказ. Попробуйте ещё раз или позвоните нам.' }, { status: 502 });
  }
}
