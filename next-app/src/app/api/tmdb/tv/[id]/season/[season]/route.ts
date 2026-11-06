import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { getTvSeasonEpisodes } from '@/lib/tmdb/server';

const SeasonParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
  season: z.coerce.number().int().min(1).max(100),
});

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string; season: string }> }
) {
  const rawParams = await context.params;
  const parsed = SeasonParamsSchema.safeParse(rawParams);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid season parameters', episodes: [] }, { status: 400 });
  }

  const episodes = await getTvSeasonEpisodes(parsed.data.id, parsed.data.season);
  return NextResponse.json({ episodes });
}
