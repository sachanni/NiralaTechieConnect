# Nirala Techie Connect

## Overview

Nirala Techie Connect is a community platform for IT professionals residing in Nirala Estate. Its primary purpose is to foster a vibrant tech community by enabling residents to connect, collaborate, share knowledge, and access community services. The platform integrates social networking features with practical utilities such as job boards, skill swapping, event management, a marketplace, and integrated messaging.

## Recent Changes

### Registration Simplification (November 15, 2025)
- **Single-Step Registration**: Reduced registration from 5 steps to 1 step with only essential fields required
- **Required Fields**: Full Name, Email, Password, Flat Number
- **Optional Fields**: Tower Name (free-text input - users can enter any tower name for their society)
- **Profile Completion System**: Users can complete optional profile details later via `/profile/edit` page
- **Profile Completion Indicator**: Dashboard shows completion percentage and missing sections to encourage gradual profile completion
- **Optional Onboarding Wizard**: Users can defer onboarding wizard without marking it complete - wizard reappears on next login
- **React Hook Ordering Fix**: Fixed "Rendered more hooks than during the previous render" error by moving `showOnboarding` state to top level with `useEffect` sync
- **Database Schema Updates**: Made optional fields nullable (occupation, employmentStatus, techStack, categoryRoles, serviceCategories)

### Authentication System Fixes (November 15, 2025)
- **Logout Bug Fix**: Fixed logout function to clear BOTH JWT tokens (accessToken, user) AND Firebase tokens (idToken, userData)
- **Comprehensive Token Support**: Fixed ALL endpoints to support both JWT and Firebase tokens:
  - `/api/events/upload-image` - Event image uploads
  - `/api/users/upload-photo` - Profile photo uploads
  - WebSocket connection - Real-time chat
  - `/api/advertisements` - Service advertisement filtering
- **Unified Auth Middleware**: The `authenticateUser` middleware now properly handles both authentication methods:
  - Tries JWT verification first with `verifyToken(token)`
  - Falls back to Firebase verification with `verifyIdToken(token)` if JWT fails
  - Returns 401 Unauthorized only if both methods fail
- **WebSocket Dual Auth**: WebSocket connections now accept both JWT and Firebase tokens with JWT-first verification
- **Complete Token Management**: All authentication flows now properly manage tokens across email/password (JWT) and phone OTP (Firebase) login methods
- **Registration Integrity**: `/api/users/register` endpoint correctly remains Firebase-only (Phone OTP verification required)

### Event Feedback System (November 15, 2025)
- **QR Code-Accessible Feedback**: Event organizers can generate QR codes for anonymous feedback collection at IT meetup events
- **Public Feedback Form**: `/feedback/:eventId` route accessible without authentication via QR scan, featuring professional tech event background
- **Mobile-First Design**: Fully responsive feedback form with optimized spacing, font sizes, and touch targets for mobile devices
- **Professional Background**: High-quality technology conference image with purple gradient overlay (rgba(88, 28, 135, 0.92) → rgba(17, 24, 39, 0.95))
- **Interactive Rating System**: 5-star rating component with responsive sizing (8px mobile, 10px tablet, 12px desktop) and hover effects
- **Frosted Glass Design**: Modern UI with enhanced glassmorphic cards (backdrop-blur-xl), shadow-2xl depth, and white/20 borders
- **Smart Event Display**: Conditional rendering of event date and location with proper formatting and flex-shrink icons
- **QR Code Generation**: Event organizers can generate, display, and download branded QR codes with feedback URLs
- **URL Shortener Integration**: Built-in guidance for using Bit.ly/TinyURL to create clean QR-friendly URLs
- **Backend Validation**: Fixed missing `insertEventFeedbackSchema` import - Zod schema validation on feedback submission
- **Admin Feedback Dashboard**: `/events/:eventId/feedback-dashboard` route for organizers/admins to view all feedback with statistics, filters, and CSV export
- **Advanced Filtering**: Filter feedback by rating (1-5 stars) and sort by newest, oldest, highest rating, or lowest rating
- **Statistics Cards**: Display total submissions, average rating, and count of detailed comments
- **CSV Export**: One-click export of all feedback data with proper formatting and timestamping
- **Dual-Route Support**: Feedback route works in both authenticated and unauthenticated contexts using wouter's routing system
- **Production Deployment**: Configured with autoscale deployment for seamless publishing with custom domain support

