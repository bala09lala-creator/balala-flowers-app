import type { CatalogResponse } from '../../data/catalog';
import { getCatalog } from '../../server/tilda';

export async function GET() {
  try {
    const { products, gifts } = await getCatalog();
    const body: CatalogResponse = { products, gifts, updatedAt: new Date().toISOString() };
    return Response.json(body, { headers: { 'Cache-Control': 'public, max-age=300' } });
  } catch (error) {
    console.error('Catalog failed', error);
    return Response.json({ error: 'Каталог временно недоступен' }, { status: 502 });
  }
}
