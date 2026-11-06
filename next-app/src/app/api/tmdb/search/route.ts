import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { searchCatalog } from '@/lib/tmdb/server';

const SearchQuerySchema = z.object({
  q: z.string().trim().max(120).default(''),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = SearchQuerySchema.safeParse({
    q: searchParams.get('q') ?? '',
  });

  if (!parsed.success) {
    return NextResponse.json({ results: [] }, { status: 400 });
  }

  if (parsed.data.q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results = await searchCatalog(parsed.data.q);
  return NextResponse.json({ results });
}
