import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const AppThemeContext = createContext({
  mode: 'light',
  setMode: () => {},
  toggleMode: () => {},
});

const STORAGE_KEY = 'nexus_ui_mode';

export function AppThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;

    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  const toggleMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const muiTheme = useMemo(() => {
    const isDark = mode === 'dark';

    return createTheme({
      palette: {
        mode,
        primary: {
          main: isDark ? '#68a0ff' : '#165dff',
        },
        secondary: {
          main: isDark ? '#56d4da' : '#0fa3b1',
        },
        background: {
          default: isDark ? '#0b1320' : '#f2f6fb',
          paper: isDark ? '#111d30' : '#ffffff',
        },
        text: {
          primary: isDark ? '#edf2ff' : '#152033',
          secondary: isDark ? '#afbdd2' : '#5b687a',
        },
      },
      shape: {
        borderRadius: 14,
      },
      typography: {
        fontFamily: 'Space Grotesk, Segoe UI, sans-serif',
        button: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
      components: {
        MuiPaper: {
          styleOverrides: {
            root: {
              border: `1px solid ${isDark ? 'rgba(132, 152, 189, 0.18)' : 'rgba(8, 31, 79, 0.08)'}`,
              boxShadow: isDark ? '0 10px 30px rgba(2, 8, 22, 0.42)' : '0 10px 30px rgba(20, 66, 152, 0.12)',
            },
          },
        },
      },
    });
  }, [mode]);

  const value = useMemo(() => ({ mode, setMode, toggleMode }), [mode]);

  return (
    <AppThemeContext.Provider value={value}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(AppThemeContext);
}
