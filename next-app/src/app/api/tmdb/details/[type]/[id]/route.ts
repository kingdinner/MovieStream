import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { MediaTypeSchema } from '@/lib/schemas';
import { getMediaDetailsBundle } from '@/lib/tmdb/server';

const ParamsSchema = z.object({
  type: MediaTypeSchema,
  id: z.coerce.number().int().positive(),
});

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ type: string; id: string }> }
) {
  const rawParams = await context.params;
  const parsed = ParamsSchema.safeParse(rawParams);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid media parameters' }, { status: 400 });
  }

  const bundle = await getMediaDetailsBundle(parsed.data.type, parsed.data.id);
  return NextResponse.json(bundle);
}
