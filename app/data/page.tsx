"use client";

import HomePageContainer from "../../components/home/HomePageContainer";
import MonthlySummarySection from "../../components/data/MonthlySummarySection";

export default function DataPage() {
  return (
    <HomePageContainer
      variant="data"
      pageTitle="データ"
      pageDescription="収入・支出の計画と今月の集計をまとめて確認できます。"
      extraSection={<MonthlySummarySection />}
    />
  );
}
