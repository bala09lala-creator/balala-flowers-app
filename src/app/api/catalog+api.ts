import type { CatalogResponse } from '../../data/catalog';
import { getCatalog } from '../../server/tilda';

export async function GET() {
  try {
    const body: CatalogResponse = { products: await getCatalog(), updatedAt: new Date().toISOString() };
    return Response.json(body, { headers: { 'Cache-Control': 'public, max-age=300' } });
  } catch (error) {
    console.error('Catalog failed', error);
    return Response.json({ error: 'Каталог временно недоступен' }, { status: 502 });
  }
}
