# Overview

DropOffLens is a customer exit feedback analysis platform that uses AI-powered clustering to identify key churn reasons and generate actionable insights. The application allows users to upload CSV files containing customer feedback or manually input feedback text, then processes this data using OpenAI's GPT-4o model to identify common themes, percentages, representative quotes, and suggested actions for addressing customer concerns.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built as a React Single Page Application (SPA) using:

- **React 18** with TypeScript for type safety and modern React features
- **Vite** as the build tool and development server for fast hot module replacement
- **Wouter** for client-side routing (lightweight alternative to React Router)
- **TanStack Query** for server state management, caching, and data fetching
- **Tailwind CSS** for utility-first styling with custom CSS variables for theming
- **shadcn/ui** component library built on Radix UI primitives for accessible, customizable components

The application follows a component-based architecture with clear separation of concerns:
- Pages handle routing and high-level state management
- Components are reusable UI elements with single responsibilities
- Hooks encapsulate shared logic and state management
- Services handle API communication through the query client

## Backend Architecture

The backend uses a Node.js Express server with:

- **Express.js** as the web framework for API routing and middleware
- **TypeScript** for type safety across the entire stack
- **Multer** for handling file uploads with memory storage
- **In-memory storage** for development (with abstracted storage interface for future database integration)
- **Modular service architecture** separating concerns:
  - CSV parsing service for processing uploaded feedback files
  - OpenAI service for AI-powered feedback analysis
  - PDF generation service for creating downloadable reports

The server implements a RESTful API design with proper error handling, request logging, and CORS support. The storage layer uses an abstract interface pattern, making it easy to swap from in-memory storage to a persistent database solution.

## Data Processing Pipeline

1. **Input Processing**: Users can upload CSV files or manually input feedback text
2. **Data Validation**: CSV files are parsed and validated for required feedback columns
3. **AI Analysis**: Feedback is sent to OpenAI GPT-4o model with structured prompts
4. **Result Processing**: AI responses are parsed and structured into themes with percentages, quotes, and suggested actions
5. **Report Generation**: Analysis results can be exported as HTML reports

## Database Schema

The application defines a PostgreSQL schema using Drizzle ORM with:

- **Users table**: Basic user authentication (currently unused in MVP)
- **Feedback analyses table**: Stores analysis sessions with JSONB fields for flexible data storage
- **Shared schema**: TypeScript types and Zod validation schemas ensure type safety between frontend and backend

The schema is designed to be extensible, with JSONB fields allowing for flexible storage of analysis results and feedback data without rigid column constraints.

## State Management

- **Server State**: Managed by TanStack Query with automatic caching, background refetching, and optimistic updates
- **Client State**: Minimal local state using React hooks (useState, useReducer)
- **Form State**: Uses React Hook Form with Zod validation for type-safe form handling
- **UI State**: Toast notifications and loading states managed through custom hooks

## Authentication & Authorization

The current implementation includes a basic user schema but authentication is not actively implemented in the MVP. The storage interface includes user-related methods, indicating preparation for future authentication features.

# External Dependencies

## AI Services
- **OpenAI GPT-4o**: Primary AI model for analyzing customer feedback and generating insights
- **OpenAI API**: RESTful API integration for text analysis with structured JSON responses

## Cloud Storage
- **Google Cloud Storage**: Configured for file storage capabilities (though primarily using memory storage in current implementation)

## Database
- **Neon Database**: Serverless PostgreSQL provider for data persistence
- **Drizzle ORM**: Type-safe ORM for database operations with PostgreSQL dialect

## File Processing
- **Multer**: Express middleware for handling multipart/form-data file uploads
- **csv-parse**: Library for parsing CSV files with configurable options

## UI/UX Libraries
- **Radix UI**: Unstyled, accessible component primitives for building the design system
- **Lucide Icons**: Icon library for consistent iconography
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens

## Development Tools
- **Vite**: Build tool with plugin support for React, TypeScript, and development optimizations
- **ESBuild**: Fast JavaScript bundler used by Vite for production builds
- **TypeScript**: Static type checking across the entire application stack

## Monitoring & Development
- **Replit Integration**: Development environment integration with runtime error overlays and cartographer for code mapping