export default function SummarySection({ summary }) {
  if (!summary || summary.trim().length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow mt-8">
      <h2 className="font-semibold mb-4 text-lg flex items-center gap-2">
        🧠 AI Health Summary
      </h2>

      {/* SUMMARY TEXT */}
      <pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-200 font-sans">
        {summary}
      </pre>

      {/* DISCLAIMER */}
      <div className="mt-4 text-xs text-yellow-600 bg-yellow-500/10 p-3 rounded">
        ⚠️ Disclaimer: This AI-generated summary is for informational purposes only
        and should not be considered medical advice. Please consult a qualified
        doctor for diagnosis and treatment.
      </div>
    </div>
  );
}
