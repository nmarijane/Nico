import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Validation des variables d'environnement
function validateEnv() {
  if (!supabaseUrl || supabaseUrl === "https://your-project.supabase.co") {
    console.error("❌ NEXT_PUBLIC_SUPABASE_URL n'est pas configuré!");
    console.error("   Allez sur https://supabase.com/dashboard > votre projet > Settings > API");
    return false;
  }
  if (!supabaseAnonKey || supabaseAnonKey === "your-anon-key") {
    console.error("❌ NEXT_PUBLIC_SUPABASE_ANON_KEY n'est pas configuré!");
    console.error("   Allez sur https://supabase.com/dashboard > votre projet > Settings > API");
    return false;
  }
  return true;
}

let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!validateEnv()) {
    throw new Error(
      "Configuration Supabase manquante. Vérifiez vos variables d'environnement dans .env.local"
    );
  }
  
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  
  return supabaseInstance;
}

// Client pour le navigateur (avec realtime) - initialisation lazy
export const supabase = {
  get client() {
    return getSupabaseClient();
  },
  from: (table: string) => getSupabaseClient().from(table),
  channel: (name: string) => getSupabaseClient().channel(name),
  removeChannel: (channel: ReturnType<SupabaseClient["channel"]>) => 
    getSupabaseClient().removeChannel(channel),
};

// Client serveur (pour les API routes)
export function createServerClient(): SupabaseClient {
  if (!validateEnv()) {
    throw new Error(
      "Configuration Supabase manquante. Vérifiez vos variables d'environnement dans .env.local"
    );
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
