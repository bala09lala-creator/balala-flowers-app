import { Redirect, router } from 'expo-router';
import { useEffect } from 'react';

// Сюда ведёт ссылка возврата из ЮKassa. Обычно её перехватывает окно оплаты,
// а результат обрабатывает экран оформления заказа. Если ссылка всё же открыла
// приложение напрямую — просто возвращаемся назад.
export default function PaymentResult() {
  const canGoBack = router.canGoBack();
  useEffect(() => {
    if (canGoBack) router.back();
  }, [canGoBack]);
  return canGoBack ? null : <Redirect href="/" />;
}
