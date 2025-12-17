// lib/kakeiboStateRepo.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import type { LocalDump } from "./cloudSync";

export async function saveKakeiboState(
  supabase: SupabaseClient,
  userId: string,
  dump: LocalDump
) {
  // upsert: なければ作る、あれば更新
  const { error } = await supabase.from("kakeibo_state").upsert({
    user_id: userId,
    data: dump,
    version: 1,
  });

  if (error) throw error;
}

export async function loadKakeiboState(
  supabase: SupabaseClient,
  userId: string
): Promise<LocalDump | null> {
  const { data, error } = await supabase
    .from("kakeibo_state")
    .select("data")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return (data.data ?? null) as LocalDump | null;
}
