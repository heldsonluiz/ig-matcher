"use client";

import { useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark" | "system";

const storageKey = "fio-local-theme";

function getSystemTheme(): Exclude<Theme, "system"> {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  const resolvedTheme = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  document.documentElement.classList.toggle("light", resolvedTheme === "light");
  document.documentElement.dataset.theme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(storageKey);
    const nextTheme: Theme =
      savedTheme === "light" || savedTheme === "dark" || savedTheme === "system"
        ? savedTheme
        : "system";
    applyTheme(nextTheme);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => {
      if (nextTheme === "system") applyTheme("system");
    };
    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () =>
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, []);

  function updateTheme(nextTheme: Theme) {
    setTheme(nextTheme);
    window.localStorage.setItem(storageKey, nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <div data-theme-provider={theme}>
      {children}
      <ThemeControl theme={theme} onThemeChange={updateTheme} />
    </div>
  );
}

function ThemeControl({
  theme,
  onThemeChange,
}: {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}) {
  return (
    <div className="fixed right-4 bottom-4 z-20 flex items-center gap-2 rounded-full border border-border bg-card/95 px-3 py-2 text-xs shadow-lg backdrop-blur sm:right-6 sm:bottom-6">
      <label htmlFor="theme-select" className="text-muted-foreground">
        Tema
      </label>
      <select
        id="theme-select"
        value={theme}
        onChange={(event) => onThemeChange(event.target.value as Theme)}
        className="bg-transparent font-medium text-foreground outline-none"
        aria-label="Selecionar tema"
      >
        <option value="system">Sistema</option>
        <option value="light">Claro</option>
        <option value="dark">Escuro</option>
      </select>
    </div>
  );
}
