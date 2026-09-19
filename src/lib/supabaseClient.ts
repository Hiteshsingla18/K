import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type SupabaseEnvConfig = {
  url: string;
  anonKey: string;
};

const resolveSupabaseEnv = (): SupabaseEnvConfig => {
  const nodeEnv = typeof process !== 'undefined' ? process.env : undefined;
  const viteEnv = typeof import.meta !== 'undefined' ? import.meta.env : undefined;

  const url =
    nodeEnv?.NEXT_PUBLIC_SUPABASE_URL ??
    nodeEnv?.VITE_SUPABASE_URL ??
    viteEnv?.NEXT_PUBLIC_SUPABASE_URL ??
    viteEnv?.VITE_SUPABASE_URL ??
    '';

  const anonKey =
    nodeEnv?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    nodeEnv?.VITE_SUPABASE_ANON_KEY ??
    viteEnv?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    viteEnv?.VITE_SUPABASE_ANON_KEY ??
    '';

  return { url, anonKey };
};

export const supabaseConfig = resolveSupabaseEnv();

export const supabase: SupabaseClient | null =
  supabaseConfig.url && supabaseConfig.anonKey
    ? createClient(supabaseConfig.url, supabaseConfig.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      })
    : null;

export const isSupabaseConfigured = Boolean(supabase);

export const getSupabaseClient = (): SupabaseClient | null => supabase;