### Follow System & User Discovery (November 14, 2025)
- **Follow/Unfollow Functionality**: Users can now follow/unfollow other members directly from the Find Teammates page and Activity Feed
- **Individual User Profiles**: New `/profile/:userId` route displays detailed user profiles including tech stack, badges, community points, and social links
- **Profile Navigation**: Clickable user cards on Find Teammates and clickable user names on Activity Feed link to individual profile pages
- **Real-time Updates**: Follow/unfollow actions immediately update UI across all pages using React Query cache invalidation with predicate-based patterns
- **Authentication Guards**: All follow actions properly check for authentication and display appropriate loading states

### Forum Category Subscriptions (November 16, 2025)
- **Personalized Discussions Feed**: Users can subscribe to specific forum categories to customize their activity feed
- **Database Schema**: Added `forum_category_subscriptions` table with userId/categoryId unique constraint for efficient subscription management
- **Backend API**: Implemented authenticated subscription endpoints:
  - `POST /api/forum/categories/:categoryId/subscribe` - Subscribe to a category
  - `POST /api/forum/categories/:categoryId/unsubscribe` - Unsubscribe from a category
  - `GET /api/forum/subscriptions` - Fetch user's subscribed categories
  - `GET /api/forum/categories/:categoryId/is-subscribed` - Check subscription status
- **Storage Layer**: Created helper methods (`subscribeToCategory`, `unsubscribeFromCategory`, `getUserSubscribedCategories`, `isUserSubscribed`) with idempotent behavior
- **Frontend Hook**: `useForumSubscriptions` custom hook with React Query integration, proper authentication headers, and toast notifications
- **Category Page UI**: Subscribe/Unsubscribe button on forum category pages with loading states and authentication guards
- **Activity Feed Integration**: Added "Discussions" tab (4th tab) to Dashboard and ActivityFeed showing forum posts and replies from subscribed categories
- **Activity Feed Filtering**: Extended `getActivityFeed` backend method to support 'discussions' filter, fetching forum content filtered by user's subscriptions
- **Activity Rendering**: Added `forum_post` and `forum_reply` activity types with indigo and cyan color schemes and MessageSquare icons
- **Category Pre-selection**: Ask Question flow automatically pre-selects category when clicked from category page via query parameter
- **Dual Storage Architecture**: Configured `storage-methods.ts` to delegate filtered queries (discussions, following, interests) to the main `storage.ts` class for unified filtering logic

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with **React** and **TypeScript**, using **Vite** for tooling. It employs **Radix UI** for accessible primitives and **Shadcn/ui** for a custom-themed design system, styled with **Tailwind CSS** to support light/dark modes. **TanStack Query (React Query)** manages server state and caching, while **React Context API** handles global features. **Wouter** is used for lightweight client-side routing. Key design decisions include a mobile-first responsive design with dynamic navigation (bottom on mobile, sidebar on desktop), real-time chat popups, and toast notifications.

### Backend Architecture

The backend is an **Express.js** application written in **TypeScript** running on **Node.js**. Authentication uses **Firebase Phone OTP** for initial registration only. All passwords are stored as **bcrypt hashes in PostgreSQL**, NOT in Firebase. **Email/password login** validates against the PostgreSQL database. **JWT tokens** manage sessions with 15-minute access tokens and 7-day refresh tokens. A **WebSocket server** provides real-time communication for chat, including typing indicators, read receipts, and message reactions. The API is **RESTful**, supporting CRUD operations with **Bearer token authentication** and **role-based access control**. Security features include **bcrypt** password hashing, **CORS**, **Zod** schema validation, password reset tokens, and SQL injection protection via parameterized queries. **Multer** handles file uploads with specific size and format limits. Asynchronous broadcast notifications are implemented for new content.

