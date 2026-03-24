import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const status = {
      DATABASE_URL: Boolean(process.env.DATABASE_URL),
      DIRECT_URL: Boolean(process.env.DIRECT_URL),
      NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      APP_BOOTSTRAP_ADMIN_EMAIL: Boolean(process.env.APP_BOOTSTRAP_ADMIN_EMAIL),
    };

    console.log('[api/env-check] status', status);

    return NextResponse.json({ ok: true, status });
  } catch (error) {
    console.error('[api/env-check] crash', error);
    return NextResponse.json({ ok: false, error: 'env-check-failed' }, { status: 500 });
  }
}
