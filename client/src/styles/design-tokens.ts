/**
 * @file design-tokens.ts
 * @description Central design system tokens for SMBTaxCredits.com
 * @author SMBTaxCredits.com Team
 * @date 2024-01-15
 * 
 * This file centralizes all design decisions to ensure consistency
 * across the application. It implements the official brand guide
 * specifications for colors, typography, spacing, and effects.
 */

// Color System - Direct from Brand Guide
export const colors = {
  // Core Palette
  ink: '#0B0C0E',        // Primary text, dark UI
  graphite: '#1C1E22',   // Headers, dark surfaces
  slate: '#3B3F45',      // Secondary text
  ash: '#8A9099',        // Tertiary text, icons
  cloud: '#F5F7FA',      // Subtle backgrounds
  paper: '#FFFFFF',      // Main background
  
  // Brand Colors
  blue: {
    DEFAULT: '#2E5AAC',  // Deep Blue - primary actions
    50: '#EBF0FA',
    100: '#D6E0F4',
    200: '#ADC1E9',
    300: '#85A3DE',
    400: '#5C84D3',
    500: '#2E5AAC',      // Base
    600: '#254A8C',
    700: '#1C376B',
    800: '#13254A',
    900: '#0A122A',
  },
  
  emerald: {
    DEFAULT: '#1E8E5A',  // Success, secondary
    50: '#E8F5EF',
    100: '#D1EBDF',
    200: '#A3D7BF',
    300: '#75C39F',
    400: '#47AF7F',
    500: '#1E8E5A',      // Base
    600: '#187148',
    700: '#125536',
    800: '#0C3924',
    900: '#061C12',
  },
  
  // State Colors
  info: '#0B6EEF',
  warn: '#B78103',
  error: '#B42318',
  
  // UI Colors
  border: '#E4E7EC',
  divider: '#E4E7EC',
  
  // Semantic mappings
  primary: '#2E5AAC',
  secondary: '#1E8E5A',
  success: '#1E8E5A',
  warning: '#B78103',
  danger: '#B42318',
  
  // Text colors
  text: {
    primary: '#0B0C0E',    // Ink
    secondary: '#3B3F45',  // Slate
    tertiary: '#8A9099',   // Ash
    inverse: '#FFFFFF',
  },
  
  // Background colors
  background: {
    primary: '#FFFFFF',    // Paper
    secondary: '#F5F7FA',  // Cloud
    tertiary: '#E4E7EC',   // Light gray
  }
} as const;

// Typography System - Direct from Brand Guide
export const typography = {
  // Font families
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
    mono: ['Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
  },
  
  // Font sizes with line heights
  fontSize: {
    display: ['3.5rem', { lineHeight: '1.2' }],      // 56px
    h1: ['2.25rem', { lineHeight: '1.25' }],         // 36px
    h2: ['1.75rem', { lineHeight: '1.3' }],          // 28px
    h3: ['1.375rem', { lineHeight: '1.35' }],        // 22px
    h4: ['1.125rem', { lineHeight: '1.4' }],         // 18px
    body: ['1rem', { lineHeight: '1.6' }],           // 16px
    small: ['0.875rem', { lineHeight: '1.5' }],      // 14px
    micro: ['0.75rem', { lineHeight: '1.4' }],       // 12px
  },
  
  // Font weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Letter spacing
  letterSpacing: {
    tight: '-0.01em',
    normal: '0',
    wide: '0.01em',
    wider: '0.02em',
  },
} as const;

// Spacing System - 4pt grid from Brand Guide
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
} as const;

// Layout System
export const layout = {
  maxWidth: {
    xs: '20rem',      // 320px
    sm: '24rem',      // 384px
    md: '28rem',      // 448px
    lg: '32rem',      // 512px
    xl: '36rem',      // 576px
    '2xl': '42rem',   // 672px
    '3xl': '48rem',   // 768px
    '4xl': '56rem',   // 896px
    '5xl': '64rem',   // 1024px
    '6xl': '72rem',   // 1152px
    '7xl': '80rem',   // 1280px
    container: '75rem', // 1200px - from brand guide
  },
  
  gutter: {
    mobile: '1rem',     // 16px
    tablet: '1.5rem',   // 24px
    desktop: '2rem',    // 32px
  },
} as const;

// Border Radius - from Brand Guide
export const borderRadius = {
  none: '0',
  sm: '0.5rem',     // 8px
  DEFAULT: '0.75rem', // 12px - default from guide
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px - for modals
  xl: '1.25rem',    // 20px
  full: '9999px',   // pills
} as const;

// Shadows - Subtle elevation from Brand Guide
export const shadows = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.06)',    // Elevation 1
  DEFAULT: '0 2px 8px rgba(0, 0, 0, 0.08)', // Elevation 2
  md: '0 2px 8px rgba(0, 0, 0, 0.08)',    // Elevation 2
  lg: '0 8px 24px rgba(0, 0, 0, 0.10)',   // Elevation 3
  xl: '0 16px 48px rgba(0, 0, 0, 0.12)',
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
  focus: '0 0 0 3px rgba(46, 90, 172, 0.25)', // Blue focus
} as const;

// Transitions - from Brand Guide
export const transitions = {
  duration: {
    fast: '120ms',     // micro interactions
    DEFAULT: '200ms',  // UI transitions
    slow: '320ms',     // modals
  },
  
  timing: {
    DEFAULT: 'cubic-bezier(0.2, 0.6, 0.2, 1)', // ease-out from guide
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0.2, 0.6, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// Z-index scale
export const zIndex = {
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  modal: '1040',
  popover: '1050',
  tooltip: '1060',
} as const;

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Component-specific tokens
export const components = {
  button: {
    height: {
      sm: '2.25rem',    // 36px
      DEFAULT: '2.75rem', // 44px - meets touch target
      lg: '3rem',       // 48px
    },
    padding: {
      sm: '0.75rem 1rem',
      DEFAULT: '1rem 1.5rem',
      lg: '1.25rem 2rem',
    },
  },
  
  input: {
    height: '2.75rem',  // 44px - from brand guide
    padding: '0.75rem 1rem',
    borderWidth: '1px',
  },
  
  card: {
    padding: {
      sm: '1rem',       // 16px
      DEFAULT: '1.5rem', // 24px
      lg: '2rem',       // 32px - from guide
    },
  },
  
  navigation: {
    height: '4rem',     // 64px - from brand guide
  },
} as const;

// Icon sizes - from Brand Guide
export const iconSizes = {
  xs: '1rem',    // 16px
  sm: '1.25rem', // 20px
  md: '1.5rem',  // 24px
  lg: '2rem',    // 32px
} as const;

// Export type for TypeScript
export type DesignTokens = {
  colors: typeof colors;
  typography: typeof typography;
  spacing: typeof spacing;
  layout: typeof layout;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  transitions: typeof transitions;
  zIndex: typeof zIndex;
  breakpoints: typeof breakpoints;
  components: typeof components;
  iconSizes: typeof iconSizes;
};

// Default export for easy access
const tokens: DesignTokens = {
  colors,
  typography,
  spacing,
  layout,
  borderRadius,
  shadows,
  transitions,
  zIndex,
  breakpoints,
  components,
  iconSizes,
};

export default tokens;