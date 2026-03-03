import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/env";

export function getSupabaseBrowserClient() {
  const { url, anonKey, isConfigured } = getSupabaseEnv();
  if (!isConfigured || !url || !anonKey) {
    return null;
  }

  return createBrowserClient(url, anonKey);
}
