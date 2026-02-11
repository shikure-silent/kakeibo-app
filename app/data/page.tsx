"use client";

import HomePageContainer from "../../components/home/HomePageContainer";
import MonthlySummarySection from "../../components/data/MonthlySummarySection";

export default function DataPage() {
  return (
    <HomePageContainer
      variant="data"
      pageTitle="データ"
      pageDescription=""
      extraSection={<MonthlySummarySection />}
    />
  );
}
