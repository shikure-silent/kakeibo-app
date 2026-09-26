import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function getBearerToken(authHeader: string | null) {
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token.trim();
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "DELETE") {
    return json({ error: "Method Not Allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const token = getBearerToken(request.headers.get("authorization"));
  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: "サーバー設定が不足しています。" }, 500);
  }
  if (!token) {
    return json({ error: "認証トークンが見つかりません。" }, 401);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const {
    data: { user },
    error: userError,
  } = await admin.auth.getUser(token);
  if (userError || !user) {
    return json({ error: "ユーザー認証に失敗しました。" }, 401);
  }

  const { error: stateDeleteError } = await admin
    .from("kakeibo_state")
    .delete()
    .eq("user_id", user.id);
  if (stateDeleteError) {
    return json({ error: "クラウドデータの削除に失敗しました。" }, 500);
  }

  const { error: userDeleteError } = await admin.auth.admin.deleteUser(user.id);
  if (userDeleteError) {
    return json({ error: "アカウント削除に失敗しました。" }, 500);
  }

  return json({ ok: true });
});
