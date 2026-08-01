import { useEffect, useState } from "react";
import api from "../services/api";
import HealthTrendsChart from "../components/HealthTrendsChart";

export default function HealthTrends() {
  const [tests, setTests] = useState([]);
  const [selected, setSelected] = useState("");
  const [trend, setTrend] = useState(null);
  const [loading, setLoading] = useState(false);
  const [infoMsg, setInfoMsg] = useState("");

  // 🔹 Load all test names properly
  useEffect(() => {
    const loadTests = async () => {
      try {
        const reportsRes = await api.get("/reports/my");

        const countMap = {};

        // 🔁 fetch each report details (because /my doesn't include tests)
        for (const r of reportsRes.data) {
          const detailRes = await api.get(`/reports/${r.id}`);
          const testsArr = detailRes.data.tests || [];

          testsArr.forEach(t => {
            if (!t?.name) return;
            countMap[t.name] = (countMap[t.name] || 0) + 1;
          });
        }

        const testList = Object.entries(countMap).map(
          ([name, count]) => ({ name, count })
        );

        setTests(testList);

        if (testList.length === 0) {
          setInfoMsg("No test data found. Please re-analyze reports.");
        }  else if (testList.every(t => t.count === 1)) {
  setInfoMsg(
    "This is your first data point for each test. As you upload future reports, MediLens will automatically show trends and health improvements."
  );
}

      } catch (err) {
        setInfoMsg("Failed to load test data.");
      }
    };

    loadTests();
  }, []);

  // 🔹 Load trend data
  const loadTrend = async () => {
    if (!selected) return;
    setLoading(true);
    const res = await api.get(`/compare/trends/${selected}`);
    setTrend(res.data);
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          📈 Health Trends
        </h1>
        <p className="text-sm text-slate-500">
          Track how your health markers change over time.
        </p>
      </div>

      {/* INFO */}
      {infoMsg && (
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 text-sm text-blue-600 dark:text-blue-400">
          {infoMsg}
        </div>
      )}

      {/* SELECT */}
      <div className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow space-y-3">
        <p className="text-sm text-slate-500">
           Select any test to view how it has changed over time.
           Tests with multiple reports provide clearer health insights.
        </p>

        <div className="flex gap-3 flex-col sm:flex-row">
          <select
            value={selected}
            onChange={e => setSelected(e.target.value)}
            className="flex-1 p-2 rounded-lg bg-slate-100 dark:bg-slate-700"
          >
            <option value="">Select test</option>
            {tests.map(t => (
              <option key={t.name} value={t.name}>
                {t.name} ({t.count} report{t.count > 1 ? "s" : ""})
              </option>
            ))}
          </select>

          <button
            onClick={loadTrend}
            disabled={!selected || loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
          >
            {loading ? "Loading..." : "View"}
          </button>
        </div>
      </div>

      {/* CHART */}
      {trend && <HealthTrendsChart trend={trend} />}
    </div>
  );
}
