// components/ThemeSwitcher.tsx

"use client";

import { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";

export type Theme = "dark" | "light";

interface ThemeSwitcherProps {
  onThemeChange: (theme: Theme) => void;
  initialTheme: Theme;
}

export default function ThemeSwitch({
  onThemeChange,
  initialTheme,
}: ThemeSwitcherProps) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    applyTheme(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyTheme = (selectedTheme: Theme) => {
    if (selectedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    onThemeChange(selectedTheme);

    localStorage.setItem("theme", selectedTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  return (
    <div>
      <button className="m-2" onClick={toggleTheme}>
        {theme === "light" ? <FaMoon /> : <FaSun />}
      </button>
    </div>
  );
}
