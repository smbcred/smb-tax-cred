/**
 * @file ThemeProvider.tsx
 * @description Theme provider component for SMBTaxCredits.com design system
 * @author SMBTaxCredits.com Team
 * @date 2024-01-15
 * @knowledgeBase SMBTaxCredits - Visual Brand Identity Guide.md
 * 
 * This component provides:
 * - Theme context for the entire application
 * - Dark mode toggle functionality
 * - Design token access via hooks
 * - Consistent styling across all components
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

// Design tokens matching our CSS custom properties (HSL format)
export const theme = {
  colors: {
    // Core Palette - HSL Format
    ink: 'hsl(210, 15%, 5%)',
    graphite: 'hsl(220, 10%, 12%)',
    slate: 'hsl(216, 8%, 25%)',
    ash: 'hsl(220, 7%, 58%)',
    cloud: 'hsl(210, 25%, 97%)',
    paper: 'hsl(0, 0%, 100%)',

    // Brand Colors - HSL Format
    blue: {
      DEFAULT: 'hsl(217, 58%, 43%)',
      dark: 'hsl(217, 59%, 34%)',
      light: 'hsl(216, 89%, 95%)',
    },
    emerald: {
      DEFAULT: 'hsl(154, 65%, 34%)',
      dark: 'hsl(154, 63%, 25%)',
      light: 'hsl(150, 44%, 93%)',
    },

    // Semantic Colors - HSL Format
    info: 'hsl(211, 92%, 49%)',
    warn: 'hsl(43, 93%, 37%)',
    error: 'hsl(4, 72%, 41%)',
    border: 'hsl(213, 27%, 91%)',
  },

  typography: {
    fonts: {
      sans: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      mono: "'SF Mono', Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    },
    sizes: {
      display: 'clamp(2.5rem, 5vw, 3.5rem)',
      h1: 'clamp(2rem, 4vw, 2.25rem)',
      h2: 'clamp(1.5rem, 3vw, 1.75rem)',
      h3: 'clamp(1.25rem, 2.5vw, 1.375rem)',
      h4: '1.125rem',
      body: '1rem',
      small: '0.875rem',
      micro: '0.75rem',
    },
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeights: {
      tight: 1.2,
      snug: 1.35,
      normal: 1.6,
      relaxed: 1.75,
    },
  },

  spacing: {
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
  },

  layout: {
    containerMax: '1200px',
    containerPadding: '1rem',
    borderRadius: {
      sm: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.5rem',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.06)',
      md: '0 2px 8px rgba(0, 0, 0, 0.08)',
      lg: '0 8px 24px rgba(0, 0, 0, 0.10)',
      xl: '0 16px 48px rgba(0, 0, 0, 0.12)',
    },
  },

  transitions: {
    fast: '150ms ease-out',
    base: '200ms ease-out',
    slow: '300ms ease-out',
    easing: {
      out: 'cubic-bezier(0.2, 0.6, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  zIndex: {
    dropdown: 100,
    sticky: 200,
    fixed: 300,
    modalBackdrop: 400,
    modal: 500,
    popover: 600,
    tooltip: 700,
  },
} as const;

// Theme type
export type Theme = typeof theme;

// Theme mode type
export type ThemeMode = 'light' | 'dark';

// Theme context type
interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
}

// Create theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider props
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
}

/**
 * Theme Provider Component
 * Manages theme state and provides theme context to children
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultMode = 'light' 
}) => {
  // Initialize theme mode from localStorage or default
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('theme-mode') as ThemeMode;
      if (savedMode === 'light' || savedMode === 'dark') {
        return savedMode;
      }
      // Check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return defaultMode;
  });

  // Update document class and localStorage when mode changes
  useEffect(() => {
    const root = document.documentElement;

    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem('theme-mode', mode);
  }, [mode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      const savedMode = localStorage.getItem('theme-mode');
      // Only update if user hasn't explicitly set a preference
      if (!savedMode) {
        setModeState(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Toggle between light and dark mode
  const toggleMode = () => {
    setModeState(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };

  // Set specific mode
  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  const value: ThemeContextType = {
    theme,
    mode,
    toggleMode,
    setMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access theme context
 * @throws Error if used outside ThemeProvider
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};

/**
 * Hook to get current theme colors based on mode
 * Returns appropriate colors for current light/dark mode
 */
export const useThemeColors = () => {
  const { mode } = useTheme();

  // Return mode-specific colors
  const colors = mode === 'dark' ? {
    // Dark mode color mappings
    text: {
      primary: theme.colors.cloud,
      secondary: theme.colors.ash,
      muted: theme.colors.slate,
    },
    background: {
      primary: theme.colors.graphite,
      secondary: theme.colors.ink,
      elevated: theme.colors.slate,
    },
    border: {
      DEFAULT: theme.colors.slate,
      light: theme.colors.ash,
    },
  } : {
    // Light mode color mappings
    text: {
      primary: theme.colors.ink,
      secondary: theme.colors.slate,
      muted: theme.colors.ash,
    },
    background: {
      primary: theme.colors.paper,
      secondary: theme.colors.cloud,
      elevated: theme.colors.paper,
    },
    border: {
      DEFAULT: theme.colors.border,
      light: theme.colors.cloud,
    },
  };

  return colors;
};

/**
 * Hook to check if current mode is dark
 */
export const useIsDarkMode = (): boolean => {
  const { mode } = useTheme();
  return mode === 'dark';
};

/**
 * Hook to get responsive breakpoint status
 */
export const useBreakpoint = (breakpoint: keyof typeof theme.breakpoints): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(`(min-width: ${theme.breakpoints[breakpoint]})`);

    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // Set initial value
    setMatches(query.matches);

    // Listen for changes
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, [breakpoint]);

  return matches;
};

/**
 * Hook to get multiple breakpoint statuses
 */
export const useBreakpoints = () => {
  const sm = useBreakpoint('sm');
  const md = useBreakpoint('md');
  const lg = useBreakpoint('lg');
  const xl = useBreakpoint('xl');
  const xxl = useBreakpoint('2xl');

  return {
    isMobile: !sm,
    isTablet: sm && !lg,
    isDesktop: lg,
    sm,
    md,
    lg,
    xl,
    xxl,
  };
};

// Export theme type for use in components
export type { ThemeContextType };