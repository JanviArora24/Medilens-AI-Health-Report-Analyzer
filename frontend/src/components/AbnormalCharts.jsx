import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { normalizeStatus } from "../utils/statusUtils";

export default function AbnormalCharts({ tests }) {
  if (!tests || !tests.length) return null;

  // ❗ Only abnormal tests
  const abnormal = tests.filter(
    (t) =>
      normalizeStatus(t.status) !== "Normal" &&
      typeof t.value_numeric === "number"
  );

  if (!abnormal.length) return null;

  const data = abnormal.map((t) => {
    let normalValue;

    // BOTH limits present → average
    if (t.normal_min !== null && t.normal_max !== null) {
      normalValue = (t.normal_min + t.normal_max) / 2;
    }
    // ONLY upper limit (< 200)
    else if (t.normal_max !== null) {
      normalValue = t.normal_max;
    }
    // ONLY lower limit (> 40)
    else if (t.normal_min !== null) {
      normalValue = t.normal_min;
    }
    // fallback
    else {
      normalValue = t.value_numeric;
    }

    return {
      name: t.name,
      Normal: normalValue,
      "Your Value": t.value_numeric,
    };
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow mt-8">
      <h3 className="font-semibold mb-4">
        📊 Abnormal Test Comparison
      </h3>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ bottom: 40 }}>
          <XAxis
            dataKey="name"
            angle={-20}
            textAnchor="end"
            tick={{ fontSize: 11 }}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Normal" fill="#22c55e" />
          <Bar dataKey="Your Value" fill="#facc15" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
