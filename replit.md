# Nirala Techie Community Platform

## Overview
Nirala Techie is a community platform for IT professionals within a residential society, designed to foster professional networking and collaboration. It enables users to create profiles, showcase skills, and connect with peers. Key features include phone authentication, gamification (points, badges), a job board, an idea wall for project collaboration, a skill-swap system for mentorship, and an event management system. The platform aims to provide a modern, engaging experience inspired by leading professional platforms.

## User Preferences
Preferred communication style: Simple, everyday language.
Mobile UX Priority: Top-notch mobile experience is critical since no native app will be developed - mobile-first approach required.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript, using Vite for tooling.
- **UI/UX**: Utilizes Shadcn/ui (Radix UI based) and Tailwind CSS for styling, incorporating custom design tokens and supporting light/dark modes. The aesthetic is inspired by Linear and GitHub, with Inter and JetBrains Mono as primary fonts.
- **State Management**: React hooks for local UI state, and TanStack Query for server-side state and data fetching.
- **Routing**: Wouter is used for lightweight client-side routing.
- **Application Structure**: A single-page application design manages authenticated and unauthenticated user states.
- **Navigation**: Desktop view includes a "Dashboard" button in the Profile page header for easy navigation back to the main dashboard. Mobile users navigate via the bottom navigation bar.

### Backend
- **Server**: Express.js on Node.js, written in TypeScript.
- **API**: RESTful architecture with JSON data exchange, secured using Bearer token authentication. Multer handles file uploads.
- **Authentication**: Firebase Authentication manages phone OTP, with Firebase Admin SDK for server-side token verification.
- **Authorization**: A simple model where authenticated users generally have equal permissions for core functionalities.

### Data Management
- **Database**: PostgreSQL, hosted on Neon (serverless), with Drizzle ORM for type-safe interactions.
- **Schema**: Comprehensive schema covering users, jobs (with attachments), applications, messaging, ideas, skill swaps, broadcasts, admin actions, and events.
- **File Storage**: 
  - Profile photos: `uploads/profiles/` (5MB limit, JPEG/PNG/GIF/WebP)
  - Resumes: Application uploads (5MB limit, PDF/DOC/DOCX)
  - Job attachments: `uploads/job_attachments/` (10MB limit, JPG/PNG/PDF) - allows users to upload company job posting images/PDFs from WhatsApp groups
  - All managed by Multer with strict format and size validation

### Core Features
- **User Management**: Phone authentication via Firebase, multi-step registration, user profiles with tech stack and professional details.
- **Community & Collaboration**:
    - **Find Teammates**: Search and filter members by skills and location, with WhatsApp integration for direct contact.
    - **In-App Messaging**: Real-time one-on-one chat with WebSocket integration.
    - **Job Board**: Comprehensive job posting and application system with:
        - **80+ Tech Stack Options** organized in 10 categories: Frontend Development, Backend Development, Mobile Development, QA & Testing (Selenium, Cypress, Jest, Playwright), Cloud & Infrastructure, Databases & Data, AI & Machine Learning, Architecture & Design, Leadership & Management, Specialized Skills
        - **7 Experience Levels**: Entry (0-2 years), Mid (2-5 years), Senior (5-8 years), Lead (8-12 years), Principal/Architect (12-15 years), Executive (15-20 years), Director+ (20+ years)
        - **Job Attachments**: Upload job posting images or PDFs (10MB limit, JPG/PNG/PDF) for sharing WhatsApp group job postings
        - Application tracking and applicant management for job posters
        - Mobile-optimized interface with responsive layouts
    - **Idea Wall**: Platform for posting, discovering, and collaborating on ideas, including upvoting, commenting, and team formation features.
    - **Skill Swap**: System for users to define skills they can teach and want to learn, facilitating mentor discovery, direct messaging with mentors before booking, session booking (virtual with Google Meet integration or in-person), and a review system.
    - **Tech Forum**: **Experience-based discussion platform** designed to leverage senior professionals' wisdom that AI cannot replicate. Unlike traditional technical Q&A (which ChatGPT handles well), this forum focuses on real-world experience, career insights, and human mentorship.
        - **8 Experience-Based Categories**:
            1. **Career & Growth** (📈) - Advancing from senior to principal/architect/director roles, salary negotiations, promotions
            2. **System Design & Architecture** (🏗️) - Review real production architectures, scalability challenges, design patterns at scale
            3. **War Stories** (⚔️) - Production incidents, major failures/successes, lessons learned from the trenches
            4. **Leadership & Management** (👔) - Managing teams, navigating office politics, hiring, firing, org dynamics
            5. **Interview Prep** (💼) - Real experiences at FAANG/top companies, interview tips from both sides of the table
            6. **Code Review Sessions** (👀) - Get your actual code reviewed by 15-20 year veterans, pair programming sessions
            7. **Company Culture & Insights** (🏢) - Working at Google vs Amazon vs startups, company comparisons, culture insights
            8. **Office Hours** (🎓) - Schedule 1:1 mentorship time with experts, ask anything sessions
        - **Expert-Focused Features**: Post types (Question, Architecture Review, War Story, Office Hours), expert-only request flags, experience badges (Junior/Mid/Senior/Expert/Veteran based on years)
        - **Community Features**: Threaded replies (1-level deep), upvote/downvote system, best answer marking, spam reporting, points/badges for contributions
        - **Moderation**: Integrated admin moderation for spam reports and content quality
