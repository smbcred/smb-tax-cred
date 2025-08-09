# R&D Tax Credit SAAS - Replit Development Guide

## Overview

This is a comprehensive R&D Tax Credit documentation service for small businesses built as a full-stack web application. The platform helps SMBs calculate their potential R&D tax credits, captures leads through an interactive calculator, processes payments via Stripe, collects detailed business information through smart forms, and generates IRS-compliant documentation using AI.

The application follows a structured user journey from discovery through delivery: users start with an interactive calculator, provide contact information to see results, make payment based on dynamic pricing tiers, complete comprehensive intake forms, and receive professionally generated tax documentation packages.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### R&D Tax Credit ASC Calculation Engine (January 9, 2025)
- Implemented comprehensive Alternative Simplified Credit (ASC) calculation method
- Added support for first-time filers (6% rate) vs. experienced filers (14% rate)
- Created proper QRE breakdown with 65% contractor limitation per IRS Section 41
- Integrated prior year QRE support for base amount calculations
- Built pricing tier system ($500-$2500) based on credit amounts
- Added ROI calculations showing service value proposition
- Implemented detailed validation with constructive business guidance
- Enhanced supply QRE calculations including cloud and software costs
- Fixed modal blur effect to properly show/hide results during email capture
- Resolved form submission redirect issue for smooth user experience

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