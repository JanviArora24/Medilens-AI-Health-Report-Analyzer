import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

import HealthOverview from "../components/HealthOverview";
import DonutChart from "../components/DonutChart";
import AbnormalCharts from "../components/AbnormalCharts";
import AutoCompare from "../components/AutoCompare";

export default function ViewReport() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);

  // 🔹 Fetch report
  const fetchReport = async () => {
    try {
      const res = await api.get(`/reports/${id}`);
      setReport(res.data);
    } catch (err) {
      console.error("Fetch report error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line
  }, [id]);

  // 🔄 Re-analyze report
  const handleReanalyze = async () => {
    try {
      setReanalyzing(true);

      const res = await api.post(`/reports/${id}/reanalyze`);

      setReport((prev) => ({
        ...prev,
        summary: res.data.summary,
        tests: res.data.tests,
        updated_at: new Date().toISOString(),
      }));
    } catch (err) {
      console.error("Re-analyze error:", err);
      alert("Failed to re-analyze report");
    } finally {
      setReanalyzing(false);
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;
  if (!report)
    return <p className="text-center text-red-500">Report not found</p>;

  const sections = report.summary
    .split("• Test Name:")
    .filter(Boolean);

  return (
    <div className="space-y-10">
      {/* ================= HEADER ================= */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-blue-500 hover:underline"
        >
          ← Back to My Reports
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-2">
          <h1 className="text-2xl sm:text-3xl font-bold">
            {report.report_name}
          </h1>

          {/* ACTION BUTTONS */}
          <div className="flex gap-3">
            <button
              onClick={handleReanalyze}
              disabled={reanalyzing}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {reanalyzing ? "Re-analyzing..." : "🔄 Re-analyze"}
            </button>
          </div>
        </div>

        <p className="text-sm text-slate-500 mt-1">
          Uploaded on{" "}
          {new Date(report.created_at).toLocaleDateString()}
          {report.updated_at &&
            new Date(report.updated_at).getTime() >
              new Date(report.created_at).getTime() && (
              <span className="ml-2 text-green-500">(updated)</span>
            )}
        </p>
      </div>

      {/* ================= AUTO COMPARE ================= */}
      <AutoCompare reportId={id} />

      {/* ================= AI EXPLANATION ================= */}
      <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow space-y-6">
        <h2 className="text-lg font-semibold">AI Explanation</h2>

        {sections.map((block, idx) => {
          const lines = block
            .split("\n")
            .map((l) =>
              l.replace(/^•\s*/, "").replace(/^-\s*/, "").trim()
            )
            .filter(Boolean);

          const title = lines[0];
          const points = lines.slice(1);

          return (
            <div key={idx} className="space-y-2">
              <h3 className="font-semibold text-blue-600 dark:text-blue-400">
                {title}
              </h3>

              <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700 dark:text-slate-300 text-justify">
                {points.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* ================= VISUAL INSIGHTS ================= */}
      <HealthOverview tests={report.tests} />
      <DonutChart tests={report.tests} />
      <AbnormalCharts tests={report.tests} />
    </div>
  );
}
