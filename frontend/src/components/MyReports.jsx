import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get("/reports/my");
        setReports(res.data);
      } catch (err) {
        setError("Unable to load reports");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <p className="text-center mt-10 text-slate-500 dark:text-slate-400">
        Loading your reports...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-center mt-10 text-red-500">
        {error}
      </p>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold">
          My Reports
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          All your previously uploaded medical reports
        </p>
      </div>

      {reports.length === 0 ? (
        <p className="text-slate-500">
          You haven’t uploaded any reports yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report) => {
            const createdAt = new Date(report.created_at);
            const updatedAt = report.updated_at
              ? new Date(report.updated_at)
              : null;

            const showUpdated =
              updatedAt && updatedAt.getTime() > createdAt.getTime();

            return (
              <div
                key={report.id}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm hover:shadow-md transition"
              >
                <h3 className="font-semibold text-lg truncate">
                  📄 {report.report_name}
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  {showUpdated
                    ? `Updated on ${updatedAt.toLocaleDateString()}`
                    : `Uploaded on ${createdAt.toLocaleDateString()}`
                  }
                </p>

                <p className="text-sm text-slate-700 dark:text-slate-300 mt-4 line-clamp-3">
                  {report.summary}
                </p>

                <button
                  onClick={() => navigate(`/reports/${report.id}`)}
                  className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View details →
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
