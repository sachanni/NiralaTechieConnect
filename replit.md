# Nirala Techie Community Platform

## Overview

Nirala Techie is a community platform designed for IT professionals within a residential society. The platform enables members to register via phone authentication, create profiles showcasing their technical expertise, and connect with fellow developers. It features a gamification system with points and badges to encourage engagement, along with a modern, developer-friendly interface inspired by Linear and GitHub design patterns.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server, providing fast HMR (Hot Module Replacement)
- **Wouter** for lightweight client-side routing instead of React Router
- **TanStack Query (React Query)** for server state management and data fetching

**UI Component System**
- **Shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS** for utility-first styling with custom design tokens
- Custom color system supporting light/dark modes via CSS variables
- Design inspiration from Linear (clean, modern) and GitHub (developer-friendly) patterns
- Typography: Inter font for UI, JetBrains Mono for code/tech elements

**State Management Approach**
- Component-level state with React hooks for UI state
- TanStack Query for server state caching and synchronization
- No global state management library needed due to simple app flow

**Application Flow**
- Single-page application with authenticated and unauthenticated states
- Unauthenticated: landing → phone verification → registration
- Authenticated: dashboard ↔ find teammates (with full routing)
- State transitions managed via local component state in App.tsx
- Authentication token passed through component props
- Wouter routing for authenticated pages (/dashboard, /find-teammates)

### Backend Architecture

**Server Framework**
- **Express.js** on Node.js for REST API endpoints
- TypeScript throughout for type safety
- ESM (ES Modules) module system

**API Design Pattern**
- RESTful endpoints under `/api` prefix
- JSON request/response format
- Bearer token authentication for protected routes
- File upload handling via Multer middleware for profile photos

**Key Endpoints**
- `POST /api/auth/verify` - Verify Firebase ID token and check user existence
- `POST /api/users/register` - Create new user profile
- `POST /api/users/upload-photo` - Upload profile photo (multipart/form-data)
- `GET /api/users/search` - Search and filter users by tech stack, experience, flat block
- `GET /api/users/:id` - Get individual user profile by ID

**Authentication Flow**
1. Client obtains ID token from Firebase Authentication (phone OTP)
2. Client sends ID token to backend for verification
3. Backend validates token with Firebase Admin SDK
4. Backend extracts phone number from verified token
5. Backend checks if user exists or proceeds with registration

### Data Storage

**Database**
- **PostgreSQL** via Neon serverless (connection pooling)
- **Drizzle ORM** for type-safe database queries and migrations
- Schema-first approach with TypeScript types inferred from Drizzle schema

**Database Schema**
- Single `users` table containing all user profile information
- Fields: id (UUID), phoneNumber (unique), fullName, flatNumber, email (unique), company, techStack (array), yearsOfExperience, linkedinUrl, githubUrl, profilePhotoUrl, points, badges (array), createdAt
- Array columns for techStack and badges stored as PostgreSQL array type

**Storage Strategy**
- In-memory storage implementation (`MemStorage`) for development/testing
- Production uses PostgreSQL through Drizzle ORM
- Profile photos stored in filesystem at `attached_assets/uploads/` directory
- Photo URLs stored as relative paths in database

### Authentication & Authorization

**Phone Authentication**
- **Firebase Authentication** for phone number verification with OTP
- Client-side: Firebase Web SDK handles reCAPTCHA and OTP flow
- Server-side: Firebase Admin SDK verifies ID tokens

**Security Implementation**
- Firebase service account credentials stored in `FIREBASE_SERVICE_ACCOUNT` environment variable
- ID tokens include phone number claim used for user identification
- No session management - stateless token verification per request
- Profile photo uploads require valid ID token in Authorization header

**Authorization Model**
- Simple authenticated/unauthenticated model
- All authenticated users have equal permissions
- User identification via phone number extracted from verified tokens

### File Upload System

**Profile Photo Handling**
- **Multer** middleware for multipart form data processing
- File size limit: 5MB per image
- Allowed formats: JPEG, JPG, PNG, GIF, WebP
- Server-side validation of file type via MIME type and extension checking
- Unique filenames generated using UUID to prevent collisions
- Photos stored in `attached_assets/uploads/` directory

## External Dependencies

### Third-Party Services

**Firebase (Authentication)**
- Purpose: Phone number authentication with OTP verification
- Integration: Firebase Web SDK (client) + Firebase Admin SDK (server)
- Configuration: Requires API key, project ID, app ID on client; service account JSON on server

**Neon Database (PostgreSQL)**
- Purpose: Serverless PostgreSQL database hosting
- Integration: Connection via `@neondatabase/serverless` package with WebSocket support
- Configuration: `DATABASE_URL` environment variable for connection string

### Key NPM Dependencies

**UI & Styling**
- `@radix-ui/*` - Accessible, unstyled UI primitives (20+ components)
- `tailwindcss` - Utility-first CSS framework
- `class-variance-authority` - Type-safe variant management for components
- `canvas-confetti` - Celebration effects on dashboard

**Form Management**
- `react-hook-form` - Form state and validation
- `@hookform/resolvers` - Integration with Zod validation
- `zod` - Schema validation (via drizzle-zod)

