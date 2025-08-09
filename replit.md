# R&D Tax Credit SAAS - Replit Development Guide

## Overview

This is a comprehensive R&D Tax Credit documentation service for small businesses built as a full-stack web application. The platform helps SMBs calculate their potential R&D tax credits, captures leads through an interactive calculator, processes payments via Stripe, collects detailed business information through smart forms, and generates IRS-compliant documentation using AI.

The application follows a structured user journey from discovery through delivery: users start with an interactive calculator, provide contact information to see results, make payment based on dynamic pricing tiers, complete comprehensive intake forms, and receive professionally generated tax documentation packages.

## User Preferences

Preferred communication style: Simple, everyday language.

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