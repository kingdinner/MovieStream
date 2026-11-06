import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { getCatalogRow } from '@/lib/tmdb/server';
import { ROW_CONFIGS } from '@/lib/tmdb/config';

const QuerySchema = z.object({
  key: z
    .string()
    .refine((val) => ROW_CONFIGS.some((r) => r.key === val), 'Invalid row key')
    .default('trending_movies'),
  page: z.coerce.number().int().min(1).max(20).default(1),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = QuerySchema.safeParse({
    key: searchParams.get('key') ?? 'trending_movies',
    page: searchParams.get('page') ?? '1',
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = await getCatalogRow(parsed.data.key, parsed.data.page);
  return NextResponse.json({
    results: data.items,
    total_pages: data.totalPages,
    page: parsed.data.page,
  });
}
