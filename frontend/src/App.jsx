import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import UploadCard from "./components/UploadCard";
import SummarySection from "./components/SummarySection";
import HealthOverview from "./components/HealthOverview";
import DonutChart from "./components/DonutChart";
import AbnormalCharts from "./components/AbnormalCharts";
import ChatSection from "./components/ChatSection";
import DownloadReport from "./components/DownloadReport";
import { useTheme } from "./context/ThemeContext";

export default function App() {
  const [activeTab, setActiveTab] = useState("summary");
  const [report, setReport] = useState(null);
  const { toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        toggleTheme={toggleTheme}
      />

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
        {activeTab === "summary" && (
          <>
            <Hero />
            <div className="space-y-6">
              <UploadCard onReportReady={setReport} />
              {report && <SummarySection summary={report.summary} />}
            </div>
          </>
        )}

        {activeTab === "insights" && report && (
          <div className="space-y-6">
            {/* DOWNLOAD BUTTON */}
            <div className="flex justify-end">
              <DownloadReport />
            </div>

            {/* CONTENT TO BE DOWNLOADED */}
            <div id="report-section" className="space-y-6">
              <HealthOverview tests={report.tests} />
              <DonutChart tests={report.tests} />
              <AbnormalCharts tests={report.tests} />
            </div>
          </div>
        )}

        {activeTab === "chat" && report && (
          <div className="max-w-3xl mx-auto">
            <ChatSection reportId={report.report_id} />
          </div>
        )}
      </main>
    </div>
  );
}