**Database & ORM**
- `drizzle-orm` - TypeScript ORM
- `drizzle-kit` - Database migration tooling
- `@neondatabase/serverless` - Neon PostgreSQL client with WebSocket support

**Authentication**
- `firebase` - Client-side authentication SDK
- `firebase-admin` - Server-side token verification

**Development Tools**
- `vite` - Build tool and dev server
- `tsx` - TypeScript execution for development
- `esbuild` - Production bundling for server code
- `@replit/*` - Replit-specific development plugins

### Environment Variables Required

- `DATABASE_URL` - PostgreSQL connection string (Neon)
- `FIREBASE_SERVICE_ACCOUNT` - Firebase Admin service account JSON
- `VITE_FIREBASE_API_KEY` - Firebase client API key
- `VITE_FIREBASE_PROJECT_ID` - Firebase project identifier
- `VITE_FIREBASE_APP_ID` - Firebase app identifier

## Features

### 1. Phone Authentication & Registration
- Firebase phone OTP verification
- Multi-step registration form (4 steps): Basic info → Professional details → Tech stack → Profile photo
- Automatic profile photo upload with drag-and-drop support
- Gamification: 50 points awarded on registration
- Tech stack badges automatically assigned based on skills

### 2. Dashboard
- Personalized welcome with confetti celebration
- Profile overview with photo, company, experience
- Points and level progress tracking
- Badge showcase
- Quick links to LinkedIn and GitHub profiles
- Navigation to Find Teammates feature

### 3. Find Teammates (Member Search & Discovery)
- **Purpose**: Connect IT professionals within the residential society based on skills and location
- **Route**: `/find-teammates` (authenticated users only)

**Search & Filter Capabilities:**
- **Tech Stack Filter**: Multi-select checkboxes for 25+ technologies (React, Python, AWS, etc.)
- **Experience Filter**: Dropdown with ranges (0-2, 3-5, 5+ years)
- **Flat Block Filter**: Text input to find neighbors by building block (e.g., "T27", "T17")
- Real-time query updates with TanStack Query caching
- Clear filters button to reset all selections

**Member Discovery:**
- Responsive grid of member cards showing:
  - Profile photo with fallback initials
  - Full name and flat number
  - Company and years of experience
  - Top 4 tech stack badges (with "+N more" indicator)
- Click any member card to view full profile

**Profile View:**
- Complete member details with all tech stack badges
- Community points and earned badges
- **WhatsApp Connect Button**: Opens WhatsApp with pre-filled connection message
- LinkedIn profile link (if available)
- Back to search navigation

**Technical Implementation:**
- Backend: PostgreSQL array overlap search for tech stack filtering
- Frontend: Optimistic UI updates with React Query
- Database queries use Drizzle ORM with proper indexing
- WhatsApp deep linking: `https://wa.me/{phone}?text={message}`

**UX Features:**
- Hover elevation effects on cards
- Loading states with skeleton loaders
- Empty state messaging when no members match filters
- Smooth transitions between list and profile views
- Mobile-responsive design with touch-friendly targets

**Security:**
- Public member discovery (no authentication required for viewing)
- Phone numbers used only for WhatsApp links, not displayed in UI
- Profile data limited to professional information only

### 4. In-App Messaging System
- **Purpose**: Real-time chat communication between community members
- **Route**: `/chat` (authenticated users only)

**Core Features:**
- One-on-one conversations between members
- Real-time message delivery via WebSocket
- Unread message indicators with badge counts
- Conversation history with timestamps
- "Start Chat" button in member profiles (Find Teammates)

**Database Schema:**
- `conversations` table: Tracks conversations between two users with lastMessageAt timestamp
- `messages` table: Stores individual messages with content, sender, read status, and timestamps
- Foreign key relationships ensure data integrity

**API Endpoints:**
- `POST /api/conversations/create` - Create or retrieve conversation between two users
- `GET /api/conversations` - Get all conversations for authenticated user with unread counts
- `POST /api/messages/send` - Send a message (max 5000 characters)
- `GET /api/messages/:conversationId` - Retrieve messages in a conversation
- `POST /api/messages/:conversationId/read` - Mark messages as read
- `GET /api/messages/unread/count` - Get total unread message count

**Real-Time Communication:**
- WebSocket server at `/ws` path with token-based authentication
- Client subscribes to specific conversations for real-time updates
- Message broadcasting to all participants in a conversation
- Automatic reconnection handling on client side

**Security & Authorization:**
- **Conversation Participation Validation**: All endpoints verify user is a participant before allowing access
- **WebSocket Authorization**: Subscription and message sending restricted to conversation participants
- Message content validation (non-empty, max 5000 characters)
- Bearer token authentication required for all chat operations
- 403 Forbidden responses for unauthorized access attempts
- Authorization enforced at storage layer for defense in depth

**UX Features:**
- Conversation list sorted by most recent activity
- Unread message badges on conversations
- Real-time message delivery without page refresh
- Smooth scrolling to latest messages
- Timestamp formatting (time, yesterday, or date)
- Message grouping by sender with visual distinction
- Loading states and error handling

**Technical Implementation:**
- Frontend: React with WebSocket integration and TanStack Query for data management
- Backend: Express with ws package for WebSocket handling
- Storage: Participant validation in both MemStorage and PostgresStorage implementations
- Type-safe message handling with Drizzle ORM schema validation