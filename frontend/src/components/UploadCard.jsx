import { useState } from "react";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

export default function UploadCard({ onReportReady }) {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState("hinglish");
  const [loading, setLoading] = useState(false);

  async function analyze() {
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", language.toLowerCase().trim());

    try {
      const res = await fetch(`${BASE_URL}/uploadfile/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Backend request failed");
      }

      const data = await res.json();
      onReportReady(data);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Backend not reachable. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 shadow">
      <h2 className="font-semibold mb-4 text-base sm:text-lg">
        📄 Upload Medical Report
      </h2>

      <input
        type="file"
        accept=".pdf"
        className="w-full text-sm"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <select
        className="block w-full mt-4 p-2 text-sm bg-slate-200 dark:bg-slate-700 rounded"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="english">English</option>
        <option value="hindi">Hindi</option>
        <option value="hinglish">Hinglish</option>
      </select>

      <button
        disabled={loading || !file}
        onClick={analyze}
        className="w-full mt-4 py-2 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Analyze Report"}
      </button>
    </div>
  );
}
