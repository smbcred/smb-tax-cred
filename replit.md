# SMBTaxCredits.com - Replit Development Guide

## Overview

This is a comprehensive R&D Tax Credit documentation service for small businesses built as a full-stack web application. The platform helps SMBs calculate their potential R&D tax credits, captures leads through an interactive calculator, processes payments via Stripe, collects detailed business information through smart forms, and generates IRS-compliant documentation using AI.

The application follows a structured user journey from discovery through delivery: users start with an interactive calculator, provide contact information to see results, make payment based on dynamic pricing tiers, complete comprehensive intake forms, and receive professionally generated tax documentation packages.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### Complete Design System Migration (January 10, 2025)
- **PHASE 1-5 COMPLETED**: Successfully migrated entire application to new robust design system
- **DESIGN TOKENS**: Implemented comprehensive CSS variables for colors, typography, spacing, shadows, and animations
- **COMPONENT ENHANCEMENTS**: Upgraded all buttons, forms, cards with consistent hover/focus states and size variants
- **ANIMATION SYSTEM**: Added 9 animation utilities (fadeIn, slideIn, scaleIn, pulse, spin, bounce) with delay options
- **DARK MODE**: Enhanced dark mode support with component-specific overrides and improved contrast
- **UTILITY CLASSES**: Added flex/grid utilities, transition helpers, accessibility features, loading states
- **PERFORMANCE**: Consolidated styles, removed duplicates, optimized with design token architecture
- **ACCESSIBILITY**: Added focus indicators, screen reader utilities, proper contrast ratios

### Site Rebranding (January 10, 2025)
- **RENAMED SITE**: Changed from "R&D Tax Credit Pro" to "SMBTaxCredits.com" throughout the application
- **UPDATED BRANDING**: Changed all references in navigation, footer, dashboard, and metadata
- **EMAIL UPDATE**: Changed support email from support@rdtaxcreditpro.com to support@smbtaxcredits.com
- **URL UPDATE**: Updated Open Graph URLs to https://smbtaxcredits.com
- **CONSISTENCY**: Ensured consistent branding across all pages and components

