// components/ThemeSwitcher.tsx

'use client';

import { useEffect, useState } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';

export type Theme = 'dark' | 'light';

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
    const storedTheme = localStorage.getItem('theme');
    const resolvedTheme: Theme =
      storedTheme === 'dark' || storedTheme === 'light'
        ? storedTheme
        : document.documentElement.classList.contains('dark')
          ? 'dark'
          : 'light';

    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
    setTheme(resolvedTheme);
    onThemeChange(resolvedTheme);
  }, [onThemeChange]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';

    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
    onThemeChange(newTheme);
  };

  return (
    <div>
      <button
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        className="m-2"
        onClick={toggleTheme}
        type="button"
      >
        {theme === 'light' ? <FaMoon /> : <FaSun />}
      </button>
    </div>
  );
}
