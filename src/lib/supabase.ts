import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

let client: SupabaseClient;

if (supabaseConfigured) {
  client = createClient(supabaseUrl!, supabaseAnonKey!);
} else {
  // Placeholder — never used because App checks supabaseConfigured first
  client = createClient(
    "https://placeholder.supabase.co",
    "placeholder-key",
  );
}

export const supabase = client;
