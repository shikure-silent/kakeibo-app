import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function getBearerToken(authHeader: string | null) {
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token.trim();
}

export async function DELETE(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceRoleKey) {
    return NextResponse.json(
      { error: "サーバー設定が不足しています。" },
      { status: 500 }
    );
  }

  const token = getBearerToken(request.headers.get("authorization"));
  if (!token) {
    return NextResponse.json(
      { error: "認証トークンが見つかりません。" },
      { status: 401 }
    );
  }

  const userClient = createClient(url, anonKey);
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser(token);

  if (userError || !user) {
    return NextResponse.json(
      { error: "ユーザー認証に失敗しました。" },
      { status: 401 }
    );
  }

  const adminClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error: stateDeleteError } = await adminClient
    .from("kakeibo_state")
    .delete()
    .eq("user_id", user.id);
  if (stateDeleteError) {
    return NextResponse.json(
      { error: "クラウドデータの削除に失敗しました。" },
      { status: 500 }
    );
  }

  const { error: userDeleteError } = await adminClient.auth.admin.deleteUser(
    user.id
  );
  if (userDeleteError) {
    return NextResponse.json(
      { error: "アカウント削除に失敗しました。" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
