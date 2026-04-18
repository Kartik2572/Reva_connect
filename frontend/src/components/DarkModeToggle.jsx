import { useEffect, useState } from "react";
import { getStoredDarkMode, setDarkMode } from "../utils/darkMode.js";

const DarkModeToggle = () => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(getStoredDarkMode());
  }, []);

  const handleToggle = () => {
    const nextMode = !enabled;
    setEnabled(nextMode);
    setDarkMode(nextMode);
  };

  return (
    <section className="card p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="card-title">Dark Mode</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Enable or disable the app theme for easier reading in low-light environments.
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            enabled
              ? "bg-slate-800 text-white hover:bg-slate-700"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-100"
          }`}
        >
          {enabled ? "Dark mode ON" : "Dark mode OFF"}
        </button>
      </div>
    </section>
  );
};

export default DarkModeToggle;
