"use client";
import * as React from "react";
import { Moon, Sun } from "lucide-react";

const ThemeSwitcher: React.FC = () => {
  const [isDark, setIsDark] = React.useState(false);
  React.useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);
  const toggleTheme = () => {
    setIsDark((prev) => {
      document.documentElement.classList.toggle("dark");
      return !prev;
    });
  };
  return (
    <button
      className="p-2 rounded bg-muted hover:bg-accent transition-colors text-gray-600 hover:text-tourism-navy hover:bg-tourism-sage/10"
      title="Cambiar tema"
      onClick={toggleTheme}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
};

export default ThemeSwitcher;
