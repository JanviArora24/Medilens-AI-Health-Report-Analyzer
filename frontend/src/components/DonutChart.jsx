import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { normalizeStatus } from "../utils/statusUtils";

export default function DonutChart({ tests }) {
  const normalized = tests.map((t) => normalizeStatus(t.status));

  const data = [
    { name: "Normal", value: normalized.filter((s) => s === "Normal").length },
    {
      name: "Borderline",
      value: normalized.filter((s) => s === "Borderline").length,
    },
    {
      name: "Abnormal",
      value: normalized.filter((s) => ["Low", "High"].includes(s)).length,
    },
  ].filter((d) => d.value > 0);

  const COLORS = {
    Normal: "#22c55e",
    Borderline: "#facc15",
    Abnormal: "#ef4444",
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 shadow mt-8">
      <h3 className="font-semibold mb-4 text-sm sm:text-base">
        🍩 Health Distribution
      </h3>

      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={60} outerRadius={90}>
            {data.map((e) => (
              <Cell key={e.name} fill={COLORS[e.name]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
