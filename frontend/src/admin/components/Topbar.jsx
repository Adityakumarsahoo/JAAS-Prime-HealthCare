import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";

const Topbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("aToken");
    localStorage.removeItem("role");
    navigate("/login");
  };

  // Theme state initialized from localStorage or admin settings
  const [dark, setDark] = useState(() => {
    try {
      const userTheme = localStorage.getItem("theme");
      if (userTheme === "dark") return true;
      if (userTheme === "light") return false;
      const raw = localStorage.getItem("adminSettings");
      const settings = raw ? JSON.parse(raw) : null;
      if (settings?.general?.darkMode !== undefined)
        return !!settings.general.darkMode;
      return false; // default white
    } catch {
      return false;
    }
  });

  // Apply theme and persist
  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
      // Notify other components to sync icon state
      window.dispatchEvent(new CustomEvent("themechange", { detail: dark ? "dark" : "light" }));
    } catch {}
  }, [dark]);

  // Listen for theme changes triggered elsewhere to keep icon in sync
  useEffect(() => {
    const onThemeChange = (e) => {
      const next = e?.detail === "dark";
      setDark(next);
    };
    const onStorage = (e) => {
      if (e.key === "theme") setDark(e.newValue === "dark");
    };
    window.addEventListener("themechange", onThemeChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("themechange", onThemeChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return (
    <div className="flex justify-between items-center bg-white/95 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-100">Admin Dashboard</h2>
      <div className="flex items-center gap-3">
        <button
          aria-label="Toggle theme"
          onClick={() => setDark((d) => !d)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          title={dark ? "Switch to Light" : "Switch to Dark"}
        >
          {dark ? (
            <Sun size={18} className="text-gray-700 dark:text-gray-200" />
          ) : (
            <Moon size={18} className="text-gray-700 dark:text-gray-200" />
          )}
        </button>
      </div>
    </div>
  );
};

export default Topbar;