### Comprehensive Design System Overhaul (January 9, 2025)
- **DESIGN TOKENS**: Created centralized design system with brand colors from visual identity guide
- **BRAND COLORS**: Implemented blue (#2E5AAC) and emerald (#1E8E5A) as primary/secondary colors
- **TYPOGRAPHY SYSTEM**: Set up Inter font with hierarchical sizes for consistency
- **TAILWIND CONFIG**: Updated with brand palette, custom shadows, and animation utilities
- **ACCESSIBILITY**: Ensured AA compliance with proper contrast ratios and touch targets
- **SPACING GRID**: Implemented 4pt grid system for consistent layout spacing
- **PROFESSIONAL TRUST**: Design emphasizes credibility for SMBs documenting AI experimentation

### Lead Capture Modal System (January 9, 2025)
- **VALUE EXCHANGE**: Modal emphasizes getting "$15,000 credit breakdown" for contact info
- **TRUST SIGNALS**: Added "No credit card required", security badges, 500+ businesses social proof
- **SUCCESS STORY**: Included marketing agency example saving $15K from GPT development
- **FORM VALIDATION**: Real-time validation with helpful error messages
- **MOBILE RESPONSIVE**: Touch-friendly inputs with proper spacing
- **API INTEGRATION**: Connected to existing backend lead capture endpoint
- **CONVERSION FOCUSED**: Appears at peak interest moment after calculation

### AI-Forward Calculator Implementation (January 9, 2025)
- **PIVOTED TO AI-FORWARD**: Changed business types to focus on AI/automation use cases
- **NEW BUSINESS TYPES**: Marketing/Creative Agency, E-commerce, Consulting, SaaS, Healthcare
- **AI ACTIVITIES**: Custom GPTs, Prompt Engineering, Chatbots, AI Automations, Data Analysis
- **ENHANCED VALIDATION**: Comprehensive input validation with AI-specific warnings
- **ROI METRICS**: Added payback days calculation to ROI metrics
- **CONFIDENCE SCORING**: Added confidence level assessment based on data quality

### Complete Calculator Engine Overhaul (January 9, 2025)
- **FIXED CRITICAL BUG**: Employee wages now calculate at full value with R&D allocation percentage
- **FIXED ASC CALCULATION**: Proper implementation with 6% for first-time filers, 14% for repeat filers
- **FIXED PRICING TIERS**: Unified 7-tier system ($500-$2000) aligned across all components
- **FIXED SOFTWARE COSTS**: Removed incorrect 80% reduction - now calculates at full value
- Contractor costs correctly limited to 65% per IRS Section 41 (wages are NOT limited)
- Added R&D allocation percentage input (defaults to 100%) for accurate wage calculations
- Implemented prior year QRE handling for proper ASC base amount calculation
- Federal-only focus confirmed (state credits always 0)
- Enhanced validation with business-friendly warnings and error messages
- Added detailed calculation breakdowns showing wage, contractor, and supply calculations
- Improved UI labels from "AI" to "Innovation" for broader appeal

### Enhanced Calculator UI with 4-Step Flow (January 9, 2025)
- Implemented comprehensive 4-step calculator flow with visual progress indicator
- Created ProgressIndicator component with clickable steps and completion tracking
- Added step validation with clear, constructive error messages
- Implemented keyboard navigation (Enter to advance, Escape to go back)
- Enhanced step management with visited step tracking and smart navigation
- Added error display with red alert boxes and specific guidance
- Integrated help text footer with IRS Section 41 reference
- Successfully tested email capture modal with blur/unblur effects
- Maintained smooth animations and transitions between steps
- Ensured mobile-responsive design with touch-friendly controls

### Innovation Tax Credit Calculator Implementation (January 9, 2025)
- Pivoted from AI-specific to broader innovation tax credit focus
- Built InnovationCalculatorEngine with 10-14% federal credit rates
- Created BusinessExamplesService with industry-specific profiles
- Updated business types to professional services, e-commerce, healthcare, etc.
- Redesigned activities around automation, custom solutions, process optimization
- Implemented sophisticated expense calculation across 4 categories
- Added validation with constructive business guidance
- Created industry presets with real-world examples
- Maintained pricing tier system from $500-$1500
- Enhanced with professional insights and recommendations

### Marketing Copy Integration (January 9, 2025)
- Created comprehensive marketing data files with conversion-optimized copy
- Integrated hero content with powerful value proposition and trust signals
- Implemented benefits content highlighting 6 key features with IRS compliance focus
- Added 3-step process explanation with time estimates and clear descriptions
- Created transparent pricing content with ROI messaging and comparison callout
- Added 10 FAQ items addressing common customer concerns
- Implemented SEO meta tags with structured data for better search visibility
- Created compliance content file for trust-building elements

### Responsive Design Implementation (January 5, 2025)
- Created comprehensive responsive navigation component with mobile hamburger menu
- Built mobile-optimized hero section with intersection observer for performance
- Implemented responsive grid layouts for benefits, pricing, and process steps
- Enhanced all sections with mobile-first breakpoints (sm: 640px, md: 768px, lg: 1024px)
- Added touch-friendly interfaces with minimum 44px touch targets
- Integrated framer-motion animations with scroll-triggered effects
- Optimized font sizes and spacing for mobile devices
- Created reusable responsive components for consistent design patterns

### Database Schema Enhancement (January 5, 2025)
- Enhanced PostgreSQL database schema with comprehensive fields for R&D tax credit documentation
- Added indexes on frequently queried fields for improved performance
- Implemented proper foreign key relationships with CASCADE options
- Added new fields for external integrations (Airtable, Make.com, AWS S3)
- Created subscriptions table for Stripe payment tracking
- Enhanced all tables with additional tracking and metadata fields
- Added JSONB fields for flexible data storage (form sections, calculations)
- Implemented comprehensive field types including inet for IP addresses, bigint for file sizes

### Development Environment Configuration (January 3, 2025)
- Added comprehensive linting with ESLint and code formatting with Prettier
- Configured TypeScript with enhanced path mappings for better imports
- Set up testing framework with Vitest and React Testing Library
- Installed essential development dependencies including:
  - Security packages: helmet, express-rate-limit, express-validator
  - Logging: winston
  - External services: @aws-sdk/client-s3, @sendgrid/mail, airtable
  - File handling: multer, cors
  - Scheduling: node-cron
- Created configuration files for consistent code quality
- Enhanced Tailwind configuration with comprehensive color palette

## System Architecture

### Frontend Architecture
- **Framework**: React 18+ with TypeScript for type safety and modern development patterns
- **Styling**: Tailwind CSS with custom design system variables and shadcn/ui component library
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for robust form handling
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js REST API server
- **Language**: TypeScript throughout the entire codebase for consistency
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **API Design**: RESTful endpoints with proper error handling and logging middleware
- **File Structure**: Modular route handlers with separate storage layer abstraction

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Schema**: Comprehensive database schema including users, companies, calculations, payments, intake forms, leads, and documents
- **Migrations**: Drizzle Kit for database schema migrations and management

### Authentication and Authorization
- **Strategy**: JWT tokens stored in localStorage for client-side authentication
- **Password Security**: bcrypt for secure password hashing with salt rounds
- **Protected Routes**: Custom authentication middleware for API route protection
- **User Sessions**: Token-based authentication with user context propagation

## External Dependencies

### Payment Processing
- **Stripe**: Complete payment processing integration with Stripe Elements for secure card handling
- **Dynamic Pricing**: Tiered pricing structure based on calculated R&D credit amounts
- **Checkout Flow**: Custom checkout page with payment confirmation and error handling

### Database Services
- **Neon Database**: Serverless PostgreSQL with automatic scaling and connection pooling
- **Drizzle ORM**: Type-safe database operations with schema validation

### AI and Document Generation
- **Claude API**: AI-powered narrative generation for R&D tax credit documentation
- **Documint**: PDF generation service for IRS-compliant forms and reports

### Communication Services
- **SendGrid**: Email delivery service for notifications and document delivery
- **Airtable**: Workflow management and lead tracking integration
- **Make.com**: Automation orchestration for business process workflows

### Cloud Storage
- **AWS S3**: Document storage and secure file delivery for generated tax packages

### Development Tools
- **Replit Integration**: Custom Vite plugins for Replit development environment
- **Runtime Error Handling**: Development-specific error overlay and debugging tools

### UI Component System
- **Radix UI**: Accessible, unstyled component primitives for complex UI elements
- **Shadcn/ui**: Pre-built component library with consistent design patterns
- **Font Awesome**: Icon system for consistent visual elements throughout the application

The application is designed as a monorepo with shared TypeScript types and schemas, enabling type safety across the full stack while maintaining clear separation between client and server code.