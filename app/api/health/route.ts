import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  console.log('[api/health] start');

  try {
    const result = await db.$queryRaw`SELECT 1 as ok`;

    console.log('[api/health] db ok', result);

    return NextResponse.json({ ok: true, db: true, result });
  } catch (error) {
    console.error('[api/health] db crash', error);
    return NextResponse.json({ ok: false, db: false, error: error instanceof Error ? error.message : 'unknown-error' }, { status: 500 });
  }
}
