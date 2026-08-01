export default function SummarySection({ summary }) {
  if (!summary || summary.trim().length === 0) return null;

  const sections = summary
    .split("• Test Name:")
    .filter(Boolean);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow mt-8 space-y-6">
      <h2 className="font-semibold text-lg flex items-center gap-2">
        🧠 AI Health Summary
      </h2>

      {sections.map((block, idx) => {
        const lines = block
          .split("\n")
          .map(l =>
            l.replace(/^•\s*/, "").replace(/^-\s*/, "").trim()
          )
          .filter(Boolean);

        const title = lines[0];
        const points = lines.slice(1);

        return (
          <div key={idx} className="space-y-2">
            {/* Test Name */}
            <h3 className="font-semibold text-blue-600 dark:text-blue-400">
              {title}
            </h3>

            {/* Clean bullets */}
            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700 dark:text-slate-200 text-justify">
              {points.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        );
      })}

      <div className="mt-4 text-xs text-yellow-600 bg-yellow-500/10 p-3 rounded">
        ⚠️ Disclaimer: This AI-generated summary is for informational purposes only
        and should not be considered medical advice.
      </div>
    </div>
  );
}
