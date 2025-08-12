import React, { createContext, useContext } from 'react';

type ThemeCtx = { mode: "light"; toggleMode: () => void };
const Ctx = createContext<ThemeCtx>({ mode: "light", toggleMode: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Force light mode for now
  if (typeof document !== "undefined") document.documentElement.classList.remove("dark");
  return <Ctx.Provider value={{ mode: "light", toggleMode: () => {} }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);