import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { darkColors, lightColors } from './tokens';
import type { Palette } from './tokens';

export type ThemeMode = 'system' | 'light' | 'dark';

const STORE_KEY = 'theme_mode';

function readMode(): ThemeMode {
  try {
    const stored = SecureStore.getItem(STORE_KEY);
    if (stored === 'system' || stored === 'light' || stored === 'dark') return stored;
  } catch {
    // unreadable storage falls back to following the system
  }
  return 'system';
}

interface ThemeValue {
  colors: Palette;
  scheme: 'light' | 'dark';
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(readMode);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    try {
      SecureStore.setItem(STORE_KEY, next);
    } catch {
      // a failed save only means the choice is not remembered next launch
    }
  }, []);

  const scheme: 'light' | 'dark' = mode === 'system' ? (system === 'light' ? 'light' : 'dark') : mode;

  const value = useMemo<ThemeValue>(
    () => ({ colors: scheme === 'light' ? lightColors : darkColors, scheme, mode, setMode }),
    [scheme, mode, setMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside ThemeProvider');
  return value;
}
