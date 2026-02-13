"use client";

import HomePageContainer from "../../components/home/HomePageContainer";
import MonthlySummarySection from "../../components/data/MonthlySummarySection";
import ClientErrorBoundary from "../../components/ClientErrorBoundary";

export default function DataPage() {
  return (
    <ClientErrorBoundary>
      <HomePageContainer
        variant="data"
        pageTitle="データ"
        pageDescription=""
        extraSection={<MonthlySummarySection />}
      />
    </ClientErrorBoundary>
  );
}
