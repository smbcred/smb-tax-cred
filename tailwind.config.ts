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
        // Core brand palette - HSL Format
        ink: 'hsl(210, 15%, 5%)',
        graphite: 'hsl(220, 10%, 12%)',
        slate: 'hsl(216, 8%, 25%)',
        ash: 'hsl(220, 7%, 58%)',
        cloud: 'hsl(210, 25%, 97%)',
        paper: 'hsl(0, 0%, 100%)',
        
        // Brand blue with shades - HSL Format
        blue: {
          50: 'hsl(217, 58%, 95%)',
          100: 'hsl(217, 58%, 90%)',
          200: 'hsl(217, 58%, 78%)',
          300: 'hsl(217, 58%, 68%)',
          400: 'hsl(217, 58%, 58%)',
          500: 'hsl(217, 58%, 43%)',
          600: 'hsl(217, 59%, 34%)',
          700: 'hsl(217, 59%, 26%)',
          800: 'hsl(217, 59%, 18%)',
          900: 'hsl(217, 59%, 10%)',
          DEFAULT: 'hsl(217, 58%, 43%)',
        },
        
        // Brand emerald with shades - HSL Format
        emerald: {
          50: 'hsl(154, 44%, 94%)',
          100: 'hsl(154, 44%, 87%)',
          200: 'hsl(154, 44%, 75%)',
          300: 'hsl(154, 44%, 62%)',
          400: 'hsl(154, 44%, 50%)',
          500: 'hsl(154, 65%, 34%)',
          600: 'hsl(154, 63%, 25%)',
          700: 'hsl(154, 61%, 19%)',
          800: 'hsl(154, 60%, 13%)',
          900: 'hsl(154, 60%, 7%)',
          DEFAULT: 'hsl(154, 65%, 34%)',
        },
        
        // State colors - HSL Format
        info: 'hsl(211, 92%, 49%)',
        warn: 'hsl(43, 93%, 37%)',
        error: 'hsl(4, 72%, 41%)',
        
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
          50: 'hsl(217, 58%, 95%)',
          100: 'hsl(217, 58%, 90%)',
          200: 'hsl(217, 58%, 78%)',
          300: 'hsl(217, 58%, 68%)',
          400: 'hsl(217, 58%, 58%)',
          500: 'hsl(217, 58%, 43%)',
          600: 'hsl(217, 59%, 34%)',
          700: 'hsl(217, 59%, 26%)',
          800: 'hsl(217, 59%, 18%)',
          900: 'hsl(217, 59%, 10%)',
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          50: 'hsl(154, 44%, 94%)',
          100: 'hsl(154, 44%, 87%)',
          200: 'hsl(154, 44%, 75%)',
          300: 'hsl(154, 44%, 62%)',
          400: 'hsl(154, 44%, 50%)',
          500: 'hsl(154, 65%, 34%)',
          600: 'hsl(154, 63%, 25%)',
          700: 'hsl(154, 61%, 19%)',
          800: 'hsl(154, 60%, 13%)',
          900: 'hsl(154, 60%, 7%)',
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
