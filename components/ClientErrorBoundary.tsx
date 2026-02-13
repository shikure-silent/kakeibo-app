"use client";

import React from "react";

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export default class ClientErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // iOS WebView でのクラッシュ原因を追えるようにログを残す
    console.error("[ClientErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-900">
            データ表示の一部でエラーが発生しました。画面を再読み込みしてください。
          </section>
        )
      );
    }
    return this.props.children;
  }
}
