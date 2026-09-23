"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  compactMode: boolean;
  setCompactMode: (compact: boolean) => void;
  highContrast: boolean;
  setHighContrast: (contrast: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [compactMode, setCompactModeState] = useState<boolean>(false);
  const [highContrast, setHighContrastState] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  // Initialize from localStorage or fallback
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("skillintel_theme") as Theme | null;
      if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
        setThemeState(savedTheme);
      }

      const savedCompact = localStorage.getItem("skillintel_compact_mode");
      if (savedCompact !== null) {
        setCompactModeState(savedCompact === "true");
      }

      const savedContrast = localStorage.getItem("skillintel_high_contrast");
      if (savedContrast !== null) {
        setHighContrastState(savedContrast === "true");
      }
    } catch {
      // Ignore if localStorage unavailable
    }
    setMounted(true);
  }, []);

  // Update resolvedTheme and document classes whenever theme changes or OS preference changes
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const calculateResolvedTheme = (currentTheme: Theme): ResolvedTheme => {
      if (currentTheme === "system") {
        return mediaQuery.matches ? "dark" : "light";
      }
      return currentTheme;
    };

    const applyTheme = () => {
      const active = calculateResolvedTheme(theme);
      setResolvedTheme(active);

      const root = document.documentElement;
      if (active === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }

      if (compactMode) {
        root.classList.add("compact-mode");
      } else {
        root.classList.remove("compact-mode");
      }

      if (highContrast) {
        root.classList.add("high-contrast");
      } else {
        root.classList.remove("high-contrast");
      }
    };

    applyTheme();

    const handleMediaChange = () => {
      if (theme === "system") {
        applyTheme();
      }
    };

    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, [theme, compactMode, highContrast, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("skillintel_theme", newTheme);
    } catch {
      // Ignore
    }
  };

  const setCompactMode = (compact: boolean) => {
    setCompactModeState(compact);
    try {
      localStorage.setItem("skillintel_compact_mode", String(compact));
    } catch {
      // Ignore
    }
  };

  const setHighContrast = (contrast: boolean) => {
    setHighContrastState(contrast);
    try {
      localStorage.setItem("skillintel_high_contrast", String(contrast));
    } catch {
      // Ignore
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        compactMode,
        setCompactMode,
        highContrast,
        setHighContrast,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
