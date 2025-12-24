import { useState, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import Login from "../auth/Login";
import Register from "../auth/Register";

export default function Navbar({ activeTab, setActiveTab }) {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout, user } = useAuth();

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  const menuRef = useRef();

  const tabs = [
    { id: "summary", label: "Upload & Summary" },
    { id: "insights", label: "Health Insights" },
    { id: "chat", label: "Chat with AI" },
  ];

  const initial = user?.name?.charAt(0).toUpperCase();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-40 backdrop-blur bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* TOP ROW */}
          <div className="flex justify-between items-center py-3">
            <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              🧑‍⚕️ <span>MediLens</span>
            </h1>

            {/* AUTH AREA */}
            {!isAuthenticated ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowLogin(true)}
                  className="text-sm px-3 py-1.5 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800"
                >
                  Login
                </button>
                <button
                  onClick={() => setShowRegister(true)}
                  className="text-sm px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Register
                </button>
              </div>
            ) : (
              <div className="relative" ref={menuRef}>
                {/* Avatar */}
                <button
                  onClick={() => setOpenMenu(!openMenu)}
                  className="flex items-center gap-2"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                    {initial}
                  </div>
                </button>

                {/* DROPDOWN */}
                {openMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                      <p className="font-semibold text-sm">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {user.email}
                      </p>
                    </div>

                    <button
                      onClick={toggleTheme}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      {theme === "dark"
                        ? "☀️ Light Mode"
                        : "🌙 Dark Mode"}
                    </button>

                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            )}
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

      {/* MODALS */}
      {showLogin && (
        <Login
          onSuccess={() => setShowLogin(false)}
          switchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}

      {showRegister && (
        <Register
          onSuccess={() => setShowRegister(false)}
          switchToLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
        />
      )}
    </>
  );
}
