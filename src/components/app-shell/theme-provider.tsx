"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Theme = "light" | "dark" | "system";

const storageKey = "instagram-matcher-theme";

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
      <Select
        value={theme}
        onValueChange={(value) => {
          if (value === "system" || value === "light" || value === "dark") {
            onThemeChange(value);
          }
        }}
        items={{ system: "Sistema", light: "Claro", dark: "Escuro" }}
      >
        <SelectTrigger
          id="theme-select"
          size="sm"
          aria-label="Selecionar tema"
          className="min-w-28 rounded-full text-xs"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          side="top"
          align="end"
          sideOffset={8}
          alignItemWithTrigger={false}
          className="motion-reduce:animate-none motion-reduce:transition-none"
        >
          <SelectGroup>
            <SelectItem value="system">
              <Monitor aria-hidden="true" /> Sistema
            </SelectItem>
            <SelectItem value="light">
              <Sun aria-hidden="true" /> Claro
            </SelectItem>
            <SelectItem value="dark">
              <Moon aria-hidden="true" /> Escuro
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
