'use client';

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createSupabaseBrowserClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase client env vars are missing in the browser bundle. Restart `npm run dev` after updating `.env.local`.');
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
