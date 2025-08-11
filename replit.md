# SMBTaxCredits.com - Replit Development Guide

## Overview
SMBTaxCredits.com is a self-serve SaaS platform designed to help small businesses document their AI experimentation work to claim federal R&D tax credits. It converts practical test-and-learn activities with AI tools like ChatGPT and Claude into IRS-compliant documentation, potentially worth 10-16% of project costs. The platform's core mission is to "Turn everyday AI experiments into tax savings" for businesses *using* AI tools, not building them. It features an interactive calculator for lead capture, processes payments, collects business information via smart forms, and generates IRS-compliant documentation using AI. The service focuses on documentation and explicitly disclaims tax advisory roles, always using "may qualify" language.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18+ with TypeScript.
- **Styling**: Tailwind CSS with custom design system variables and shadcn/ui.
- **State Management**: TanStack React Query for server state and caching.
- **Routing**: Wouter for lightweight client-side routing.
- **Forms**: React Hook Form with Zod validation, multi-step form components with auto-save functionality.
- **Build Tool**: Vite.
- **UI/UX**: Emphasizes credibility for SMBs with a professional design system, including a comprehensive design system overhaul with design tokens for colors (blue, emerald), typography (Inter font), spacing, and animations. It includes enhanced dark mode support, accessibility features (AA compliance, focus indicators), and a 4-step calculator flow with visual progress indicators and clear validation. Now includes comprehensive multi-step intake forms with section navigation, auto-save (2-second debouncing), and mobile-responsive design.

### Backend Architecture
- **Runtime**: Node.js with Express.js REST API server.
- **Language**: TypeScript.
- **Authentication**: JWT-based authentication with bcrypt password hashing.
- **API Design**: RESTful endpoints with error handling and logging middleware.
- **File Structure**: Modular route handlers with storage layer abstraction.

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe operations.
- **Connection**: Neon serverless PostgreSQL with connection pooling.
- **Schema**: Comprehensive database schema for users, companies, calculations, payments, intake forms, leads, and documents, with Drizzle Kit for migrations.

### Authentication and Authorization
- **Strategy**: JWT tokens stored in localStorage.
- **Password Security**: bcrypt for password hashing.
- **Protected Routes**: Custom authentication middleware.

### System Design Choices
- **Business Logic**: Calculator engine overhauled to focus on AI/automation use cases, with specific business types and AI activities. It includes accurate R&D allocation, proper ASC calculation (6% for first-time filers, 14% for repeat), and correct handling of wage and contractor costs (contractor costs limited to 65% per IRS Section 41).
- **Compliance**: Adherence to IRS Section 174 warnings for 2022-2025 regarding capitalization and amortization. The platform is a documentation service only, not a tax advisor.
- **Monorepo Structure**: Shared TypeScript types and schemas for full-stack type safety.

## External Dependencies

### Payment Processing
- **Stripe**: Complete payment processing with Stripe Elements for secure card handling and dynamic tiered pricing.

### Database Services
- **Neon Database**: Serverless PostgreSQL.
- **Drizzle ORM**: Type-safe database operations.

### AI and Document Generation
- **Claude API**: AI-powered narrative generation for R&D tax credit documentation.
- **Documint**: PDF generation service for IRS-compliant forms and reports.

### Communication Services
- **SendGrid**: Email delivery for notifications and document delivery.
- **Airtable**: Workflow management and lead tracking.
- **Make.com**: Automation orchestration for business process workflows.

### Cloud Storage
- **AWS S3**: Document storage and secure file delivery.

### UI Component System
- **Radix UI**: Accessible, unstyled component primitives.
- **Shadcn/ui**: Pre-built component library.
- **Font Awesome**: Icon system.

### User Acceptance Testing
- **Framework**: Comprehensive UAT system with test scenarios, recruitment plan, and feedback collection.
- **Components**: UserFeedbackWidget with multiple trigger modes (float, inline, button) and rating systems.
- **API**: RESTful feedback endpoints with validation, analytics, and testing session tracking.
- **Database**: User feedback and testing session tables with comprehensive metadata and participant tracking.