const HAS_ASCII_LETTER = /[A-Za-z]/;

export function toJapaneseAuthErrorMessage(
  message: string,
  fallback = "認証エラーが発生しました。しばらく待ってから再試行してください。"
) {
  const normalized = message.toLowerCase();
  const match = message.match(/after\s+(\d+)\s+seconds?/i);

  if (message.includes("For security purposes") && match) {
    return `セキュリティのため、次のリクエストは${match[1]}秒後に再試行してください。`;
  }
  if (message.includes("For security purposes")) {
    return "セキュリティのため、しばらく待ってから再試行してください。";
  }
  if (normalized.includes("email rate limit exceeded")) {
    return "メール送信回数が上限に達しました。しばらく待ってから再試行してください。";
  }
  if (normalized.includes("rate limit")) {
    return "リクエスト回数が上限に達しました。しばらく待ってから再試行してください。";
  }
  if (normalized.includes("invalid login credentials")) {
    return "メールアドレスまたはパスワードが正しくありません。";
  }
  if (normalized.includes("email not confirmed")) {
    return "メール確認が完了していません。確認メールのリンクを開いてください。";
  }
  if (normalized.includes("user already registered")) {
    return "このメールアドレスは既に登録されています。ログインしてください。";
  }
  if (normalized.includes("signup is disabled")) {
    return "現在、新規登録は受け付けていません。";
  }
  if (normalized.includes("weak password")) {
    return "パスワードが弱すぎます。より強いパスワードを設定してください。";
  }
  if (normalized.includes("password should be at least")) {
    return "パスワードは6文字以上で入力してください。";
  }
  if (normalized.includes("same as the old password")) {
    return "新しいパスワードは現在のパスワードと異なるものにしてください。";
  }
  if (normalized.includes("new password should be different")) {
    return "新しいパスワードは現在のパスワードと異なるものにしてください。";
  }
  if (normalized.includes("auth session missing")) {
    return "認証セッションの有効期限が切れました。再度メールリンクを開いてください。";
  }
  if (normalized.includes("jwt expired")) {
    return "認証の有効期限が切れました。再度お試しください。";
  }
  if (normalized.includes("invalid token") || normalized.includes("token has expired")) {
    return "認証リンクの有効期限が切れているか無効です。再度やり直してください。";
  }
  if (normalized.includes("user not found")) {
    return "ユーザーが見つかりませんでした。入力内容をご確認ください。";
  }
  if (normalized.includes("unable to validate email address")) {
    return "メールアドレスの形式が正しくありません。";
  }
  if (normalized.includes("email address") && normalized.includes("invalid")) {
    return "メールアドレスの形式が正しくありません。";
  }

  if (HAS_ASCII_LETTER.test(message)) {
    return fallback;
  }
  return message;
}
