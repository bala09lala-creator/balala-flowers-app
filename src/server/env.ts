// Секреты читаются только на сервере (API-маршруты) и никогда не попадают в приложение.
export function requireEnv(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Не задана переменная окружения ${name}`);
  return value;
}
