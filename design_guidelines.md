# Design Guidelines: Nirala Techie Community Platform

## Design Approach

**Selected Approach**: Design System with Reference Inspiration
- **Primary Reference**: Linear (clean, modern productivity UI) + GitHub (developer-friendly patterns)
- **Rationale**: Community platform for IT professionals requires clarity, efficiency, and familiarity with developer tools while maintaining visual appeal for engagement

## Core Design Elements

### A. Typography System

**Font Stack**:
- Primary: Inter (via Google Fonts CDN) - headlines, UI elements, body text
- Monospace: JetBrains Mono - code snippets, tech stack tags

**Hierarchy**:
- Hero Headline: text-5xl lg:text-6xl, font-bold, tracking-tight
- Section Headers: text-3xl lg:text-4xl, font-semibold
- Subsections: text-xl lg:text-2xl, font-medium
- Body Text: text-base lg:text-lg, font-normal, leading-relaxed
- UI Labels: text-sm, font-medium, tracking-wide, uppercase
- Tech Tags: text-xs, font-mono

### B. Layout System

**Spacing Scale**: Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Component padding: p-6 to p-8
- Section spacing: py-16 lg:py-24
- Card gaps: gap-6 lg:gap-8
- Input spacing: space-y-4

**Container Strategy**:
- Max width: max-w-7xl for sections, max-w-3xl for forms
- Form containers: max-w-2xl mx-auto
- Grid layouts: grid-cols-1 md:grid-cols-2 lg:grid-cols-3

### C. Component Library

#### Landing Page Structure

**Hero Section** (80vh):
- Full-width background with gradient overlay
- Centered content: max-w-4xl
- Headline + subtitle + primary CTA
- Trust indicators: "100+ IT professionals already connected"
- Floating tech stack badges (React, Python, AWS icons)

**Quick Stats Section** (3-column grid):
- Member count, Active discussions, Tech stacks represented
- Large numbers (text-4xl) with labels (text-sm)
- Icon above each stat (Heroicons)

**How It Works** (4-step timeline):
- Vertical timeline on mobile, horizontal on desktop
- Step numbers in circles, connecting lines between steps
- Icon + title + description for each step
- Screenshots/illustrations for visual interest

**Community Benefits** (2-column grid):
- 6 benefit cards with icons (Font Awesome)
- Card layout: icon-left, title + description-right
- Hover lift effect

**CTA Section**:
- Centered content with background treatment
- Primary + secondary action buttons
- Supporting text about privacy/security

#### Registration Flow

**Phone Verification Screen**:
- Centered card (max-w-md)
- Large phone input with country code selector
- OTP input: 6 individual boxes (w-12 h-12 each)
- Resend timer display

**Profile Setup Form**:
- Multi-step progress indicator at top (4 steps: Basic Info, Professional, Skills, Finish)
- Single column form layout
- Grouped sections with headers

**Form Inputs**:
- Floating labels (label moves up when focused/filled)
- Input height: h-12
- Border radius: rounded-lg
- Focus rings with offset
- Helper text: text-sm below inputs
- Error states: border treatment + icon + message

**Tech Stack Multi-Select**:
- Search-as-you-type dropdown
- Selected items as dismissible pills/badges
- Popular stacks as quick-select buttons
- Custom badge colors per technology category (frontend/backend/cloud/etc)

**Profile Photo Upload**:
- Circular upload area (w-32 h-32)
- Drag-and-drop zone
- Preview with edit overlay on hover
- File size/type indicators

#### Dashboard Preview (Post-Registration)

**Navigation Header**:
- Logo left, user menu right
- Search bar center (expandable on mobile)
- Notification bell with badge
- Height: h-16

**Profile Card**:
- Avatar (w-24 h-24) with online indicator
- Name + role + company
- Quick stats: points, badges, connections
- Edit profile button

**Gamification Elements**:
- Badge showcase: grid of earned badges with tooltips
- Points display with progress bar to next level
- Achievement notifications (toast style, top-right)
- Skill tags with proficiency levels (beginner/intermediate/expert)

**Community Feed**:
- Card-based layout for posts/discussions
- Avatar + name + timestamp header
- Content area with text + optional media
- Interaction buttons (like, comment, share) footer
- Tech stack tags inline

### D. Interactive Elements

**Buttons**:
- Primary: h-12, px-8, rounded-lg, font-semibold, text-base
- Secondary: same size, bordered variant
- Tertiary: text button, no background
- Icon buttons: w-10 h-10, rounded-full

**Cards**:
- Border radius: rounded-xl
- Shadow: subtle elevation (shadow-sm default, shadow-md hover)
- Padding: p-6 lg:p-8
- Hover: transform scale-[1.02] transition

**Badges/Pills**:
- Height: h-8
- Padding: px-3
- Border radius: rounded-full
- Font: text-sm font-medium
- Close button for dismissible variants

**Loading States**:
- Skeleton screens matching component structure
- Spinner for async operations (w-6 h-6)
- Progress bars for multi-step flows

**Tooltips**:
- Small rounded box with arrow pointer
- Max width: max-w-xs
- Padding: px-3 py-2
- Text: text-sm

### E. Icons

**Library**: Heroicons (via CDN)
- Navigation: outline style, stroke-width-2
- Interactive elements: solid style for active states
- Size: w-5 h-5 for inline, w-6 h-6 for standalone
- Decorative: w-8 h-8 to w-12 h-12

### F. Images

**Hero Section**: 
- Large background image showing diverse IT professionals collaborating/coding
- Overlay gradient for text readability
- Image should convey modern tech workspace/community

**How It Works Section**:
- Interface screenshots or illustrations for each step
- Style: Clean, minimal mockups with subtle shadows

**Community Benefits**:
- Optional spot illustrations (simple line art) for each benefit card

### G. Animations

**Use Sparingly**:
- Page transitions: fade-in on load (duration-300)
- Badge earning: scale + bounce animation (one-time, celebrate achievement)
- Form validation: shake animation on error
- Hover states: transform and shadow transitions (duration-200)
- NO scroll-triggered animations, NO parallax effects

### H. Accessibility

**Form Accessibility**:
- All inputs have visible labels
- Focus indicators on all interactive elements
- Error messages linked to inputs via aria-describedby
- Keyboard navigation fully supported
- Color contrast ratio 4.5:1 minimum

**ARIA Labels**:
- Icon-only buttons have aria-label
- Loading states announced to screen readers
- Form validation errors read aloud

**Focus Management**:
- Focus ring: ring-2 ring-offset-2
- Focus moves logically through form steps
- Modal traps focus when open

This design creates a professional, efficient experience that IT professionals will find familiar and trustworthy while incorporating modern visual polish and gamification elements to drive engagement.