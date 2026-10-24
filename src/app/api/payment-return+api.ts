// ЮKassa возвращает покупателя сюда после оплаты, а мы перенаправляем его обратно в приложение.
// Разрешены только ссылки приложения, чтобы адрес нельзя было использовать для редиректа на чужой сайт.
const ALLOWED_PREFIXES = ['balalaflowers://', 'exp://', 'exps://'];

export function GET(request: Request) {
  const url = new URL(request.url);
  const to = url.searchParams.get('to') ?? '';
  const target = ALLOWED_PREFIXES.some((p) => to.startsWith(p)) ? to : 'balalaflowers://payment-result';

  return new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<p style="font-family:sans-serif;text-align:center;margin-top:40vh">
<a href="${target.replace(/"/g, '&quot;')}">Вернуться в приложение</a></p>`,
    { status: 302, headers: { Location: target, 'Content-Type': 'text/html; charset=utf-8' } },
  );
}
