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

function getNormalValue(range, fallback) {
  if (!range) return fallback;

  let m = range.match(/(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)/);
  if (m) return (parseFloat(m[1]) + parseFloat(m[2])) / 2;

  m = range.match(/<\s*(\d+\.?\d*)/);
  if (m) return parseFloat(m[1]);

  m = range.match(/>\s*(\d+\.?\d*)/);
  if (m) return parseFloat(m[1]);

  return fallback;
}

export default function AbnormalCharts({ tests }) {
  const abnormal = tests.filter(
    (t) => normalizeStatus(t.status) !== "Normal"
  );

  if (!abnormal.length) return null;

  const data = abnormal.map((t) => {
    const yourValue = parseFloat(t.value);
    return {
      name: t.name,
      Normal: getNormalValue(t.normal_range, yourValue),
      "Your Value": yourValue,
    };
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 shadow mt-8">
      <h3 className="font-semibold mb-4 text-sm sm:text-base">
        📊 Abnormal Test Comparison
      </h3>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ bottom: 50 }}>
          <XAxis
            dataKey="name"
            interval={0}
            angle={-20}
            textAnchor="end"
            tick={{ fontSize: 11 }}
          />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="Normal" fill="#22c55e" />
          <Bar dataKey="Your Value" fill="#facc15" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
