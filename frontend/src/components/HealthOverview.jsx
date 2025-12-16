import { normalizeStatus } from "../utils/statusUtils";

export default function HealthOverview({ tests }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {tests.map((t, i) => {
        const status = normalizeStatus(t.status);

        const color =
          status === "Normal"
            ? "border-green-500 bg-green-50 dark:bg-green-900/30"
            : status === "Borderline"
            ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30"
            : "border-red-500 bg-red-50 dark:bg-red-900/30";

        return (
          <div key={i} className={`p-4 rounded-xl border-l-4 ${color}`}>
            <h3 className="font-semibold text-sm sm:text-base">{t.name}</h3>

            <p className="text-xs sm:text-sm opacity-80">
              Your Value: <b>{t.value}</b>
            </p>

            <p className="text-xs sm:text-sm opacity-80">
              Normal Range: {t.normal_range}
            </p>

            <p className="mt-1 font-bold text-xs sm:text-sm">
              Status:{" "}
              <span
                className={
                  status === "Normal"
                    ? "text-green-600"
                    : status === "Borderline"
                    ? "text-yellow-600"
                    : "text-red-600"
                }
              >
                {t.status}
              </span>
            </p>
          </div>
        );
      })}
    </div>
  );
}
