"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
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

export const themeStorageKey = "instagram-matcher-theme";

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

function readTheme(): Theme {
  try {
    const saved = window.localStorage.getItem(themeStorageKey);
    return saved === "light" || saved === "dark" ? saved : "system";
  } catch {
    return "system";
  }
}

function subscribeTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("theme-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("theme-change", callback);
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore<Theme>(
    subscribeTheme,
    readTheme,
    () => "system",
  );
  useEffect(() => {
    applyTheme(theme);
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      if (theme === "system") applyTheme(theme);
    };
    mediaQuery.addEventListener("change", onSystemChange);
    return () => mediaQuery.removeEventListener("change", onSystemChange);
  }, [theme]);

  function updateTheme(nextTheme: Theme) {
    window.localStorage.setItem(themeStorageKey, nextTheme);
    window.dispatchEvent(new Event("theme-change"));
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
