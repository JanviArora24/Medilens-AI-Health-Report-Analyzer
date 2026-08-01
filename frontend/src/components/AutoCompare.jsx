import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function AutoCompare({ reportId }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleCompare = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get(`/compare/${reportId}`);

      setData(res.data);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Unable to compare reports."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow space-y-5">

      <div className="flex items-center justify-between">

        <h2 className="text-lg font-semibold">
          🔁 Compare with Previous Report
        </h2>

        <button
          onClick={handleCompare}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Comparing..." : "Compare"}
        </button>

      </div>

      {error && (
        <div className="rounded-lg bg-red-100 text-red-700 p-3">
          {error}
        </div>
      )}

      {data?.overall_summary && (

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <div className="rounded-lg bg-green-100 dark:bg-green-900/20 p-4">

            <div className="text-2xl font-bold">
              {data.overall_summary.improved}
            </div>

            <div className="text-sm">
              Improved
            </div>

          </div>

          <div className="rounded-lg bg-red-100 dark:bg-red-900/20 p-4">

            <div className="text-2xl font-bold">
              {data.overall_summary.worsened}
            </div>

            <div className="text-sm">
              Worsened
            </div>

          </div>

          <div className="rounded-lg bg-gray-100 dark:bg-slate-700 p-4">

            <div className="text-2xl font-bold">
              {data.overall_summary.stable}
            </div>

            <div className="text-sm">
              Stable
            </div>

          </div>

          <div className="rounded-lg bg-blue-100 dark:bg-blue-900/20 p-4">

            <div className="text-2xl font-bold">
              {data.overall_summary.total}
            </div>

            <div className="text-sm">
              Compared
            </div>

          </div>

        </div>

      )}

      {data && data.comparisons.length === 0 && (

        <div className="text-sm text-slate-500">

          {data.message}

          <br />

          <button
            onClick={() => navigate("/health-trends")}
            className="underline text-blue-600 mt-2"
          >
            View Health Trends
          </button>

        </div>

      )}

      {data?.comparisons?.map((c, index) => (

        <div
          key={index}
          className={`rounded-xl border-l-4 p-5 ${
            c.is_good === true
              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
              : c.is_good === false
              ? "border-red-500 bg-red-50 dark:bg-red-900/20"
              : "border-gray-400 bg-gray-50 dark:bg-slate-700/40"
          }`}
        >

          <div className="flex justify-between items-center">

            <h3 className="font-semibold text-lg">
              {c.test_name}
            </h3>

            <span className="text-sm font-medium">

              {c.trend === "up" && "⬆"}

              {c.trend === "down" && "⬇"}

              {c.trend === "no_change" && "➖"}

            </span>

          </div>

          <div className="mt-2 text-sm">

            <strong>
              Previous:
            </strong>{" "}

            {c.previous_value}

            {" "}

            {c.unit}

          </div>

          <div className="text-sm">

            <strong>
              Current:
            </strong>{" "}

            {c.current_value}

            {" "}

            {c.unit}

          </div>

          {c.change !== null && (

            <div className="mt-2 text-sm">

              <strong>Change:</strong>

              {" "}

              {c.change}

              {" "}

              {c.unit}

              {c.percentage_change !== null && (
                <>
                  {" "}
                  ({c.percentage_change}%)
                </>
              )}

            </div>

          )}

          <div className="mt-2 font-medium">

            {c.is_good === true &&
              "✅ Health Improving"}

            {c.is_good === false &&
              "❌ Needs Attention"}

            {c.is_good === null &&
              "➖ Stable"}

          </div>

          <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">

            {c.insight}

          </div>

        </div>

      ))}

    </div>
  );
}