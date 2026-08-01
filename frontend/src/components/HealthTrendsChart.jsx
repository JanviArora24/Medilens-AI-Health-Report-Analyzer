import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { useEffect, useState } from "react";
import { generateTrendInsight } from "../utils/trendInsight";

export default function HealthTrendsChart({ trend }) {
  const [isDark, setIsDark] = useState(false);

  // 🔹 Detect dark mode (Tailwind based)
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  if (!trend?.data?.length) return null;

  const chartData = trend.data.map(d => ({
    date: new Date(d.report_date).toLocaleDateString(),
    value: d.value
  }));

  const insight = generateTrendInsight(trend.test_name, trend.data);

  const axisColor = isDark ? "#cbd5f5" : "#475569";   // text
  const gridColor = isDark ? "#334155" : "#e5e7eb";  // lines

  return (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow space-y-4">
      <h3 className="font-semibold text-base sm:text-lg">
        {trend.test_name} Trend
      </h3>

      {/* 📊 CHART */}
      <div className="w-full h-[260px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis
              dataKey="date"
              tick={{ fill: axisColor, fontSize: 12 }}
              axisLine={{ stroke: gridColor }}
              tickLine={{ stroke: gridColor }}
            />
            <YAxis
              tick={{ fill: axisColor, fontSize: 12 }}
              axisLine={{ stroke: gridColor }}
              tickLine={{ stroke: gridColor }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#020617" : "#ffffff",
                border: "none",
                borderRadius: "8px",
                color: isDark ? "#e5e7eb" : "#020617",
                fontSize: "13px"
              }}
              labelStyle={{
                color: isDark ? "#93c5fd" : "#1d4ed8"
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 🧠 INSIGHT */}
      <div className="text-sm bg-slate-100 dark:bg-slate-700 p-3 rounded-lg leading-relaxed">
        🧠 <strong>Insight:</strong> {insight}
      </div>
    </div>
  );
}
