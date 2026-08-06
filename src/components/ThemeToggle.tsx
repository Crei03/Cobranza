"use client";

import { useState, useEffect } from "react";
import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

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
      {mounted ? (
        theme === "dark" ? <Sun size={20} /> : <Moon size={20} />
      ) : (
        <span className="w-5 h-5" />
      )}
    </button>
  );
}
