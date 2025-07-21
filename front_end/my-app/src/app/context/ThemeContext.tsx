'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  resolvedMode: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>('system');
  const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>('light');

  // load saved mode once
  useEffect(() => {
    const saved = localStorage.getItem('themeMode') as ThemeMode | null;
    if (saved) setMode(saved);
  }, []);

  // persist on change
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

   useEffect(() => {
    const checkSystemTheme = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    };

    const updateResolvedMode = () => {
      if (mode === 'system') {
        setResolvedMode(checkSystemTheme());
      } else {
        setResolvedMode(mode);
      }
    };

    updateResolvedMode();

    // if system, listen to OS changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if (mode === 'system') {
      mediaQuery.addEventListener('change', updateResolvedMode);
      return () => mediaQuery.removeEventListener('change', updateResolvedMode);
    }
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, setMode, resolvedMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeMode = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeMode must be under ThemeProviderWrapper');
  return ctx;
};
