# 📱 **Community Platform Mobile App - Uizard Design Prompts**

**Project:** Nirala Estate Community Platform  
**Purpose:** Mobile UI/UX design prompts for iOS & Android apps  
**Design Tool:** Uizard (https://app.uizard.io/)  
**Total Screens:** 58 screens organized across 15 feature categories  
**Last Updated:** November 14, 2025

---

## 📋 **TABLE OF CONTENTS**

1. [Design System & Guidelines](#design-system--guidelines)
2. [Screen Categories Overview](#screen-categories-overview)
3. [Authentication Flow (6 screens)](#authentication-flow)
4. [Main Dashboard & Navigation (2 screens)](#main-dashboard--navigation)
5. [Profile & Settings (4 screens)](#profile--settings)
6. [Services Hub (3 screens)](#services-hub)
7. [Ideas Wall (4 screens)](#ideas-wall)
8. [Job Board (6 screens)](#job-board)
9. [Skill Swap (3 screens)](#skill-swap)
10. [Events (7 screens)](#events)
11. [Chat & Messaging (3 screens)](#chat--messaging)
12. [Notifications (1 screen)](#notifications)
13. [Forum / Q&A (3 screens)](#forum--qa)
14. [Community Features (5 screens)](#community-features)
15. [Marketplace - Phase 2 (3 screens)](#marketplace-phase-2)
16. [Tool Rental - Phase 2 (2 screens)](#tool-rental-phase-2)
17. [Gamification (1 screen)](#gamification--achievements)
18. [Networking (1 screen)](#find-teammates)
19. [Admin Features (4 screens)](#admin-features)
20. [User Flows & Navigation Maps](#user-flows--navigation-maps)
21. [Implementation Priority](#implementation-priority)

---

## 🎨 **DESIGN SYSTEM & GUIDELINES**

### **Color Palette**
```
PRIMARY COLORS:
- Primary Purple: #8B46DE
- Primary Dark: #7C3DCE
- Primary Light: #A67BE8

SECONDARY COLORS:
- Accent Purple: #8B5CF6
- Success Green: #10B981
- Warning Orange: #F59E0B
- Danger Red: #EF4444

NEUTRALS:
- Background: #FFFFFF
- Surface: #F9FAFB
- Surface Dark: #F3F4F6
- Border: #E5E7EB
- Text Primary: #111827
- Text Secondary: #6B7280
- Text Tertiary: #9CA3AF

SEMANTIC COLORS:
- Online Status: #10B981 (green)
- Offline: #6B7280 (gray)
- Badge Background: Based on category
- Notification Badge: #EF4444 (red)
```

### **Typography Scale**
```
HEADINGS:
- H1: 32px, Bold (Page titles)
- H2: 24px, Semi-bold (Section headers)
- H3: 20px, Semi-bold (Card titles)
- H4: 18px, Semi-bold (Subsections)

BODY TEXT:
- Large: 16px, Regular (Primary content)
- Medium: 14px, Regular (Default body)
- Small: 12px, Regular (Captions, metadata)

BUTTONS:
- Button Text: 16px, Semi-bold

FONTS:
- Primary: SF Pro (iOS) / Roboto (Android)
- Alternative: Inter, System UI
```

### **Spacing System**
```
PADDING/MARGINS:
- 4px: Micro spacing
- 8px: Tight spacing
- 12px: Small spacing
- 16px: Standard spacing (most common)
- 20px: Medium spacing
- 24px: Large spacing
- 32px: Extra large spacing
- 48px: Section spacing

SCREEN MARGINS:
- Edge padding: 16-20px
- Between cards: 12-16px
- Card internal padding: 16px
```

### **Component Specifications**

**Buttons:**
- Primary: Purple background, white text, 8px radius
- Secondary: White background, purple border & text, 8px radius
- Ghost: Transparent background, colored text
- Minimum height: 44px (touch target)
- Padding: 16px horizontal, 12px vertical
- States: Default, Pressed (darker), Disabled (50% opacity)

**Cards:**
- Border radius: 12px
- Shadow: 0 1px 3px rgba(0,0,0,0.1)
- Padding: 16px
- Background: White
- Border: Optional, 1px #E5E7EB

**Input Fields:**
- Height: 44px minimum
- Border radius: 8px
- Border: 1px solid #E5E7EB
- Focus state: 2px purple border
- Error state: Red border + error text below
- Padding: 12px horizontal

**Avatars:**
- Extra small: 24px
- Small: 32px
- Medium: 48px
- Large: 64px
- Extra large: 96px
- Shape: Circular
- Border: Optional 2px white border with shadow

**Badges/Pills:**
- Border radius: 12px (pill shape)
- Padding: 4px 8px
- Font size: 12px
- Background: Colored (category-based)
- Text: White or contrasting color

**Bottom Navigation:**
- Height: 56px + safe area
- 5 items maximum
- Icon size: 24px
- Icon + label
- Selected state: Primary color
- Unselected: Text secondary color

**Icons:**
- Small: 16px
- Medium: 20px
- Large: 24px
- Extra large: 32px
- Style: Outlined or filled (consistent throughout)

### **Interaction Guidelines**

**Touch Targets:**
- Minimum size: 44x44px
- Spacing between targets: 8px minimum

**Gestures:**
- Tap: Primary action
- Long press: Contextual menu
- Swipe left: Delete/Archive
- Swipe right: Quick action (context-dependent)
- Pull down: Refresh
- Pinch: Zoom (images)

**Transitions:**
- Screen transitions: 300ms ease
- Button press: 150ms ease
- Fade in/out: 200ms
- Slide animations: 250ms

**Loading States:**
- Skeleton screens for content loading
- Spinners for actions (16-24px)
- Progress bars for uploads/downloads
- Pull-to-refresh indicator

**States:**
- Default
- Hover/Focus (subtle background change)
- Active/Pressed (darker background)
- Disabled (50% opacity, no interaction)
- Loading (spinner or skeleton)
- Error (red border/text)
- Success (green indicator)

### **Mobile-Specific Considerations**

**Safe Areas:**
- Respect notch/camera cutout
- Account for navigation bars
- Bottom navigation above gesture bar

**Orientation:**
- Primary: Portrait
- Support: Landscape (where applicable)

**Platform Differences:**
- iOS: System fonts, native navigation patterns
- Android: Material Design principles, FABs

---

## 📱 **SCREEN CATEGORIES OVERVIEW**

| Category | Screens | Priority | Complexity |
|----------|---------|----------|------------|
| Authentication | 6 | High | Medium |
| Dashboard & Nav | 2 | High | High |
| Profile & Settings | 4 | High | Medium |
| Services Hub | 3 | High | Medium |
| Ideas Wall | 4 | Medium | Medium |
| Job Board | 6 | Medium | High |
| Skill Swap | 3 | Medium | Medium |
| Events | 7 | High | High |
| Chat & Messaging | 3 | High | High |
| Notifications | 1 | High | Low |
| Forum / Q&A | 3 | Medium | Medium |
| Community Features | 5 | Medium | Low |
| Marketplace | 3 | Low | Medium |
| Tool Rental | 2 | Low | Medium |
| Gamification | 1 | Low | Low |
| Networking | 1 | Medium | Low |
| Admin Features | 4 | Medium | High |

---

## 🔐 **AUTHENTICATION FLOW**

### **Screen 1: Landing/Splash Screen (Interactive)**
**File name:** `01-landing-splash.png`  
**User flow:** Entry point → Category preview → Login/Register

**Uizard Prompt:**
```
Design an interactive mobile landing screen for a modern community society app called "Nirala Estate". 

HEADER SECTION:
- Light gradient background (top): #F0F7FF to white
- Community illustration at top (160px height):
  * Friendly illustration of diverse people in/around a car/community setting
  * Warm, welcoming colors (pastels: coral, purple, mint)
  * Modern, approachable illustration style
  * Centered, with subtle clouds in background

BRANDING SECTION:
- App logo/icon (60px, centered)
- App name: "Nirala Estate" (28px, bold, #1F2937)
- Tagline: "Join your community today" (14px, #6B7280, centered)
- 16px spacing below tagline

CATEGORY PREVIEW GRID:
- Section label: "Explore Features" (14px, gray, semi-bold, left-aligned, with sparkle icon)
- 2 column grid of category preview cards
- 10 feature cards total (5 rows × 2 columns)

Category card design:
  * Size: 160px × 120px each
  * Background: White
  * Border: 1px solid #E5E7EB
  * Border radius: 16px
  * Shadow: 0 2px 8px rgba(0,0,0,0.06)
  * Padding: 16px
  * Tappable with subtle press effect
  
  Card contents (vertically centered):
  - Icon illustration (48px, centered)
    * Colorful, friendly icons (not just solid colors)
    * Each category has distinct color theme
  - Feature name (12px, semi-bold, centered, #374151)
    * 2 lines max, centered
  
  Card hover/press state:
  - Subtle scale (1.02)
  - Shadow increases slightly
  - Border becomes purple (#8B46DE)

Category cards (in order):

Row 1:
  * Society Events
    - Icon: Calendar with confetti (purple/pink gradient)
  * Idea Sharing
    - Icon: Lightbulb with sparkles (yellow/orange gradient)

Row 2:
  * Health & Wellness
    - Icon: Heart with pulse (red/pink gradient)
  * Festival Events
    - Icon: Gift box with ribbon (orange/gold gradient)

Row 3:
  * Learning & Classes
    - Icon: Book with graduation cap (blue/teal gradient)
  * Smart Mobility
    - Icon: Car/bicycle (green/purple gradient)

Row 4:
  * Professional Services
    - Icon: Briefcase/tools (blue/purple gradient)
  * Monetization
    - Icon: Coins/wallet (gold/green gradient)

Row 5:
  * Sport & Team
    - Icon: Sports equipment (orange/red gradient)
  * Forum
    - Icon: Chat bubbles (blue/purple gradient)

Grid spacing:
- 12px gap between cards
- 16px margins from screen edges
- Grid starts 24px below "Explore Features" label

CALL-TO-ACTION SECTION:
- Fixed at bottom (above safe area)
- Background: White with subtle top shadow
- Padding: 20px

Content:
  * "Get Started" button:
    - Full width (minus 32px margins)
    - Height: 52px
    - Background: Linear gradient (#8B46DE to #8B5CF6)
    - Text: "Get Started" (16px, bold, white)
    - Border radius: 26px (pill shape)
    - Shadow: 0 4px 12px rgba(59, 130, 246, 0.3)
  
  * Login link below button:
    - "Already a member? Login" (14px, centered)
    - "Login" in purple (#8B46DE), semi-bold
    - 12px top margin from button

  * User count indicator:
    - Small avatar stack (3 overlapping circles, 24px each)
    - Text: "Join 100+ neighbors already connected" (12px, gray)
    - Centered, 16px top margin
    - Avatars show diverse community members

OVERALL DESIGN:
- Clean, modern, friendly aesthetic
- Lots of white space
- Colorful but professional
- Interactive and explorable
- Mobile-first (375px width)
- Scrollable content (grid may require vertical scroll)
- Smooth animations on interactions

ACCESSIBILITY:
- High contrast text
- Touch targets minimum 44px
- Clear visual hierarchy
- Icons + text labels for clarity

This design invites exploration while clearly showing the app's value proposition through visual category previews, making it more engaging than a simple login screen.
```

---

### **Screen 2: Category Selector Screen**
**File name:** `02-category-selector.png`  
**User flow:** From Landing → Phone Verification

**Uizard Prompt:**
```
Design a category selection screen for a society app registration flow.

HEADER:
- Back button (left, 24px icon)
- Title: "What brings you here?" (20px, bold)
- Progress indicator: Step 1 of 3 (right side)

CONTENT:
- Subtext: "Select all categories that interest you (you can change this later)" (14px, gray)
- Grid of category cards (2 columns, 4 rows):
  
  Row 1:
  * Tech & Development (laptop icon, purple #8B46DE)
  * Business & Entrepreneurship (briefcase icon, purple #8B5CF6)
  
  Row 2:
  * Design & Creative (palette icon, pink #EC4899)
  * Education & Learning (book icon, green #10B981)
  
  Row 3:
  * Health & Fitness (heart icon, red #EF4444)
  * Food & Culinary (chef hat icon, orange #F59E0B)
  
  Row 4:
  * Home Services (wrench icon, blue-gray #64748B)
  * Events & Entertainment (calendar icon, indigo #6366F1)

CARD DESIGN:
- Each card: 160px × 140px
- Border radius: 12px
- Border: 2px solid #E5E7EB (default), 2px solid category-color (selected)
- Background: White (default), category-color 10% opacity (selected)
- Icon: 32px, centered at top, category color
- Text: Category name (14px, semi-bold, centered)
- Checkbox: Top-right corner (20px)

ROLE SELECTION (appears when category selected):
- Below selected card, show 3 pill buttons:
  * "Provider" (can be selected)
  * "Seeker" (can be selected)
  * "Both" (selects both above)
- Pills: 24px height, 8px padding horizontal, 12px border radius

FOOTER:
- Sticky bottom button: "Continue" (full width - 40px margins, 48px height)
- Button enabled only when at least one category + role selected
- Disabled state: Gray background, 50% opacity
- Enabled state: Blue #8B46DE

SPACING:
- 16px between cards
- 20px screen margins
- 24px spacing before continue button
```

---

### **Screen 3: Phone Verification Screen**
**File name:** `03-phone-verification.png`  
**User flow:** From Category or Login → Registration or Dashboard

**Uizard Prompt:**
```
Design a phone number verification screen for mobile app.

HEADER:
- Back button (left, 24px icon)
- Title: "Verify Your Number" (20px, bold, centered)

HERO ILLUSTRATION:
- Phone with shield/lock icon (security theme)
- Size: 120px × 120px
- Centered below header
- Colors: Purple and gray

CONTENT:
- Main text: "We'll send you a verification code" (16px, centered, gray)
- 24px spacing below illustration

PHONE INPUT SECTION:
- Country code selector:
  * Flag icon (India 🇮🇳)
  * Dropdown showing "+91"
  * 80px width, 48px height
- Phone number input field:
  * Placeholder: "Enter phone number"
  * 10 digit input
  * Type: numeric keyboard
  * Height: 48px
  * Border radius: 8px
  * Border: 1px #E5E7EB

SEND OTP BUTTON:
- Text: "Send OTP"
- Full width (minus 40px margins)
- Height: 48px
- Background: #8B46DE
- Border radius: 8px
- 24px top margin

OTP INPUT SECTION (shown after sending):
- 6 individual digit boxes
- Each box: 48px × 56px
- Border radius: 8px
- Border: 2px #E5E7EB (default), #8B46DE (active), #10B981 (filled)
- 8px spacing between boxes
- Auto-focus next box on digit entry
- Large font: 24px, bold, centered

RESEND SECTION:
- Text: "Didn't receive code?" (14px, gray)
- "Resend" link (14px, purple, semi-bold)
- Timer: "00:59" (countdown, red when <10 seconds)
- Layout: Inline, centered

VERIFY BUTTON:
- Text: "Verify & Continue"
- Full width (minus 40px margins)
- Height: 48px
- Background: #8B46DE
- Enabled only when all 6 digits entered
- 32px top margin

SPACING:
- Screen padding: 20px
- Between sections: 24px
- Input field spacing: 16px
```

---

### **Screen 4: Email/Password Login Screen**
**File name:** `04-email-login.png`  
**User flow:** From Landing → Dashboard

**Uizard Prompt:**
```
Design an email login screen for a mobile community app.

HEADER:
- Back button (left, 24px icon)
- Title: "Welcome Back!" (24px, bold, centered)

HERO ILLUSTRATION:
- Simple envelope or user avatar icon
- Size: 100px × 100px
- Centered
- Color: Purple gradient (#8B46DE to #8B5CF6)

FORM SECTION:
- Email input field:
  * Label: "Email Address" (14px, gray, semi-bold)
  * Input field with @ icon (left side, gray)
  * Placeholder: "you@example.com"
  * Height: 48px
  * Border radius: 8px
  * Type: email keyboard
  
- Password input field:
  * Label: "Password" (14px, gray, semi-bold)
  * Input field with lock icon (left side, gray)
  * Eye icon (right side) to show/hide password
  * Placeholder: "Enter your password"
  * Height: 48px
  * Type: password (masked)
  * 16px top margin

- "Forgot Password?" link:
  * Aligned right
  * 14px, purple, semi-bold
  * 8px top margin

LOGIN BUTTON:
- Text: "Login"
- Full width (minus 40px margins)
- Height: 48px
- Background: #8B46DE
- Border radius: 8px
- 24px top margin

DIVIDER:
- Horizontal line with "OR" text in center
- 32px top/bottom margins
- Line: 1px, #E5E7EB
- "OR" background: white
- "OR" text: 14px, gray

ALTERNATIVE LOGIN:
- "Login with Phone OTP" button:
  * Outlined style (2px purple border)
  * Background: White
  * Text: Blue, 16px, semi-bold
  * Icon: Phone icon (left side)
  * Height: 48px
  * Full width (minus 40px margins)

FOOTER:
- Bottom text: "Don't have an account? Register"
- "Register" is a purple link (semi-bold)
- 14px font size
- Centered
- 24px from bottom

SPACING:
- Screen padding: 20px
- Between form fields: 16px
- Sections spacing: 24px

ERROR STATES:
- Invalid email/password: Red border on field
- Error message: 12px, red, below field
```

---

### **Screen 5: Registration Form Screen**
**File name:** `05-registration-form.png`  
**User flow:** From Phone Verification → Dashboard

**Uizard Prompt:**
```
Design a multi-step registration form for mobile (scrollable single page).

HEADER:
- Back button (left)
- Title: "Complete Your Profile" (20px, bold)
- Progress: "Step 2 of 3" (right side, 14px, gray)
- Progress bar: 66% filled (blue)

PROFILE PHOTO:
- Large circular upload area (96px diameter)
- Camera icon overlay (bottom-right, 32px, purple circle)
- Default: Gray placeholder with user icon
- Centered at top

FORM SECTIONS:

BASIC INFO:
- Section header: "Basic Information" (16px, bold)
- Full Name* (required indicator: red asterisk)
  * Input field, 48px height
  * Placeholder: "Enter your full name"
- Email* (may be pre-filled)
  * Input field with @ icon
  * Verified badge if from email login
- Date of Birth
  * Date picker input
  * Format: DD/MM/YYYY
  * Icon: calendar

RESIDENCE INFO:
- Section header: "Residence Details" (16px, bold)
- Tower Name*
  * Dropdown selector
  * Options: Tower A, Tower B, Tower C, etc.
- Flat Number*
  * Number input
  * Placeholder: "A-101"
- Society Name (pre-filled, disabled)
  * Shows: "Nirala Estate"
  * Gray background
- Residency Type
  * Dropdown: Owner / Tenant
- Resident Since
  * Month/Year picker
  * Format: MM/YYYY

PROFESSIONAL INFO (Optional):
- Section header: "Professional Details (Optional)" (16px, bold)
- Occupation
  * Input field
  * Placeholder: "Software Engineer"
- Company
  * Input field
  * Placeholder: "Company name"
- Employment Status
  * Dropdown: Employed / Self-Employed / Freelancer / Student / Retired / Other
- Brief Introduction
  * Multiline text area (4 rows)
  * Character limit: 300
  * Counter shown: "0/300"
  * Placeholder: "Tell us a bit about yourself..."

ACCOUNT SECURITY (Optional):
- Section header: "Secure Your Account (Optional)" (16px, bold)
- Info text: "Create a password to enable email/password login" (14px, gray)
- Create Password
  * Password field with eye icon
  * Strength indicator bar (weak/medium/strong)
  * Colors: Red/Orange/Green
- Confirm Password
  * Password field
  * Checkmark icon when matches (green)

SUBMIT BUTTON:
- Text: "Complete Registration"
- Full width (minus 40px margins)
- Height: 48px
- Background: #8B46DE
- Border radius: 8px
- Sticky bottom (above safe area)

DESIGN DETAILS:
- Input fields: 8px border radius, 1px border #E5E7EB
- Labels: 14px, gray, semi-bold, 8px bottom margin
- Section headers: 24px top margin, 16px bottom margin
- Between fields: 16px spacing
- Screen padding: 20px
- Sections have subtle background: #F9FAFB, 12px padding, 8px radius
```

---

### **Screen 6: Password Reset Screen**
**File name:** `06-password-reset.png`  
**User flow:** From Phone Verification (forgot password) → Dashboard

**Uizard Prompt:**
```
Design a password reset screen for mobile.

HEADER:
- Back button (left, 24px icon)
- Title: "Reset Password" (20px, bold, centered)

HERO ILLUSTRATION:
- Lock icon with circular arrows (reset symbol)
- Size: 100px × 100px
- Colors: Purple gradient
- Centered

VERIFICATION STATUS:
- Text: "Verified: +91 98XXXXXX45" (16px, centered)
- Green checkmark icon (20px, left of text)
- Background: Light green (#10B981, 10% opacity)
- Padding: 12px
- Border radius: 8px
- 24px spacing below illustration

FORM SECTION:
- New Password input:
  * Label: "New Password" (14px, gray, semi-bold)
  * Input field with lock icon (left)
  * Eye icon (right) to show/hide
  * Height: 48px
  * Border radius: 8px
  
- Password strength indicator:
  * Progress bar below input
  * Colors: Red (weak), Orange (medium), Green (strong)
  * Height: 4px
  * Border radius: 2px
  * Labels: "Weak" / "Medium" / "Strong" (12px)

- Confirm Password input:
  * Label: "Confirm Password" (14px, gray, semi-bold)
  * Input field with lock icon
  * Checkmark icon (right, green) when passwords match
  * 16px top margin

PASSWORD REQUIREMENTS:
- Section header: "Password must contain:" (14px, gray)
- Checklist with icons:
  * ✓ Minimum 8 characters (green when met, gray when not)
  * ✓ At least one uppercase letter
  * ✓ At least one number
  * ✓ At least one special character (optional)
- Each requirement: 14px, left-aligned
- Icon: 16px circle with checkmark
- 8px spacing between items

RESET BUTTON:
- Text: "Reset Password"
- Full width (minus 40px margins)
- Height: 48px
- Background: #8B46DE
- Border radius: 8px
- Enabled only when all requirements met
- 32px top margin
- Disabled state: Gray, 50% opacity

SPACING:
- Screen padding: 20px
- Between sections: 24px
- Input spacing: 16px

SUCCESS STATE (optional variant):
- Green checkmark animation
- Text: "Password reset successful!"
- "Continue to Login" button
```

---

## 📊 **MAIN DASHBOARD & NAVIGATION**

### **Screen 7: Dashboard/Home Screen (Modern Interactive)**
**File name:** `07-dashboard-home.png`  
**User flow:** Post-login main screen

**Uizard Prompt:**
```
Design a modern, engaging mobile dashboard home screen for a society community app.

HERO SECTION:
- Full-width architectural/building background image (280px height)
  * Modern society building or community spaces
  * High-quality, professional photography
  * Dark gradient overlay (60% black from top, 80% black at bottom)
  * Creates welcoming, premium feel

- Home icon (top-left, 32px, white, outlined)
  * Subtle, minimal design
  
- Content overlaid on image (centered):
  * Greeting: "Welcome to My Society!" (28px, bold, white)
    - Centered, 24px from top
  
  * Tagline: "Your community's official platform for services, connections & events" (15px, white, 85% opacity, centered)
    - 16px below greeting
    - Max width: 90% of screen
    - Line height: 1.5

- Notification bell (top-right, 28px, white)
  * Badge: Red dot (10px) if notifications
  * Overlaid on hero image

QUICK ACCESS BUTTONS (overlaid on hero, bottom):
- Two buttons centered, 20px from bottom of hero
- Stacked vertically, 12px gap

  * Primary button: "Explore Features" or "Quick Actions"
    - Width: 280px
    - Height: 48px
    - Background: Semi-transparent white (20% opacity)
    - Border: 1.5px solid white (40% opacity)
    - Text: "Explore Features" (16px, white, bold)
    - Icon: Grid (left, 20px)
    - Border radius: 24px
    - Backdrop blur effect
  
  * Secondary button: "Community Events"
    - Width: 280px
    - Height: 48px
    - Background: Linear gradient (#8B46DE to #8B5CF6)
    - Text: "Community Events" (16px, white, bold)
    - Icon: Calendar (left, 20px)
    - Border radius: 24px
    - Shadow: 0 4px 12px rgba(59, 130, 246, 0.3)

COMMUNITY STATS CARDS:
- Section below hero (starts immediately after hero ends)
- White background
- Padding: 20px (top), 16px (sides)

Stats grid (2×2):
  * Card size: (Screen width - 48px) / 2
  * 12px gap between cards
  * Border radius: 20px
  * Background: White
  * Border: 1px solid #E5E7EB
  * Padding: 20px
  * Shadow: 0 2px 8px rgba(0,0,0,0.04)

Card 1 (Top-Left): Total Residents
  - Icon: Users (40px, purple #8B46DE circle background, 80px diameter)
  - Number: "150+" (32px, bold, #1F2937)
  - Label: "Residents Connected" (13px, #6B7280, centered)
  - Vertical layout, centered

Card 2 (Top-Right): Active Today
  - Icon: Heart/Activity pulse (40px, red/pink #EC4899)
  - Number: "45" (32px, bold, #1F2937)
  - Label: "Active Today" (13px, #6B7280, centered)

Card 3 (Bottom-Left): Events This Month
  - Icon: Calendar (40px, purple #8B5CF6)
  - Number: "12" (32px, bold, #1F2937)
  - Label: "Events This Month" (13px, #6B7280)

Card 4 (Bottom-Right): Services Available
  - Icon: Briefcase (40px, orange #F59E0B)
  - Number: "89" (32px, bold, #1F2937)
  - Label: "Services Available" (13px, #6B7280)

QUICK ACTIONS SECTION:
- Section header: "Quick Actions" (20px, bold, #1F2937)
  * 24px top margin
  * Left-aligned
  * Sparkle icon (20px, left of text)

- Grid layout: 3 columns × 2 rows
- Card design:
  * Size: 104px × 110px
  * Border radius: 16px
  * Background: White
  * Border: 1px #E5E7EB
  * Shadow: 0 2px 6px rgba(0,0,0,0.06)
  * Tappable with press effect
  * Vertical layout

Cards content (centered):
  Row 1:
  * Services
    - Icon: Briefcase (32px, purple #8B46DE)
    - Label: "Services" (13px, bold, #374151)
  
  * Events
    - Icon: Calendar (32px, purple #8B5CF6)
    - Label: "Events" (13px, bold)
  
  * Jobs
    - Icon: Work bag (32px, green #10B981)
    - Label: "Jobs" (13px, bold)
  
  Row 2:
  * Skill Swap
    - Icon: Graduation cap (32px, orange #F59E0B)
    - Label: "Skill Swap" (13px, bold)
  
  * Forum
    - Icon: Chat bubbles (32px, pink #EC4899)
    - Label: "Forum" (13px, bold)
  
  * Ideas
    - Icon: Lightbulb (32px, yellow #FBBF24)
    - Label: "Ideas" (13px, bold)

- 12px gap between cards
- 20px top margin from section header

RECENT ACTIVITY FEED:
- Section header: "Recent Activity" (20px, bold)
  * 28px top margin
  * "See All" link (14px, purple, right-aligned)

- Activity cards (3-4 visible):
  * Background: White
  * Border: 1px #E5E7EB
  * Border radius: 12px
  * Padding: 14px
  * 10px spacing between cards
  
  Card content:
  - Avatar (44px, left, circular)
  - Name (15px, bold, #1F2937)
  - Action: "posted a service" (14px, #6B7280)
  - Time: "2h ago" (12px, #9CA3AF)
  - Activity icon (right, 24px, colored)
  - Engagement row (bottom):
    * Heart icon + count (small, 12px)
    * Comment icon + count (small, 12px)

BOTTOM NAVIGATION:
- Fixed at bottom
- Height: 60px + safe area
- Background: White
- Top border: 1px #E5E7EB
- Slight shadow: 0 -2px 10px rgba(0,0,0,0.04)

- 5 items (evenly spaced):
  * Home (house icon, SELECTED)
    - Icon: 26px, filled, purple #8B46DE
    - Label: "Home" (11px, purple)
    - Active indicator: Purple dot (4px, top)
  
  * Services (grid icon)
    - Icon: 26px, outlined, gray #9CA3AF
    - Label: "Services" (11px, gray)
  
  * Events (calendar icon)
    - Icon: 26px, outlined, gray
    - Label: "Events" (11px, gray)
  
  * Messages (chat icon, badge "2")
    - Icon: 26px, outlined, gray
    - Badge: Red dot (8px) with count
    - Label: "Messages" (11px, gray)
  
  * Profile (user icon)
    - Icon: 26px, outlined, gray
    - Label: "Profile" (11px, gray)

OVERALL DESIGN:
- Modern, clean, professional
- Hero image creates premium feel
- Stats cards show community vitality
- Quick access to all major features
- Scrollable content
- White background for content sections
- Consistent 16px side padding
- 24-28px spacing between major sections

INTERACTIONS:
- Hero buttons tappable
- Stats cards tappable (go to details)
- Quick action cards tappable with scale effect
- Activity cards tappable (go to detail)
- Bottom nav switches screens

This design combines visual appeal (hero image) with functionality (stats, quick actions) while maintaining professional aesthetics suitable for a community platform.
```

---

### **Screen 8: Global Search Screen**
**File name:** `08-global-search.png`  
**User flow:** From Dashboard search bar or dedicated search

**Uizard Prompt:**
```
Design a universal search screen for mobile app.

HEADER:
- Back button (left, 24px)
- Search bar (main focus):
  * Full width (minus back button and margins)
  * Height: 44px
  * Border radius: 8px
  * Background: #F3F4F6
  * Auto-focused with keyboard shown
  * Magnifying glass icon (left)
  * Voice icon (right)
  * Clear X icon (right, when text entered)

RECENT SEARCHES (before searching):
- Section header: "Recent" (16px, bold)
- List items:
  * Clock icon (left, 20px, gray)
  * Search term (16px)
  * X icon to remove (right, 20px)
  * Each item height: 48px
  * Separator lines between items
- "Clear All" link (14px, purple, right-aligned after header)
- 3-5 recent items shown

SEARCH CATEGORIES TABS:
- Horizontal scrollable tabs:
  * All (selected by default)
  * People
  * Services
  * Events
  * Jobs
  * Posts
- Tab design:
  * Pill shape, 32px height
  * Selected: Purple background, white text
  * Unselected: Gray background, gray text
  * 8px gap between tabs
  * 16px top margin

SEARCH RESULTS:
- Results grouped by category if "All" selected
- Category headers: "People" (16px, bold, 24px top margin)

Result card types:

PEOPLE CARD:
- Avatar (48px, left)
- Name (16px, bold)
- Flat number & role (14px, gray)
- "Connect" button (right, small, outlined)
- Height: 72px

SERVICE CARD:
- Service icon (48px, left, colored background circle)
- Service title (16px, bold)
- Provider name (14px, gray)
- Category tag (pill, 12px)
- Rating stars (right)
- Height: 72px

EVENT CARD:
- Event image thumbnail (64px × 64px, left, rounded)
- Event title (16px, bold)
- Date & time (14px, gray)
- Attendee count (12px, gray)
- "RSVP" button (right, small)
- Height: 80px

JOB CARD:
- Company logo (48px, left)
- Job title (16px, bold)
- Company name (14px, gray)
- Location tag (12px, pill)
- Posted time (12px, right, gray)
- Height: 72px

POST CARD:
- User avatar (40px, left)
- Post preview (14px, 2 lines)
- Post type icon (right top)
- Engagement stats (bottom: likes, comments)
- Height: 80px

EMPTY STATE (no results):
- Large magnifying glass illustration (120px)
- Text: "No results found" (18px, bold, centered)
- Sub-text: "Try different keywords" (14px, gray, centered)
- Centered vertically

DEFAULT STATE (before search):
- Magnifying glass illustration (120px)
- Text: "Search for people, services, events and more" (16px, centered, gray)
- Centered vertically

SPACING:
- Screen padding: 16px
- Between result cards: 8px
- Card padding: 12px
- Section spacing: 24px

DESIGN DETAILS:
- Each result card has subtle border: 1px #E5E7EB
- Border radius: 12px on cards
- Background: White cards on #F9FAFB background
- Infinite scroll for results
```

---

## 👤 **PROFILE & SETTINGS**

### **Screen 9: User Profile Screen**
**File name:** `09-user-profile.png`  
**User flow:** From navigation or search

**Uizard Prompt:**
```
Design a user profile screen for a mobile community app.

HEADER:
- Back button (left, 24px, white)
- Share icon (right, 24px, white)
- More menu (3 dots, right, 24px, white)
- Overlaid on cover photo

COVER PHOTO:
- Full width image
- Height: 200px
- Subtle gradient overlay (buildings/abstract pattern)
- Can be custom uploaded or default pattern

PROFILE SECTION:
- Profile photo (96px, circular)
- Positioned: Center, overlapping cover by 48px
- Border: 4px white
- Online status indicator (green dot, 16px, bottom-right of avatar)

USER INFO:
- Name (24px, bold, centered)
- Flat number: "A-204, Tower B" (14px, gray, centered)
- Online status text: "Online now" or "Last seen 2 hours ago" (12px, green/gray)
- Member since: "Member since Jan 2024" (12px, gray)

STATS ROW:
- 3 equal columns:
  * Points: "850" (18px, bold) + "Points" label (12px, gray)
  * Badges: "12" (18px, bold) + "Badges" label (12px, gray)
  * Connections: "89" (18px, bold) + "Connections" label (12px, gray)
- Each tappable to see details
- Background: White
- Height: 70px
- Border top/bottom: 1px #E5E7EB
- 12px spacing from profile info

ACTION BUTTONS ROW:
- 3 equal width buttons:
  * Message (purple, filled)
  * Connect (purple, outlined)
  * Share Profile (gray, outlined)
- Height: 40px
- Border radius: 8px
- 8px gap between buttons
- Icons + text
- 16px margins (sides)
- 16px top margin

CONTENT TABS:
- Tabs: About | Services | Activity | Reviews
- Active tab: Blue underline (3px)
- Tab text: 14px, semi-bold
- Tab height: 44px
- Background: White
- Border bottom: 1px #E5E7EB

ABOUT TAB CONTENT:
- Bio section:
  * "About" header (16px, bold)
  * Bio text (14px, gray, readable line height)
  * "Read more" if truncated
  * 16px padding

- Professional Info:
  * "Professional Details" header (16px, bold)
  * Company icon + "Software Engineer at TechCorp" (14px)
  * Experience icon + "5 years experience" (14px)
  * 12px spacing between items
  * Light gray background section

- Skills section:
  * "Skills to Teach" header (14px, bold)
  * Skills as colored pills/chips:
    - "React" "Node.js" "Python" (12px)
    - Purple background, white text
    - Horizontal wrap
  * "Skills to Learn" header (14px, bold)
  * Skills as pills (different color - purple)
  * 16px spacing

- Badges section:
  * "Achievements" header (16px, bold)
  * Horizontal scroll of badge cards:
    - Badge icon (48px)
    - Badge name (12px)
    - Earned date (10px, gray)
    - Size: 100px × 120px
  * 8px gap between badges

SPACING:
- Screen content padding: 16px
- Section spacing: 24px
- Between items: 12px

DESIGN:
- Background: #F9FAFB
- Content sections: White cards
- Card radius: 12px
- Scrollable content
```

---

### **Screen 10: Edit Profile Screen**
**File name:** `10-edit-profile.png`  
**User flow:** From Profile screen

**Uizard Prompt:**
```
Design an edit profile screen for mobile (scrollable form).

HEADER:
- Left: "Cancel" text button (16px, purple)
- Center: "Edit Profile" (18px, bold)
- Right: "Save" text button (16px, purple, bold)
- Height: 56px
- Border bottom: 1px #E5E7EB

COVER PHOTO EDIT:
- Cover photo (full width, 160px height)
- Semi-transparent overlay on hover
- "Change Cover" button (centered, white, outlined)
- Camera icon

PROFILE PHOTO EDIT:
- Profile photo (96px, centered)
- Overlapping cover by 32px
- "Change Photo" button (floating, bottom-right of avatar)
- Camera icon in purple circle (32px)

FORM SECTIONS:

BASIC INFORMATION:
- Section header: "Basic Information" (16px, bold, gray background)
- Full Name field
  * Label: "Full Name" (14px, gray)
  * Input: 48px height, current value shown
  * Edit icon on focus
- Bio field
  * Label: "Bio" (14px, gray)
  * Multiline input (4 rows)
  * Character counter: "156/300" (12px, gray, right-aligned)
- Email field
  * Label: "Email" (14px, gray)
  * Input with verified badge (green checkmark)
  * Locked icon if verified (can't edit)
- Phone field
  * Label: "Phone Number" (14px, gray)
  * Input with verified badge
  * Locked icon if verified

PROFESSIONAL DETAILS:
- Section header: "Professional Details" (16px, bold)
- Occupation field
- Company field
- Years of Experience (number dropdown: 1-30+)
- LinkedIn URL field (with LinkedIn icon)
- GitHub URL field (with GitHub icon)
- Website field (with globe icon)

SKILLS:
- Section header: "Skills & Expertise" (16px, bold)
- Skills to Teach:
  * Label (14px, gray)
  * Tag input with suggestions dropdown
  * Current tags shown as removable pills (X icon)
  * "+ Add Skill" button
- Skills to Learn:
  * Same design as above
- Tech Stack:
  * Same tag input design
  * Suggestions: React, Python, Node.js, etc.

RESIDENCE:
- Section header: "Residence Details" (16px, bold)
- Tower (dropdown)
- Flat Number (text input)
- Residency Type (dropdown: Owner/Tenant)

PRIVACY:
- Section header: "Privacy Settings" (16px, bold)
- Show Email (toggle switch)
- Show Phone (toggle switch)
- Profile Visibility dropdown:
  * Everyone
  * Members Only
  * Private

SAVE BUTTON:
- Fixed at bottom (above safe area)
- Full width (minus 32px margins)
- Height: 48px
- Background: #8B46DE
- Text: "Save Changes" (16px, white, bold)
- Border radius: 8px

DESIGN DETAILS:
- Input fields: White background, 1px border #E5E7EB
- Border radius: 8px on inputs
- Section headers: #F9FAFB background, 12px padding vertical
- Field spacing: 16px
- Section spacing: 24px
- Screen padding: 16px
- Form is scrollable

STATES:
- Unsaved changes warning on Cancel
- Success toast on save
- Error states on invalid inputs (red border)
```

---

### **Screen 11: Settings Screen**
**File name:** `11-settings.png`  
**User flow:** From bottom navigation or profile

**Uizard Prompt:**
```
Design a settings screen for mobile app.

HEADER:
- Back button (left, 24px)
- Title: "Settings" (20px, bold, centered)
- Height: 56px

USER CARD:
- Avatar (64px, left)
- Name (18px, bold)
- Email (14px, gray)
- "View Profile" link (14px, purple)
- Background: White
- Padding: 16px
- Border radius: 12px
- 16px margin

SETTINGS GROUPS:

ACCOUNT SECTION:
- Section header: "Account" (14px, uppercase, gray, semi-bold)
- Settings items:

  * Profile Settings
    - Icon: User (20px, purple circle background)
    - Text: "Profile Settings" (16px)
    - Subtitle: "Update your profile information" (12px, gray)
    - Arrow icon (right, gray)
    - Height: 60px
  
  * Privacy Settings
    - Icon: Lock (20px, purple circle)
    - Text: "Privacy Settings"
    - Subtitle: "Control who can see your info"
    - Arrow icon
  
  * Change Password
    - Icon: Key (20px, green circle)
    - Text: "Change Password"
    - Arrow icon
  
  * Linked Accounts
    - Icon: Link (20px, orange circle)
    - Text: "Linked Accounts"
    - Subtitle: "Email, Phone" (12px, gray)
    - Arrow icon

NOTIFICATIONS SECTION:
- Section header: "Notifications" (14px, uppercase, gray)
- Items:

  * Notification Preferences
    - Icon: Bell (20px, yellow circle)
    - Text: "Notification Preferences"
    - Arrow icon
  
  * Push Notifications
    - Icon: Bell (20px, yellow circle)
    - Text: "Push Notifications"
    - Toggle switch (right, purple when on)
  
  * Email Notifications
    - Icon: Mail (20px, purple circle)
    - Text: "Email Notifications"
    - Toggle switch

PRIVACY SECTION:
- Section header: "Privacy" (14px)
- Items:

  * Profile Visibility
    - Icon: Eye (20px, indigo circle)
    - Text: "Profile Visibility"
    - Current value: "Everyone" (14px, gray, right)
    - Arrow icon
  
  * Show Email
    - Icon: Mail (20px, purple circle)
    - Text: "Show Email in Profile"
    - Toggle switch
  
  * Show Phone
    - Icon: Phone (20px, green circle)
    - Text: "Show Phone in Profile"
    - Toggle switch
  
  * Who can message me
    - Icon: Message (20px, purple circle)
    - Text: "Who can message me"
    - Current: "Everyone" (14px, gray, right)
    - Arrow

APP SECTION:
- Section header: "App" (14px)
- Items:

  * Dark Mode
    - Icon: Moon/Sun (20px, gray circle)
    - Text: "Dark Mode"
    - Toggle switch
  
  * Language
    - Icon: Globe (20px, purple circle)
    - Text: "Language"
    - Current: "English" (14px, gray, right)
    - Arrow
  
  * About
    - Icon: Info (20px, gray circle)
    - Text: "About"
    - Subtitle: "Version 1.2.3"
    - Arrow
  
  * Help & Support
    - Icon: Question mark (20px, purple circle)
    - Text: "Help & Support"
    - Arrow

DANGER ZONE SECTION:
- Section header: "Danger Zone" (14px, red)
- Background: Light red (#FEE2E2)
- Items:

  * Logout
    - Icon: Logout (20px, red)
    - Text: "Logout" (16px, red)
  
  * Delete Account
    - Icon: Trash (20px, red)
    - Text: "Delete Account" (16px, red)
    - Subtitle: "Permanently delete your account" (12px, red)

DESIGN DETAILS:
- Each item: White background, 1px border #E5E7EB
- Border radius: 8px on cards
- Section spacing: 24px
- Section header: 24px top margin, 12px bottom
- Items in same section: 8px gap
- Icons: Left side, in colored circles (32px diameter)
- Toggle switches: iOS/Material style, purple when on
- Screen background: #F9FAFB
- Screen padding: 16px
- Scrollable content
```

---

### **Screen 12: Notification Settings Screen**
**File name:** `12-notification-settings.png`  
**User flow:** From Settings

**Uizard Prompt:**
```
Design a notification preferences screen for mobile.

HEADER:
- Back button (left, 24px)
- Title: "Notification Settings" (20px, bold)
- Height: 56px

DESCRIPTION:
- Text: "Choose what notifications you want to receive" (14px, gray, centered)
- Background: Light purple (#DBEAFE), 12px padding
- Border radius: 8px
- 16px margin

NOTIFICATION CATEGORIES:

JOB BOARD SECTION:
- Section icon + header: Briefcase icon + "Job Board" (16px, bold)
- Background: White card
- Items with toggle switches:

  * New Job Postings
    - Text: "New Job Postings" (14px)
    - Description: "When jobs matching your skills are posted" (12px, gray)
    - Toggle (right, purple when on)
    - Height: 60px
  
  * Application Updates
    - Text: "Application Updates"
    - Description: "Status changes on your applications"
    - Toggle
  
  * Interview Requests
    - Text: "Interview Requests"
    - Description: "When employers request interviews"
    - Toggle

MESSAGES SECTION:
- Section header: Message icon + "Messages" (16px, bold)
- Items:

  * New Messages
    - Text + description + toggle
  
  * Message Requests
    - Text + description + toggle

SKILL SWAP SECTION:
- Section header: Graduation cap + "Skill Swap" (16px, bold)
- Items:

  * Session Requests
    - Text: "Session Requests"
    - Description: "When someone requests a session with you"
    - Toggle
  
  * Session Reminders
    - Text: "Session Reminders"
    - Description: "Reminders before upcoming sessions"
    - Toggle
  
  * New Reviews
    - Text: "New Reviews"
    - Description: "When someone reviews your session"
    - Toggle

IDEAS SECTION:
- Section header: Lightbulb + "Ideas" (16px, bold)
- Items:

  * Team Applications
    - Toggle
  
  * Idea Updates
    - Toggle
  
  * Comments
    - Toggle

EVENTS SECTION:
- Section header: Calendar + "Events" (16px, bold)
- Items:

  * New Events
    - Text: "New Events"
    - Description: "Events you might be interested in"
    - Toggle
  
  * Event Reminders
    - Text: "Event Reminders"
    - Description: "1 day before and 1 hour before"
    - Toggle
  
  * Event Updates
    - Text: "Event Updates"
    - Description: "Changes to events you're attending"
    - Toggle

FORUM SECTION:
- Section header: Chat bubbles + "Forum" (16px, bold)
- Items:

  * Answers to Questions
    - Toggle
  
  * Mentions
    - Text: "Mentions"
    - Description: "When someone mentions you"
    - Toggle
  
  * Upvotes
    - Text: "Upvotes"
    - Description: "When your answers get upvoted"
    - Toggle

COMMUNITY SECTION:
- Section header: Home + "Community" (16px, bold)
- Items:

  * Announcements
    - Text: "Announcements"
    - Description: "Important community announcements"
    - Toggle (default ON, recommended)
  
  * Lost & Found Matches
    - Text: "Lost & Found Matches"
    - Description: "Potential matches for your lost items"
    - Toggle

NOTIFICATION CHANNELS:
- Section header: "Notification Channels" (16px, bold)
- Items:

  * In-App Notifications
    - Icon: Bell
    - Toggle (cannot disable)
    - Text: "Always enabled"
  
  * Push Notifications
    - Icon: Phone
    - Toggle
  
  * Email Notifications
    - Icon: Mail
    - Toggle
    - Dropdown: Frequency (Instant / Daily Digest / Weekly Summary)

SAVE BUTTON:
- Sticky bottom
- Full width (minus 32px margins)
- Height: 48px
- Background: #8B46DE
- Text: "Save Preferences" (16px, white, bold)

DESIGN DETAILS:
- Each section: White card, border radius 12px
- Section spacing: 16px
- Items separated by 1px divider #E5E7EB
- Item padding: 16px
- Toggle switches: Blue when ON, gray when OFF
- Icons: 20px, colored per category
- Screen background: #F9FAFB
- Screen padding: 16px
- Scrollable content
- Auto-save option (debounced)
```

---

## 💼 **SERVICES HUB**

### **Screen 13: Services Hub Screen**
**File name:** `13-services-hub.png`  
**User flow:** From Dashboard or bottom nav

**Uizard Prompt:**
```
Design a services directory home screen for mobile.

HEADER:
- Back button (left, 24px icon)
- Title: "Services Hub" (20px, bold, centered)
- Search icon (right, 24px icon)
- Height: 56px
- Border bottom: 1px #E5E7EB

HERO BANNER:
- Background: Purple gradient (#8B46DE to #8B5CF6)
- Height: 120px
- Border radius: 16px
- Padding: 20px
- Text: "Find services within your community" (20px, white, bold)
- Subtext: "Connect with skilled neighbors" (14px, white, 80% opacity)
- Icon: Handshake or community icon (48px, white, right side)
- 16px margin (sides and top)

SERVICE CATEGORIES GRID:
- Section header: "Browse Categories" (18px, bold)
- Grid layout: 2 columns
- Card design for each category:
  * Size: 165px × 140px
  * Border radius: 16px
  * Background: White
  * Border: 1px #E5E7EB
  * Subtle shadow
  
  Card contents:
  * Icon: 48px, top center, in colored circle (64px)
  * Category name: 16px, semi-bold, centered
  * Provider count: "23 providers" (12px, gray, centered)
  * "View Services" subtle text (10px, purple, centered)

Categories (8 total):
  
  Row 1:
  * Tech & Development
    - Icon: Laptop (purple #8B46DE)
    - Circle background: Blue 15% opacity
  
  * Business Consulting
    - Icon: Briefcase (purple #8B5CF6)
    - Circle background: Purple 15% opacity
  
  Row 2:
  * Design & Creative
    - Icon: Palette (pink #EC4899)
    - Circle background: Pink 15% opacity
  
  * Education & Tutoring
    - Icon: Book (green #10B981)
    - Circle background: Green 15% opacity
  
  Row 3:
  * Health & Wellness
    - Icon: Heart (red #EF4444)
    - Circle background: Red 15% opacity
  
  * Food & Catering
    - Icon: Chef hat (orange #F59E0B)
    - Circle background: Orange 15% opacity
  
  Row 4:
  * Home Services
    - Icon: Wrench (blue-gray #64748B)
    - Circle background: Gray 15% opacity
  
  * Events & Entertainment
    - Icon: Party popper (indigo #6366F1)
    - Circle background: Indigo 15% opacity

FLOATING ACTION BUTTON:
- Position: Bottom-right
- Above bottom navigation (16px margin from bottom nav)
- 56px diameter circle
- Background: #8B46DE
- Icon: Plus sign (24px, white)
- Label: "My Services" (tooltip on long press)
- Shadow: prominent

BOTTOM NAVIGATION:
- 5 items as per design system
- Services tab highlighted/selected

SPACING:
- Screen padding: 16px
- Between hero and categories: 24px
- Between category cards: 12px
- Section header margin: 16px bottom
- Content scrollable

DESIGN DETAILS:
- Background: #F9FAFB
- Vibrant category colors
- Each category tappable
- Subtle hover/press states
```

---

### **Screen 14: Service Category Listing Screen**
**File name:** `14-service-category-listing.png`  
**User flow:** From Services Hub

**Uizard Prompt:**
```
Design a service provider listing screen for mobile.

HEADER:
- Back button (left, 24px)
- Category title: "Tech & Development" (18px, bold)
- Filter icon (right, 24px)
- Height: 56px

FILTER CHIPS ROW:
- Horizontal scrollable chips
- Chip design:
  * Height: 32px
  * Border radius: 16px (pill)
  * Padding: 8px 16px
  * Selected: Purple background, white text
  * Unselected: Gray background, gray text

Filter options:
  * All (selected by default)
  * Available Now
  * Top Rated (with star icon)
  * Verified (with checkmark icon)
  * Near Me (with location icon)

- 8px gap between chips
- 16px margins (sides)
- 12px top margin

SERVICE PROVIDER CARDS:
- List of provider cards (vertically scrolling)
- Card design:
  * Background: White
  * Border radius: 12px
  * Border: 1px #E5E7EB
  * Padding: 16px
  * Shadow: subtle
  * 12px spacing between cards

Card contents:
  * Top section:
    - Avatar (56px, left, circular)
    - Name (16px, bold)
    - Rating: 4.8 ⭐ (14px, with star icon)
    - Flat/Tower: "A-204, Tower B" (12px, gray)
  
  * Service title: "Full Stack Web Development" (14px, bold)
  * Description: Brief 2-line description (14px, gray, truncated)
  * Skills/Tags section:
    - Horizontal scroll chips
    - "React" "Node.js" "Python" "AWS" (12px)
    - Purple background, white text
    - 6px height padding, 8px horizontal
    - 4px gap between tags
  
  * Bottom section:
    - Left: Availability badge
      - "Available" (green) or "Busy" (orange) or hourly rate "$50/hr"
      - Pill shape, 24px height
    - Right: "Contact" button
      - Blue outlined
      - 32px height, 80px width
      - Icon: Message or phone

EMPTY STATE:
- Centered illustration (120px)
- Icon: Magnifying glass or empty box
- Text: "No providers in this category yet" (16px, bold, centered)
- Subtext: "Be the first to offer your services!" (14px, gray)
- "Offer Your Service" button (purple, filled)

FLOATING ACTION BUTTON:
- Position: Bottom-right, 16px from edges
- Text: "Offer Service" or Plus icon
- 56px diameter
- Purple background
- White icon

SPACING:
- Screen padding: 16px
- Between cards: 12px
- Card internal spacing: 12px between sections
- Content scrollable (infinite scroll)

DESIGN DETAILS:
- Pull to refresh
- Skeleton loading states
- Tag chips horizontally scrollable
- Provider count shown: "Showing 23 providers"
```

---

### **Screen 15: My Services Screen**
**File name:** `15-my-services.png`  
**User flow:** From Services Hub FAB or profile

**Uizard Prompt:**
```
Design a "my services" management screen for mobile.

HEADER:
- Back button (left, 24px)
- Title: "My Services" (20px, bold)
- Add icon (right, 24px, purple)
- Height: 56px

TABS:
- 3 tabs: Active | Pending | Completed
- Active tab underlined (blue, 3px)
- Badge counts: Active (3), Pending (1), Completed (8)
- Tab height: 44px
- Background: White
- Border bottom: 1px #E5E7EB

ADD NEW SERVICE CARD (top of Active tab):
- Prominent card at top
- Background: Purple gradient (#8B46DE to #8B5CF6)
- Border radius: 16px
- Height: 100px
- Padding: 20px
- Content:
  * Plus icon (32px, white, left)
  * Text: "Add New Service" (18px, white, bold)
  * Subtext: "Start offering your skills" (14px, white, 80% opacity)
  * Arrow icon (right)
- Tappable to add service
- 16px margin

SERVICE CARDS:
- List of service cards per tab
- Card design:
  * Background: White
  * Border radius: 12px
  * Border: 1px #E5E7EB
  * Padding: 16px
  * 12px spacing between cards

Card contents:
  * Top section:
    - Category icon (40px, left, colored circle)
    - Service title (16px, bold)
    - Status badge (right top)
      - "Active" (green)
      - "Pending Approval" (orange)
      - "Completed" (gray)
      - Pill shape, 12px text
  
  * Description: 2-line truncated (14px, gray)
  
  * Stats row:
    - Views: Eye icon + "124 views" (12px, gray)
    - Inquiries: Message icon + "8 inquiries" (12px, gray)
    - Layout: Horizontal, icons 16px
  
  * Action buttons (bottom):
    - Edit icon (24px, purple)
    - Delete icon (24px, red)
    - More menu (3 dots, 24px, gray)
    - Right-aligned

ACTIVE TAB specific:
- Shows active service listings
- "Mark as Completed" option in menu
- "View Inquiries" button if inquiries > 0

PENDING TAB specific:
- Shows services awaiting admin approval
- Info text: "Your service is under review" (12px, orange)
- Estimated approval time shown

COMPLETED TAB specific:
- Shows past/completed services
- "Re-activate" option in menu
- Service duration shown: "Active for 3 months"

EMPTY STATE (per tab):
- Icon illustration (100px)
- Text based on tab:
  * Active: "No active services"
  * Pending: "No pending approvals"
  * Completed: "No completed services"
- Subtext: "Start offering your services to the community"
- "Add Service" button (purple, outlined)

FLOATING ACTION BUTTON:
- Bottom-right corner
- Plus icon
- 56px diameter
- Purple background
- Opens add service form

SPACING:
- Screen padding: 16px
- Between cards: 12px
- Card sections: 12px spacing
- Content scrollable

DESIGN DETAILS:
- Swipe card left for quick delete
- Pull to refresh
- Tab badge counts update real-time
- Confirmation dialog for delete
```

---

## 💡 **IDEAS WALL**

### **Screen 16: Idea Wall/Browse Screen**
**File name:** `16-idea-wall-browse.png`  
**User flow:** From Dashboard

**Uizard Prompt:**
```
Design an idea sharing/browse screen for mobile.

HEADER:
- Back button (left, 24px)
- Title: "Idea Wall" (20px, bold)
- Filter icon (right, 24px)
- Add/Post icon (right, 24px)
- Height: 56px

SORTING TABS:
- Horizontal tabs (scrollable):
  * Trending (fire icon)
  * Recent (clock icon)
  * My Ideas (user icon)
  * Saved (bookmark icon)
- Active tab: Purple background, white text
- Inactive: Gray text
- Pill shape, 32px height
- 8px gap between tabs
- 16px margins

IDEA CARDS:
- Vertical scrolling list
- Card design:
  * Background: White
  * Border radius: 12px
  * Border: 1px #E5E7EB
  * Padding: 16px
  * 16px spacing between cards

Card contents:

  * Header section:
    - Creator avatar (40px, left)
    - Name (14px, bold)
    - Posted time (12px, gray) - "2 hours ago"
    - More menu (3 dots, right)
  
  * Idea title (18px, bold, 2 lines max)
  
  * Description (14px, gray, 3 lines max, truncated)
  
  * Category tags:
    - Horizontal pills
    - "Tech" "Startup" "Mobile App" (12px)
    - Colored backgrounds (category-based)
    - 4px gap between tags
  
  * Team needs section:
    - Label: "Looking for:" (12px, gray)
    - Chips: "Designer" "Developer" "Marketer" (12px)
    - Orange background
    - 4px gap
  
  * Status badge:
    - "Seeking Team" or "Team Full" or "In Progress"
    - Pill shape
    - Green (seeking), Blue (in progress), Gray (full)
    - 12px text
  
  * Engagement section (bottom):
    - Left side stats:
      - 👍 24 likes
      - 💬 8 comments
      - 👥 5 interested
      - 12px, gray, with icons
    - Right side:
      - "Join Team" button (purple, filled, 32px height)
      - or "View Details" button

FLOATING ACTION BUTTON:
- Position: Bottom-right
- Icon: Lightbulb or Plus
- 56px diameter
- Background: #8B46DE (blue)
- Text: "Share Idea" (tooltip)
- Shadow: prominent

EMPTY STATE:
- Illustration: Lightbulb (120px)
- Text: "No ideas yet" (18px, bold)
- Subtext: "Be the first to share your innovative idea!"
- "Share Your Idea" button

SPACING:
- Screen padding: 16px
- Between cards: 16px
- Card internal: 12px between sections
- Pull to refresh
- Infinite scroll

DESIGN DETAILS:
- Trending tag/fire icon for hot ideas
- Save/bookmark icon (top-right of card)
- Like button interactive
- Skeleton loaders
- Filter options: Category, Team status, Date posted
```

---

### **Screen 17: Idea Details Screen**
**File name:** `17-idea-details.png`  
**User flow:** From Idea Wall

**Uizard Prompt:**
```
Design an idea detail view screen for mobile.

HEADER:
- Back button (left, 24px, white over image)
- Share icon (right, 24px, white)
- Bookmark icon (right, 24px, white)
- Overlaid on cover/hero image or gradient

CREATOR INFO CARD:
- White card with shadow
- Avatar (48px, left)
- Name (16px, bold)
- Role: "Idea Creator" (12px, gray)
- "Message" button (right, purple, outlined, 32px height)
- Card padding: 12px
- 16px margin from edges

IDEA CONTENT:

Title section:
- Idea title (24px, bold, 2-3 lines allowed)
- Posted date (12px, gray) - "Posted 2 days ago"
- 16px spacing

Category tags row:
- Pills: "Tech" "Startup" "SaaS" (12px)
- Colored backgrounds
- 4px gap

Full description:
- Description text (16px, readable line height)
- Multiple paragraphs allowed
- No truncation
- 20px spacing from tags

"What we're building" section:
- Section header (18px, bold)
- Bullet points or paragraphs
- Icon: Rocket (20px, purple)
- Background: Light purple (#DBEAFE), 12px padding
- Border radius: 8px

"Team needs" section:
- Section header (18px, bold)
- Open position cards:
  
  Position card:
  * Title: "Frontend Developer" (16px, semi-bold)
  * Icon: Code (24px, colored circle)
  * Requirements list (14px):
    - React expertise
    - 2+ years experience
    - Available 10hrs/week
  * "Apply for this role" button (purple, outlined, full width of card)
  * Card background: White
  * Border: 1px #E5E7EB
  * Border radius: 12px
  * Padding: 16px
  * 12px spacing between position cards

"Current Team" section:
- Section header (16px, bold)
- Avatar stack (overlapping circles)
- Names list:
  * Avatar (32px)
  * Name (14px)
  * Role in team (12px, gray)
  * 8px spacing between members
- Grid or list layout

Comments section:
- Section header: "Comments (12)" (16px, bold)
- Sort: Recent / Top
- Comment cards:
  * Avatar (32px, left)
  * Name (14px, bold)
  * Comment text (14px)
  * Time (12px, gray)
  * Like button (small heart icon + count)
  * Reply button
  * Card padding: 12px
  * 8px spacing between comments

"Add comment" input:
- Fixed at bottom (above keyboard when active)
- Input field (40px height)
- Send button (blue icon)
- Background: White
- Border top: 1px #E5E7EB

ENGAGEMENT BUTTONS (sticky header):
- Row of buttons just below creator card:
  * Like (heart icon + count)
  * Comment (bubble icon + count)
  * Share (arrow icon)
- Background: White
- Border bottom: 1px #E5E7EB
- Icons: 20px
- Text: 12px

SPACING:
- Screen padding: 16px
- Section spacing: 24px
- Scrollable long-form content

DESIGN DETAILS:
- Hero image/gradient at top (optional)
- Sticky engagement bar
- Comment input expands when focused
- "Interested" button to join waitlist
```

---

### **Screen 18: My Ideas Screen**
**File name:** `18-my-ideas.png`  
**User flow:** From Idea Wall or Profile

**Uizard Prompt:**
```
Design a "my ideas" management screen for mobile.

HEADER:
- Back button (left, 24px)
- Title: "My Ideas" (20px, bold)
- Add icon (right, 24px, purple)
- Height: 56px

TABS:
- 3 tabs: Posted | Saved | Applications
- Badge counts: Posted (2), Saved (5), Applications (3)
- Active tab: Blue underline (3px)
- Tab height: 44px
- Background: White
- Border bottom: 1px #E5E7EB

POSTED TAB:
- My posted ideas

Idea card:
  * Idea thumbnail/icon (64px, left, colored circle)
  * Title (16px, bold)
  * Status badge (right top):
    - "Active" (green)
    - "Team Full" (blue)
    - "On Hold" (gray)
    - "Completed" (purple)
  
  * Team progress bar:
    - Visual bar showing filled positions
    - "3/5 positions filled" (12px)
    - Progress: 60% (green fill)
  
  * Stats row:
    - Views: Eye icon + "234 views"
    - Applications: User icon + "12 applications"
    - Comments: Bubble icon + "8"
    - 12px, gray, icons 16px
  
  * Action buttons:
    - "View Applications" (purple, outlined, full width)
    - Edit icon (24px, purple, right)
    - Delete/Archive icon (24px, gray, right)
  
  * Card design:
    - White background
    - Border radius: 12px
    - Padding: 16px
    - Border: 1px #E5E7EB
    - 12px spacing between cards

SAVED TAB:
- Ideas bookmarked/saved

Saved idea card:
  * Similar to browse view
  * Bookmark icon (filled, top-right)
  * Creator info shown
  * "View Idea" button
  * Swipe left to unsave

APPLICATIONS TAB:
- Ideas I applied to join

Application card:
  * Idea title (16px, bold)
  * Role applied for: "Frontend Developer" (14px, gray)
  * Application status:
    - "Pending" (orange)
    - "Accepted" (green)
    - "Rejected" (red)
    - "Interview Requested" (blue)
  * Applied date (12px, gray)
  * Creator avatar + name
  * "View Status" or "View Idea" button
  * "Withdraw Application" option (if pending)

EMPTY STATES:
Per tab:
  * Posted: "You haven't shared any ideas yet"
    - Icon: Lightbulb
    - "Share Your Idea" button
  
  * Saved: "No saved ideas"
    - Icon: Bookmark
    - "Browse Ideas" button
  
  * Applications: "You haven't applied to any teams"
    - Icon: Users
    - "Browse Ideas" button

FLOATING ACTION BUTTON:
- Bottom-right
- Icon: Plus or Lightbulb
- 56px diameter
- Purple background
- Opens "Post Idea" form

SPACING:
- Screen padding: 16px
- Between cards: 12px
- Card sections: 12px
- Scrollable content

DESIGN DETAILS:
- Pull to refresh
- Swipe actions (delete, archive)
- Filter options per tab
- Sort options: Recent, Popular, Status
```

---

### **Screen 19: Team Applications Screen**
**File name:** `19-team-applications.png`  
**User flow:** From My Ideas (Posted tab)

**Uizard Prompt:**
```
Design a team applications review screen for mobile.

HEADER:
- Back button (left, 24px)
- Idea title: "[Idea Name] - Applications" (18px, bold, truncated)
- More menu (right, 3 dots, 24px)
- Height: 56px

STATUS FILTER CHIPS:
- Horizontal scrollable:
  * All (selected)
  * Pending (12)
  * Accepted (3)
  * Declined (5)
- Pill shape, 32px height
- Badge counts shown
- Active: Purple background
- 8px gap, 16px margins

APPLICATION CARDS:
- List of applicant cards

Card design:
  * Background: White
  * Border radius: 12px
  * Border: 1px #E5E7EB
  * Padding: 16px
  * 12px spacing between cards

Card contents:

  * Top section:
    - Avatar (56px, left, circular)
    - Name (16px, bold)
    - Flat/Tower info (12px, gray)
    - Application status badge (right):
      - "Pending" (orange pill)
      - "Accepted" (green pill)
      - "Declined" (red pill)
  
  * Applied for role:
    - Text: "Applied for: Frontend Developer" (14px, semi-bold)
    - Role icon (20px, purple)
  
  * Skills match section:
    - "Skills Match: 8/10" (14px, green text)
    - Matching skills highlighted:
      - "React" "TypeScript" "Node.js" (12px pills, green background)
    - Missing skills grayed:
      - "GraphQL" "Docker" (12px pills, gray background)
    - Horizontal scroll
  
  * Application message/cover letter:
    - "Message:" label (12px, gray)
    - Message preview (14px, 3 lines max, expandable)
    - "Read more" link if truncated
    - Background: #F9FAFB
    - Padding: 12px
    - Border radius: 8px
  
  * Meta info:
    - Applied time: "Applied 2 days ago" (12px, gray)
    - Profile views: "Viewed profile" (if applicable)
  
  * Action buttons row:
    - "Accept" button (green, filled, flex 1)
    - "Decline" button (red, outlined, flex 1)
    - "Message" button (purple, outlined, icon only or small)
    - 8px gap between buttons
    - All buttons: 36px height
  
  * Additional actions:
    - "View Full Profile" link (14px, purple, center)

ACCEPTED state card variant:
  * Green left border (4px)
  * "Accepted on [date]" text
  * "Message" button only
  * "Remove from team" option in menu

DECLINED state card variant:
  * Red left border (4px)
  * "Declined on [date]" text
  * "Reconsider" button option
  * Slightly grayed out

EMPTY STATE:
- Icon: Inbox or User group (100px)
- Text: "No applications yet" (18px, bold)
- Subtext: "Share your idea to attract team members"
- "Share Idea" button

BULK ACTIONS (when selecting multiple):
- Checkbox mode enabled
- Top bar shows selected count
- "Accept All" and "Decline All" buttons
- Bottom action bar

FLOATING INFO:
- Total applications count card (top):
  * "12 total applications"
  * "3 pending review"
  * Background: Light blue
  * 12px padding
  * Border radius: 8px
  * 16px margin

SPACING:
- Screen padding: 16px
- Between cards: 12px
- Card internal: 12px
- Scrollable

DESIGN DETAILS:
- Swipe card for quick accept/decline
- Filter by skills match percentage
- Sort by: Date, Skills match, Rating
- Pull to refresh
- Decision confirmation dialogs
```

---

*Due to character limits, I'll continue this document in a follow-up response. Would you like me to continue creating the remaining sections?*

The document will include all remaining screens:
- Job Board (6 screens)
- Skill Swap (3 screens)
- Events (7 screens)
- Chat & Messaging (3 screens)
- Notifications (1 screen)
- Forum / Q&A (3 screens)
- Community Features (5 screens)
- Marketplace (3 screens)
- Tool Rental (2 screens)
- Gamification (1 screen)
- Networking (1 screen)
- Admin Features (4 screens)
- User Flows & Navigation Maps
- Implementation Priority

Shall I continue?

---

## 💼 **JOB BOARD**

### **Screen 20: Job Board Screen**
**File name:** `20-job-board.png`  
**User flow:** From Dashboard

**Uizard Prompt:**
```
Design a job listings screen for mobile.

HEADER:
- Back button (left, 24px)
- Title: "Job Board" (20px, bold)
- Filter icon (right, 24px)
- Search icon (right, 24px)
- Height: 56px

QUICK FILTERS:
- Horizontal scrollable chips:
  * All Jobs (selected)
  * Full Time
  * Part Time
  * Contract
  * Freelance
  * Remote
  * On-site
- Pill shape, 32px height
- Active: Purple background, white text
- Inactive: Gray background, gray text
- 8px gap between chips
- 16px margins

JOB CARDS:
- Vertical scrolling list
- Card design:
  * Background: White
  * Border radius: 12px
  * Border: 1px #E5E7EB
  * Padding: 16px
  * Shadow: subtle
  * 12px spacing between cards

Card contents:
  * Company logo/icon (48px, left top, colored circle or actual logo)
  * Bookmark icon (right top, 24px, outline/filled toggle)
  
  * Job title (18px, bold)
    - "Senior Frontend Developer"
  
  * Company name (14px, gray)
    - "TechCorp Solutions"
  
  * Location (14px, gray, with pin icon)
    - "Remote" or "Mumbai, India"
  
  * Employment badges (horizontal pills):
    - Type: "Full Time" (blue pill)
    - Remote/On-site: "Remote" (green pill)
    - 12px text, 24px height
    - 4px gap
  
  * Salary range (if available):
    - "₹8L - ₹12L per year" (14px, semi-bold, green)
    - Icon: Money/Rupee symbol
  
  * Posted time (12px, gray)
    - "Posted 2 days ago"
  
  * Required skills (quick tags):
    - Show top 3 skills: "React" "TypeScript" "Node.js"
    - Pills: 12px, gray background
    - "+2 more" if additional skills
  
  * Applicant count:
    - "12 applicants" (12px, gray)
    - Icon: Users (16px)
  
  * Apply button or status:
    - "Apply Now" (purple, outlined, full width, 36px height)
    - or "Applied ✓" (green, filled) if already applied

FLOATING ACTION BUTTON:
- Bottom-right corner
- Icon: Plus or Briefcase
- 56px diameter
- Purple background (#8B46DE)
- Text: "Post a Job"
- Above bottom nav (16px margin)

FILTER BOTTOM SHEET (when filter tapped):
- Slides up from bottom
- Filters:
  * Job Type (checkboxes)
  * Location (search + suggestions)
  * Salary Range (slider)
  * Experience Level (dropdown)
  * Posted Date (last 24hrs, week, month)
- "Apply Filters" button at bottom

EMPTY STATE:
- Illustration: Briefcase (100px)
- Text: "No jobs found" (18px, bold)
- Subtext: "Try adjusting your filters"
- "Clear Filters" button

STICKY HEADER INFO:
- Jobs count: "Showing 45 jobs" (14px, gray)
- Sort dropdown: "Sort by: Recent" (14px, purple)
- Below filter chips

SPACING:
- Screen padding: 16px
- Between cards: 12px
- Pull to refresh
- Infinite scroll

DESIGN DETAILS:
- Skeleton loading cards
- Job type color coding
- Save/bookmark jobs
- Recently viewed jobs section (optional)
```

---

### **Screen 21: Job Details Screen**
**File name:** `21-job-details.png`  
**User flow:** From Job Board

**Uizard Prompt:**
```
Design a job detail view screen for mobile.

HEADER:
- Back button (left, 24px)
- Share icon (right, 24px)
- Bookmark icon (right, 24px)
- Title: Job title in collapsed state (when scrolled)
- Height: 56px

COMPANY BANNER:
- Background: Light gradient or company brand color
- Height: 120px
- Company logo (64px, centered)
- Company name (16px, bold, centered)
- Company location (14px, gray, centered)
- "View Company Profile" link (12px, purple)

JOB HEADER:
- Job title (24px, bold)
  - "Senior Frontend Developer"
- Posted by section:
  - Avatar (32px, left)
  - Name (14px, semi-bold)
  - "Job Poster" label (12px, gray)
  - "Message" button (right, purple, outlined, 32px height)
  - Card background: #F9FAFB
  - Padding: 12px
  - Border radius: 8px

JOB META BADGES:
- Employment type: "Full Time" (blue pill)
- Location: "Remote" (green pill)
- Salary: "₹8L - ₹12L/year" (green pill with money icon)
- Posted: "2 days ago" (gray pill)
- Horizontal wrap, 4px gap
- 12px text, 28px height

APPLY BUTTON (sticky):
- Large prominent button
- "Apply Now" (18px, bold, white)
- Background: #8B46DE
- Height: 52px
- Full width (minus 32px margins)
- Fixed at bottom (above safe area)
- Shadow: prominent
- Or "Applied ✓" (green) if already applied

CONTENT SECTIONS:
Scrollable content with sections:

"Job Description" section:
- Icon: Document (20px, purple)
- Header: "Job Description" (18px, bold)
- Description text (16px, readable line height)
- Multiple paragraphs
- 16px padding
- Background: White card

"Responsibilities" section:
- Icon: Checklist (20px, purple)
- Header: "Responsibilities" (18px, bold)
- Bullet points with checkmarks:
  * Each item: 14px
  * Green checkmark icon (16px)
  * 8px spacing between items
- Background: White card

"Requirements" section:
- Icon: Star (20px, purple)
- Header: "Requirements" (18px, bold)
- Bullet points with checkmarks:
  * Required items: Green checkmark
  * Preferred items: Gray checkmark
- Background: White card

"Required Skills" section:
- Header: "Required Skills" (18px, bold)
- Skill pills (horizontal wrap):
  * "React" "TypeScript" "Node.js" "GraphQL"
  * Purple background, white text
  * 12px text, 28px height
  * 4px gap

"Preferred Skills" section:
- Header: "Preferred Skills" (18px, bold)
- Skill pills (gray background)

"Benefits" section:
- Icon: Gift (20px, purple)
- Header: "Benefits" (18px, bold)
- Benefit items with icons:
  * Health insurance (heart icon)
  * Flexible hours (clock icon)
  * Remote work (home icon)
  * Learning budget (book icon)
- Grid or list layout
- Icons: 24px, colored circles

"About the Company" section:
- Header: "About [Company Name]" (18px, bold)
- Company description (14px)
- Company stats:
  * Founded: 2018
  * Team size: 50-100
  * Industry: Technology
- "Visit Website" link (blue)

APPLICATION STATUS:
- Card showing: "25 people have applied"
- Avatar stack (overlapping)
- Background: Light purple (#DBEAFE)
- Icon: Users
- 12px padding, 8px border radius

"Similar Jobs" section:
- Header: "Similar Jobs" (18px, bold)
- Horizontal scroll of job cards (mini version)
- 3-4 jobs shown
- Card size: 240px × 160px
- "View All" link

SPACING:
- Screen padding: 16px
- Section spacing: 24px
- Between section items: 12px
- All sections in white cards with 12px radius
- 8px gap between cards

DESIGN DETAILS:
- Long scrollable content
- Sticky apply button
- Share job capability
- Save/bookmark job
- Report job option (in menu)
- Application deadline shown if applicable
```

---

### **Screen 22: Post a Job Screen**
**File name:** `22-post-job.png`  
**User flow:** From Job Board FAB

**Uizard Prompt:**
```
Design a job posting form for mobile.

HEADER:
- Cancel button (left, 16px, purple text)
- Title: "Post a Job" (18px, bold, centered)
- Post/Publish button (right, 16px, purple text, bold)
  - Disabled until required fields filled
- Height: 56px

FORM SECTIONS:
Scrollable form with sections:

JOB DETAILS:
- Section header: "Job Details" (16px, bold)

Fields:
  * Job Title (required)
    - Label: "Job Title" (14px, gray)
    - Input: 48px height
    - Placeholder: "e.g., Senior Frontend Developer"
    - Character counter: "0/100"
  
  * Company Name
    - Pre-filled with user's company or input
    - Icon: Building (left)
  
  * Employment Type (required)
    - Dropdown: Full-time, Part-time, Contract, Freelance, Internship
    - Icon: Briefcase (left)
  
  * Location (required)
    - Input with location icon
    - "Remote" toggle switch
    - If not remote: City/Location input with autocomplete
  
  * Salary Range (optional)
    - Toggle: "Show salary range"
    - Min and Max inputs (two fields side by side)
    - Currency: ₹ (dropdown for currency)
    - Period: Yearly/Monthly (dropdown)
    - "Negotiable" checkbox

JOB DESCRIPTION:
- Section header: "Job Description" (16px, bold)

Fields:
  * Description (required)
    - Rich text editor (simplified for mobile)
    - Multiline input (min 6 rows)
    - Character counter: "0/2000"
    - Formatting tools: Bold, Italic, Bullets, Numbers
    - Placeholder: "Describe the role, what you're looking for..."
  
  * Responsibilities
    - Bulleted list input
    - "Add responsibility" button to add new bullets
    - Each item removable (X icon)
    - Placeholder: "Key responsibility"
  
  * Requirements
    - Bulleted list input
    - Similar to Responsibilities
    - Placeholder: "Required qualification or skill"

SKILLS:
- Section header: "Required Skills" (16px, bold)
  
  * Required Skills (required, min 1)
    - Tag input with autocomplete
    - Suggestions: React, Python, Design, etc.
    - Current tags as removable pills
    - "+ Add skill" button
  
  * Preferred Skills (optional)
    - Same tag input design

APPLICATION SETTINGS:
- Section header: "Application Settings" (16px, bold)

Fields:
  * Application Deadline (optional)
    - Date picker
    - Icon: Calendar
    - Toggle: "No deadline"
  
  * How to Apply:
    - Radio buttons:
      ○ In-app applications (default, recommended)
      ○ Email applications
    
    - If Email selected:
      * Email input field
      * "Applications will be sent to this email"
  
  * Max Applicants (optional)
    - Number input
    - Placeholder: "No limit"
    - "Close applications when limit reached" checkbox

PREVIEW & PUBLISH:
- Two buttons at bottom:
  * "Preview" (outlined, purple)
    - Shows how job will look
  * "Publish Job" (filled, purple)
    - Enabled when all required fields complete
- Both full width, 48px height
- 8px gap between
- Sticky at bottom

DESIGN DETAILS:
- Input fields: 8px border radius
- Labels: 14px, gray, semi-bold
- Section headers: 24px top margin, 12px bottom
- Between fields: 16px spacing
- Required field indicator: Red asterisk
- Validation errors: Red border + error text below
- Screen padding: 16px
- Sections in light gray cards (#F9FAFB)
- Save as draft option
- Auto-save indicator

HELPER TEXT:
- Tips shown in info boxes (purple background)
- "Write a clear, detailed job description to attract qualified candidates"
- Icon: Info circle
```

---

### **Screen 23: My Jobs Screen**
**File name:** `23-my-jobs.png`  
**User flow:** From Job Board or Profile

**Uizard Prompt:**
```
Design a "my job postings" management screen for mobile.

HEADER:
- Back button (left, 24px)
- Title: "My Jobs" (20px, bold)
- Add icon (right, 24px, purple)
- Height: 56px

TABS:
- 3 tabs: Active | Closed | Drafts
- Badge counts: Active (3), Closed (5), Drafts (1)
- Active tab: Blue underline (3px)
- Tab height: 44px
- Background: White
- Border bottom: 1px #E5E7EB

JOB CARDS:
Card design:
  * Background: White
  * Border radius: 12px
  * Border: 1px #E5E7EB
  * Padding: 16px
  * 12px spacing between cards

Card contents:

  * Job icon/logo (40px, left, colored circle)
  * Status badge (right top):
    - Active: Green "Active"
    - Closed: Gray "Closed"
    - Draft: Orange "Draft"
    - Pill shape, 12px text
  
  * Job title (16px, bold)
  * Company name (14px, gray)
  
  * Posted date (12px, gray)
    - "Posted 5 days ago"
  
  * Stats row (horizontal):
    - Views: Eye icon + "234 views" (12px, gray)
    - Applicants with avatar stack:
      * 3 overlapping avatars (24px each)
      * "+12" if more applicants
      * Or "8 applicants" text
    - Icons: 16px
  
  * Action button:
    - "View Applications" (purple, outlined, full width, 36px height)
    - Shows applicant count if > 0
  
  * More actions menu (3 dots, right):
    - Edit Job
    - Close Applications (if active)
    - Reopen (if closed)
    - Delete
    - Share Job

ACTIVE TAB specific:
- Show active job listings
- "Applications" button prominent
- "Close Applications" in menu
- Days remaining if deadline set

CLOSED TAB specific:
- Grayed out appearance
- "Reopen" option in menu
- "Closed on [date]" text (12px)
- Total applicants received shown

DRAFTS TAB specific:
- Orange accent
- "Continue Editing" button (purple, outlined)
- "Last edited [time]" (12px, gray)
- "Publish" and "Delete" options

EMPTY STATE (per tab):
- Icon based on tab:
  * Active: Briefcase
  * Closed: Archive box
  * Drafts: Document
- Text: Tab-specific message
  * Active: "No active job postings"
  * Closed: "No closed jobs"
  * Drafts: "No draft jobs"
- "Post a Job" button (purple, filled)

FLOATING ACTION BUTTON:
- Bottom-right
- Icon: Plus
- 56px diameter
- Purple background
- Opens "Post Job" form

SPACING:
- Screen padding: 16px
- Between cards: 12px
- Card sections: 12px
- Scrollable content

DESIGN DETAILS:
- Swipe card left for quick actions (edit, delete)
- Pull to refresh
- Filter/sort options:
  * Sort by: Recent, Most applicants, Views
  * Filter by: Type, Location
- Bulk actions: Select multiple, close all
```

---

### **Screen 24: My Job Applications Screen**
**File name:** `24-my-applications.png`  
**User flow:** From Job Board or Profile

**Uizard Prompt:**
```
Design an "applications I submitted" screen for mobile.

HEADER:
- Back button (left, 24px)
- Title: "My Applications" (20px, bold)
- Filter icon (right, 24px)
- Height: 56px

FILTER CHIPS:
- Horizontal scrollable:
  * All
  * Pending (12)
  * Reviewing (3)
  * Accepted (2)
  * Rejected (4)
- Pill shape, 32px height
- Badge counts shown
- Active: Purple background
- 8px gap, 16px margins

APPLICATION CARDS:
Card design:
  * Background: White
  * Border radius: 12px
  * Border: 1px #E5E7EB
  * Padding: 16px
  * 12px spacing between cards
  * Left border accent (4px) based on status:
    - Pending: Blue
    - Reviewing: Orange
    - Accepted: Green
    - Rejected: Red

Card contents:

  * Company logo (48px, left top)
  * Status badge (right top):
    - "Pending" (blue)
    - "Under Review" (orange)
    - "Accepted" (green)
    - "Rejected" (red)
    - Pill shape, 12px text
  
  * Job title (16px, bold)
    - "Senior Frontend Developer"
  
  * Company name (14px, gray)
    - "TechCorp Solutions"
  
  * Applied date (12px, gray)
    - "Applied 3 days ago"
  
  * Application status timeline:
    - Visual progress bar/stepper
    - Steps:
      1. Submitted ✓ (green checkmark)
      2. Under Review (current - purple dot)
      3. Interview (gray/upcoming)
      4. Offer (gray/upcoming)
    - Line connecting steps
    - Current step highlighted
    - Horizontal layout (scrollable if needed)
  
  * Status message (14px):
    - Pending: "Your application is being reviewed"
    - Interview: "Interview scheduled for [date]"
    - Accepted: "Congratulations! You've been selected"
    - Rejected: "Thank you for applying"
    - Appropriate background color (light)
  
  * Action buttons:
    - "View Job" (purple, outlined, flex 1)
    - Status-specific button (flex 1):
      * Pending: "Withdraw Application" (red, outlined)
      * Interview: "View Details" (purple, filled)
      * Accepted: "Accept Offer" (green, filled)
    - 8px gap
    - 36px height

ACCEPTED state variant:
  * Green accent throughout
  * Confetti animation on card (optional)
  * "Accept Offer" prominent button
  * "Decline Offer" option in menu

REJECTED state variant:
  * Slightly grayed out
  * "View Feedback" button if feedback available
  * "Apply to Similar Jobs" suggestion

INTERVIEW state variant:
  * Orange accent
  * Interview details card:
    - Date and time
    - Interview type (Phone, Video, In-person)
    - Meeting link (if video)
    - "Add to Calendar" button

EMPTY STATE:
- Icon: Briefcase with magnifying glass (100px)
- Text: "You haven't applied to any jobs yet"
- Subtext: "Start browsing available positions"
- "Browse Jobs" button (purple, filled)

STATS CARD (top):
- Summary card showing:
  * Total applications: 12
  * Pending: 5
  * Interviews: 2
  * Offers: 1
- Background: Light blue
- Icons for each stat
- 12px padding
- Border radius: 12px
- 16px margin

SPACING:
- Screen padding: 16px
- Between cards: 12px
- Card internal: 12px
- Scrollable

DESIGN DETAILS:
- Status color coding consistent
- Timeline progress visual
- Swipe for quick actions
- Pull to refresh
- Sort by: Date, Status, Company
- Filter by: Date range, Status, Job type
```

---

### **Screen 25: View Applicants Screen**
**File name:** `25-view-applicants.png`  
**User flow:** From My Jobs

**Uizard Prompt:**
```
Design an applicant review screen for job posters (mobile).

HEADER:
- Back button (left, 24px)
- Job title: "[Job Title]" (18px, bold, truncated)
- Subtitle: "Applicants (23)" (14px, gray)
- More menu (right, 3 dots)
- Height: 56px

FILTER/SORT BAR:
- Horizontal scrollable chips:
  * All (23)
  * Shortlisted (5)
  * Interviewed (3)
  * Rejected (8)
- Pill shape, 32px height
- Badge counts
- 8px gap

SORT DROPDOWN:
- "Sort by: Recent" (14px, purple)
- Options: Recent, Skills Match, Experience, Rating

APPLICANT CARDS:
Card design:
  * Background: White
  * Border radius: 12px
  * Border: 1px #E5E7EB
  * Padding: 16px
  * 12px spacing between cards

Card contents:

  * Top section:
    - Avatar (56px, left, circular)
    - Name (16px, bold)
    - Current role (14px, gray)
      "Frontend Developer at ABC Corp"
    - Flat/Tower (12px, gray)
    - Status badge (right top):
      * "New" (blue)
      * "Shortlisted" (green)
      * "Interviewed" (orange)
      * "Rejected" (red)
  
  * Skills match indicator:
    - Progress bar
    - "8/10 skills match" (14px, green)
    - Matching skills highlighted:
      * "React" "TypeScript" "Node.js" (green pills, 12px)
    - Missing skills shown:
      * "GraphQL" "Docker" (gray pills, 12px)
    - Horizontal scroll
  
  * Experience match:
    - Icon: Briefcase
    - "5 years experience" (14px)
    - "Meets requirements ✓" or "Exceeds requirements" (green)
  
  * Cover letter preview:
    - "Cover Letter:" label (12px, gray)
    - First 2 lines of text (14px)
    - "Read more" link (expandable)
    - Background: #F9FAFB
    - Padding: 12px
    - Border radius: 8px
  
  * Applied date:
    - "Applied 2 days ago" (12px, gray)
    - Clock icon (16px)
  
  * Expandable sections (tap to expand):
    - Full cover letter
    - Resume/CV (if attached, PDF icon)
    - Work samples/Portfolio link
  
  * Action buttons row:
    - "View Profile" (purple, outlined, full width)
    - Icon row below:
      * Shortlist (star icon, 40px, circular)
      * Reject (X icon, 40px, circular, red)
      * Message (chat icon, 40px, circular, purple)
    - Or if already shortlisted/rejected:
      * "Shortlisted ✓" (green button)
      * "Rejected" (red button) with "Undo" option

SHORTLISTED state:
  * Green left border (4px)
  * "Shortlisted on [date]"
  * "Schedule Interview" button

REJECTED state:
  * Red left border (4px)
  * Grayed out slightly
  * "Rejected on [date]"
  * "Undo" option
  * Collapse by default

BULK ACTIONS:
- Checkbox mode (tap-hold to activate)
- Top bar shows selected count
- Bottom action bar:
  * "Shortlist All" (green)
  * "Reject All" (red)
  * "Message All" (blue)

STATS SUMMARY CARD (top):
- Total applicants: 23
- New: 12
- Shortlisted: 5
- Interviewed: 3
- Rejected: 8
- Background: Light purple (#DBEAFE)
- Icons for each
- 12px padding
- Collapsible

EMPTY STATE:
- Icon: Inbox (100px)
- Text: "No applicants yet"
- Subtext: "Share your job posting to get more visibility"
- "Share Job" button

SPACING:
- Screen padding: 16px
- Between cards: 12px
- Card internal: 12px
- Scrollable

DESIGN DETAILS:
- Swipe card right: Shortlist
- Swipe card left: Reject
- Skills match percentage prominent
- Filter by skills match threshold
- Export applicants list (CSV)
- Batch operations
- Application notes (internal notes about candidate)
```

---

## 🎓 **SKILL SWAP**

### **Screen 26: Skill Swap Browse Screen**
**File name:** `26-skill-swap-browse.png`  
**User flow:** From Dashboard

**Uizard Prompt:**
```
Design a skill exchange browsing screen for mobile.

HEADER:
- Back button (left, 24px)
- Title: "Skill Swap" (20px, bold)
- Search icon (right, 24px)
- Height: 56px

USER MODE TOGGLE:
- Large toggle switch (center)
- Two options:
  * "I want to learn" (left, book icon)
  * "I want to teach" (right, graduation cap icon)
- Selected side: Purple background, white text
- Unselected: Gray background, gray text
- Width: 90% of screen
- Height: 44px
- Border radius: 22px
- 16px top margin

SEARCH BAR:
- Full width (minus 32px margins)
- Placeholder changes based on toggle:
  * Learning mode: "Search skills to learn..."
  * Teaching mode: "Search skills to teach..."
- Height: 44px
- Border radius: 22px
- Background: #F3F4F6
- Magnifying glass icon (left)
- 16px top margin

POPULAR SKILLS CHIPS:
- Section header: "Popular Skills" (16px, bold)
- Horizontal scrollable chips:
  * Web Development
  * UI/UX Design
  * Digital Marketing
  * Photography
  * Python
  * Cooking
  * Guitar
  * Languages
- Pill shape, 32px height
- Blue outlined (selected), gray (unselected)
- 8px gap
- 16px margins

MENTOR/LEARNER CARDS:
- Section header based on mode:
  * Learning: "Available Mentors" (18px, bold)
  * Teaching: "Looking to Learn" (18px, bold)
- Vertical scrolling list

Card design:
  * Background: White
  * Border radius: 12px
  * Border: 1px #E5E7EB
  * Padding: 16px
  * 12px spacing between cards

Card contents:

  * Top section:
    - Avatar (56px, left, circular)
    - Online indicator (green dot, 12px)
    - Name (16px, bold)
    - Flat/Tower (12px, gray)
    - Rating: 4.9 ⭐ (14px)
    - Sessions count: "(24 sessions)" (12px, gray)
  
  * Teaching/Learning skills:
    - Label changes based on mode:
      * Learning mode: "Teaching:" (12px, gray)
      * Teaching mode: "Learning:" (12px, gray)
    - Skill pills:
      * "Python" "React" "Node.js" (12px)
      * Purple background, white text
      * Horizontal scroll
      * 4px gap
  
  * Availability:
    - Icon: Calendar
    - "Available weekends" (14px)
    - or "Available Mon-Fri evenings"
    - Green checkmark if available now
  
  * Session type & price:
    - Icon: Video/Person
    - "One-on-one sessions" (14px)
    - Price: "₹500/hr" or "Free" (14px, green)
  
  * Bio preview:
    - 2 lines of bio text (14px, gray)
    - "Read more" if longer
  
  * Action button:
    - "Book Session" (purple, filled, full width, 36px height)
    - or "Request Session" for learners

FILTER BUTTON:
- Floating filter icon (right side, middle of screen)
- 48px circular button
- White background, purple icon
- Shadow

FILTER BOTTOM SHEET:
- Availability (checkboxes)
  * Available now
  * Weekdays
  * Weekends
  * Flexible
- Session type
  * One-on-one
  * Group sessions
- Price range (slider)
  * Free to ₹2000/hr
- Experience level
  * Beginner friendly
  * Intermediate
  * Advanced
- "Apply Filters" button

EMPTY STATE:
- Icon: Graduation cap (100px)
- Text: "No mentors available"
- Subtext: "Try adjusting your search filters"
- "Clear Filters" button

FLOATING ACTION BUTTON:
- Bottom-right
- Icon: Calendar or Book
- Text: "My Sessions"
- 56px diameter
- Purple background

SPACING:
- Screen padding: 16px
- Between cards: 12px
- Card internal: 12px
- Scrollable
- Pull to refresh

DESIGN DETAILS:
- Mode toggle animates smoothly
- Online indicators real-time
- Verified mentor badge (checkmark icon)
- Skill tags tappable to filter
- "Top Mentor" badge for highly rated
```

---

### **Screen 27: Book Session Screen**
**File name:** `27-book-session.png`  
**User flow:** From Skill Swap Browse

**Uizard Prompt:**
```
Design a session booking screen for mobile.

HEADER:
- Back button (left, 24px)
- Title: "Book with [Teacher Name]" (18px, bold)
- Height: 56px

TEACHER CARD:
- Background: White card
- Border radius: 12px
- Padding: 16px
- Contents:
  * Avatar (64px, left)
  * Name (18px, bold)
  * Rating: 4.9 ⭐ (14px)
  * "(24 sessions completed)" (12px, gray)
  * Skill teaching: "Python Programming" (14px)
  * Message icon (right, 32px, purple circle)

BOOKING FORM:

SELECT SKILL:
- Label: "What do you want to learn?" (14px, gray)
- Dropdown showing teacher's skills
  * Python Programming
  * Web Development
  * Data Science
- Icon: Book (left)
- 48px height

SESSION TYPE:
- Label: "Session Type" (14px, gray)
- Radio buttons (large, tappable cards):
  
  * One-on-one
    - Icon: Person
    - Description: "Private session, personalized attention"
    - Price: "₹500/hour"
    - Selected: Purple border (2px), purple background (10% opacity)
  
  * Group session
    - Icon: Users
    - Description: "Learn with 3-5 others"
    - Price: "₹200/hour per person"
    - "2 spots left" indicator

- Cards: 100% width, 80px height, 12px radius

DURATION:
- Label: "Duration" (14px, gray)
- Dropdown: 1 hour, 2 hours, 3 hours
- Icon: Clock
- 48px height

DATE SELECTION:
- Label: "Select Date" (14px, gray)
- Horizontal scrollable date picker:
  * Shows 7 days
  * Each day card:
    - Day name (12px, gray) - "Mon"
    - Date number (18px, bold) - "15"
    - Month (12px, gray) - "Mar"
    - Size: 60px × 80px
    - Selected: Purple background, white text
    - Disabled: Gray, strikethrough if unavailable
  * 8px gap

TIME SLOTS:
- Label: "Available Time Slots" (14px, gray)
- Grid of time slot pills (2 columns):
  * "10:00 AM" (available - purple outlined)
  * "2:00 PM" (available)
  * "4:00 PM" (selected - purple filled, white text)
  * "6:00 PM" (booked - gray, disabled)
- Pill size: 32px height
- 8px gap between pills

LOCATION:
- Label: "Session Location" (14px, gray)
- Radio buttons:
  
  ○ Online (selected)
    - Icon: Video
    - "Meeting link will be shared"
  
  ○ In-person
    - Icon: Map pin
    - Location input field appears
    - "Suggest meeting location"
    - Dropdown with common locations:
      * Community center
      * Coffee shop
      * Mentor's place
      * Your place
      * Custom location

MESSAGE TO TEACHER:
- Label: "Message (Optional)" (14px, gray)
- Multiline text area (3 rows)
- Placeholder: "Let the teacher know what you'd like to focus on..."
- Character counter: "0/300"
- Border radius: 8px

SESSION SUMMARY CARD:
- Background: Light purple (#DBEAFE)
- Border radius: 12px
- Padding: 16px
- Contents:
  * Icon: Clipboard
  * "Session Summary" (16px, bold)
  * Skill: Python Programming
  * Type: One-on-one
  * Duration: 2 hours
  * Date: Monday, Mar 15
  * Time: 4:00 PM - 6:00 PM
  * Location: Online (Zoom)
  * Total Cost: "₹1,000" (18px, bold, green)
    - Breakdown if applicable

REQUEST BUTTON:
- Text: "Request Session" or "Book & Pay"
- Full width (minus 32px margins)
- Height: 52px
- Background: #8B46DE
- Bold, white text
- Border radius: 8px
- Fixed at bottom (above safe area)

NOTES:
- Info box (purple background):
  * "Teacher will confirm within 24 hours"
  * "You can cancel free up to 24 hours before"
  * Icon: Info circle

SPACING:
- Screen padding: 16px
- Between fields: 20px
- Section spacing: 24px
- Scrollable form

DESIGN DETAILS:
- Date picker swipeable
- Time slots update based on selected date
- Price updates based on duration/type
- Security deposit info if applicable
- Payment method selection (if paid)
- Calendar integration offer
```

---

### **Screen 28: My Sessions Screen**
**File name:** `28-my-sessions.png`  
**User flow:** From Skill Swap FAB

**Uizard Prompt:**
```
Design a sessions management screen for mobile.

HEADER:
- Back button (left, 24px)
- Title: "My Sessions" (20px, bold)
- Calendar icon (right, 24px) - sync to calendar
- Height: 56px

TABS:
- 4 tabs with badge counts:
  * Upcoming (3)
  * Past (12)
  * As Teacher (8)
  * As Learner (7)
- Active tab: Blue underline (3px)
- Tab height: 44px
- Scrollable horizontally
- Background: White
- Border bottom: 1px #E5E7EB

SESSION CARDS:
Card design:
  * Background: White
  * Border radius: 12px
  * Border: 1px #E5E7EB
  * Padding: 16px
  * 12px spacing between cards
  * Left accent border (4px) based on type:
    - Upcoming: Blue
    - As Teacher: Purple
    - As Learner: Green
    - Past: Gray

Card contents:

  * Date & time header:
    - Large date: "Mon, Mar 15" (16px, bold)
    - Time: "4:00 PM - 6:00 PM" (14px)
    - Countdown for upcoming: "In 2 days, 3 hours" (12px, purple)
    - Icon: Calendar (20px)
  
  * Partner info:
    - Avatar (48px, left)
    - Name (16px, bold)
    - Role: "Learning from" or "Teaching to" (12px, gray)
    - Flat/Tower (12px, gray)
  
  * Session details:
    - Skill/Topic: "Python Programming" (14px, semi-bold)
    - Session type: "One-on-one session" (12px)
    - Duration: "2 hours" (12px)
    - Icons for each detail (16px)
  
  * Location/Meeting:
    - Online: "Online (Zoom)" with link icon
      * "Join Meeting" button if time is near (green)
    - In-person: Location with map pin icon
      * "Get Directions" link
  
  * Status badge:
    - "Confirmed" (green)
    - "Pending Confirmation" (orange)
    - "Completed" (blue)
    - "Cancelled" (red)
    - Pill shape, 12px text
  
  * Action buttons (varies by status):
    
    UPCOMING session:
    - "Join Meeting" (green, filled) - if online & time within 30 min
    - "Cancel Session" (red, outlined)
    - "Reschedule" (purple, outlined)
    - "Contact Partner" (blue, text button)
    - "Add to Calendar" (gray, text button)
    
    COMPLETED session:
    - "Rate & Review" (purple, filled) - if not yet rated
    - "Book Again" (purple, outlined)
    - "View Review" (blue, text) - if already reviewed
    
    PENDING session:
    - As Teacher: "Accept" / "Decline" buttons
    - As Learner: "Cancel Request" button

UPCOMING TAB specific:
- Sorted by date/time
- Next session highlighted
- Reminder settings per session
- Quick actions prominent

PAST TAB specific:
- Sorted by most recent
- Rating/review status shown
- "Book again" option
- Session notes visible

AS TEACHER TAB specific:
- All sessions where you're teaching
- Earnings summary card at top:
  * Total earned this month
  * Upcoming earnings
  * Sessions completed
- "Mark as Completed" for past sessions

AS LEARNER TAB specific:
- All sessions where you're learning
- Learning progress indicators
- Completed skills/topics shown
- "Request another session" quick link

CALENDAR INTEGRATION:
- Floating calendar icon (bottom-right)
- "Sync all sessions to calendar"
- Google Calendar / Apple Calendar options

EMPTY STATE (per tab):
- Icon based on tab:
  * Upcoming: Calendar
  * Past: Clock
  * Teacher: Graduation cap
  * Learner: Book
- Text: Tab-specific message
- "Browse skills" or "Offer sessions" button

STATS CARD (collapsible, top):
- As Teacher:
  * Total sessions taught: 24
  * Average rating: 4.9 ⭐
  * Total earned: ₹12,000
- As Learner:
  * Total sessions attended: 15
  * Skills learned: 5
  * Hours invested: 30
- Background: Light gradient
- Icons for each stat

SPACING:
- Screen padding: 16px
- Between cards: 12px
- Card sections: 12px
- Scrollable

DESIGN DETAILS:
- Upcoming sessions show countdown
- Color coding by status
- Swipe card for quick actions
- Pull to refresh
- Filter: Date range, Status, Partner
- Sort: Date, Partner name
- Notification settings per session
- Session reminders (24hr, 1hr before)
```

---

## 📅 **EVENTS**

### **Screen 29: Events Browse Screen**
**File name:** `29-events-browse.png`  
**User flow:** From Dashboard or bottom nav

**Uizard Prompt:**
```
Design an events listing screen for mobile.

HEADER:
- Back button (left, 24px)
- Title: "Community Events" (20px, bold)
- Filter icon (right, 24px)
- Search icon (right, 24px)
- Height: 56px

FILTER CHIPS:
- Horizontal scrollable:
  * All Events
  * This Week
  * This Month
  * My Events
  * Going
  * Interested
- Pill shape, 32px height
- Active: Purple background, white text
- 8px gap, 16px margins

EVENT CARDS:
- Vertical scrolling list
- Card design:
  * Background: White
  * Border radius: 16px
  * Border: 1px #E5E7EB
  * Shadow: subtle
  * 16px spacing between cards

Card contents:

  * Event banner image:
    - Full width of card
    - Height: 180px
    - Border radius: 16px 16px 0 0
    - Gradient overlay (bottom) for text readability
  
  * Date badge (overlaid on image, top-left):
    - Background: White
    - Size: 56px × 64px
    - Border radius: 8px
    - Shadow
    - Month: "MAR" (12px, uppercase, gray)
    - Day: "15" (24px, bold, black)
    - Centered text
  
  * Bookmark icon (overlaid, top-right):
    - 40px circular button
    - White background
    - Bookmark icon (outline/filled toggle)
    - Shadow
  
  * Event content (below image):
    - Padding: 16px
    
    * Event title (18px, bold, 2 lines max)
      - "Community Tech Meetup & Networking"
    
    * Date & time row:
      - Icon: Calendar (16px, purple)
      - "Mon, March 15" (14px)
      - Icon: Clock (16px, purple)
      - "6:00 PM - 9:00 PM" (14px)
      - One row, icons + text
    
    * Location row:
      - Icon: Map pin (16px, purple)
      - "Community Hall, Tower A" (14px)
      - or "Online Event" (14px, green)
    
    * Host section:
      - Label: "Hosted by" (12px, gray)
      - Avatar (24px)
      - Name (14px)
      - Inline layout
    
    * Attendees section:
      - Avatar stack (overlapping, 28px each)
      - "+23 going" text (14px)
      - "You and 23 others" if user is going
    
    * Event type tag:
      - "Social" / "Sports" / "Workshop" / "Party" etc.
      - Pill shape
      - Colored background (category-based)
      - 12px text, 24px height
    
    * RSVP button:
      - "RSVP" (purple, filled, full width, 36px height)
      - or "You're Going ✓" (green, filled)
      - or "Interested" (purple, outlined)

FLOATING ACTION BUTTON:
- Bottom-right
- Icon: Plus or Calendar
- 56px diameter
- Purple background (#8B46DE)
- Text: "Create Event"
- Above bottom nav

FILTER BOTTOM SHEET:
- Event Type (checkboxes)
  * Social, Sports, Educational, etc.
- Date Range (date picker)
- Location (Online / In-person)
- RSVP Status (Going, Not going, Interested)
- "Apply Filters" button

EMPTY STATE:
- Illustration: Calendar (120px)
- Text: "No events found" (18px, bold)
- Subtext: "Be the first to create an event!"
- "Create Event" button (purple, filled)

CALENDAR VIEW TOGGLE:
- Icon button (top-right, next to filter)
- Switches to calendar view
- Shows events on calendar grid

SPACING:
- Screen padding: 16px (except cards)
- Between cards: 16px
- Card internal padding: 16px (below image)
- Scrollable
- Pull to refresh

DESIGN DETAILS:
- Image-forward design
- Quick RSVP from list
- Category color coding
- Past events grayed out
- "Event Full" indicator if max capacity reached
- "Members only" badge if restricted
```

---

### **Screen 30: Event Details Screen**
**File name:** `30-event-details.png`  
**User flow:** From Events Browse

**Uizard Prompt:**
```
Design an event detail screen for mobile.

HEADER:
- Event cover image (full width, 280px height)
- Back button (overlaid, top-left, white, 40px circle, shadow)
- Floating action buttons (overlaid, top-right):
  * Share icon (white, 40px circle, shadow)
  * Bookmark icon (white, 40px circle, shadow)
- Gradient overlay (bottom of image) for text contrast

EVENT INFO CARD:
- White card overlapping image by 40px
- Border radius: 24px 24px 0 0
- Padding: 20px
- Shadow: prominent

Card contents:

  * Event title (24px, bold, multiline allowed)
    - "Annual Community Tech Festival 2024"
  
  * Event type badge:
    - "Workshop" (colored pill, 12px, 28px height)
    - Top-right of title
  
  * Date & time section:
    - Icon: Calendar (24px, purple circle background)
    - Day/Date: "Saturday, March 15, 2024" (16px)
    - Time: "6:00 PM - 9:00 PM" (16px, bold)
    - Background: #F9FAFB
    - Padding: 12px
    - Border radius: 12px
    - Tappable to add to calendar
  
  * Location section:
    - Icon: Map pin (24px, purple circle background)
    - Venue: "Community Hall, Tower A" (16px)
    - Address: "Ground Floor, Near Gate 2" (14px, gray)
    - or "Online Event" with meeting platform
    - "Get Directions" link (14px, purple)
    - Background: #F9FAFB
    - Padding: 12px
    - Border radius: 12px
    - Tappable for map
  
  * Host section:
    - Label: "Hosted by" (14px, gray)
    - Avatar (48px)
    - Name (16px, semi-bold)
    - Role/Badge if admin or organizer
    - "Message Host" button (right, purple, outlined, 32px)
    - Horizontal layout
  
  * Attendees section:
    - Label: "Attendees (45)" (16px, bold)
    - Avatar stack (overlapping circles, 36px each, show 10)
    - "+35 more" text
    - "See all" link (blue, 14px)
    - Tappable to see full list

RSVP BUTTON (large, prominent):
- Fixed at bottom (above safe area)
- States:
  * "Attend Event" (purple, filled, 52px height)
  * "You're Going ✓" (green, filled)
  * "Check-in with QR" (purple, filled) - if event is today
  * "Event Full" (gray, disabled) - if capacity reached
- Full width (minus 32px margins)
- Shadow: prominent

CONTENT SECTIONS:
Scrollable content below event card:

"About this Event" section:
- Header: "About" (18px, bold)
- Full description (16px, readable line height)
- Multiple paragraphs
- Expandable if very long
- Background: White card
- Padding: 16px
- Border radius: 12px

"Schedule / Agenda" section (if applicable):
- Header: "Event Schedule" (18px, bold)
- Timeline items:
  * Time: "6:00 PM" (14px, bold)
  * Activity: "Registration & Welcome" (16px)
  * Duration: "30 mins" (12px, gray)
  * Icon: Clock (left, 20px)
  * Vertical timeline line connecting items
- Background: White card

"Location Map" section:
- Embedded map (full width, 200px height)
- Shows event location pin
- Tappable to open full map
- Border radius: 12px

"Attendees" section:
- Header: "Going (45)" (18px, bold)
- "See all" link (right)
- Grid of avatars (5×2 grid)
- Each: Avatar (64px) + name (12px)
- "You and 44 others are going"

"Discussion" section:
- Header: "Discussion (12 comments)" (18px, bold)
- Comment cards:
  * Avatar (32px)
  * Name (14px, bold)
  * Comment (14px)
  * Time (12px, gray)
  * Like count
  * 8px spacing between comments
- "View all comments" link
- "Add comment" input (fixed at keyboard level when active)

"Share Event" section:
- Header: "Share with Friends" (18px, bold)
- Share buttons:
  * WhatsApp (green)
  * Copy Link (blue)
  * More options (gray)
- Horizontal row

ADD TO CALENDAR button:
- "Add to Calendar" (outlined, purple)
- Full width
- 44px height
- Google Calendar / Apple Calendar options

SPACING:
- Screen padding: 16px
- Section spacing: 24px
- Between sections: White cards with 12px radius
- Long scrollable content

DESIGN DETAILS:
- Image parallax on scroll (optional)
- Sticky RSVP button
- Calendar integration
- Map integration
- Share functionality
- Comment/discussion feature
- Going status updates real-time
- Capacity indicator if limited seats
```

---

### **Screen 31: Create/Edit Event Screen**
**File name:** `31-create-event.png`  
**User flow:** From Events FAB

**Uizard Prompt:**
```
Design an event creation form for mobile.

HEADER:
- Cancel button (left, 16px, purple text)
- Title: "Create Event" (18px, bold, centered)
- Save Draft button (right top, 14px, gray text)
- Publish button (right, 16px, purple text, bold)
- Height: 56px

COVER IMAGE UPLOAD:
- Large upload area (full width, 200px height)
- Placeholder: Camera icon + "Add Event Cover" text
- Tap to upload or take photo
- Preview uploaded image
- "Change" button if image uploaded
- Border radius: 16px (top corners if first element)

FORM SECTIONS:
Scrollable form:

EVENT DETAILS:
- Section header: "Event Details" (16px, bold, gray background)

Fields:
  * Event Title (required)
    - Label: "Event Title" (14px, gray)
    - Input: 48px height
    - Placeholder: "e.g., Community Tech Meetup"
    - Character counter: "0/100"
  
  * Event Type (required)
    - Dropdown with icons:
      * Social (party icon)
      * Sports (ball icon)
      * Educational (book icon)
      * Workshop (tools icon)
      * Meetup (people icon)
      * Celebration (cake icon)
      * Other
  
  * Description (required)
    - Rich text editor (simplified)
    - Multiline (6 rows min)
    - Character counter: "0/1000"
    - Formatting: Bold, Italic, Bullets
    - Placeholder: "Tell people what the event is about..."

DATE & TIME:
- Section header: "When" (16px, bold)

Fields:
  * Event Date (required)
    - Date picker
    - Icon: Calendar
    - Format: "Monday, March 15, 2024"
  
  * Start Time (required)
    - Time picker
    - Icon: Clock
    - Format: "6:00 PM"
  
  * End Time (required)
    - Time picker
    - Auto-suggest based on duration presets:
      * 1 hour, 2 hours, 3 hours
    - Must be after start time

LOCATION:
- Section header: "Where" (16px, bold)

Radio buttons:
  ○ In-person (selected by default)
    - Icon: Map pin
    - Venue/Address input field:
      * Autocomplete from common locations:
        - Community Hall
        - Club House
        - Swimming Pool
        - Sports Court
        - Custom address
    - Map picker (tappable to select on map)
    - Map preview (100px height) showing selected location
  
  ○ Online Event
    - Icon: Video
    - Platform dropdown:
      * Zoom
      * Google Meet
      * Microsoft Teams
      * Other
    - Meeting link input
    - "Link will be shared with attendees after RSVP"

CAPACITY & REGISTRATION:
- Section header: "Attendee Settings" (16px, bold)

Fields:
  * Max Attendees (optional)
    - Number input
    - Placeholder: "Unlimited"
    - Icon: Users
    - "Set a capacity limit for your event"
  
  * Registration Required (toggle)
    - Switch: ON/OFF
    - "Attendees must RSVP to join"
  
  * Registration Deadline (if registration ON)
    - Date picker
    - "Stop accepting RSVPs by this date"
    - Default: 1 day before event

PRICING:
- Section header: "Cost" (16px, bold)

Toggle: Free Event / Paid Event
  
  If Free (default):
  - Badge: "FREE" (green)
  
  If Paid:
  - Price input
  - Currency: ₹ (dropdown)
  - Placeholder: "500"
  - "Per person" label
  - Payment collection note:
    "Collect payment at the event or integrate payment gateway"

ADDITIONAL OPTIONS:
- Section header: "Additional Options" (16px, bold)

Fields:
  * Event Tags (optional)
    - Tag input
    - Suggestions: Tech, Sports, Social, Food, Music
    - Removable pills
  
  * Repeating Event (toggle)
    - OFF by default
    - If ON: Show recurrence options
      * Weekly, Bi-weekly, Monthly
      * Ends: After X occurrences or On date
  
  * Private Event (toggle)
    - Only visible to invited people
    - "Event won't appear in public listings"

PREVIEW & PUBLISH:
- Two buttons (bottom, sticky):
  * "Preview" (outlined, purple, flex 1)
    - Shows how event will look
  * "Publish Event" (filled, purple, flex 1)
    - Creates and publishes event
- 8px gap between buttons
- 48px height each

DESIGN DETAILS:
- Auto-save to drafts every 30s
- "Saved" indicator (subtle, top)
- Input validation with error messages
- Required field indicators (red asterisk)
- Image compression for cover upload
- Screen padding: 16px
- Section spacing: 24px
- Collapsible sections (optional)
```

---

### **Screen 32: My Events Screen**
**File name:** `32-my-events.png`  
**User flow:** From Events or Profile

**Uizard Prompt:**
```
Design a "my events" management screen for mobile.

HEADER:
- Back button (left, 24px)
- Title: "My Events" (20px, bold)
- Add icon (right, 24px, purple)
- Height: 56px

TABS:
- 3 tabs with badge counts:
  * Hosting (2)
  * Attending (8)
  * Past (15)
- Active tab: Blue underline (3px)
- Tab height: 44px

HOSTING TAB:
Event cards:
  * Event image thumbnail (100px × 100px, left, rounded 12px)
  * Title (16px, bold)
  * Date & time (14px, gray, with calendar icon)
  * Attendee stats:
    - Avatar stack (3-4 avatars, 24px each)
    - "45 / 50 going" (14px)
    - Progress bar showing capacity (green fill)
  * Quick actions row:
    - "View Attendees" (purple, outlined, flex 1)
    - "QR Check-in" (purple, outlined, flex 1)
    - Edit icon (32px, purple)
    - Cancel icon (32px, red)
  * 8px gap between buttons
  * Card: White background, 12px radius, 16px padding

ATTENDING TAB:
Event cards:
  * Event image (100px × 100px)
  * Title (16px, bold)
  * Date & time (14px)
  * Location (14px, gray, with pin icon)
  * Host info:
    - Avatar (24px) + name (12px)
  * Going status: "You're going ✓" (green pill)
  * Quick actions:
    - "View Details" (purple, outlined, full width)
    - "My QR Code" (purple, outlined, full width)
      - For event check-in
    - "Cancel RSVP" option (in menu)
  * Upcoming event countdown: "In 2 days" (12px, purple)

PAST TAB:
Event cards (grayed out slightly):
  * Event image (100px × 100px)
  * Title (16px, bold)
  * Date (14px, gray)
  * "Attended" or "Missed" badge
  * Attendee count: "You and 44 others attended"
  * Photo gallery preview (if photos uploaded)
    - Small thumbnails (3 photos max)
  * "View Memories" button (purple, outlined)
  * "Share" option

EMPTY STATES:
Per tab:
  * Hosting: "You haven't created any events"
    - Icon: Calendar with plus
    - "Create Event" button
  
  * Attending: "You're not attending any upcoming events"
    - Icon: Calendar
    - "Browse Events" button
  
  * Past: "No past events"
    - Icon: Clock
    - "Browse Upcoming Events" button

FLOATING ACTION BUTTON:
- Bottom-right
- Icon: Plus or Calendar
- 56px diameter
- Purple background
- Opens "Create Event"

HOSTING TAB specific features:
- Stats summary card (collapsible, top):
  * Total events hosted: 12
  * Total attendees served: 340
  * Average attendance: 28 people
  * Upcoming events: 2
- "Duplicate Event" option (create similar event)

ATTENDING TAB specific:
- Filter: Upcoming, This week, This month
- Calendar sync button
- Notification preferences per event

PAST TAB specific:
- Year filter: 2024, 2023, etc.
- Event memories/photos section
- Feedback/reviews if applicable

SPACING:
- Screen padding: 16px
- Between cards: 12px
- Card internal: 12px
- Scrollable

DESIGN DETAILS:
- Swipe card for quick actions
- Pull to refresh
- Color coding by event type
- Check-in QR code quick access
- Past event photo albums
- Export attendee list (hosting tab)
```

---

### **Screen 33: Event QR Code Screen**
**File name:** `33-event-qr-code.png`  
**User flow:** From My Events (attending)

**Uizard Prompt:**
```
Design an event check-in QR code screen for mobile.

HEADER:
- Back button (left, 24px)
- Title: "Event Check-in" (20px, bold)
- More menu (right, 3 dots)
- Background: matches app theme
- Height: 56px

EVENT INFO CARD:
- Background: Light purple gradient (#DBEAFE to white)
- Border radius: 16px (top)
- Padding: 20px
- Contents:
  * Event icon (40px, centered top)
  * Event name (18px, bold, centered)
    - "Community Tech Meetup"
  * Date & time (14px, centered)
    - "Saturday, March 15 • 6:00 PM"
  * Location (14px, centered, gray)
    - "Community Hall, Tower A"

QR CODE SECTION:
- Large QR code (280px × 280px, centered)
- White background with padding (16px)
- Border radius: 16px
- Shadow: subtle but visible
- QR code contains:
  * User ID
  * Event ID
  * RSVP confirmation ID
  * Timestamp

USER INFO (below QR):
- White card
- Border radius: 12px
- Padding: 16px
- Contents:
  * User avatar (48px, centered)
  * Name (18px, bold, centered)
  * Flat number (14px, gray, centered)
  * RSVP status: "Confirmed ✓" (green pill, centered)

INSTRUCTIONS:
- Background: #F9FAFB
- Border radius: 12px
- Padding: 16px
- Icon: Info circle (20px, purple)
- Text: "Show this QR code at the event entrance for quick check-in" (14px)

QR FEATURES:
- Auto-refresh indicator:
  * "Refreshes in 00:28" (12px, gray, centered)
  * Circular progress indicator
  * QR refreshes every 30 seconds for security
- Brightness auto-boost:
  * "Screen brightness maximized for scanning" (12px, purple)
  * Icon: Sun

MANUAL CHECK-IN FALLBACK:
- Section: "Having trouble scanning?" (14px, gray)
- "Manual Code" button (outlined, purple)
  * Shows alphanumeric code: "ABC-1234-XYZ"
  * "Give this code to the event organizer"

ACTION BUTTONS:
- "Save QR Code" (outlined, purple)
  * Saves to photo gallery
- "Share QR Code" (outlined, purple)
  * Share via apps
- Side by side, 8px gap
- 44px height each

EVENT DETAILS LINK:
- "View Event Details" (purple link, centered, 14px)
- Opens full event detail screen

SPACING:
- Generous padding for QR visibility
- Screen padding: 20px
- Section spacing: 24px
- Centered layout
- White space around QR for scanner

DESIGN DETAILS:
- Full-screen QR for easy scanning
- High contrast for QR readability
- Auto-rotation lock (portrait only)
- Screen always-on while on this screen
- Success animation after scan (green checkmark)
- QR code encrypted for security
- Offline capability (cached QR)
```

---

### **Screen 34: Event Scanner Screen (Host)**
**File name:** `34-event-scanner-host.png`  
**User flow:** From My Events (hosting tab)

**Uizard Prompt:**
```
Design a QR code scanner screen for event hosts (mobile).

HEADER:
- Back button (left, 24px, white)
- Title: "Scan Attendee" (18px, bold, white)
- Attendee list icon (right, 24px, white)
  - Opens full attendee list
- Background: Semi-transparent dark
- Overlaid on camera viewfinder
- Height: 56px

CAMERA VIEWFINDER:
- Full screen camera feed
- Real-time QR code detection

SCANNING FRAME:
- Centered square overlay (260px × 260px)
- Rounded corners (24px)
- Border: 4px white with animation (corners glow)
- Scanning line animation (moves up/down)
- Semi-transparent corners

INSTRUCTIONS:
- Text below frame: "Align QR code within frame" (16px, white)
- Icon: Camera focus (24px)
- Background: Semi-transparent dark overlay
- Padding: 12px
- Border radius: 8px

SCAN SUCCESS FEEDBACK:
Animated overlay when QR scanned successfully:
  * Green checkmark animation (large, 120px)
  * Success sound/haptic
  * Attendee card slides up:
    
    Card contents:
    - Avatar (64px, centered)
    - Name (20px, bold)
    - "Checked in successfully! ✓" (16px, green)
    - Time: "6:45 PM" (14px, gray)
    - Auto-dismiss after 2 seconds

SCAN ERROR FEEDBACK:
If invalid/duplicate QR:
  * Red X animation (120px)
  * Error card slides up:
    - Error icon (48px, red)
    - Error message:
      * "Already checked in" (16px, bold)
      * "Invalid QR code" (16px, bold)
      * "Not registered for this event" (16px, bold)
    - Time of first check-in (if duplicate)
    - "Dismiss" button
    - Error sound/haptic

MANUAL CHECK-IN:
- Button at bottom: "Manual Check-in" (purple, outlined)
  * Opens search interface:
    - Search bar: "Search attendee by name"
    - Filtered attendee list
    - Tap attendee → "Mark as Checked-in" button

BOTTOM STATS CARD:
- Fixed at bottom (above safe area)
- Semi-transparent white background
- Blur effect
- Border radius: 16px (top corners)
- Padding: 16px
- Contents:
  * Stats row:
    - Total RSVPs: "45" (16px, bold)
    - Checked in: "32" (16px, bold, green)
    - Pending: "13" (16px, bold, orange)
  * Progress bar (visual representation)
  * "View All Attendees" button (purple text, 14px)

FLASHLIGHT TOGGLE:
- Floating button (bottom-left)
- 48px circular button
- Icon: Flashlight (24px)
- Background: Semi-transparent white
- Blur effect
- Toggle on/off for low light scanning

CAMERA FLIP:
- Floating button (bottom-right)
- 48px circular button
- Icon: Camera flip (24px)
- Background: Semi-transparent white
- Switches front/rear camera

SPACING:
- Scanning frame centered vertically
- Stats card: 16px from bottom (above safe area)
- Button spacing: 16px margins

DESIGN DETAILS:
- Real-time camera preview
- Auto-focus on QR codes
- Vibration feedback on scan
- Sound feedback (success/error)
- Continuous scanning mode
- Offline mode (cached attendee list)
- Export check-in log
- Duplicate scan prevention
- Time-stamped check-ins
- Dark mode optimized
```

---

### **Screen 35: Event Attendees Screen**
**File name:** `35-event-attendees.png`  
**User flow:** From My Events or Event Details

**Uizard Prompt:**
```
Design an attendee management screen for event hosts (mobile).

HEADER:
- Back button (left, 24px)
- Event name (18px, bold, truncated)
- Subtitle: "Attendees" (14px, gray)
- More menu (right, 3 dots)
- Height: 56px

STATS CARDS ROW:
- 3 cards (horizontal):
  
  * Total RSVPs:
    - Icon: Users (24px, purple)
    - Number: "45" (24px, bold)
    - Label: "Total RSVPs" (12px, gray)
    - Background: Light blue
    - Size: Flex 1
  
  * Checked In:
    - Icon: Checkmark (24px, green)
    - Number: "32" (24px, bold)
    - Label: "Checked In" (12px, gray)
    - Background: Light green
    - Size: Flex 1
  
  * Pending:
    - Icon: Clock (24px, orange)
    - Number: "13" (24px, bold)
    - Label: "Pending" (12px, gray)
    - Background: Light orange
    - Size: Flex 1

- Card height: 90px
- Border radius: 12px
- 8px gap between cards
- 16px margins

FILTER CHIPS:
- Horizontal scrollable:
  * All (45)
  * Checked In (32)
  * Pending (13)
  * Waitlist (if applicable)
- Pill shape, 32px height
- Active: Purple background
- Badge counts shown
- 8px gap

SEARCH BAR:
- Full width (minus 32px margins)
- Placeholder: "Search attendees..."
- Magnifying glass icon (left)
- Clear X icon (right, when typing)
- Height: 44px
- Border radius: 22px
- Background: #F3F4F6
- 12px top margin

ATTENDEE LIST:
Attendee cards:
  * Avatar (48px, left, circular)
  * Check-in indicator (overlay on avatar):
    - Green checkmark (if checked in)
    - Gray clock (if pending)
  
  * Name (16px, bold)
  * Flat/Tower (14px, gray)
  
  * RSVP time (12px, gray)
    - "RSVP'd 3 days ago"
  
  * Check-in status:
    - If checked in:
      * Green pill: "Checked in ✓"
      * Time: "6:45 PM" (12px, gray)
    - If pending:
      * Blue pill: "Not checked in"
  
  * Action button (right):
    - If not checked in:
      * "Check In" (purple, outlined, 32px height)
    - If checked in:
      * Checkmark icon (green)
      * "Checked in" text

  * Card design:
    - Background: White
    - Border: 1px #E5E7EB
    - Border radius: 12px
    - Padding: 12px
    - 8px spacing between cards
    - Swipe left for more options

SWIPE ACTIONS:
- Swipe left reveals:
  * Message icon (blue, 60px width)
  * Remove icon (red, 60px width)

BULK ACTIONS:
- Long press to enable selection mode
- Checkboxes appear (left of avatars)
- Top bar shows: "X selected"
- Bottom action bar:
  * "Check In All" (blue)
  * "Send Message" (blue)
  * "Remove All" (red)

SORT DROPDOWN:
- Top-right, next to search
- "Sort by: Name" (14px)
- Options:
  * Name (A-Z)
  * Check-in status
  * RSVP time
  * Recent check-ins first

EXPORT BUTTON:
- Bottom-right corner
- Floating action button style
- Icon: Download (24px)
- 48px circular button
- "Export List" tooltip
- Exports to CSV/Excel with:
  * Name, Flat, RSVP time, Check-in time

EMPTY STATE (per filter):
- All: "No attendees yet"
- Checked in: "No one checked in yet"
- Pending: "Everyone is checked in!"
- Icon and text centered

WAITLIST SECTION (if applicable):
- Separate section below main list
- Header: "Waitlist (5)" (16px, bold)
- Same card design as main list
- "Approve" button to move to main list

SPACING:
- Screen padding: 16px
- Between cards: 8px
- Section spacing: 16px
- Scrollable list

DESIGN DETAILS:
- Real-time updates (check-ins sync live)
- Pull to refresh
- Check-in timestamp visible
- Bulk messaging capability
- Export functionality
- Search by name/flat
- Filter and sort
- Color-coded status
- Quick check-in from list
```

---

## 💬 **CHAT & MESSAGING**

### **Screen 36: Chat List Screen**
**File name:** `36-chat-list.png`  
**User flow:** From bottom navigation

**Uizard Prompt:**
```
Design a messaging inbox screen for mobile.

HEADER:
- Back button (left, 24px)
- Title: "Messages" (20px, bold)
- Search icon (right, 24px)
- New message icon (right, 24px, purple)
- Height: 56px

FILTER CHIPS:
- Horizontal scrollable:
  * All
  * Unread (3)
  * Groups
  * Archived
- Pill shape, 32px height
- Active: Purple background, white text
- Badge counts shown (red for unread)
- 8px gap, 16px margins

CONVERSATION LIST:
Conversation items:
  * Avatar (56px, left, circular)
    - Online indicator (green dot, 12px, bottom-right)
    - Group icon if group chat (multiple faces)
  
  * Name (16px, bold)
    - Person name or Group name
  
  * Flat/Tower info (12px, gray)
    - "A-204, Tower B"
    - Hidden for groups
  
  * Last message preview (14px, gray)
    - Truncated to 1 line
    - "You: Thanks for the help!" (if sent by you)
    - "Typing..." (if other person typing, purple, animated dots)
  
  * Timestamp (12px, gray, right aligned)
    - "2m ago" (if recent)
    - "Yesterday" (if yesterday)
    - "Mon" (if this week)
    - "Mar 10" (if older)
  
  * Unread badge (right, top)
    - Red circle with count "3"
    - 20px diameter minimum
    - White text, bold
  
  * Message type indicator (icon, 16px):
    - Image icon (if last message was image)
    - File icon (if last message was file)
    - Microphone icon (if voice message)
  
  * Read status (for sent messages):
    - Double checkmark (gray - delivered)
    - Double checkmark (blue - read)
    - Single checkmark (sent)
  
  * Pinned indicator (top-left of card):
    - Pin icon (16px, gray)
    - Pinned chats stay at top

Item design:
  - Background: White
  - Height: 80px
  - Padding: 12px
  - Border bottom: 1px #E5E7EB
  - Unread messages: Slightly bold, white background
  - Read messages: Normal weight, light background

SWIPE ACTIONS:
- Swipe right:
  * Archive (gray, 80px width, archive icon)
- Swipe left:
  * Mute (orange, 80px width, bell icon)
  * Delete (red, 80px width, trash icon)

PINNED CONVERSATIONS:
- Section header: "Pinned" (14px, bold, gray)
- Separated from regular conversations
- Pin icon shown

FLOATING ACTION BUTTON:
- Bottom-right corner
- Icon: Plus or New message (24px)
- 56px diameter
- Purple background (#8B46DE)
- Opens new conversation screen (contact selector)

EMPTY STATE:
- Icon: Chat bubbles (100px)
- Text: "No messages yet" (18px, bold)
- Subtext: "Start a conversation with your neighbors"
- "Find People" button (purple, filled)

SEARCH (when search icon tapped):
- Search bar slides down
- Placeholder: "Search messages..."
- Searches:
  * Contact names
  * Message content
  * Results grouped by conversation

SPACING:
- List items: No spacing (full width)
- Border separators between items
- Screen has no side padding for list
- Scrollable list
- Pull to refresh

DESIGN DETAILS:
- Online status real-time
- Typing indicators
- Unread count badges
- Message preview
- Swipe gestures
- Long-press for multi-select
- Archive/mute/delete options
- Pin important chats
- Group chat icons
- Last message timestamp
- Delivery status indicators
```

---

### **Screen 37: Chat Conversation Screen**
**File name:** `37-chat-conversation.png`  
**User flow:** From Chat List

**Uizard Prompt:**
```
Design a one-on-one chat conversation screen for mobile.

HEADER:
- Back button (left, 24px)
- Avatar (32px, next to back button)
- Name (16px, bold)
- Online status / Last seen (12px, gray)
  * "Online now" (green) or "Last seen 2h ago"
- Right icons:
  * Video call (24px)
  * Voice call (24px)
  * Info/More menu (24px, 3 dots)
- Background: White
- Height: 64px
- Border bottom: 1px #E5E7EB

CHAT MESSAGES AREA:
- Scrollable message list (reverse chronological)
- Background: #F9FAFB or chat wallpaper
- Padding: 16px (sides)

Message bubbles:

SENT MESSAGES (right-aligned):
  * Background: #8B46DE (blue)
  * Text color: White
  * Max width: 75% of screen
  * Border radius: 16px 16px 4px 16px
  * Padding: 12px
  * Font size: 16px
  * Tail/pointer: Bottom-right (subtle)
  * Timestamp below: "2:45 PM" (12px, gray, right-aligned)
  * Read receipt: Double checkmark (blue when read, gray when delivered)

RECEIVED MESSAGES (left-aligned):
  * Background: White or #E5E7EB
  * Text color: Black
  * Max width: 75% of screen
  * Border radius: 16px 16px 16px 4px
  * Padding: 12px
  * Font size: 16px
  * Tail/pointer: Bottom-left (subtle)
  * Timestamp below: "2:43 PM" (12px, gray, left-aligned)
  * Optional: Avatar (24px) to left of message (in group chats)

DATE SEPARATORS:
  * Centered text: "Today" or "Yesterday" or "March 15"
  * Background: Light gray pill
  * 12px text
  * Sticky on scroll

MESSAGE TYPES:

TEXT MESSAGE:
  * Plain text, wrapping
  * Links auto-detected (blue, underlined)
  * Emoji support (larger if emoji-only message)

IMAGE MESSAGE:
  * Image thumbnail (max 240px width)
  * Border radius: 12px
  * Tap to view full screen
  * Loading spinner while uploading
  * Caption below image (if any)

FILE MESSAGE:
  * File icon (48px, based on type)
  * File name (14px, bold)
  * File size (12px, gray)
  * "Download" or "Open" button
  * Background: Slightly different shade

VOICE MESSAGE:
  * Waveform visualization
  * Play button (circular, 32px)
  * Duration: "0:45" (12px)
  * Playback progress indicator
  * Width: 240px

SYSTEM MESSAGES (centered):
  * Background: Transparent
  * Text: Gray, italic, 14px
  * Examples:
    - "You added [Name] to the conversation"
    - "Messages are end-to-end encrypted"
    - "This conversation is now archived"

TYPING INDICATOR (when other person typing):
  * Small bubble (left side)
  * Animated dots: "..." (bouncing animation)
  * Background: #E5E7EB
  * Temporary (disappears when message sent)

INPUT AREA (bottom):
- Background: White
- Border top: 1px #E5E7EB
- Padding: 8px 16px
- Safe area padding at bottom
- Height: Flexible (grows with text)

Input components:
  * Attachment button (left):
    - Icon: Paperclip (24px, gray)
    - Opens attachment menu (bottom sheet)
  
  * Camera button:
    - Icon: Camera (24px, gray)
    - Quick photo/video capture
  
  * Text input field:
    - Multiline (max 6 lines, then scrollable)
    - Placeholder: "Type a message..." (14px, gray)
    - Background: #F3F4F6
    - Border radius: 20px
    - Padding: 10px 16px
    - Font size: 16px
    - Auto-expand as user types
  
  * Voice record button (right):
    - Icon: Microphone (24px, gray)
    - Long-press to record
    - Slide to cancel
  
  * Send button (appears when text entered):
    - Icon: Send arrow (24px, white)
    - Background: Blue circle (44px)
    - Replaces voice button when typing

ATTACHMENT MENU (bottom sheet):
- Slides up from bottom
- Options:
  * Photos & Videos (gallery icon)
  * Camera (camera icon)
  * Document (file icon)
  * Location (map pin icon)
- Each option: Icon (48px) + label (14px)
- Grid layout: 3 columns

VOICE RECORDING MODE:
- When microphone pressed:
  * Input area transforms
  * Waveform animation shows
  * Timer: "0:05" counting up
  * Slide left to cancel (red)
  * Release to send
  * "Slide to cancel" instruction

CONTEXT MENU (long-press message):
- Options:
  * Reply
  * Forward
  * Copy
  * Delete
  * Info (timestamp, read status)
- Appears above message in overlay

SCROLL TO BOTTOM:
- Floating button (bottom-right, above input)
- Appears when scrolled up
- Icon: Down arrow
- Badge: Unread count (if new messages below)
- 40px circular button

SPACING:
- Message spacing: 4px (same sender), 12px (different sender)
- Bubble internal padding: 12px
- Screen side padding: 16px
- Generous padding for readability

DESIGN DETAILS:
- Auto-scroll to bottom on new message (if near bottom)
- Smooth scrolling
- Load earlier messages on scroll to top
- Message sent/delivered/read indicators
- Online status updates real-time
- Typing indicators
- Link previews (URL metadata cards)
- Reply threading (optional)
- Message reactions (long-press)
- Forwarding capability
- Search in conversation
- Mute/block options in menu
```

---

### **Screen 38: Chat Popup (Minimized)**
**File name:** `38-chat-popup.png`  
**User flow:** Chat head overlay on other screens

**Uizard Prompt:**
```
Design a floating chat popup widget for mobile (appears over other screens).

MINIMIZED STATE (Chat Head):
- Small circular floating bubble
- Avatar of person chatting with (48px diameter)
- Unread count badge (red, top-right):
  * Badge: 16px diameter
  * Text: "3" (white, 10px, bold)
- Online indicator (green dot, bottom-right, 12px)
- Position: Draggable anywhere on screen
  * Default: Bottom-right corner
  * Margin from edge: 16px
  * Above bottom navigation bar
- Shadow: Prominent (raised appearance)
- Tap to expand

DRAGGING:
- User can drag to any position
- Snaps to edges when released
- Never overlaps critical UI (keyboard, navigation)
- Semi-transparent while dragging

EXPANDED STATE (Mini Chat Window):
- Slides up when bubble tapped
- Size: 90% screen width, 60% screen height
- Border radius: 20px 20px 0 0
- Shadow: Large, floats over content

Mini window header:
  * Avatar (32px, left)
  * Name (14px, bold)
  * Online status (10px, green text)
  * Minimize button (right, 24px, down arrow)
  * Close button (right, 24px, X icon)
  * Background: White
  * Height: 48px
  * Border radius: 20px 20px 0 0

Message area (mini):
  * Last 5-6 messages visible
  * Scrollable
  * Same bubble design as full chat
  * Condensed spacing
  * Background: #F9FAFB

Quick reply input (bottom):
  * Simple text input
  * Placeholder: "Quick reply..."
  * Send button (blue icon, right)
  * Height: 40px
  * No attachment options (keep simple)

"Open full chat" button:
  * Link at bottom
  * "Open full chat" (14px, purple, centered)
  * Icon: Expand arrows
  * Tappable area: Full width
  * Opens full conversation screen
  * Closes mini window

MULTIPLE CHAT HEADS:
- Can have 2-3 active chat bubbles
- Stack vertically on right edge:
  * Spacing: 8px between bubbles
  * Each draggable independently
- Oldest chat bubble auto-closes if > 3 active

INTERACTIONS:
- Single tap: Expand to mini window
- Double tap: Open full conversation
- Long press: Enter edit mode (close/remove)
- Swipe left: Close chat head

NOTIFICATIONS:
- New message animates chat head:
  * Subtle bounce
  * Badge updates
  * Can show message preview (toast style)

MINIMIZE/CLOSE:
- Minimize: Collapses to chat head
- Close X: Completely closes (can reopen from chat list)
- Swipe down on mini window: Minimize

DESIGN DETAILS:
- Messenger/WhatsApp-style chat heads
- Always on top of other content
- Doesn't interfere with scrolling
- Unread badge prominent
- Quick access to active conversations
- Minimal, non-intrusive design
- iOS: Respects safe areas
- Android: Picture-in-picture style
```

---

## 🔔 **NOTIFICATIONS**

### **Screen 39: Notifications Screen**
**File name:** `39-notifications.png`  
**User flow:** From top bar or bottom navigation

**Uizard Prompt:**
```
Design a notifications feed screen for mobile.

HEADER:
- Back button (left, 24px)
- Title: "Notifications" (20px, bold)
- Filter icon (right, 24px)
- Mark all read icon (right, 24px, checkmark)
- Height: 56px

FILTER CHIPS:
- Horizontal scrollable:
  * All
  * Unread (5)
  * Mentions
  * Today
- Pill shape, 32px height
- Active: Purple background
- Badge counts (red for unread)
- 8px gap

NOTIFICATIONS LIST:
Grouped by date:

DATE HEADERS:
  * "TODAY" (14px, uppercase, gray, bold)
  * "YESTERDAY"
  * "THIS WEEK"
  * "EARLIER"
  * Sticky on scroll
  * Background: #F9FAFB
  * Padding: 8px 16px

NOTIFICATION CARD:
Card design:
  * Background: White (read), Light purple (#EBF5FF) (unread)
  * Border radius: 12px
  * Padding: 12px
  * Border: 1px #E5E7EB
  * 8px spacing between cards
  * Left accent bar (4px, color-coded by type)

Card contents:

  * Type icon (left, 40px colored circle):
    - Job: Briefcase (blue)
    - Message: Chat bubble (green)
    - Skill Swap: Graduation cap (orange)
    - Event: Calendar (purple)
    - Idea: Lightbulb (yellow)
    - Team: Users (indigo)
    - Admin: Megaphone (red)
    - Forum: Question mark (blue)
  
  * Actor avatar (32px, next to icon if applicable):
    - Person who performed action
    - Overlaps icon slightly
  
  * Notification text (14px):
    - Name in bold
    - Action in normal weight
    - Entity in semi-bold
    - Example: "John Doe applied to your job posting for Senior Developer"
    - Max 3 lines, expandable
  
  * Time ago (12px, gray):
    - "2 hours ago"
    - "Yesterday at 3:45 PM"
  
  * Unread indicator:
    - Purple dot (8px, left of card)
  
  * Action button (if applicable):
    - "View Application" (purple, outlined, small)
    - "Reply" (purple, outlined)
    - "Accept" / "Decline" buttons
    - Full width or inline based on notification type
    - 32px height

NOTIFICATION TYPES:

JOB BOARD:
  * New job posting:
    - Icon: Briefcase (blue)
    - Text: "New job posted: [Job Title]"
    - Action: "View Job"
  
  * Application update:
    - Icon: Document
    - Text: "[Company] updated your application status"
    - Action: "View Status"
  
  * Interview request:
    - Icon: Calendar
    - Text: "[Company] requested an interview for [Job]"
    - Actions: "Accept" / "Decline"

MESSAGES:
  * New message:
    - Icon: Chat (green)
    - Actor avatar
    - Text: "[Name] sent you a message"
    - Action: "Reply"
    - Message preview (italic, 1 line)
  
  * Message request:
    - Text: "[Name] wants to message you"
    - Actions: "Accept" / "Decline"

SKILL SWAP:
  * Session request:
    - Icon: Graduation cap (orange)
    - Actor avatar
    - Text: "[Name] requested a session for [Skill]"
    - Actions: "Accept" / "Decline"
  
  * Session reminder:
    - Text: "Session with [Name] starts in 1 hour"
    - Action: "View Details"
  
  * New review:
    - Text: "[Name] left you a 5-star review"
    - Action: "View Review"

IDEAS:
  * Team application:
    - Icon: Users (indigo)
    - Actor avatar
    - Text: "[Name] applied to join your team for [Idea]"
    - Action: "View Application"
  
  * Idea update:
    - Text: "[Idea] was updated by [Name]"
    - Action: "View Idea"
  
  * Comment:
    - Text: "[Name] commented on your idea"
    - Comment preview
    - Action: "Reply"

EVENTS:
  * New event:
    - Icon: Calendar (purple)
    - Text: "New event: [Event Name]"
    - Action: "View Event"
  
  * Event reminder:
    - Text: "[Event Name] starts tomorrow at 6 PM"
    - Action: "View Details"
  
  * Event update:
    - Text: "[Event Name] details have been updated"
    - Action: "View Changes"

FORUM:
  * Answer to question:
    - Icon: Question mark
    - Text: "[Name] answered your question"
    - Action: "View Answer"
  
  * Mention:
    - Text: "[Name] mentioned you in a post"
    - Action: "View Post"
  
  * Upvote:
    - Text: "Your answer received 10 upvotes"
    - Action: "View"

COMMUNITY:
  * Announcement:
    - Icon: Megaphone (red)
    - Text: "Admin Announcement: [Title]"
    - Preview of announcement
    - Action: "Read More"
    - Highlighted background (light red)
  
  * Lost & Found match:
    - Text: "Potential match found for your lost item"
    - Action: "View Match"

SWIPE ACTIONS:
- Swipe right: Mark as read (checkmark)
- Swipe left: Delete (trash icon)

TAP ACTIONS:
- Tap notification: Opens relevant screen
- Long press: Options menu
  * Mark as read/unread
  * Delete
  * Turn off notifications for this type

EMPTY STATE:
- Icon: Bell with checkmark (100px)
- Text: "You're all caught up!" (18px, bold)
- Subtext: "No new notifications" (14px, gray)
- Illustration: Relaxed character

MARK ALL READ:
- Confirmation dialog:
  * "Mark all as read?"
  * "Cancel" / "Mark Read" buttons

SPACING:
- Screen padding: 16px
- Between cards: 8px
- Card internal: 12px
- Scrollable

DESIGN DETAILS:
- Pull to refresh
- Real-time updates
- Color-coded by type
- Actionable notifications
- Grouped by date
- Unread count in header
- Quick actions via swipe
- Priority notifications (highlighted)
- Mute specific notification types
- Clear all option (in menu)
```

---

## ❓ **FORUM / Q&A**

### **Screen 40: Forum Home Screen**
**File name:** `40-forum-home.png`  
**User flow:** From Dashboard

**Uizard Prompt:**
```
Design a Q&A forum home screen for mobile.

HEADER:
- Back button (left, 24px)
- Title: "Community Forum" (20px, bold)
- Search icon (right, 24px)
- Ask question icon (right, 24px, purple, plus or edit icon)
- Height: 56px

CATEGORY TAGS:
- Horizontal scrollable chips:
  * All Questions (selected)
  * Tech Help (computer icon)
  * General Discussion (chat icon)
  * Recommendations (star icon)
  * Complaints (alert icon)
  * Suggestions (lightbulb icon)
  * Events (calendar icon)
- Pill shape, 32px height
- Active: Purple background, white text
- Icons: 16px, left of text
- 8px gap, 16px margins

SORTING TABS:
- Below categories
- Tabs: Trending | Recent | Unanswered | Most Voted
- Active: Blue underline (3px)
- Fire icon for trending
- 14px text, 44px height

QUESTION CARDS:
- Vertical scrolling list
- Card design:
  * Background: White
  * Border radius: 12px
  * Border: 1px #E5E7EB
  * Padding: 16px
  * 12px spacing between cards

Card contents:

  * Top section:
    - Author avatar (32px, left)
    - Author name (14px, bold)
    - Posted time (12px, gray)
      "2 hours ago"
    - More menu (3 dots, right)
  
  * Question title (18px, bold, 2 lines max)
    - "How do I set up Firebase authentication in React?"
  
  * Question snippet (14px, gray, 2 lines max)
    - First 2 lines of question body
    - "Read more" if longer
  
  * Category tag:
    - Pill: "Tech Help" (12px, colored background)
    - Color-coded by category
  
  * Stats row (bottom):
    - Upvotes: "24" with up arrow icon (14px, can tap to upvote)
    - Answers: "8 answers" with comment icon
    - Views: "156 views" with eye icon
    - All inline, 12px, gray
    - Icons: 16px
  
  * Status badge (if applicable):
    - "Answered ✓" (green pill, top-right)
    - or "Unanswered" (orange pill)
    - 12px text
  
  * Top answer preview (if answered):
    - Background: #F9FAFB
    - Border-left: 3px green
    - Padding: 12px
    - "✓ Best Answer:" label (12px, green, bold)
    - Answer excerpt (14px, 2 lines max)
    - Author: "by [Name]" (12px, gray)
    - Collapsible

FLOATING ACTION BUTTON:
- Bottom-right corner
- Icon: Plus or Question mark
- 56px diameter
- Background: #8B46DE (blue)
- Text: "Ask Question"
- Shadow: prominent
- Above bottom nav

TRENDING SECTION (if on Trending tab):
- Special styling:
  * Fire icon (animated, 24px, top-right)
  * Slightly highlighted background (#FFF9E5)
  * "Trending" badge

FILTER MENU:
- Floating filter button (if needed)
- Bottom sheet with filters:
  * Time range (Today, This week, All time)
  * Has answers (Yes, No, Any)
  * Minimum votes
  * Specific tags

EMPTY STATE:
- Icon: Question mark in chat bubble (100px)
- Text: "No questions yet" (18px, bold)
- Subtext: "Be the first to ask a question"
- "Ask Question" button (purple, filled)

SPACING:
- Screen padding: 16px
- Between cards: 12px
- Card internal: 16px
- Scrollable
- Pull to refresh

DESIGN DETAILS:
- Upvote button interactive (tap to vote)
- Category color coding
- Answered badge prominent
- View count tracking
- Best answer preview
- Sorting options
- Tag filtering
- Skeleton loading
- Infinite scroll
```

---

### **Screen 41: Question Detail Screen**
**File name:** `41-question-detail.png`  
**User flow:** From Forum Home

**Uizard Prompt:**
```
Design a forum question detail screen for mobile.

HEADER:
- Back button (left, 24px)
- Share icon (right, 24px)
- Bookmark icon (right, 24px)
- More menu (right, 3 dots)
- Height: 56px

QUESTION CARD:
- White card with shadow
- Border radius: 16px
- Padding: 16px
- Margin: 16px

Card contents:

  * Author section:
    - Avatar (48px, left)
    - Name (16px, bold)
    - Reputation points: "1,234 pts" (12px, orange)
    - Posted time: "2 hours ago" (12px, gray)
    - "Follow" button (right, purple, outlined, 32px height)
  
  * Question title (24px, bold, multiline)
    - "How do I properly set up Firebase authentication in a React application?"
  
  * Category tags:
    - Pills: "React" "Firebase" "Authentication" (12px)
    - Purple background, white text
    - 4px gap, horizontal wrap
  
  * Question body:
    - Full text (16px, readable line height)
    - Multiple paragraphs allowed
    - Code blocks (if any):
      * Monospace font
      * Background: #F5F5F5
      * Border: 1px #E5E7EB
      * Padding: 12px
      * Horizontal scroll if needed
      * Syntax highlighting
    - Images (if attached):
      * Full width
      * Border radius: 8px
      * Tappable to enlarge
    - Links clickable and styled
  
  * Engagement section (bottom):
    - Upvote button (left):
      * Up arrow icon (24px)
      * Count: "24" (18px, bold)
      * Down arrow icon (24px)
      * Vertical layout
      * Blue when upvoted, gray default
      * Tap to toggle
    
    - Share icon (40px, centered)
    - Bookmark icon (40px, outlined/filled toggle)
    - "Follow Question" (purple text, 14px)
    
    - Horizontal layout
    - 16px spacing between items

ANSWERS SECTION:
- Section header: "8 Answers" (18px, bold)
- Sort dropdown: "Most Helpful" (14px, purple, right)
  * Options: Most Helpful, Recent, Oldest

Answer cards:
  * Background: White
  * Border: 1px #E5E7EB
  * Border radius: 12px
  * Padding: 16px
  * 12px spacing between cards
  * Best answer: Green left border (4px)

Answer card contents:

  * Best answer badge (if applicable):
    - Green checkmark icon (24px)
    - "Best Answer" (14px, green, bold)
    - Selected by question author
    - Top-right position
  
  * Author section:
    - Avatar (40px, left)
    - Name (14px, bold)
    - Reputation (12px, orange)
    - Expertise badge if expert in topic
    - Answered time (12px, gray)
  
  * Answer text:
    - Full answer (16px, readable line height)
    - Code blocks (styled as in question)
    - Images/links supported
    - "Read more" if very long (expandable)
  
  * Engagement row:
    - Upvote/Downvote (same as question)
    - Upvote count (16px, bold)
    - Comment icon + count: "Reply (3)" (14px)
    - Share icon
  
  * "Mark as Best Answer" button (if question author):
    - Blue, outlined
    - Full width
    - 36px height
    - Only shows if not already marked
  
  * Comments/Replies section (collapsible):
    - "View 3 replies" (14px, purple)
    - Nested comment cards:
      * Avatar (24px)
      * Name (12px)
      * Comment (14px)
      * Time (12px, gray)
      * Indented 16px from left
      * Light background (#F9FAFB)

"WRITE AN ANSWER" SECTION:
- Fixed at bottom (above keyboard when active)
- Collapsed state:
  * Input field: "Write an answer..." (14px, placeholder)
  * Height: 48px
  * Background: White
  * Border top: 1px #E5E7EB
  * Tap to expand

- Expanded state (full screen overlay):
  * Header: "Your Answer" (18px, bold)
  * Close button (X, top-right)
  * Rich text editor:
    - Multiline input (full screen)
    - Formatting toolbar:
      * Bold, Italic, Code, Link icons
      * Image upload
    - Character counter (bottom-right)
  * "Post Answer" button (purple, filled, bottom)
    - Full width, 48px height

RELATED QUESTIONS:
- Section header: "Related Questions" (18px, bold)
- Question cards (mini version):
  * Question title (14px, bold, 2 lines)
  * Answer count
  * View count
  * Horizontal scroll or vertical list
  * 3-4 questions shown

SPACING:
- Screen padding: 16px
- Section spacing: 24px
- Between answer cards: 12px
- Long scrollable content

DESIGN DETAILS:
- Upvote/downvote interactive
- Best answer prominently displayed
- Code syntax highlighting
- Image lightbox on tap
- Comment threading
- Author can mark best answer
- Share question
- Follow for updates
- Report inappropriate content
```

---

### **Screen 42: Ask Question Screen**
**File name:** `42-ask-question.png`  
**User flow:** From Forum Home FAB

**Uizard Prompt:**
```
Design a question posting screen for mobile.

HEADER:
- Cancel button (left, 16px, purple text)
- Title: "Ask a Question" (18px, bold, centered)
- Post button (right, 16px, purple text, bold)
  - Disabled until required fields filled
- Height: 56px

FORM:
Scrollable form sections:

QUESTION TITLE:
- Label: "Question Title" (14px, gray, semi-bold)
- Input field:
  * Placeholder: "What would you like to know?"
  * Height: 48px
  * Border: 1px #E5E7EB
  * Border radius: 8px
  * Font: 16px
  * Required indicator: Red asterisk
- Character guide: "Be specific and clear" (12px, gray)
- Character counter: "0/150" (12px, gray, right)

QUESTION CATEGORY:
- Label: "Category" (14px, gray, semi-bold)
- Dropdown selection:
  * Options with icons:
    - Tech Help (computer icon)
    - General Discussion (chat icon)
    - Recommendations (star icon)
    - Complaints (alert icon)
    - Suggestions (lightbulb icon)
    - Events (calendar icon)
  * Selected shows icon + text
  * Height: 48px
  * Border radius: 8px
- Required field

DETAILED DESCRIPTION:
- Label: "Detailed Description" (14px, gray, semi-bold)
- Rich text editor (simplified for mobile):
  * Multiline input (min 8 rows)
  * Placeholder: "Provide more details about your question. Include what you've tried and what you're looking for..."
  * Character counter: "0/2000" (bottom-right)
  * Formatting toolbar (bottom of input):
    - Bold (B icon)
    - Italic (I icon)
    - Bullet list (dots icon)
    - Code block (code icon)
    - 40px height icons
  * Auto-expand as user types
  * Border radius: 8px
- Required field

TAGS:
- Label: "Tags (Optional)" (14px, gray, semi-bold)
- Tag input:
  * Placeholder: "Add relevant tags"
  * Autocomplete suggestions dropdown:
    - Popular tags shown: React, JavaScript, Python, Design, etc.
    - Tap to add
  * Current tags shown as removable pills:
    - "React" with X icon (tap to remove)
    - Purple background, white text
    - 28px height, 12px text
  * "+ Add Tag" button
  * Max 5 tags

ATTACH IMAGES:
- Label: "Attach Images (Optional)" (14px, gray)
- Image upload area:
  * Dashed border rectangle
  * Icon: Image + camera
  * Text: "Add screenshots or images"
  * Tap to select from gallery or take photo
  * Max 3 images
- Preview uploaded images:
  * Thumbnail grid (3 columns)
  * Each: 100px × 100px
  * X icon to remove (top-right)
  * Border radius: 8px

ANONYMOUS POSTING:
- Toggle switch
- Label: "Post Anonymously" (14px)
- Description: "Your name won't be shown" (12px, gray)
- Icon: Incognito mask

TIPS SECTION (collapsible):
- Header: "💡 How to ask a good question" (14px, bold)
- Expandable card
- Background: Light purple (#EBF5FF)
- Border radius: 8px
- Padding: 12px
- Tips:
  * "Search before asking - your question may already be answered"
  * "Be specific and provide context"
  * "Include what you've tried"
  * "Use proper formatting for code"
  * "Add relevant tags"
- Can collapse/expand
- Icon: Info circle (blue)

PREVIEW & POST:
- Two buttons at bottom (sticky):
  * "Preview" (outlined, purple, flex 1)
    - Shows how question will appear
  * "Post Question" (filled, purple, flex 1)
    - Enabled when title, category, description filled
    - Disabled state: Gray, 50% opacity
- 8px gap between buttons
- 48px height each
- Above safe area

PREVIEW MODE:
- Modal/full screen overlay
- Shows question as it will appear in forum
- "Edit" button (top-right)
- "Confirm & Post" button (bottom)

DESIGN DETAILS:
- Auto-save draft (every 30 seconds)
- "Draft saved" indicator (subtle, top)
- Validation on required fields
- Error messages below invalid fields (red text)
- Character limits enforced
- Image size validation
- Duplicate question warning (AI-powered)
  * "Similar questions found:" with links
  * Shown after entering title
- Screen padding: 16px
- Section spacing: 24px
- Field spacing: 16px

SIMILAR QUESTIONS POPUP (AI suggestion):
- Appears after typing title
- "Similar questions:" header (14px, bold)
- List of 2-3 similar questions
- Each: Title + answer count
- "Still want to post?" button
- "These helped, thanks!" button
- Dismissible

---

## 🏘️ **COMMUNITY FEATURES**

### **Screen 43: Lost & Found Screen**
**File name:** `43-lost-and-found.png`  
**User flow:** From Dashboard or Community menu

**Uizard Prompt:**
```
Design a lost and found screen for mobile.

HEADER:
- Back button (left, 24px)
- Title: "Lost & Found" (20px, bold)
- Filter icon (right, 24px)
- Post button (right, 24px, purple, plus icon)
- Height: 56px

TABS:
- 2 main tabs:
  * Lost Items (12)
  * Found Items (8)
- Active tab: Blue underline (3px)
- Badge counts shown
- Tab height: 44px

FILTER CHIPS:
- Below tabs
- Horizontal scrollable:
  * All
  * Today
  * This Week
  * Resolved
- Pill shape, 32px height
- Active: Purple background
- 8px gap

ITEM CARDS:
- Vertical scrolling list
- Card design:
  * Background: White
  * Border radius: 12px
  * Border: 1px #E5E7EB
  * Padding: 16px
  * 12px spacing between cards

Card contents:

  * Item image (120px × 120px, left, rounded 12px)
    - Or placeholder icon if no image (based on category)
    - Multiple images: Show first with "+2" badge
  
  * Status badge (overlaid on image, top-right):
    - "Lost" (red pill)
    - "Found" (green pill)
    - "Resolved ✓" (gray pill)
    - 12px text
  
  * Item info section (right of image):
    
    * Item title (16px, bold)
      - "Blue Bicycle"
    
    * Category pill (12px):
      - "Bicycle" (colored, category-based)
    
    * Description (14px, gray, 2 lines max)
      - "Blue mountain bike with black seat..."
    
    * Location (14px, gray):
      - Icon: Map pin (16px)
      - "Near Gate 2"
    
    * Date posted (12px, gray):
      - Icon: Calendar
      - "Posted 2 days ago"
  
  * Posted by section (bottom):
    - Avatar (24px, left)
    - Name (14px, semi-bold)
    - Flat/Tower (12px, gray)
  
  * Contact button:
    - "Contact" (purple, outlined, full width, 36px height)
    - Or "Mark as Found/Returned" if poster's own item
    - Or "Resolved" status if already found

LOST TAB specific:
- Items people have lost
- Red accent color
- "Mark as Found" button for own posts

FOUND TAB specific:
- Items people have found
- Green accent color
- "Mark as Returned" button for own posts

FLOATING ACTION BUTTON:
- Bottom-right corner
- Icon: Plus
- 56px diameter
- Background: #8B46DE (blue)
- Text: "Report Item"
- Opens post form with toggle: Lost/Found

SEARCH FUNCTIONALITY:
- Search bar (top, below tabs):
  * Placeholder: "Search by item name, category..."
  * Magnifying glass icon (left)
  * Height: 44px
  * Border radius: 22px
  * Background: #F3F4F6

FILTER OPTIONS:
- Category filter (bottom sheet):
  * Keys
  * Wallet
  * Phone
  * Pet
  * Jewelry
  * Documents
  * Clothing
  * Electronics
  * Other
- Date range picker
- Location filter (gate/tower)

EMPTY STATE:
- Icon: Magnifying glass with item (100px)
- Text based on tab:
  * Lost: "No lost items reported"
  * Found: "No found items reported"
- "Report Item" button

RESOLVED ITEMS:
- Collapsed section at bottom
- "Show Resolved Items (15)" (14px, gray)
- Expandable
- Grayed out items

SPACING:
- Screen padding: 16px
- Between cards: 12px
- Card internal: 12px
- Scrollable

DESIGN DETAILS:
- Color coding (red for lost, green for found)
- Image gallery support
- Location mapping
- Contact privacy (message system)
- Mark as resolved
- Share item listing
- Time-sensitive highlighting (recent posts)
- Category icons
```

---

### **Screen 44: Post Lost/Found Item Screen**
**File name:** `44-post-lost-found.png`  
**User flow:** From Lost & Found FAB

**Uizard Prompt:**
```
Design a lost or found item posting screen for mobile.

HEADER:
- Cancel button (left, 16px, purple text)
- Title: "Report Item" (18px, bold, centered)
- Post button (right, 16px, purple text, bold)
- Height: 56px

ITEM TYPE TOGGLE:
- Large toggle at top
- Two options:
  * "Lost Item" (left, red accent)
  * "Found Item" (right, green accent)
- Selected side: Colored background, white text
- Unselected: Gray background, dark text
- Width: 90% of screen
- Height: 48px
- Border radius: 24px
- Icons: Sad face (lost), Happy face (found)

FORM SECTIONS:

UPLOAD PHOTOS:
- Label: "Photos" (14px, gray, semi-bold)
- Photo upload grid:
  * First box: Upload button (dashed border)
    - Icon: Camera + image
    - Text: "Add Photo" (14px)
    - Size: 100px × 100px
  * Preview boxes (for uploaded photos):
    - Photo thumbnail (100px × 100px)
    - X icon to remove (top-right)
    - Border radius: 12px
    - Max 3 photos
  * 3 column grid
  * 8px gap

ITEM DETAILS:
- Section header: "Item Details" (16px, bold)

Fields:
  * Item Title (required)
    - Input: 48px height
    - Placeholder: "e.g., Blue Bicycle"
    - Character counter: "0/100"
  
  * Category (required)
    - Dropdown with icons:
      * Keys (key icon)
      * Wallet (wallet icon)
      * Phone (phone icon)
      * Pet (paw icon)
      * Jewelry (diamond icon)
      * Documents (document icon)
      * Clothing (shirt icon)
      * Electronics (plug icon)
      * Bicycle (bike icon)
      * Other
  
  * Description (required)
    - Multiline input (6 rows)
    - Placeholder based on toggle:
      * Lost: "Describe the item. Where and when did you lose it?"
      * Found: "Describe the item. Where and when did you find it?"
    - Character counter: "0/500"

DATE & LOCATION:
- Section header: "When & Where" (16px, bold)

Fields:
  * Date Lost/Found (required)
    - Date picker
    - Icon: Calendar
    - Default: Today
    - Label changes: "Date Lost" or "Date Found"
  
  * Location (required)
    - Dropdown or map picker:
      * Common locations:
        - Near Gate 1
        - Near Gate 2
        - Swimming Pool Area
        - Community Hall
        - Tower A Lobby
        - Tower B Lobby
        - Parking Area
        - Gardens
        - Custom location (text input)
    - Icon: Map pin
  
  * Time (optional)
    - Time picker
    - "Approximate time" placeholder

CONTACT PREFERENCES:
- Section header: "Contact Preferences" (16px, bold)

Options:
  * Show Phone Number (toggle)
    - "People can call you directly"
    - Shows: +91 98XXXXXX45
  
  * Messages Only (toggle, default ON)
    - "Communicate via in-app messages only"
    - Recommended for privacy

ADDITIONAL INFO (for Lost items):
- "Reward Offered" (toggle)
  * If ON: Text input for reward amount/description
  * Placeholder: "e.g., ₹500 reward"

ADDITIONAL INFO (for Found items):
- "Item is with me" (toggle, default ON)
  * If OFF: Location input where item is kept
  * "e.g., Community office, Gate 1 security"

POST BUTTON:
- Fixed at bottom
- Full width (minus 32px margins)
- Height: 52px
- Text: "Post Lost Item" or "Post Found Item" (based on toggle)
- Background: Red (lost) or Green (found)
- Border radius: 8px
- Above safe area

TIPS CARD:
- Background: Light purple (#EBF5FF)
- Border radius: 8px
- Padding: 12px
- Icon: Info circle (blue)
- Text: Tips based on type:
  * Lost: "Be as specific as possible. Include unique identifying features."
  * Found: "Do not share personal/sensitive details publicly. Contact admin if found official documents."
- Collapsible

DESIGN DETAILS:
- Input validation
- Required field indicators (red asterisk)
- Error messages below invalid fields
- Image compression on upload
- Character limits
- Privacy-first approach
- Screen padding: 16px
- Section spacing: 24px
- Form scrollable
```

---

### **Screen 45: Community Announcements Screen**
**File name:** `45-announcements.png`  
**User flow:** From Dashboard or Community menu

**Uizard Prompt:**
```
Design a community announcements screen for mobile.

HEADER:
- Back button (left, 24px)
- Title: "Announcements" (20px, bold)
- Filter icon (right, 24px)
- Height: 56px

FILTER CHIPS:
- Horizontal scrollable:
  * All
  * Admin
  * Events
  * Maintenance
  * Safety
  * Important
- Pill shape, 32px height
- Active: Purple background
- Badge counts if unread
- 8px gap

PINNED ANNOUNCEMENTS:
- Section at top (if any)
- Section header: "Pinned" (14px, bold, gray)
- Pin icon (16px, red)
- Special highlighting

ANNOUNCEMENT CARDS:
- Vertical scrolling list
- Card design:
  * Background: White
  * Border radius: 12px
  * Border: 1px #E5E7EB
  * Padding: 16px
  * 12px spacing between cards
  * Left accent bar (4px) - color coded by type:
    - Admin: Red
    - Events: Purple
    - Maintenance: Orange
    - Safety: Red
    - General: Blue

Card contents:

  * Priority badge (top-right):
    - "IMPORTANT" (red pill, bold)
    - "URGENT" (red pill, pulsing)
    - "INFO" (blue pill)
  
  * Type icon (left, 48px colored circle):
    - Admin: Megaphone (red)
    - Event: Calendar (purple)
    - Maintenance: Tools (orange)
    - Safety: Shield (red)
    - General: Info (blue)
  
  * Title (18px, bold, 2 lines max)
    - "Water Supply Maintenance - March 15"
  
  * Posted by (14px, gray):
    - "Admin" badge (with checkmark)
    - Or poster name with avatar (24px)
    - Posted date: "2 days ago"
  
  * Message content:
    - Full text (16px, readable line height)
    - Expandable if long ("Read more" link)
    - Supports formatting:
      * Bold text
      * Bullet points
      * Links (blue, underlined)
  
  * Attached files (if any):
    - File card:
      * Icon based on type (PDF, image, etc.)
      * File name (14px)
      * File size (12px, gray)
      * "Download" or "View" button
      * Background: #F9FAFB
      * Border radius: 8px
      * Padding: 12px
  
  * Images (if any):
    - Full width images
    - Border radius: 12px
    - Tappable to enlarge
    - Multiple images: Gallery/carousel
  
  * Engagement section (bottom):
    - Like icon + count: "24 likes"
    - Comment icon + count: "8 comments"
    - Share icon
    - All interactive
    - 14px, gray
    - Icons: 20px

ADMIN ANNOUNCEMENTS:
- Special styling:
  * Red accent
  * "ADMIN" badge (checkmark icon)
  * Verified icon
  * Cannot be deleted/hidden
  * Highlighted background (#FEE2E2) if urgent

IMPORTANT/URGENT:
- Top of feed (below pinned)
- Pulsing animation on badge
- Notification sound on new urgent
- Requires acknowledgment (optional):
  * "Mark as Read" button
  * Stays in feed until acknowledged

COMMENTS SECTION (expandable):
- "View 8 comments" (14px, purple)
- Expands to show comment list:
  * Avatar (32px)
  * Name (14px, bold)
  * Comment (14px)
  * Time (12px, gray)
  * Like button
  * Reply button
- "Add comment" input (bottom):
  * Text field
  * Send button (blue icon)

FILTER MENU (bottom sheet):
- Date range
- Announcement type
- Unread only (toggle)
- Important only (toggle)

EMPTY STATE:
- Icon: Megaphone (100px, gray)
- Text: "No announcements" (18px, bold)
- Subtext: "You'll see community announcements here"

SPACING:
- Screen padding: 16px
- Between cards: 12px
- Card internal: 16px
- Scrollable
- Pull to refresh

DESIGN DETAILS:
- Color-coded by type
- Priority levels
- File attachments
- Image galleries
- Commenting capability
- Like/react option
- Share announcement
- Mark as read
- Search in announcements
- Notification for new urgent
- Push notifications opt-in per type
```

---

### **Screen 46: Activity Feed Screen**
**File name:** `46-activity-feed.png`  
**User flow:** From Dashboard or Community menu

**Uizard Prompt:**
```
Design a social activity feed screen for mobile.

HEADER:
- Back button (left, 24px)
- Title: "Activity Feed" (20px, bold)
- Filter icon (right, 24px)
- Height: 56px

FILTER CHIPS:
- Horizontal scrollable:
  * All
  * Following
  * My Posts
- Pill shape, 32px height
- Active: Purple background
- 8px gap

ACTIVITY CARDS:
- Vertical scrolling feed
- Card design:
  * Background: White
  * Border radius: 12px
  * Border: 1px #E5E7EB
  * Padding: 16px
  * 16px spacing between cards

Activity types and card contents:

1. SERVICE POSTED:
  * Activity icon (left, 40px circle):
    - Briefcase icon (purple background)
  
  * Content:
    - Avatar (32px, right of icon)
    - Name (14px, bold)
    - Action: "posted a new service" (14px, gray)
    - Time: "2 hours ago" (12px, gray)
  
  * Preview card:
    - Service icon (32px)
    - Service title (16px, bold)
    - Category tag (12px pill)
    - "View Service" button (purple, outlined, small)
  
  * Engagement:
    - Like, comment, share icons (20px)
    - Counts shown

2. IDEA SHARED:
  * Activity icon: Lightbulb (yellow background)
  * Action: "shared an idea"
  * Preview:
    - Idea title (16px, bold)
    - Brief description (14px, 2 lines)
    - "Looking for: Designer, Developer" (12px)
    - "View Idea" button

3. EVENT JOINED:
  * Activity icon: Calendar (purple background)
  * Action: "joined an event"
  * Preview:
    - Event banner (small, 80px × 80px, rounded)
    - Event name (16px, bold)
    - Date & time (14px)
    - "View Event" button

4. QUESTION ANSWERED:
  * Activity icon: Question mark (purple background)
  * Action: "answered a question"
  * Preview:
    - Question title (16px, bold)
    - Answer preview (14px, 2 lines, italic)
    - "View Answer" button

5. SKILL SWAP COMPLETED:
  * Activity icon: Graduation cap (orange background)
  * Action: "completed a skill swap session"
  * Preview:
    - Skill learned: "Python Programming"
    - With: Partner name + avatar
    - Rating: 5 stars
    - "Book Another Session" button

6. BADGE EARNED:
  * Activity icon: Trophy (gold background)
  * Action: "earned a new badge"
  * Preview:
    - Badge icon (large, 64px)
    - Badge name (16px, bold)
    - Badge description (14px)
    - Confetti animation (subtle)

7. JOB APPLICATION:
  * Activity icon: Document (green background)
  * Action: "applied to a job"
  * Preview:
    - Job title (16px, bold)
    - Company name (14px)
    - "View Application" button

8. PROFILE UPDATE:
  * Activity icon: User (gray background)
  * Action: "updated their profile"
  * Preview:
    - "Added new skills: React, Node.js"
    - or "Updated profile photo"
    - "View Profile" button

ENGAGEMENT ROW (bottom of each card):
- Like button:
  * Heart icon (20px)
  * Count: "12" (14px)
  * Tap to toggle
  * Animates when liked

- Comment button:
  * Comment icon (20px)
  * Count: "3" (14px)
  * Opens comment section

- Share button:
  * Share icon (20px)
  * Opens share menu

COMMENT SECTION (collapsible):
- "View 3 comments" (14px, purple)
- Expands inline
- Comment cards:
  * Avatar (24px)
  * Name (14px, bold)
  * Comment (14px)
  * Time (12px, gray)
  * Like icon
- "Add comment" input

FILTER OPTIONS:
- Bottom sheet
- Activity types (multi-select):
  * Services
  * Ideas
  * Events
  * Jobs
  * Skill Swaps
  * Achievements
  * Q&A
- Date range: Today, This Week, All Time

EMPTY STATE:
- Icon: Activity graph (100px)
- Text: "No activity yet" (18px, bold)
- Subtext: "Follow people to see their activity"
- "Find People" button

LOAD MORE:
- Infinite scroll
- "Loading..." indicator at bottom
- Pull to refresh at top

SPACING:
- Screen padding: 16px
- Between cards: 16px
- Card internal: 16px
- Scrollable

DESIGN DETAILS:
- Color-coded activity icons
- Preview cards for context
- Inline engagement
- Real-time updates
- Like animations
- Share functionality
- Comment threading
- Badge celebrations (confetti)
- Time-based sorting
- Filter by type
- Search activities
```

---

### **Screen 47: Photo Gallery Screen**
**File name:** `47-photo-gallery.png`  
**User flow:** From Dashboard or Community menu

**Uizard Prompt:**
```
Design a community photo gallery screen for mobile.

HEADER:
- Back button (left, 24px)
- Title: "Photo Gallery" (20px, bold)
- Upload icon (right, 24px, purple, cloud with arrow up)
- Filter/Sort icon (right, 24px)
- Height: 56px

ALBUMS/CATEGORIES:
- Horizontal scrollable chips:
  * All Photos
  * Events
  * Festivals
  * Sports
  * Community Activities
  * User Uploads
- Pill shape, 36px height
- Active: Purple background, white text
- Photo count badge: "(234)"
- 8px gap, 16px margins

PHOTO GRID:
- 3 column grid layout
- Photo tiles:
  * Square aspect ratio (1:1)
  * Size: (Screen width - 32px - 16px) / 3
  * Border radius: 4px
  * 4px gap between photos
  * Tappable

Photo tile contents:
  * Photo thumbnail (full fill)
  * Like overlay (on long-press or tap):
    - Heart icon (white, 24px, center)
    - Fade-in animation
  * Multiple select mode:
    - Checkbox (top-right, 24px)
    - Blue checkmark when selected
  
  * Video indicator (if video):
    - Play icon overlay (center, 40px, white)
    - Duration badge (bottom-right, "2:34")

PHOTO INFO (shown in tile):
- Subtle gradient overlay (bottom)
- Uploader avatar (24px, bottom-left)
- Like count: Heart icon + "24" (bottom-right, white)

FULL SCREEN PHOTO VIEW:
When photo tapped:
  * Full screen overlay (black background)
  * Photo centered (pinch to zoom)
  * Swipe left/right for next/previous
  * Close button (top-left, X, white)
  * More menu (top-right, 3 dots, white)
  
  * Photo info bar (bottom):
    - Uploader avatar (32px) + name (16px, white)
    - Upload date (12px, white, 70% opacity)
    - Location (if tagged): "Community Hall" (12px)
  
  * Caption (if any):
    - Text below photo (16px, white)
    - "Beautiful sunset at the community garden"
  
  * Action buttons (bottom):
    - Like: Heart icon + count
    - Comment: Bubble icon + count
    - Share: Share icon
    - Download: Download icon
    - All white, 40px touch target
    - Horizontal row

COMMENTS (in full screen):
- Swipe up or tap comment icon
- Bottom sheet slides up
- Comment list:
  * Avatar (32px)
  * Name (14px, bold)
  * Comment (14px)
  * Time (12px, gray)
  * Like button
  * 8px spacing
- "Add comment" input (sticky bottom):
  * Text field
  * Send button (blue icon)

UPLOAD FUNCTIONALITY:
- Floating action button (bottom-right):
  * Icon: Plus or camera (24px)
  * 56px diameter
  * Purple background (#8B46DE)
  * Opens upload interface

UPLOAD SCREEN (modal):
- Photo selection from gallery
- Multi-select (max 10 photos)
- Preview selected photos
- Add caption per photo (optional)
- Add to album/category (dropdown)
- Tag location (optional)
- "Upload X Photos" button (purple, filled)

MULTI-SELECT MODE:
- Long-press photo to activate
- Checkboxes appear on all photos
- Top bar changes:
  * "X selected" (16px)
  * Actions:
    - Download All
    - Share All
    - Delete (if user's photos)
    - Add to Album
  * Cancel button (right)

FILTER/SORT MENU:
- Bottom sheet
- Sort by:
  * Recent
  * Popular (most liked)
  * Most commented
  * Oldest
- Filter by:
  * Date range (date picker)
  * Uploader (search users)
  * Album/Category
  * My uploads only (toggle)

EMPTY STATE:
- Icon: Image gallery (100px)
- Text: "No photos yet" (18px, bold)
- Subtext: "Be the first to share community moments"
- "Upload Photos" button (purple, filled)

PHOTO DETAILS (in more menu):
- Full metadata:
  * Uploader
  * Upload date & time
  * File size
  * Dimensions
  * Camera info (if EXIF data)
  * Location (if tagged)
  * Album
- Edit options (if owner):
  * Edit caption
  * Change album
  * Delete photo
- Report photo (if not owner)

SPACING:
- No screen padding (full width grid)
- 4px gap between photos
- Grid scrollable
- Pull to refresh
- Infinite scroll (load more on scroll)

DESIGN DETAILS:
- Lazy loading images
- Thumbnail optimization
- Smooth transitions
- Pinch to zoom in full view
- Swipe gestures
- Like animation (heart pop)
- Download to device
- Share via apps
- Instagram-style grid
- EXIF data preservation
- Photo reporting/moderation
```

---

## 🛒 **MARKETPLACE (PHASE 2)**

### **Screen 48: Marketplace Screen**
**File name:** `48-marketplace.png`  
**User flow:** From Dashboard

**Uizard Prompt:**
```
Design a marketplace/classifieds screen for mobile.

HEADER:
- Back button (left, 24px)
- Title: "Marketplace" (20px, bold)
- Search icon (right, 24px)
- Sell button (right, 24px, purple, tag icon)
- Height: 56px

CATEGORIES:
- Horizontal scrollable chips with icons:
  * All Items
  * Electronics (phone icon)
  * Furniture (sofa icon)
  * Books (book icon)
  * Clothing (shirt icon)
  * Kids Items (toy icon)
  * Sports Equipment (ball icon)
  * Home Decor (lamp icon)
  * Services (wrench icon)
- Pill shape, 40px height
- Active: Purple background, white text
- Icons: 20px
- 8px gap

FILTER BAR:
- Below categories
- Filter chips:
  * Price: "₹0 - ₹10,000" (tappable to edit)
  * Condition: "All" (New, Like New, Good, Fair)
  * Distance: "All Towers"
- Sort dropdown (right): "Recent" (options: Recent, Price Low-High, Price High-Low, Distance)

ITEM GRID:
- 2 column grid layout
- Item cards:
  * Size: (Screen width - 48px) / 2
  * Border radius: 12px
  * Background: White
  * Border: 1px #E5E7EB
  * Shadow: subtle
  * 8px gap between cards

Item card contents:

  * Item image (top):
    - Square aspect ratio
    - Full width of card
    - Border radius: 12px 12px 0 0
    - Multiple images indicator: Dot pagination (if >1 image)
  
  * Price tag (overlaid on image, top-right):
    - Background: Semi-transparent black
    - Text: "₹5,000" (14px, white, bold)
    - Border radius: 8px
    - Padding: 4px 8px
    - Or "FREE" (green background)
  
  * Sold badge (if sold):
    - "SOLD" overlay (red, diagonal banner)
    - Semi-transparent background
  
  * Content area (bottom):
    - Padding: 12px
    
    * Title (14px, bold, 2 lines max)
      - "iPhone 12 Pro Max 256GB"
    
    * Condition badge (12px pill):
      - "Like New" (green)
      - "Good" (blue)
      - "Fair" (orange)
    
    * Location (12px, gray):
      - Icon: Map pin (12px)
      - "Tower A, Flat 204"
    
    * Posted time (10px, gray):
      - "2 hours ago"
    
    * Seller avatar (24px, bottom-left, circular)
  
  * Bookmark icon (top-right):
    - 32px circular button
    - White background
    - Outline/filled toggle
    - Tap to save

FLOATING ACTION BUTTON:
- Bottom-right corner
- Icon: Plus or tag
- 56px diameter
- Background: #8B46DE (blue)
- Text: "Sell Item"
- Shadow: prominent
- Above bottom nav

FILTER BOTTOM SHEET:
- Slides up when filter tapped

Sections:
  * Price Range:
    - Dual slider (min-max)
    - Range: ₹0 to ₹50,000
    - Current: "₹0 - ₹10,000"
  
  * Condition (checkboxes):
    - New
    - Like New
    - Good
    - Fair
    - Poor
  
  * Distance:
    - All Towers
    - Same Tower
    - Nearby Towers
  
  * Availability:
    - Available Now
    - Negotiable Price
  
  * "Apply Filters" button (purple, filled, bottom)
  * "Clear All" link (top-right)

EMPTY STATE:
- Icon: Shopping bag (100px)
- Text: "No items found" (18px, bold)
- Subtext: "Try adjusting your filters"
- "Clear Filters" button

SEARCH:
- Search bar below header
- Placeholder: "Search items..."
- Autocomplete suggestions
- Recent searches

SPACING:
- Screen padding: 16px
- Grid gap: 8px
- Card internal: 12px
- Scrollable
- Infinite scroll
- Pull to refresh

DESIGN DETAILS:
- Image-forward grid
- Price prominent
- Condition indicators
- Save/bookmark items
- Distance from user
- Sold items grayed out
- Free items highlighted
- Multi-image support
- Category filtering
- Price range slider
```

---

### **Screen 49: Marketplace Item Detail Screen**
**File name:** `49-item-detail.png`  
**User flow:** From Marketplace grid

**Uizard Prompt:**
```
Design a marketplace item detail screen for mobile.

HEADER:
- Back button (left, 24px)
- Share icon (right, 24px)
- Bookmark icon (right, 24px, outline/filled toggle)
- More menu (right, 3 dots)
- Height: 56px
- Overlaid on image (white icons with shadow)

IMAGE CAROUSEL:
- Full width images (swipeable)
- Height: 320px
- Dot pagination (bottom center):
  * Dots: 8px diameter
  * Active: Blue, larger (10px)
  * Inactive: Gray, semi-transparent
  * "1/5" counter (top-right, white text)
- Pinch to zoom capability
- Double-tap to zoom

CONTENT SECTION:
- White background
- Border radius: 24px 24px 0 0
- Overlaps image by 20px
- Padding: 20px

Price section:
  * Price: "₹5,000" (32px, bold, green)
  * Original price (if discounted): "₹7,000" (18px, strikethrough, gray)
  * "30% off" badge (red pill, 12px)
  * or "FREE" (green, large)
  * "Negotiable" badge (blue pill) if applicable

Title & condition:
  * Title: "iPhone 12 Pro Max 256GB" (24px, bold)
  * Condition badge: "Like New" (green pill, 14px)
  * Category: "Electronics > Phones" (12px, gray)
  * Posted time: "2 hours ago" (12px, gray)

Seller info card:
  * Background: #F9FAFB
  * Border radius: 12px
  * Padding: 12px
  * Content:
    - Avatar (48px, left)
    - Name (16px, bold)
    - Flat/Tower (14px, gray)
    - Member since: "Jan 2024" (12px, gray)
    - Rating if applicable: 4.8 ⭐ (14px)
    - "View Profile" link (14px, purple, right)
  * "Message Seller" button (full width, 40px, purple, outlined)
  * "Call" button (full width, 40px, green, outlined) - if phone shown

Description section:
  * Header: "Description" (18px, bold)
  * Full description text (16px, readable line height)
  * Multiple paragraphs
  * Expandable if very long

Specifications section:
  * Header: "Details" (18px, bold)
  * Key-value pairs:
    - "Brand: Apple"
    - "Storage: 256GB"
    - "Color: Pacific Blue"
    - "Warranty: None"
    - Each: 14px, icon (16px, left)
    - Background: #F9FAFB (alternating rows)
    - Border radius: 8px
    - Padding: 12px

Location & Pickup:
  * Header: "Location & Pickup" (18px, bold)
  * Location: "Tower A, Flat 204" (16px)
  * Map preview (200px height):
    - Shows location pin
    - Tappable to open full map
    - Border radius: 12px
  * "Get Directions" button (purple, outlined)
  * Pickup info: "Pickup from my flat" (14px, gray)
  * Available time: "Evenings after 6 PM" (14px)

Action buttons (sticky bottom):
  * "Make Offer" button (purple, filled, flex 1)
  * "Add to Wishlist" button (outlined, flex 1)
  * 8px gap
  * 48px height each
  * Above safe area

Similar items section:
  * Header: "Similar Items" (18px, bold)
  * Horizontal scroll of item cards (mini):
    - 160px × 200px each
    - Image + price + title
    - 8px gap
  * "View All" link (14px, purple)

Report listing option:
  * In more menu
  * Report reasons:
    - Inappropriate content
    - Spam
    - Scam/fraud
    - Wrong category
    - Already sold

SPACING:
- Content padding: 20px
- Section spacing: 24px
- Long scrollable content

DESIGN DETAILS:
- Image carousel smooth
- Zoom functionality
- Price prominent
- Seller verification
- Direct messaging
- Make offer capability
- Wishlist/save
- Share listing
- Map integration
- Similar items recommendation
- Report option
```

---

### **Screen 50: Sell Item Screen**
**File name:** `50-sell-item.png`  
**User flow:** From Marketplace FAB

**Uizard Prompt:**
```
Design an item listing creation screen for mobile.

HEADER:
- Cancel button (left, 16px, purple text)
- Title: "Sell an Item" (18px, bold, centered)
- Save Draft button (right, 14px, gray text)
- Height: 56px

FORM SECTIONS:
Scrollable form:

UPLOAD PHOTOS:
- Label: "Photos (Required)" (14px, gray, semi-bold)
- "First photo will be the cover image" (12px, gray)
- Photo upload grid:
  * 3 columns
  * First box: Upload button (dashed border)
    - Icon: Camera
    - Text: "Add Photos"
    - Size: 100px × 100px
  * Preview boxes (draggable to reorder):
    - Photo thumbnail (100px × 100px)
    - "Cover" badge (first photo, purple)
    - X icon to remove (top-right)
    - Drag handle (bottom-right)
    - Border radius: 12px
    - Max 6 photos
  * 8px gap

ITEM DETAILS:
- Section header: "Item Details" (16px, bold)

Fields:
  * Item Title (required)
    - Input: 48px height
    - Placeholder: "e.g., iPhone 12 Pro Max 256GB"
    - Character counter: "0/100"
  
  * Category (required)
    - Dropdown with icons:
      * Electronics
      * Furniture
      * Books
      * Clothing
      * Kids Items
      * Sports Equipment
      * Home Decor
      * Other
    - Subcategory appears after selection
  
  * Condition (required)
    - Large radio buttons (card style):
      ○ New (never used)
      ○ Like New (minimal use)
      ○ Good (some wear)
      ○ Fair (visible wear)
      ○ Poor (heavy wear)
    - Each: Icon + description
    - 48px height, full width
    - 8px gap

PRICING:
- Section header: "Pricing" (16px, bold)

Fields:
  * Price (required)
    - Number input
    - Currency prefix: "₹"
    - Placeholder: "5,000"
    - Large font: 24px
  
  * Free item toggle:
    - "List as FREE" toggle switch
    - Disables price input when ON
  
  * Negotiable toggle:
    - "Price is negotiable" toggle switch
    - Shows "Negotiable" badge on listing

DESCRIPTION:
- Section header: "Description" (16px, bold)

Field:
  * Description (required)
    - Multiline input (8 rows)
    - Placeholder: "Describe the item's condition, features, reason for selling..."
    - Character counter: "0/1000"
    - Formatting tips:
      * "Be honest about condition"
      * "Mention included accessories"

SPECIFICATIONS:
- Section header: "Specifications (Optional)" (16px, bold)
- "Add detail" button (purple, outlined)
- Tapping adds key-value pair:
  * Key input: "Brand"
  * Value input: "Apple"
  * Remove icon (X)
- Can add up to 10 specs
- Common suggestions: Brand, Color, Size, Material, etc.

PICKUP & LOCATION:
- Section header: "Pickup Details" (16px, bold)

Fields:
  * Pickup Location
    - Radio buttons:
      ○ Your flat (pre-filled from profile)
      ○ Community Hall
      ○ Other (text input)
  
  * Available Time
    - Text input or time slots
    - Placeholder: "Weekday evenings, Weekends all day"

PREVIEW & PUBLISH:
- Two buttons at bottom (sticky):
  * "Preview" (outlined, purple)
    - Shows how listing will look
  * "Publish Listing" (filled, purple)
    - Enabled when all required fields complete
- Both full width, 48px height
- 8px gap
- Above safe area

TIPS CARD:
- Background: Light purple (#EBF5FF)
- Border radius: 8px
- Padding: 12px
- Icon: Info circle (blue)
- Tips:
  * "Take clear, well-lit photos"
  * "Be honest about condition"
  * "Price competitively"
  * "Respond to messages quickly"
- Collapsible

DESIGN DETAILS:
- Auto-save draft every 30s
- Required field indicators
- Validation on submit
- Image compression
- Image reordering (drag & drop)
- Price suggestions based on category
- Template descriptions (optional)
- Screen padding: 16px
- Section spacing: 24px
```

---

## 🔧 **TOOL RENTAL (PHASE 2)**

### **Screen 51: Tool Rental Screen**
**File name:** `51-tool-rental.png`  
**User flow:** From Dashboard or Services

**Uizard Prompt:**
```
Design a tool/equipment rental screen for mobile.

HEADER:
- Back button (left, 24px)
- Title: "Tool Rental" (20px, bold)
- Search icon (right, 24px)
- List tool button (right, 24px, purple, plus icon)
- Height: 56px

CATEGORIES:
- Horizontal scrollable chips with icons:
  * All Tools
  * Power Tools (drill icon)
  * Garden Tools (rake icon)
  * Kitchen Appliances (blender icon)
  * Sports Equipment (ball icon)
  * Party Supplies (balloon icon)
  * Ladders & Equipment (ladder icon)
- Pill shape, 40px height
- Active: Purple background
- Icons: 20px
- 8px gap

FILTER BAR:
- Below categories
- Chips:
  * Available Now (green)
  * Price: "₹0 - ₹500/day"
  * Distance: "All Towers"
- Sort dropdown: "Nearest First"

TOOL CARDS:
- Vertical scrolling list
- Card design:
  * Background: White
  * Border radius: 12px
  * Border: 1px #E5E7EB
  * Padding: 16px
  * 12px spacing between cards

Card contents:

  * Tool image (120px × 120px, left, rounded 12px)
    - Multiple images: Dot pagination
  
  * Tool info section (right of image):
    
    * Tool name (16px, bold)
      - "Bosch Cordless Drill"
    
    * Category tag (12px pill):
      - "Power Tools" (blue)
    
    * Rental price (18px, bold, green):
      - "₹100/day"
      - or "₹50/hour" if hourly
      - Options dropdown for duration
    
    * Owner info:
      - Avatar (24px) + name (14px)
      - Flat/Tower (12px, gray)
      - Rating: 4.8 ⭐ (12px)
    
    * Availability:
      - Calendar icon (16px)
      - "Available Now" (green, 14px, bold)
      - or "Next available: Mar 16" (orange, 14px)
      - Mini calendar preview (tappable)
    
    * Condition: "Excellent" (12px, gray)
  
  * "Rent Now" button:
    - Blue, filled, full width in card
    - 36px height
    - Or "View Calendar" if not immediately available

FLOATING ACTION BUTTON:
- Bottom-right
- Icon: Plus or tool
- 56px diameter
- Purple background
- "List Your Tool"

FILTER MENU:
- Bottom sheet

Sections:
  * Availability:
    - Available Now (toggle)
    - Date range picker
  
  * Price Range:
    - Slider: ₹0 to ₹1000/day
  
  * Distance:
    - Same Tower
    - Nearby Towers
    - All Towers
  
  * Tool Type (checkboxes)
  
  * Rating:
    - 4+ stars
    - 3+ stars
    - All
  
  * "Apply Filters" button

EMPTY STATE:
- Icon: Toolbox (100px)
- Text: "No tools available" (18px, bold)
- Subtext: "Be the first to list a tool for rent"
- "List Your Tool" button

SPACING:
- Screen padding: 16px
- Between cards: 12px
- Card internal: 12px
- Scrollable

DESIGN DETAILS:
- Availability status prominent
- Calendar integration
- Price per day/hour
- Owner ratings
- Distance indicator
- Condition shown
- Multi-image support
- Quick booking
```

---

### **Screen 52: Tool Detail & Booking Screen**
**File name:** `52-tool-booking.png`  
**User flow:** From Tool Rental list

**Uizard Prompt:**
```
Design a tool rental detail and booking screen for mobile.

HEADER:
- Back button (left, 24px)
- Share icon (right, 24px)
- Bookmark icon (right, 24px)
- Height: 56px

IMAGE CAROUSEL:
- Tool images (swipeable)
- Height: 280px
- Dot pagination
- Pinch to zoom

TOOL INFO CARD:
- White card
- Border radius: 16px (top)
- Padding: 20px

Content:
  * Tool name (24px, bold)
    - "Bosch Cordless Drill GSR 120-LI"
  
  * Category & Condition:
    - Pills: "Power Tools" + "Excellent" (14px)
  
  * Owner section:
    - Avatar (48px)
    - Name (16px, bold)
    - Flat/Tower (14px, gray)
    - Rating: 4.9 ⭐ with "(24 rentals)" (14px)
    - "Message Owner" button (right, purple, outlined)

PRICING CARD:
- Background: #F9FAFB
- Border radius: 12px
- Padding: 16px

Content:
  * Rental price options (radio buttons):
    ○ "₹50/hour" (selected)
    ○ "₹100/day"
    ○ "₹500/week"
  * Security deposit (if applicable):
    - "₹1,000 security deposit" (14px)
    - "Refundable" badge (green pill)

AVAILABILITY CALENDAR:
- Header: "Select Rental Period" (18px, bold)
- Calendar view (month grid):
  * Available dates: White
  * Booked dates: Gray, strikethrough
  * Selected dates: Blue
  * Today: Blue outline
- Date range selector:
  * Start date
  * End date
  * Duration auto-calculated

BOOKING SUMMARY:
- Card with calculation:
  * Selected period: "Mar 15 - Mar 17" (16px)
  * Duration: "3 days" (14px, gray)
  * Rate: "₹100/day × 3" (14px)
  * Subtotal: "₹300" (16px, bold)
  * Security deposit: "+₹1,000" (14px)
  * Total: "₹1,300" (20px, bold, green)
  * "Deposit refunded after return" (12px, gray)

PICKUP/DELIVERY:
- Header: "Pickup & Delivery" (18px, bold)
- Radio buttons:
  ○ Pickup from owner
    - Address shown
    - "Get Directions" link
  ○ Delivery (if available)
    - Delivery fee: "+₹50" (14px)
    - Address input for delivery

TOOL DESCRIPTION:
- Header: "Description" (18px, bold)
- Full description (16px)
- Features/specifications:
  * Bullet points
  * Icons for key features
- Usage instructions (if provided)

REVIEWS:
- Header: "Reviews (24)" (18px, bold)
- Average rating: 4.8 ⭐ (large)
- Rating breakdown:
  * 5 stars: progress bar (80%)
  * 4 stars: progress bar (15%)
  * etc.
- Recent reviews (3 shown):
  * Avatar + name
  * Stars + date
  * Review text
  * "Helpful" button
- "See all reviews" link

TERMS & CONDITIONS:
- Collapsible section
- Rental terms:
  * Late return fees
  * Damage policy
  * Cancellation policy
  * Deposit refund terms
- Checkbox: "I agree to rental terms"

REQUEST RENTAL BUTTON:
- Sticky bottom
- Full width (minus 32px margins)
- Height: 52px
- Background: #8B46DE
- Text: "Request Rental - ₹1,300"
- Enabled when:
  * Dates selected
  * Terms agreed
- Above safe area

PAYMENT OPTIONS:
- Shown after Request tapped
- Pay now (online):
  * UPI
  * Card
  * Wallet
- Pay at pickup (cash)

SPACING:
- Content padding: 20px
- Section spacing: 24px
- Scrollable

DESIGN DETAILS:
- Calendar integration
- Availability real-time
- Auto-calculate costs
- Security deposit clear
- Owner verification
- Reviews system
- Terms acceptance
- Multiple payment options
- Delivery option
- Usage instructions
```

---

## 🏆 **GAMIFICATION & ACHIEVEMENTS**

### **Screen 53: Points & Badges Screen**
**File name:** `53-points-badges.png`  
**User flow:** From Profile or Dashboard

**Uizard Prompt:**
```
Design a gamification/rewards screen for mobile.

HEADER:
- Back button (left, 24px)
- Title: "Your Achievements" (20px, bold)
- Info icon (right, 24px) - explains points system
- Height: 56px

POINTS CARD (hero):
- Background: Purple gradient (#8B46DE to #8B5CF6)
- Border radius: 20px
- Padding: 24px
- Margin: 16px

Content:
  * Trophy icon (large, 80px, gold, centered top)
  * Total points (48px, white, bold, centered)
    - "850 Points"
  * Level badge (below points):
    - "Level 5: Active Member" (18px, white)
    - Badge icon
  * Progress bar to next level:
    - Background: White 30% opacity
    - Fill: Yellow (#F59E0B)
    - Height: 8px
    - Border radius: 4px
    - "250 pts to Level 6" (14px, white, centered below)
  * Confetti animation (subtle, on load)

EARNED BADGES SECTION:
- Section header: "Your Badges (12)" (18px, bold)
- "View All" link (14px, purple, right)

Badge grid (2 columns):
  * Badge card:
    - Size: 160px × 180px
    - Background: White
    - Border radius: 16px
    - Border: 1px #E5E7EB
    - Shadow: subtle
    - 8px gap
    
    Content:
    - Badge icon (80px, centered, colored)
      * Different icon per badge
      * Animated on achievement
    - Badge name (14px, bold, centered)
      "Early Adopter"
    - Description (12px, gray, centered, 2 lines)
      "Joined in the first 100 members"
    - Earned date (10px, gray, centered)
      "Earned Jan 15, 2024"
    - Rarity indicator:
      * "RARE" (orange pill)
      * "COMMON" (gray pill)
      * "LEGENDARY" (gold pill)

AVAILABLE BADGES SECTION:
- Section header: "Locked Badges" (18px, bold)
- Collapsed by default
- "Show X more badges" expandable

Locked badge cards:
  * Grayed out (50% opacity)
  * Lock icon overlay
  * Badge icon (silhouette)
  * Badge name
  * How to unlock:
    - "Post 10 services to unlock"
    - Progress bar: "3/10" (visual progress)
    - Progress percentage: 30%

LEADERBOARD CARD:
- Background: Light purple (#EBF5FF)
- Border radius: 16px
- Padding: 16px

Content:
  * Header: "Community Leaderboard" (16px, bold)
    - Trophy icon (20px, left)
  
  * Top 3 users (podium style):
    - 1st place (center, higher):
      * Avatar (64px)
      * Crown icon (gold)
      * Name (16px, bold)
      * Points (14px)
    - 2nd place (left):
      * Avatar (56px)
      * Medal icon (silver)
      * Name (14px)
      * Points (12px)
    - 3rd place (right):
      * Avatar (56px)
      * Medal icon (bronze)
      * Name (14px)
      * Points (12px)
  
  * Your rank:
    - Background: White
    - Border: 2px blue
    - Border radius: 8px
    - Padding: 12px
    - "#45" rank badge (left)
    - Your avatar (40px)
    - Your name (14px, bold)
    - Your points (14px)
  
  * "View Full Leaderboard" button
    - Blue, outlined
    - Full width
    - 36px height

RECENT ACTIVITIES:
- Section header: "Recent Activity" (18px, bold)
- Activity list (last 5):
  * Activity icon (32px, colored circle)
  * Action text (14px)
    - "+50 pts - Posted a service"
    - "+25 pts - Helped a neighbor"
    - "+10 pts - Daily login"
  * Time (12px, gray, right)
    - "2 hours ago"
  * Card: White, 1px border, 12px radius
  * 8px spacing

HOW TO EARN POINTS:
- Expandable section
- Header: "How to Earn Points" (16px, bold)
- List of activities with point values:
  * Register: +50 pts (one-time)
  * Complete profile: +25 pts
  * Post a service: +50 pts
  * Post a job: +30 pts
  * Join an event: +20 pts
  * Help on forum: +15 pts per answer
  * Daily login: +5 pts
  * Share the app: +100 pts per referral
- Icon for each activity

SPACING:
- Screen padding: 16px
- Section spacing: 24px
- Badge grid gap: 8px
- Scrollable

DESIGN DETAILS:
- Points card prominent
- Badge showcase
- Locked badges motivational
- Progress bars visual
- Leaderboard competitive
- Activity history transparent
- Achievement animations
- Confetti on unlock
- Share achievements
- Rarity levels
```

---

## 👥 **FIND TEAMMATES**

### **Screen 54: Find Teammates/Network Screen**
**File name:** `54-find-teammates.png`  
**User flow:** From Dashboard

**Uizard Prompt:**
```
Design a member discovery/networking screen for mobile.

HEADER:
- Back button (left, 24px)
- Title: "Find Teammates" (20px, bold)
- Filter icon (right, 24px)
- Search icon (right, 24px)
- Height: 56px

FILTER CHIPS:
- Horizontal scrollable:
  * All Members
  * Online Now (green dot indicator)
  * By Skill
  * By Interest
  * Same Tower
  * New Members
- Pill shape, 32px height
- Active: Purple background
- 8px gap

ADVANCED FILTERS:
- Collapsible section below chips
- Expandable with down arrow

Filter options:
  * Skills (multi-select tags):
    - "React" "Python" "Design" etc.
    - Autocomplete suggestions
    - Remove with X icon
  
  * Interests (multi-select):
    - Categories from onboarding
    - Tech, Business, Creative, etc.
  
  * Availability:
    - Available for projects (toggle)
    - Available weekends (toggle)
  
  * Experience level:
    - Beginner, Intermediate, Expert
    - Slider or checkboxes

MEMBER CARDS:
- Vertical scrolling list
- Card design:
  * Background: White
  * Border radius: 16px
  * Border: 1px #E5E7EB
  * Padding: 16px
  * 16px spacing between cards

Card contents:

  * Header section:
    - Avatar (64px, left, circular)
    - Online indicator (green dot, 12px, if online)
    - Name (18px, bold)
    - Flat/Tower (14px, gray)
    - Member since: "Jan 2024" (12px, gray)
  
  * Current role/occupation:
    - Icon: Briefcase (20px)
    - "Software Engineer at TechCorp" (16px)
    - Years of experience: "5 years" (14px, gray)
  
  * Top skills (tags):
    - Show top 3: "React" "Node.js" "Python"
    - Pills: Purple background, white text, 12px
    - "+5 more" if additional skills
    - Horizontal scroll or wrap
  
  * Status badges:
    - "Looking for projects" (green pill)
    - "Open to collaborate" (blue pill)
    - "Mentoring" (purple pill)
  
  * Match indicator (if filtered by skills):
    - "90% match" (green, 14px, bold)
    - Progress bar showing match percentage
    - "8/10 shared skills"
  
  * Bio preview:
    - First 2 lines of bio (14px, gray)
    - "Read more" link if longer
  
  * Action buttons row:
    - "Connect" (purple, filled, flex 1)
      * or "Pending" (gray, outlined) if request sent
      * or "Connected ✓" (green, outlined) if connected
    - "Message" (purple, outlined, flex 1)
    - 8px gap
    - 36px height

FILTER BOTTOM SHEET:
- Slides up when filter tapped
- All advanced filter options
- "Apply Filters" button (purple, filled, bottom)
- "Clear All" link (top-right)

SORT OPTIONS:
- Dropdown (top-right):
  * Relevance (if filtered)
  * Recent activity
  * Match percentage (if skills filtered)
  * Name (A-Z)
  * New members first

EMPTY STATE:
- Icon: Users with magnifying glass (100px)
- Text: "No members found" (18px, bold)
- Subtext: "Try adjusting your filters"
- "Clear Filters" button

ONLINE NOW INDICATOR:
- If "Online Now" chip active:
  * Cards show larger green dot
  * "Active now" badge (green pill)
  * Sorted by most recent activity

TINDER-STYLE SWIPE MODE:
- Toggle in header (optional)
- Switch to card stack view:
  * Swipe right: Connect
  * Swipe left: Pass
  * Tap card: View profile
  * Undo last swipe option

CONNECTION STATUS:
- Shows connection state:
  * Not connected: "Connect" button
  * Request sent: "Pending" (gray, with cancel option)
  * Connected: "Connected ✓" (green, with message option)
  * You follow them: "Following"

SPACING:
- Screen padding: 16px
- Between cards: 16px
- Card internal: 16px
- Scrollable
- Pull to refresh
- Infinite scroll

DESIGN DETAILS:
- Online status real-time
- Skills matching algorithm
- Interest-based suggestions
- Connection management
- Quick messaging
- Profile preview
- Match percentage
- Availability indicators
- Experience level shown
- Search by name, skill, interest
```

---

## ⚙️ **ADMIN FEATURES**

### **Screen 55: Admin Dashboard Screen**
**File name:** `55-admin-dashboard.png`  
**User flow:** From admin menu (admin users only)

**Uizard Prompt:**
```
Design an admin dashboard for mobile (for community managers).

HEADER:
- Menu icon (left, 24px)
- Title: "Admin Dashboard" (20px, bold)
- Notification badge (right, red badge with count)
- Profile icon (right, 32px)
- Height: 56px
- Background: Admin theme (darker blue)

QUICK STATS GRID:
- 2×2 grid of stat cards
- Card design:
  * Size: (Screen width - 48px) / 2
  * Border radius: 16px
  * Gradient backgrounds (different colors)
  * Shadow: subtle
  * 8px gap

Stats cards:

  1. Total Members:
    - Icon: Users (32px, white)
    - Count: "234" (32px, white, bold)
    - Label: "Total Members" (14px, white)
    - Trend: "+12 this month" (12px, white, 80% opacity)
    - Up arrow icon (green)
    - Background: Purple gradient
  
  2. Active Today:
    - Icon: Activity (32px, white)
    - Count: "89" (32px, white, bold)
    - Label: "Active Today" (14px, white)
    - Percentage: "38%" (12px)
    - Background: Green gradient
  
  3. Pending Approvals:
    - Icon: Clock (32px, white)
    - Count: "8" (32px, white, bold)
    - Label: "Pending" (14px, white)
    - Red badge (pulsing if > 5)
    - Background: Orange gradient
  
  4. Reports to Review:
    - Icon: Alert (32px, white)
    - Count: "3" (32px, white, bold)
    - Label: "Reports" (14px, white)
    - Priority indicator if urgent
    - Background: Red gradient

ADMIN ACTIONS LIST:
- Section header: "Quick Actions" (18px, bold)
- List of admin action cards:

Card design:
  * Background: White
  * Border radius: 12px
  * Padding: 16px
  * Border: 1px #E5E7EB
  * 8px spacing between cards

Actions:

  * Member Management:
    - Icon: Users (40px, purple circle)
    - Title: "Member Management" (16px, bold)
    - Description: "View, edit, suspend members" (14px, gray)
    - Badge: "234 members" (12px, purple pill)
    - Arrow icon (right)
  
  * Content Approvals:
    - Icon: Checkmark (40px, orange circle)
    - Title: "Content Approvals" (16px, bold)
    - Description: "Review pending content" (14px, gray)
    - Badge: "8 pending" (12px, red pill, pulsing)
    - Arrow icon
  
  * Broadcast Message:
    - Icon: Megaphone (40px, purple circle)
    - Title: "Broadcast Message" (16px, bold)
    - Description: "Send announcement to all" (14px, gray)
    - Arrow icon
  
  * Event Management:
    - Icon: Calendar (40px, green circle)
    - Title: "Event Management" (16px, bold)
    - Description: "Manage community events" (14px, gray)
    - Badge: "5 upcoming" (12px, green pill)
    - Arrow icon
  
  * Reports & Analytics:
    - Icon: Chart (40px, indigo circle)
    - Title: "Reports & Analytics" (16px, bold)
    - Description: "View insights and trends" (14px, gray)
    - Arrow icon
  
  * Activity Logs:
    - Icon: List (40px, gray circle)
    - Title: "Activity Logs" (16px, bold)
    - Description: "Audit trail and user actions" (14px, gray)
    - Arrow icon
  
  * Settings:
    - Icon: Gear (40px, purple circle)
    - Title: "Settings" (16px, bold)
    - Description: "App configuration" (14px, gray)
    - Arrow icon

RECENT ADMIN ACTIVITY:
- Section header: "Recent Activity" (18px, bold)
- Timeline list (last 10 actions):
  * Timestamp (12px, gray)
    - "2 hours ago"
  * Action icon (24px, colored)
  * Action text (14px)
    - "Approved service post by John Doe"
    - "Suspended user account"
    - "Sent broadcast announcement"
  * Actor: "by Admin Name" (12px, gray)
  * 8px spacing between items

PENDING ITEMS (quick access):
- Compact list showing items needing attention:
  * Service approvals (3)
  * Event approvals (2)
  * User reports (3)
- Each tappable to go to approval screen
- Red dot indicator

SPACING:
- Screen padding: 16px
- Section spacing: 24px
- Grid gap: 8px
- Scrollable

DESIGN DETAILS:
- Dashboard overview
- Quick stat cards
- Pending items prominent
- Action-oriented layout
- Real-time updates
- Badge notifications
- Color-coded priorities
- Activity timeline
- Shortcut to common tasks
```

---

### **Screen 56: Admin Approvals Screen**
**File name:** `56-admin-approvals.png`  
**User flow:** From Admin Dashboard

**Uizard Prompt:**
```
Design a content moderation/approval screen for admins (mobile).

HEADER:
- Back button (left, 24px)
- Title: "Pending Approvals" (20px, bold)
- Filter icon (right, 24px)
- Height: 56px

TABS:
- Tabs with badge counts:
  * All (8)
  * Users (2)
  * Services (3)
  * Events (1)
  * Posts (2)
- Active tab: Blue underline (3px)
- Badge: Red background
- Tab height: 44px
- Horizontally scrollable

APPROVAL CARDS:
Card design:
  * Background: White
  * Border radius: 12px
  * Border: 1px #E5E7EB
  * Padding: 16px
  * 12px spacing between cards
  * Left accent: Orange (4px, pending approval)

Card contents:

  * Type badge (top):
    - Icon + label
    - "Service" (blue pill)
    - "Event" (purple pill)
    - "User" (green pill)
    - "Post" (gray pill)
  
  * Submitted info:
    - Avatar (32px, left)
    - Submitted by: Name (14px, bold)
    - Flat/Tower (12px, gray)
    - Submitted time: "2 hours ago" (12px, gray)
  
  * Content preview:
    - Title/name (16px, bold)
    - Description (14px, gray, 3 lines max)
    - "View full details" link (14px, purple)
    - Expandable to show complete content
  
  * Media preview (if applicable):
    - Image thumbnail (100px × 100px)
    - Or file icon with name
    - Tappable to view full size
  
  * Flagged reasons (if reported by users):
    - Icon: Alert (red, 20px)
    - "Flagged by 2 users" (14px, red)
    - Reasons: "Inappropriate content, Spam"
    - Background: Light red (#FEE2E2)
    - Padding: 8px
    - Border radius: 8px
  
  * Action buttons row:
    - "Approve" (green, filled, flex 1)
    - "Reject" (red, outlined, flex 1)
    - "Request Changes" (orange, outlined, flex 1)
    - 8px gap
    - 36px height
  
  * More options (3 dots):
    - View submitter profile
    - Add admin note
    - Contact submitter
    - Block user

USER APPROVAL specific:
  * Shows full registration details
  * Verification documents (if any)
  * "Verify and Approve" button
  * "Request More Info" option

SERVICE APPROVAL specific:
  * Service category
  * Pricing
  * Provider qualifications
  * "Approve with edits" option

EVENT APPROVAL specific:
  * Event details
  * Date/time
  * Capacity
  * "Suggest changes" option

BULK ACTIONS:
- Checkbox selection mode:
  * Long press to activate
  * Checkboxes appear on all cards
  * Top bar shows: "X selected"
  * Actions:
    - "Approve All" (green)
    - "Reject All" (red)
  * Cancel button (right)

FILTER OPTIONS:
- Bottom sheet
- Filter by:
  * Date submitted (oldest first, newest first)
  * Type (User, Service, Event, Post)
  * Priority (flagged first, normal)
  * Submitter (search)
- Sort by:
  * Oldest first (default)
  * Most flagged
  * Newest first

APPROVAL CONFIRMATION:
- Modal dialog:
  * "Approve this service?"
  * "Reject with reason?"
    - Reason dropdown/text input
    - Will notify submitter
  * "Confirm" / "Cancel" buttons

REJECTION REASONS:
- Dropdown with options:
  * Inappropriate content
  * Spam
  * Incomplete information
  * Against community guidelines
  * Other (text input required)
- Notification sent to submitter

EMPTY STATE:
- Icon: Checkmark in circle (100px, green)
- Text: "All caught up!" (18px, bold)
- Subtext: "No pending approvals"

SPACING:
- Screen padding: 16px
- Between cards: 12px
- Card internal: 16px
- Scrollable

DESIGN DETAILS:
- Tab organization
- Content preview
- Quick approve/reject
- Batch operations
- Flagged content highlighted
- Rejection reasons required
- Submitter notification
- Admin notes capability
- Full content view
- Media preview
```

---

### **Screen 57: Admin Broadcast Screen**
**File name:** `57-admin-broadcast.png`  
**User flow:** From Admin Dashboard

**Uizard Prompt:**
```
Design a broadcast message composer for admins (mobile).

HEADER:
- Back button (left, 24px)
- Title: "Send Broadcast" (20px, bold)
- Save Draft (right, 14px, gray text)
- Height: 56px

BROADCAST TYPE SELECTOR:
- Large icon buttons (4 types):
  * Announcement (megaphone icon, purple)
  * Alert (warning icon, red)
  * Event Reminder (calendar icon, purple)
  * Maintenance Notice (tools icon, orange)
- Grid: 2×2
- Selected: Colored background, white icon
- Unselected: Gray background, gray icon
- Size: 160px × 100px each
- 8px gap
- Icon: 48px, centered
- Label: 14px, centered below icon

FORM SECTIONS:

MESSAGE CONTENT:
- Section header: "Message Content" (16px, bold)

Fields:
  * Subject/Title (required)
    - Input: 48px height
    - Placeholder: "e.g., Water Supply Maintenance"
    - Character counter: "0/100"
    - Large font: 18px
  
  * Message Body (required)
    - Rich text editor (simplified):
      * Multiline (8 rows minimum)
      * Auto-expand as user types
      * Formatting toolbar:
        - Bold, Italic, Bullet list icons
        - 40px height
    - Placeholder based on type:
      * Announcement: "Share important news with the community..."
      * Alert: "Describe the urgent situation..."
      * Reminder: "Event details and reminder message..."
    - Character counter: "0/2000"

PRIORITY LEVEL:
- Section header: "Priority" (16px, bold)
- Radio buttons (large, card style):
  
  ○ Low:
    - Icon: Info (blue)
    - "Normal notification" (14px)
    - Default option
  
  ○ Medium:
    - Icon: Bell (orange)
    - "Push notification" (14px)
  
  ○ High:
    - Icon: Alert (red)
    - "Push + In-app banner" (14px)
    - "Use sparingly" note (12px, gray)
  
  ○ Urgent:
    - Icon: Siren (red, pulsing)
    - "Push + Banner + Sound" (14px)
    - "Emergency only" note (12px, red)

CATEGORY TAGS:
- Section header: "Category (Optional)" (16px, bold)
- Tag chips (multi-select):
  * Maintenance
  * Safety
  * Events
  * Community
  * COVID-19
  * Weather
  * Other
- Selected: Purple background
- Max 3 tags

ATTACHMENTS:
- Section header: "Attachments (Optional)" (16px, bold)
- Options:
  * Attach Image:
    - Upload button (dashed border)
    - Preview uploaded (120px × 120px)
    - Max 1 image
  * Attach File:
    - PDF, DOC support
    - File icon + name preview
    - Max 1 file (5MB limit)

TARGET AUDIENCE:
- Section header: "Send To" (16px, bold)
- Radio buttons:
  
  ○ Everyone (default):
    - Icon: Users
    - "All 234 members"
  
  ○ Specific Towers:
    - Multi-select checkboxes:
      * Tower A (check)
      * Tower B (check)
      * Tower C
    - Count updates: "Sending to 142 members"
  
  ○ Specific User Segments:
    - Dropdown multi-select:
      * By category (Tech members, Business members)
      * By role (Service providers, Job seekers)
      * By activity (Active users, New members)
    - Count shown

DELIVERY OPTIONS:
- Section header: "Delivery Options" (16px, bold)

Options (toggles):
  * Send Immediately (default ON):
    - If OFF: Show schedule picker
    - Date + time selector
  
  * In-App Notification (toggle, default ON):
    - Appears in notification feed
  
  * Push Notification (toggle, default OFF):
    - Sends push to devices
    - Requires High/Urgent priority
  
  * Email Notification (toggle, default OFF):
    - Sends email copy
    - "Members with email enabled"
  
  * Show as Banner (toggle, default OFF):
    - Top banner in app
    - Duration: 24 hours (dropdown)
    - Only for High/Urgent priority

SCHEDULE (if not immediate):
- Date picker
- Time picker
- Timezone shown
- "Preview send time" text

PREVIEW BUTTON:
- "Preview Message" (purple, outlined)
- Full width
- 44px height
- Shows how message will appear:
  * As notification
  * As banner
  * In notification feed

SEND BUTTON:
- Sticky bottom
- Full width (minus 32px margins)
- Height: 52px
- Background based on priority:
  * Low/Medium: Blue
  * High: Orange
  * Urgent: Red
- Text: "Send to 234 Members" or "Schedule Broadcast"
- Confirmation dialog before sending

CONFIRMATION DIALOG:
- Modal overlay
- Warning icon (if High/Urgent)
- Summary:
  * Type: Announcement
  * Priority: High
  * Recipients: 234 members
  * Scheduled: Immediate or [Date/Time]
- "Are you sure?" (18px, bold)
- "This will send push notifications" (14px, gray)
- Buttons:
  * "Cancel" (gray, outlined)
  * "Confirm & Send" (blue/red, filled)

SPACING:
- Screen padding: 16px
- Section spacing: 24px
- Field spacing: 16px
- Form scrollable

DESIGN DETAILS:
- Type selection prominent
- Priority levels clear
- Audience targeting flexible
- Delivery options comprehensive
- Preview before send
- Confirmation for safety
- Character limits
- Attachment support
- Scheduling capability
- Draft saving
- Send history (in menu)
```

---

### **Screen 58: Admin Activity Log Screen**
**File name:** `58-admin-activity-log.png`  
**User flow:** From Admin Dashboard

**Uizard Prompt:**
```
Design an admin activity log screen for mobile.

HEADER:
- Back button (left, 24px)
- Title: "Activity Logs" (20px, bold)
- Search icon (right, 24px)
- Filter icon (right, 24px)
- Height: 56px

SEARCH BAR:
- Below header
- Placeholder: "Search logs by user, action..."
- Magnifying glass icon (left)
- Clear X icon (right, when typing)
- Height: 44px
- Border radius: 22px
- Background: #F3F4F6

FILTER CHIPS:
- Horizontal scrollable:
  * All Actions
  * User Actions
  * Admin Actions
  * System Events
  * Security
- Pill shape, 32px height
- Active: Purple background
- 8px gap

DATE RANGE SELECTOR:
- Below filters
- Card with date range:
  * From: [Date picker]
  * To: [Date picker]
  * Quick presets:
    - Today
    - Last 7 days
    - Last 30 days
    - Custom range
- Background: #F9FAFB
- Border radius: 12px
- Padding: 12px

LOG ENTRIES:
Grouped by date:

DATE HEADER (sticky):
  * "TODAY" or "MARCH 15, 2024"
  * 14px, uppercase, gray, bold
  * Background: #F9FAFB
  * Padding: 8px 16px
  * Sticky on scroll

Log entry cards:
  * Background: White
  * Border: 1px #E5E7EB
  * Border radius: 12px
  * Padding: 16px
  * 8px spacing between entries
  * Left accent bar (4px, color by type)

Entry contents:

  * Timestamp (top-right):
    - "2:45 PM" (14px, gray)
  
  * Actor section:
    - Avatar (40px, left)
    - Name (14px, bold)
    - Role badge: "Admin" or "User" or "System"
      * Admin: Red pill
      * User: Blue pill
      * System: Gray pill
  
  * Action icon (40px, colored circle):
    - User created: User+ (green)
    - User suspended: Ban (red)
    - Content approved: Checkmark (green)
    - Content rejected: X (red)
    - Login: Key (blue)
    - Settings changed: Gear (orange)
    - Broadcast sent: Megaphone (purple)
    - Data export: Download (blue)
  
  * Action description (14px):
    - "Suspended user account"
    - "Approved service posting"
    - "Changed notification settings"
    - Bold text for key entities
  
  * Affected entity:
    - "User: John Doe" (14px)
    - Link to user profile (blue, underlined)
    - Or "Service: Web Development"
  
  * Additional details (collapsible):
    - "Show details" link (14px, purple)
    - Expands to show:
      * IP address (if security relevant)
      * User agent / Device
      * Full request details
      * Before/after values (for changes)
      * JSON data (formatted, monospace)
    - Background: #F9FAFB
    - Border radius: 8px
    - Padding: 12px
  
  * Security flag (if security-relevant):
    - Icon: Shield (red, 20px)
    - "Security Event" badge (red pill)
    - Background: Light red (#FEE2E2)

LOG TYPES:

USER ACTIONS (blue accent):
  * Login / Logout
  * Profile update
  * Content posted
  * Settings changed

ADMIN ACTIONS (red accent):
  * User suspended/unsuspended
  * Content approved/rejected
  * Broadcast sent
  * Settings modified
  * User role changed

SYSTEM EVENTS (gray accent):
  * Automated tasks
  * Scheduled jobs
  * Database backups
  * System errors

SECURITY EVENTS (red accent, highlighted):
  * Failed login attempts
  * Suspicious activity
  * Account lockouts
  * Permission changes

FILTER MENU (bottom sheet):
- Filter by:
  * Action Type (checkboxes):
    - User management
    - Content moderation
    - System configuration
    - Security events
    - Data exports
  
  * Actor (search/select):
    - Specific admin
    - Specific user
    - System
  
  * Date Range:
    - Date picker (from/to)
    - Quick presets
  
  * Severity (if applicable):
    - Info
    - Warning
    - Error
    - Critical

EXPORT OPTIONS:
- Floating action button (bottom-right):
  * Icon: Download
  * 48px circular
  * Opens export menu:
    - Export to CSV
    - Export to PDF
    - Email report
  * Date range confirmation
  * "Processing..." indicator

EMPTY STATE:
- Icon: Document with magnifying glass (100px)
- Text: "No logs found" (18px, bold)
- Subtext: "Try adjusting your filters"
- "Clear Filters" button

SPACING:
- Screen padding: 16px (except date headers)
- Between entries: 8px
- Entry internal: 12px
- Scrollable
- Pull to refresh

DESIGN DETAILS:
- Chronological order (newest first)
- Date grouping
- Sticky date headers
- Color-coded actions
- Expandable details
- Security events highlighted
- Search functionality
- Advanced filtering
- Export capability
- IP address logging
- Audit trail complete
- Infinite scroll (load older)
```

---

## 🗺️ **USER FLOWS & NAVIGATION MAPS**

### **Primary User Flows:**

1. **New User Onboarding:**
   Landing → Category Selection → Phone Verification → Registration → Onboarding Wizard → Dashboard

2. **Existing User Login:**
   Landing → Email/Password Login → Dashboard
   or
   Landing → Phone OTP → Dashboard

3. **Service Discovery & Booking:**
   Dashboard → Services Hub → Category Listing → Service Detail → Contact Provider

4. **Job Application:**
   Dashboard → Job Board → Job Detail → Apply → My Applications (track)

5. **Event Participation:**
   Dashboard → Events → Event Detail → RSVP → My Events → QR Code (check-in)

6. **Skill Exchange:**
   Dashboard → Skill Swap → Browse Mentors → Book Session → My Sessions

7. **Idea Collaboration:**
   Dashboard → Ideas Wall → Idea Detail → Apply to Team → Track Application

8. **Community Engagement:**
   Dashboard → Forum → Question Detail → Post Answer
   Dashboard → Activity Feed → Like/Comment

9. **Admin Moderation:**
   Admin Dashboard → Approvals → Review Content → Approve/Reject → Activity Log

---

## 📊 **IMPLEMENTATION PRIORITY**

### **Phase 1 - MVP (High Priority):**
Screens 1-24 (Authentication, Dashboard, Profile, Services, Jobs, Basic Community)

Critical path screens:
- Authentication flow (1-6)
- Dashboard & Navigation (7-8)
- Profile & Settings (9-12)
- Services Hub (13-15)
- Job Board (20-25)

### **Phase 2 - Core Features (Medium Priority):**
Screens 25-42 (Skill Swap, Events, Chat, Notifications, Forum)

Enhanced engagement:
- Skill Swap (26-28)
- Events (29-35)
- Chat & Messaging (36-38)
- Notifications (39)
- Forum / Q&A (40-42)

### **Phase 3 - Community & Extras (Medium-Low Priority):**
Screens 43-53 (Community Features, Marketplace, Gamification)

Community building:
- Lost & Found (43-44)
- Announcements (45)
- Activity Feed (46)
- Photo Gallery (47)
- Marketplace (48-50)
- Tool Rental (51-52)
- Gamification (53)

### **Phase 4 - Advanced (Low Priority):**
Screens 54-58 (Admin Features, Networking)

Platform management:
- Find Teammates (54)
- Admin Dashboard (55)
- Admin Approvals (56)
- Admin Broadcast (57)
- Activity Logs (58)

---

## 📝 **DESIGN HANDOFF NOTES**

### **For Uizard Usage:**
1. Create each screen in order of priority
2. Use the design system specifications throughout
3. Maintain consistent spacing and component sizing
4. Apply color coding by feature category
5. Test mobile responsiveness (375px width minimum)

### **Component Reusability:**
- Create component library for buttons, cards, inputs
- Reuse bottom navigation across all main screens
- Consistent header patterns
- Standardized form layouts
- Unified color scheme

### **Accessibility Considerations:**
- Minimum 44px touch targets
- Sufficient color contrast (WCAG AA)
- Clear focus states
- Readable font sizes (min 14px body)
- Icon + text labels

### **Platform Adaptations:**
- iOS: Native navigation patterns, SF Pro font
- Android: Material Design principles, Roboto font
- Handle safe areas (notch, navigation gestures)

---

**END OF DOCUMENT**

Total Screens: 58
Last Updated: November 14, 2025