- **Events**: Full event management system including creation, RSVP, QR code-based check-in (with points awarded), and attendee management for organizers.
- **Settings**: Comprehensive user settings and preferences management:
    - **Account Status**: Account deactivation/reactivation toggle with confirmation dialog. Deactivated accounts are hidden from searches while preserving all user data.
    - **Privacy Controls**: Profile visibility (everyone/members/private), message preferences (everyone/connections/nobody), contact information display toggles (show/hide email and phone on profile page).
    - **Notification Preferences**: Granular in-app notification controls for 6 categories: Job Board, Messages, Skill Swap, Ideas, Events, and Forum. Preferences stored as JSON in database.
    - **Auto-save**: All settings changes save automatically with instant feedback via toast notifications.
    - **Mobile-first**: Responsive design with touch-friendly switches and bottom-padding for mobile navigation bar.
- **Profile Privacy**: Email and phone number are displayed on the Profile page only when the user enables "Show Email on Profile" or "Show Phone on Profile" in Settings. This gives users full control over their contact information visibility.
- **Admin Dashboard**: Secure administrative interface for analytics, content moderation (idea approvals, forum reports), broadcasting announcements, data export, and an activity log.

## External Dependencies

### Third-Party Services
- **Firebase**: For phone authentication and administration.
- **Neon Database**: Provides serverless PostgreSQL hosting.
- **Google Calendar API**: Integrated for generating Google Meet links and managing event invitations for Skill Swap sessions.

### Key NPM Dependencies
- **UI**: `@radix-ui/*`, `tailwindcss`, `class-variance-authority`, `canvas-confetti` (for celebratory animations).
- **Forms & Validation**: `react-hook-form`, `@hookform/resolvers`, `zod`.
- **Database ORM**: `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`.
- **Authentication**: `firebase`, `firebase-admin`.
- **File Uploads**: `multer`.
- **QR Code**: `qrcode` (generation), `html5-qrcode` (scanning).
- **Development Tools**: `vite`, `tsx`, `esbuild`.

### Environment Variables
- `DATABASE_URL`
- `FIREBASE_SERVICE_ACCOUNT`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`

## Known Issues & Configuration

### Google Calendar Integration (Virtual Skill Swap Sessions)
**Status:** ⚠️ Requires Admin Configuration

**Issue:** Virtual skill swap sessions cannot create Google Meet links because the Google Calendar integration has insufficient permissions.

**Current Permissions (Read-Only):**
- `calendar.events.public.readonly`
- `calendar.freebusy`
- `calendar.acls.readonly`

**Required Permissions:**
- `calendar.events` (to create events with Google Meet links)

**Temporary Workaround:**
- Booking virtual sessions will show an error: "Unable to create virtual meeting"
- Users can book in-person sessions instead
- Invalid meeting links have been removed from the database

**Solution for Admin:**
1. Go to Replit Secrets/Tools panel
2. Reconnect Google Calendar integration
3. Ensure OAuth scopes include `https://www.googleapis.com/auth/calendar.events`
4. Test by booking a virtual skill swap session

**Code Location:**
- Backend integration: `server/googleCalendar.ts`
- API endpoint: `POST /api/skill-swap/sessions` in `server/routes.ts`