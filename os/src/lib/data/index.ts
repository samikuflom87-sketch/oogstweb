import { createDemoProvider } from "@/lib/data/demoProvider";
import { createSupabaseProvider } from "@/lib/data/supabaseProvider";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { DataProvider } from "@/lib/data/provider";

let provider: DataProvider | null = null;

export function getDataProvider(): DataProvider {
  if (!provider) {
    provider = isSupabaseConfigured ? createSupabaseProvider() : createDemoProvider();
  }
  return provider;
}

export * from "@/lib/data/provider";
