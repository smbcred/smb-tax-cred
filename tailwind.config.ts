import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        // Core brand palette
        ink: '#0B0C0E',
        graphite: '#1C1E22',
        slate: '#3B3F45',
        ash: '#8A9099',
        cloud: '#F5F7FA',
        paper: '#FFFFFF',
        
        // Brand blue with shades
        blue: {
          50: '#EBF0FA',
          100: '#D6E0F4',
          200: '#ADC1E9',
          300: '#85A3DE',
          400: '#5C84D3',
          500: '#2E5AAC',
          600: '#254A8C',
          700: '#1C376B',
          800: '#13254A',
          900: '#0A122A',
          DEFAULT: '#2E5AAC',
        },
        
        // Brand emerald with shades
        emerald: {
          50: '#E8F5EF',
          100: '#D1EBDF',
          200: '#A3D7BF',
          300: '#75C39F',
          400: '#47AF7F',
          500: '#1E8E5A',
          600: '#187148',
          700: '#125536',
          800: '#0C3924',
          900: '#061C12',
          DEFAULT: '#1E8E5A',
        },
        
        // State colors
        info: '#0B6EEF',
        warn: '#B78103',
        error: '#B42318',
        
        // Keep existing shadcn variables
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          50: '#EBF0FA',
          100: '#D6E0F4',
          200: '#ADC1E9',
          300: '#85A3DE',
          400: '#5C84D3',
          500: '#2E5AAC',
          600: '#254A8C',
          700: '#1C376B',
          800: '#13254A',
          900: '#0A122A',
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          50: '#E8F5EF',
          100: '#D1EBDF',
          200: '#A3D7BF',
          300: '#75C39F',
          400: '#47AF7F',
          500: '#1E8E5A',
          600: '#187148',
          700: '#125536',
          800: '#0C3924',
          900: '#061C12',
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar-background)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        serif: ["var(--font-serif)"],
        mono: ['Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      fontSize: {
        display: ['3.5rem', { lineHeight: '1.2' }],
        h1: ['2.25rem', { lineHeight: '1.25' }],
        h2: ['1.75rem', { lineHeight: '1.3' }],
        h3: ['1.375rem', { lineHeight: '1.35' }],
        h4: ['1.125rem', { lineHeight: '1.4' }],
        body: ['1rem', { lineHeight: '1.6' }],
        small: ['0.875rem', { lineHeight: '1.5' }],
        micro: ['0.75rem', { lineHeight: '1.4' }],
      },
      height: {
        'button': '2.75rem',      // 44px
        'button-sm': '2.25rem',   // 36px
        'button-lg': '3rem',      // 48px
        'input': '2.75rem',       // 44px
        'nav': '4rem',            // 64px
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.06)',
        'DEFAULT': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'md': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'lg': '0 8px 24px rgba(0, 0, 0, 0.10)',
        'xl': '0 16px 48px rgba(0, 0, 0, 0.12)',
        'inner': 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
        'focus': '0 0 0 3px rgba(46, 90, 172, 0.25)',
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
