import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const [dietType, setDietType] = useState("");
  const [skinType, setSkinType] = useState("");
  const [goal, setGoal] = useState("");
  const [darkMode, setDarkMode] = useState(isDark);

  useEffect(() => {
    setDietType(localStorage.getItem("dietType") || "");
    setSkinType(localStorage.getItem("skinType") || "");
    setGoal(localStorage.getItem("goal") || "");
    setDarkMode(localStorage.getItem("darkMode") === "true" || isDark);
  }, []);

  const handleSave = () => {
    localStorage.setItem("dietType", dietType);
    localStorage.setItem("skinType", skinType);
    localStorage.setItem("goal", goal);
    localStorage.setItem("darkMode", darkMode);
    alert("Settings saved successfully");
  };

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
    toggleTheme();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white">
          Settings ⚙️
        </h1>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 space-y-8">
          {/* 👤 USER PREFERENCES */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
              👤 User Preferences
            </h2>

            <div className="space-y-4">
              {/* Diet Type */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Diet Type
                </label>
                <select
                  value={dietType}
                  onChange={(e) => setDietType(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Diet Type</option>
                  <option value="veg">Veg</option>
                  <option value="non-veg">Non-Veg</option>
                  <option value="eggetarian">Eggetarian</option>
                </select>
              </div>

              {/* Skin Type */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Skin Type
                </label>
                <select
                  value={skinType}
                  onChange={(e) => setSkinType(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Skin Type</option>
                  <option value="dry">Dry Skin</option>
                  <option value="oily">Oily Skin</option>
                  <option value="sensitive">Sensitive Skin</option>
                  <option value="normal">Normal Skin</option>
                </select>
              </div>
            </div>
          </section>

          {/* 🎯 GOALS */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
              🎯 Goals
            </h2>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Your Goal
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Goal</option>
                <option value="weight-loss">Weight Loss</option>
                <option value="weight-gain">Weight Gain</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </section>

          {/* 🌙 DARK MODE TOGGLE */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
              🌙 Appearance
            </h2>

            <div className="flex items-center justify-between bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3">
              <span className="text-slate-300">Dark Mode</span>
              <button
                onClick={handleDarkModeToggle}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  darkMode ? "bg-purple-500" : "bg-slate-600"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    darkMode ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </section>

          {/* SAVE BUTTON */}
          <button
            className="mt-6 w-full bg-gradient-to-r from-cyan-500 to-purple-500 py-3 rounded-lg hover:scale-105 transition"
            onClick={handleSave}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
