/**
 * @file tailwind.config.js
 * @description Tailwind CSS configuration for SMBTaxCredits.com
 * @author SMBTaxCredits.com Team
 * @date 2024-01-15
 * @knowledgeBase SMBTaxCredits - Visual Brand Identity Guide.md
 * 
 * This configuration implements the comprehensive design system
 * with custom colors, typography, spacing, and components
 * aligned with the AI-forward SMB brand identity.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      // ====================
      // COLOR SYSTEM
      // ====================
      colors: {
        // Core Palette
        ink: '#0B0C0E',
        graphite: '#1C1E22',
        slate: '#3B3F45',
        ash: '#8A9099',
        cloud: '#F5F7FA',
        paper: '#FFFFFF',
        
        // Brand Colors
        blue: {
          DEFAULT: '#2E5AAC',
          50: '#E8F0FE',
          100: '#C5D9FC',
          200: '#9DBDF9',
          300: '#75A1F6',
          400: '#4D85F3',
          500: '#2E5AAC',
          600: '#234488',
          700: '#1A3366',
          800: '#122244',
          900: '#091122',
        },
        emerald: {
          DEFAULT: '#1E8E5A',
          50: '#E6F7F0',
          100: '#C0EBDA',
          200: '#96DDC1',
          300: '#6CCFA8',
          400: '#42C18F',
          500: '#1E8E5A',
          600: '#176B45',
          700: '#114D31',
          800: '#0B301E',
          900: '#05180F',
        },
        
        // Semantic Colors
        info: '#0B6EEF',
        warn: '#B78103',
        error: '#B42318',
        border: '#E4E7EC',
        
        // Additional Grays for flexibility
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        }
      },
      
      // ====================
      // TYPOGRAPHY
      // ====================
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      
      fontSize: {
        // Custom font sizes with line heights
        'display': ['3.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'h1': ['2.25rem', { lineHeight: '1.25', letterSpacing: '-0.02em' }],
        'h2': ['1.75rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'h3': ['1.375rem', { lineHeight: '1.35' }],
        'h4': ['1.125rem', { lineHeight: '1.4' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'small': ['0.875rem', { lineHeight: '1.5' }],
        'micro': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.02em' }],
        
        // Responsive display size
        'display-responsive': ['clamp(2.5rem, 5vw, 3.5rem)', { 
          lineHeight: '1.2', 
          letterSpacing: '-0.02em' 
        }],
      },
      
      // ====================
      // SPACING
      // ====================
      spacing: {
        '18': '4.5rem',   // 72px
        '22': '5.5rem',   // 88px
        '26': '6.5rem',   // 104px
        '30': '7.5rem',   // 120px
        '34': '8.5rem',   // 136px
        '38': '9.5rem',   // 152px
        '42': '10.5rem',  // 168px
      },
      
      // ====================
      // LAYOUT
      // ====================
      maxWidth: {
        'container': '1200px',
        'prose': '65ch',
      },
      
      borderRadius: {
        'sm': '0.5rem',   // 8px
        'md': '0.75rem',  // 12px
        'lg': '1rem',     // 16px
        'xl': '1.5rem',   // 24px
      },
      
      // ====================
      // SHADOWS
      // ====================
      boxShadow: {
        'smbt-1': '0 1px 2px rgba(0, 0, 0, 0.06)',
        'smbt-2': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'smbt-3': '0 8px 24px rgba(0, 0, 0, 0.10)',
        'smbt-4': '0 16px 48px rgba(0, 0, 0, 0.12)',
        
        // Colored shadows for brand elements
        'blue': '0 4px 14px 0 rgba(46, 90, 172, 0.25)',
        'emerald': '0 4px 14px 0 rgba(30, 142, 90, 0.25)',
        
        // Focus rings
        'focus-blue': '0 0 0 2px #FFFFFF, 0 0 0 4px #2E5AAC',
        'focus-emerald': '0 0 0 2px #FFFFFF, 0 0 0 4px #1E8E5A',
      },
      
      // ====================
      // ANIMATIONS
      // ====================
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        progress: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        }
      },
      
      animation: {
        'fade-in': 'fadeIn 300ms ease-out',
        'slide-up': 'slideUp 200ms ease-out',
        'slide-down': 'slideDown 200ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'progress': 'progress 1s ease-out',
      },
      
      // ====================
      // TRANSITIONS
      // ====================
      transitionTimingFunction: {
        'ease-out-expo': 'cubic-bezier(0.2, 0.6, 0.2, 1)',
        'ease-in-out-expo': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      
      transitionDuration: {
        '350': '350ms',
        '400': '400ms',
      },
      
      // ====================
      // BACKGROUNDS
      // ====================
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
        
        // Brand gradients
        'blue-gradient': 'linear-gradient(135deg, #2E5AAC 0%, #234488 100%)',
        'emerald-gradient': 'linear-gradient(135deg, #1E8E5A 0%, #176B45 100%)',
        'hero-gradient': 'linear-gradient(180deg, #F5F7FA 0%, #FFFFFF 100%)',
      },
      
      // ====================
      // Z-INDEX SCALE
      // ====================
      zIndex: {
        'dropdown': '100',
        'sticky': '200',
        'fixed': '300',
        'modal-backdrop': '400',
        'modal': '500',
        'popover': '600',
        'tooltip': '700',
      },
    },
  },
  plugins: [
    // Form plugin for better form styling
    require('@tailwindcss/forms')({
      strategy: 'class', // Use class strategy to avoid conflicts
    }),
    
    // Typography plugin for prose content
    require('@tailwindcss/typography'),
    
    // Custom plugin for component classes
    function({ addComponents, theme }) {
      addComponents({
        // Button Components
        '.btn': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${theme('spacing.3')} ${theme('spacing.6')}`,
          fontSize: theme('fontSize.body[0]'),
          fontWeight: theme('fontWeight.semibold'),
          lineHeight: '1',
          borderRadius: theme('borderRadius.md'),
          transitionProperty: 'all',
          transitionDuration: theme('transitionDuration.200'),
          transitionTimingFunction: theme('transitionTimingFunction.ease-out'),
          minHeight: '44px',
          whiteSpace: 'nowrap',
          '&:focus-visible': {
            outline: 'none',
            boxShadow: theme('boxShadow.focus-blue'),
          },
          '&:disabled': {
            opacity: '0.6',
            cursor: 'not-allowed',
          },
        },
        
        '.btn-primary': {
          backgroundColor: theme('colors.blue.DEFAULT'),
          color: theme('colors.paper'),
          boxShadow: theme('boxShadow.smbt-1'),
          '&:hover:not(:disabled)': {
            backgroundColor: theme('colors.blue.600'),
            boxShadow: theme('boxShadow.smbt-2'),
            transform: 'translateY(-1px)',
          },
          '&:active:not(:disabled)': {
            transform: 'translateY(0)',
            boxShadow: theme('boxShadow.smbt-1'),
          },
        },
        
        '.btn-secondary': {
          backgroundColor: theme('colors.paper'),
          color: theme('colors.ink'),
          border: `1px solid ${theme('colors.border')}`,
          '&:hover:not(:disabled)': {
            backgroundColor: theme('colors.cloud'),
            borderColor: theme('colors.slate'),
          },
        },
        
        '.btn-success': {
          backgroundColor: theme('colors.emerald.DEFAULT'),
          color: theme('colors.paper'),
          '&:hover:not(:disabled)': {
            backgroundColor: theme('colors.emerald.600'),
          },
          '&:focus-visible': {
            boxShadow: theme('boxShadow.focus-emerald'),
          },
        },
        
        // Card Component
        '.card': {
          backgroundColor: theme('colors.paper'),
          border: `1px solid ${theme('colors.border')}`,
          borderRadius: theme('borderRadius.lg'),
          padding: theme('spacing.6'),
          boxShadow: theme('boxShadow.smbt-1'),
          transition: 'box-shadow 200ms ease-out',
          '&:hover': {
            boxShadow: theme('boxShadow.smbt-2'),
          },
        },
        
        // Form Components
        '.form-input': {
          width: '100%',
          padding: `${theme('spacing.3')} ${theme('spacing.4')}`,
          fontSize: theme('fontSize.body[0]'),
          color: theme('colors.ink'),
          backgroundColor: theme('colors.paper'),
          border: `1px solid ${theme('colors.border')}`,
          borderRadius: theme('borderRadius.md'),
          minHeight: '44px',
          '&:hover': {
            backgroundColor: theme('colors.cloud'),
          },
          '&:focus': {
            outline: 'none',
            borderColor: theme('colors.blue.DEFAULT'),
            boxShadow: '0 0 0 2px rgba(46, 90, 172, 0.25)',
          },
          '&::placeholder': {
            color: theme('colors.ash'),
          },
        },
        
        '.form-label': {
          display: 'block',
          fontSize: theme('fontSize.small[0]'),
          fontWeight: theme('fontWeight.medium'),
          color: theme('colors.slate'),
          marginBottom: theme('spacing.2'),
        },
        
        // Container
        '.container': {
          width: '100%',
          maxWidth: theme('maxWidth.container'),
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: theme('spacing.4'),
          paddingRight: theme('spacing.4'),
          '@media (min-width: 640px)': {
            paddingLeft: theme('spacing.6'),
            paddingRight: theme('spacing.6'),
          },
          '@media (min-width: 1024px)': {
            paddingLeft: theme('spacing.8'),
            paddingRight: theme('spacing.8'),
          },
        },
      })
    },
    
    // Custom utilities
    function({ addUtilities }) {
      const newUtilities = {
        // Text selection colors
        '.text-selection-brand': {
          '&::selection': {
            backgroundColor: '#2E5AAC',
            color: '#FFFFFF',
          },
          '&::-moz-selection': {
            backgroundColor: '#2E5AAC',
            color: '#FFFFFF',
          },
        },
        
        // Scrollbar styling
        '.scrollbar-custom': {
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#F5F7FA',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#8A9099',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: '#3B3F45',
            },
          },
        },
        
        // Loading skeleton
        '.skeleton': {
          backgroundColor: '#F5F7FA',
          backgroundImage: 'linear-gradient(90deg, #F5F7FA 0%, #E4E7EC 50%, #F5F7FA 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s linear infinite',
        },
      }
      
      addUtilities(newUtilities)
    },
  ],
}