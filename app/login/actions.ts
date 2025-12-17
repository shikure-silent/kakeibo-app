"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

function safeString(v: FormDataEntryValue | null) {
  return typeof v === "string" ? v : "";
}

export async function login(formData: FormData) {
  const email = safeString(formData.get("email")).trim();
  const password = safeString(formData.get("password"));

  if (!email || !password) {
    redirect(
      "/login?error=" +
        encodeURIComponent("メールアドレスとパスワードを入力してください。")
    );
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/login?error=" + encodeURIComponent(error.message));
  }

  redirect("/"); // 好みで /calendar でもOK
}

export async function signup(formData: FormData) {
  const email = safeString(formData.get("email")).trim();
  const password = safeString(formData.get("password"));

  if (!email || !password) {
    redirect(
      "/login?error=" +
        encodeURIComponent("メールアドレスとパスワードを入力してください。")
    );
  }
  if (password.length < 8) {
    redirect(
      "/login?error=" +
        encodeURIComponent("パスワードは8文字以上にしてください。")
    );
  }

  const origin = headers().get("origin") ?? "http://localhost:3000";
  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // 確認メールのリンク先（SupabaseのRedirect URLsにも許可が必要）
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });

  if (error) {
    redirect("/login?error=" + encodeURIComponent(error.message));
  }

  redirect(
    "/login?message=" +
      encodeURIComponent(
        "確認メールを送信しました。メール内のリンクを開いて登録を完了してください。"
      )
  );
}
