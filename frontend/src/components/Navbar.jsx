import { useTheme } from "../context/ThemeContext";

export default function Navbar({ activeTab, setActiveTab }) {
  const { theme, toggleTheme } = useTheme();

  const tabs = [
    { id: "summary", label: "Upload & Summary" },
    { id: "insights", label: "Health Insights" },
    { id: "chat", label: "Chat with AI" },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* TOP ROW */}
        <div className="flex justify-between items-center py-3">
          <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
            🧑‍⚕️ <span>MediLens</span>
          </h1>

          <button
            onClick={toggleTheme}
            className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-sm"
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* TAB ROW */}
        <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`whitespace-nowrap text-sm font-medium pb-2 border-b-2 transition
                ${
                  activeTab === t.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-slate-600 dark:text-slate-300"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
