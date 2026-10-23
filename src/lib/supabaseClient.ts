import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // In development, warn rather than crash client bundler if env vars are being loaded
  console.warn(
    '[ASARR Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment variables.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://pftmtkryefpwsmdoutre.supabase.co',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * Verified primary installation owner ID for ASARR AgencyOS (syed.ae018@asarr.in)
 */
export const ASARR_INSTALLATION_OWNER_ID = '77308899-8657-4ce4-907c-b56e33c8f760';
