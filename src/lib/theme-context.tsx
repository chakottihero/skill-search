"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Theme = "light" | "dark";
const LS_KEY = "skillsearch_theme";

const Ctx = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({
  theme: "light",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY) as Theme | null;
    const t = saved === "dark" ? "dark" : "light";
    setThemeState(t);
    document.documentElement.classList.toggle("dark", t === "dark");
  }, []);

  const setTheme = (t: Theme) => {
    localStorage.setItem(LS_KEY, t);
    setThemeState(t);
    document.documentElement.classList.toggle("dark", t === "dark");
  };

  return <Ctx.Provider value={{ theme, setTheme }}>{children}</Ctx.Provider>;
}

export function useTheme() {
  return useContext(Ctx);
}
