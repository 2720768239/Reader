import { useEffect, useState } from "react";

import { applyTheme, resolveInitialTheme, type ThemeMode } from "../lib/theme";

type ThemeToggleProps = {
  variant?: "pill" | "icon";
};

export default function ThemeToggle({ variant = "pill" }: ThemeToggleProps) {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    const initialTheme = resolveInitialTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  return (
    <button
      aria-label="Toggle theme"
      className={variant === "icon" ? "theme-toggle theme-toggle--icon" : "theme-toggle"}
      onClick={() => {
        const nextTheme = theme === "light" ? "dark" : "light";
        setTheme(nextTheme);
        applyTheme(nextTheme);
      }}
      type="button"
    >
      {variant === "icon" ? (theme === "light" ? "◐" : "☼") : theme === "light" ? "Night" : "Day"}
    </button>
  );
}
