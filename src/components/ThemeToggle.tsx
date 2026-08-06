"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="flex items-center justify-center w-10 h-10 rounded-xl transition-smooth"
      style={{
        background: "var(--input-bg)",
        color: "var(--text-secondary)",
      }}
      aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      <span suppressHydrationWarning>
        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
      </span>
    </button>
  );
}
