import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import UploadCard from "./components/UploadCard";
import SummarySection from "./components/SummarySection";
import HealthOverview from "./components/HealthOverview";
import DonutChart from "./components/DonutChart";
import AbnormalCharts from "./components/AbnormalCharts";
import ChatSection from "./components/ChatSection";
import DownloadReport from "./components/DownloadReport";
import MyReports from "./components/MyReports";

import ViewReport from "./pages/ViewReport";
import HealthTrends from "./pages/HealthTrends";


export default function App() {
  const [activeTab, setActiveTab] = useState("summary");
  const [report, setReport] = useState(null);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 pt-8 sm:pt-10">
        <Routes>
          {/* MAIN DASHBOARD */}
          <Route
            path="/"
            element={
              <>
                {activeTab === "summary" && (
                  <>
                    <Hero />
                    <div className="space-y-6">
                      <UploadCard onReportReady={setReport} />
                      {report && (
                        <SummarySection summary={report.summary} />
                      )}
                    </div>
                  </>
                )}

                {activeTab === "myreports" && <MyReports />}

                {activeTab === "insights" && report && (
                  <div className="space-y-6">
                    <div className="flex justify-end">
                      <DownloadReport />
                    </div>
                    <HealthOverview tests={report.tests} />
                    <DonutChart tests={report.tests} />
                    <AbnormalCharts tests={report.tests} />
                  </div>
                )}
                {activeTab === "trends" && <HealthTrends />}

                {activeTab === "chat" && report && (
                  <div className="max-w-3xl mx-auto">
                    <ChatSection reportId={report.report_id} />
                  </div>
                )}
              </>
            }
          />

          {/* VIEW DETAILS PAGE */}
          <Route path="/reports/:id" element={<ViewReport />} />
          <Route path="/health-trends" element={<HealthTrends />} />

        </Routes>
      </main>
    </div>
  );
}