### Data Storage

The project uses **PostgreSQL**, hosted on **Neon serverless platform**, as its primary database. **Drizzle ORM** provides type-safe database interactions. The schema includes comprehensive tables for user profiles, chat (conversations, messages), notifications, job boards, ideas, skill swaps, events, and a marketplace. **Drizzle Kit** manages schema migrations.

### Authentication & Authorization

**Registration Flow:** Phone OTP verification via Firebase → Email collection → Password creation (hashed with bcrypt) → Stored in PostgreSQL with Firebase UID as user ID → Welcome email → Onboarding wizard.

**Login Flow:** Email/password validated against PostgreSQL bcrypt hash (NOT Firebase) → JWT tokens generated → Failed attempts tracked → Account lockout after 5 failed attempts for 30 minutes.

**Password Reset Flow:** Email-based only (no OTP option) → UUID token sent via SendGrid → User sets new password → Hashed with bcrypt → Updated in PostgreSQL (NOT Firebase).

**Firebase Role:** ONLY for Phone OTP during registration. Firebase does NOT store or manage passwords. All password operations use PostgreSQL with bcrypt hashing.

Admin access is controlled via an `isAdmin` flag in the `users` table.

### Notification System

A smart, category-based notification system is implemented with granular user preferences. Notifications are delivered via in-app (WebSocket), email (SendGrid), and browser push notifications. Users can enable/disable notifications per category, set email frequency, and filter notifications based on their interests. Features include unread count badges and bulk "mark all as read" functionality.

## External Dependencies

### Third-Party Services

-   **Firebase (Google)**: Phone OTP for registration only. Firebase does NOT store passwords. Admin SDK used for OTP verification.
-   **SendGrid (Twilio)**: Transactional email delivery for password resets, welcome emails, and notification digests.
-   **Razorpay**: Payment gateway for future paid features, supporting INR.
-   **Neon Database**: Serverless PostgreSQL hosting with auto-scaling and connection pooling.
-   **Google Calendar** (Optional): Event synchronization.

### Key Libraries

-   **Backend**: `express`, `ws`, `drizzle-orm`, `firebase-admin`, `@sendgrid/mail`, `bcryptjs`, `jsonwebtoken`, `multer`, `razorpay`, `zod`.
-   **Frontend**: `react`, `@tanstack/react-query`, `wouter`, `@radix-ui/*`, `date-fns`, `canvas-confetti`, `lucide-react`.

### Environment Configuration

All integrations rely on environment variables for portability, including `FIREBASE_SERVICE_ACCOUNT`, `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `EXTERNAL_DATABASE_URL` (or `DATABASE_URL`), `JWT_SECRET`, `APP_URL`, `RAZORPAY_KEY_ID`, and `RAZORPAY_KEY_SECRET`.

## Replit Environment Setup (November 15, 2025)

### Project Configuration
- **Development Server**: Runs on port 5000 (0.0.0.0) with Express serving both API and frontend
- **Frontend**: React + TypeScript + Vite with HMR enabled
- **Backend**: Express + TypeScript with tsx for development
- **Workflow**: Single dev-server workflow running `npm run dev`

### Environment Variables (Configured in Replit Secrets)
- `DATABASE_URL`: PostgreSQL connection string (Neon serverless database)
- `SENDGRID_API_KEY`: Email service API key
- `SENDGRID_FROM_EMAIL`: Verified sender email address
- `FIREBASE_SERVICE_ACCOUNT`: Firebase Admin SDK credentials (JSON)
- Additional configuration available in `.env` file (RAZORPAY keys, Firebase client config)

### Deployment Configuration
- **Target**: Autoscale deployment (stateless, scales automatically)
- **Build Command**: `npm run build` (builds both frontend and backend)
- **Run Command**: `npm start` (runs production server on port 5000)
- **Production**: Serves static frontend from `dist/public`, API from compiled backend