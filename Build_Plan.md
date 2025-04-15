# WebPlanner Build Plan

## Project Overview
WebPlanner is a Next.js application with an integrated admin portal for managing website planning projects. The application uses a modern tech stack including TypeScript, Tailwind CSS, and various UI components from shadcn/ui.

## Tech Stack
- **Frontend Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL (with Prisma ORM)
- **Email**: Nodemailer
- **State Management**: React Hooks + Context

## Build Steps

### 1. Environment Setup
```bash
# Create necessary environment variables
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
SMTP_HOST="..."
SMTP_PORT="587"
SMTP_USER="..."
SMTP_PASSWORD="..."
ADMIN_EMAIL="admin@example.com"
```

### 2. Database Setup
1. [x] Initialize Prisma schema
2. [x] Create necessary tables:
   - Users
   - Plans
   - Versions
   - Feedback
   - AdminSettings
   - AIProviders
   - PlanShare
   - PlanPermission
3. [x] Run migrations
4. [x] Seed initial admin user

### 3. Authentication Implementation
1. [x] Configure NextAuth.js
2. [x] Set up email authentication
3. [x] Implement admin role middleware
4. [x] Create protected API routes

### 4. Core Features Implementation

#### Dashboard
- [x] Plans overview
- [x] Recent activity
- [x] Analytics cards
- [x] Quick actions

#### Plan Management
- [x] Plan creation
- [x] Plan editing
- [x] Version control
- [ ] Export functionality
- [x] AI-powered suggestions ( Done )
- [x] Plan Iteration via Feedback (Feedback UI & API Call Done)
- [x] **One-Shot Prompt & Build Plan Tracking** (Generation, Refinement, UI Tab, Activity Logging, Checkbox Task Tracking + API Integration implemented; Sharing pending)
- [x] Interactive mind maps and flowcharts (Mermaid rendering implemented for candidate sections like Site Architecture, User Flow, DB Schema; AI prompts updated to request specific diagram types; Needs styling refinement)

#### User Features
- [x] User registration
- [x] Profile management
- [x] Plan sharing (Backend Done)
- [ ] Collaboration tools
- [ ] User Profile Management:
    - [x] Create user profile page (e.g., `/profile`).
    - [ ] **Account Information Section:**
        - [ ] Ensure user's name and email are fetched and displayed in this section.
        - [ ] Implement UI controls (e.g., input fields, Save button) to allow editing of user's name (and potentially email, if allowed by business logic).
        - [ ] Create/Update API endpoint (`/api/user/update-profile` or similar) to handle profile updates.
        - [ ] Add server-side logic to validate and save changes (e.g., update name/email in the database).
        - [ ] Provide user feedback on successful update or errors.
    - [ ] **Professional Information (Display Only):**
        - [ ] Define and add relevant fields (e.g., `jobTitle`, `company`, `industry`, `website`) to the `User` model in `prisma/schema.prisma`.
        - [ ] Run `npx prisma migrate dev --name add_professional_info` (or similar) to update the database schema.
        - [ ] Update the API endpoint or server action fetching user profile data to include these new fields.
        - [ ] Enable and populate the "Professional Information" section on the profile page UI to display these details (read-only for now).
    - [ ] **Password Reset (within Profile):**
        - [ ] Enable the 'Reset Password' button on the profile page.
        - [ ] Implement UI (e.g., modal or form fields) to securely collect Current Password, New Password, and Confirm New Password.
        - [ ] Create/Update API endpoint (`/api/user/reset-password` or similar) to handle the password change request.
        - [ ] Add server-side logic to: verify the provided current password against the stored hash, validate the new password complexity, hash the new password, and update the user record in the database.
        - [ ] Provide user feedback on success or failure (e.g., incorrect current password, password mismatch, success message).
    - [ ] Allow users to delete their account.

### 6. Version History Page
- [ ] **Data Fetching:**
    - [ ] Identify the data source for plan versions (e.g., a specific Prisma model linking plans and versions).
    - [ ] Create/Update an API endpoint or server action to fetch the version history for the logged-in user's plans.
- [ ] **UI Implementation:**
    - [ ] Replace dummy data in the Version History page/tab component with the fetched data.
    - [ ] Ensure the display includes relevant details for each version (e.g., plan name, version number/ID, creation date, maybe a preview or link).
    - [ ] Implement any necessary UI interactions (e.g., pagination, sorting, filtering, viewing a specific version's details).

### 7. Settings Page
- [ ] **Data Fetching:**
    - [ ] Identify the data source for user subscription/settings data (e.g., fields on the User model, a separate Subscription model).
    - [ ] Create/Update an API endpoint or server action to fetch the current user's settings, including subscription plan details.
- [ ] **UI Connection:**
    - [ ] Connect the existing UI elements on the Settings page to the fetched data.
    - [ ] Display the user's current subscription plan type (e.g., Free, Pro).
    - [ ] Display billing information or usage quotas if applicable.
- [ ] **Functionality (Potential):**
    - [ ] Implement logic for any interactive elements (e.g., buttons to manage subscription, change notification preferences, apply theme changes if settings allow).
    - [ ] (If applicable) Integrate with a payment provider (e.g., Stripe) for subscription management.

### 8. Admin Portal Implementation

#### Access Control
- [x] Admin authentication
- [x] Role-based access control
- [x] Admin session management

#### User Management
- [x] User listing
- [x] User roles management
- [x] Account status control
- [x] Activity monitoring

#### System Settings
- [x] AI provider configuration
  - [x] Add AI Provider
  - [x] Edit AI Provider
  - [x] Delete AI Provider (with cascade)
  - [x] Add AI Model
  - [x] Edit AI Model
  - [x] Delete AI Model
- [ ] Email templates
- [ ] System parameters
- [ ] Feature toggles

#### Analytics & Monitoring
- [ ] Usage statistics
- [ ] Performance metrics
- [ ] Error logging
- [ ] Audit trails

#### Content Management
- [ ] Template management
- [ ] User Help documentation
- [ ] Announcement system

#### Admin Help Documentation
- [x] Create a dedicated, admin-only help/documentation page.
- [x] Document best practices for creating/managing prompts, including the proper use and handling of `{{variables}}`.
- [x] Explain the implications of archiving/unarchiving prompts and deleting variables from the list.
- [x] Document AI Provider/Model management context.

### 7. Email Integration
- [X] Set up Resend account and configure domain/DNS.
- [X] Install `resend` and `react-email` dependencies.
- [X] Add Resend API Key and From Email to environment variables.
- [X] Update Prisma User model for email verification (token, expiry, verified status).
- [X] Create email templates (Welcome, Admin Verification, Payment Confirmation placeholder).
- [X] Implement Welcome Email sending on user registration.
- [X] Implement Admin Verification email sending and verification API route.
- [X] Add placeholder for Payment Confirmation email sending.

### 6. Production Optimization

#### Performance
- [ ] Image optimization
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Caching strategy

#### Security
- [ ] API rate limiting
- [ ] CSRF protection
- [ ] XSS prevention
- [ ] Input validation
- [ ] Security headers

#### Monitoring
- [ ] Error tracking
- [ ] Performance monitoring
- [ ] User analytics
- [ ] Server health checks

### 7. Testing

#### Unit Tests
- [ ] Components
- [ ] Utilities
- [ ] API routes
- [ ] Authentication

#### Integration Tests
- [ ] User flows
- [ ] Admin workflows
- [ ] API endpoints
- [ ] Database operations

#### E2E Tests
- [ ] Critical user journeys
- [ ] Admin portal operations
- [ ] Authentication flows

### 8. Deployment

#### Pre-deployment
- [ ] Environment validation
- [ ] Database migrations
- [ ] Asset optimization
- [ ] Security checks

#### Deployment Steps
```bash
# Build application
pnpm build

# Run database migrations
prisma migrate deploy

# Start production server
pnpm start
```

#### Post-deployment
- [ ] Smoke tests
- [ ] SSL configuration
- [ ] CDN setup
- [ ] Monitoring setup

## Directory Structure
```
webplanner_withadmin/
├── app/
│   ├── admin/           # Admin portal pages
│   ├── dashboard/       # User dashboard pages
│   ├── api/            # API routes
│   └── layout.tsx      # Root layout
├── components/
│   ├── admin/          # Admin components
│   ├── ui/             # Shared UI components
│   └── diagrams/       # Mind map components
├── lib/
│   ├── auth-utils.ts   # Authentication utilities
│   ├── prisma.ts       # Database client
│   └── actions.ts      # Server actions
├── public/             # Static assets
└── styles/            # Global styles
```

## Production Checklist

### Security
- [ ] Enable CSRF protection
- [ ] Configure security headers
- [ ] Set up rate limiting
- [ ] Implement API authentication
- [ ] Enable audit logging

### Performance
- [ ] Enable compression
- [ ] Configure caching
- [ ] Optimize images
- [ ] Minimize bundle size
- [ ] Enable PWA features

## Marketing and SEO (for AIprompti.com)
- [ ] **Branding:**
    - [ ] Design a logo for AIprompti.com.
- [ ] **Keyword Research:**
    - [ ] Identify primary and secondary target keywords relevant to AI-powered website planning, prompt engineering, and related services.
    - [ ] Analyze competitor keywords.
    - [ ] Determine keywords for core pages (Homepage, Features, Pricing, Blog etc.).
- [ ] **On-Page SEO:**
    - [ ] Integrate target keywords naturally into page titles, headings, meta descriptions, and content.
    - [ ] Optimize images with alt text.
    - [ ] Ensure proper heading structure (H1, H2, etc.).
    - [ ] Set up basic schema markup.
- [ ] **Backlink Strategy:**
    - [ ] Identify potential sources for relevant backlinks (e.g., tech blogs, AI communities, web development resources, guest posting opportunities).
    - [ ] Develop an outreach strategy for acquiring backlinks.
    - [ ] Monitor backlink profile.
- [ ] **Technical SEO:**
    - [ ] Ensure site speed optimization.
    - [ ] Verify mobile-friendliness.
    - [ ] Create and submit an XML sitemap.
    - [ ] Set up `robots.txt`.
    - [ ] Configure Google Analytics and Google Search Console.

## Fixes Applied (2025-04-05)

- Downgraded Next.js from 15.2.4 to 14.2.0 to resolve NextAuth incompatibility.
- Cleaned `.next` cache, `node_modules`, and lockfile, then reinstalled dependencies.
- Fixed build-breaking `const` reassignment errors in:
  - `app/api/projects/[id]/route.ts`
  - `app/api/projects/[id]/status/route.ts`
- Confirmed no `useLayoutEffect` misuse in user code; warning was from Next.js Dev Overlay internals.
- Build now completes successfully.

## Known Issues To Address Next

- Prisma `activity.create` calls include a `metadata` property, which does not exist in the Prisma schema. Either:
  - Add a `metadata` JSON field to the `Activity` model, or
  - Remove/replace the `metadata` property in API calls.
- Prisma model references to `Activity` (capitalized) instead of `activity` (lowercase).
- Deprecated npm packages and vulnerabilities (optional to fix now).
- Implement remaining features and admin tools as outlined below.

## Next Steps

1. **Collaboration Tools**
   - Implement real-time collaboration features
   - Add chat functionality for plan discussions
   - Create activity feed for plan changes

2. **Plan Management**
   - Implement plan creation UI
   - Add version control system
   - Create export functionality

3. **AI Integration**
   - Implement AI-powered suggestions
   - Add content generation capabilities
   - Create interactive mind maps and flowcharts

### Phase 3: Admin Portal Implementation

#### Prompt Management
- **Backend (`api/admin/prompt-management.ts`)**:
    - [X] Implement API routes for CRUD operations.
    - [X] Validate user input using Zod.
    - [X] Handle potential errors (e.g., duplicate names, database errors) and provide feedback.
    - [X] Ensure only ADMIN users can access these routes.
- **Frontend (`components/admin/prompt-management.tsx`)**:
    - [X] Create state variables for prompts, AI models, loading, error, dialogs, and form data.
    - [X] Implement `fetchData` to get prompts and AI models from the API.
    - [X] Implement UI elements (Table, Dialog, Forms, Buttons) using `shadcn/ui`.
    - [X] Connect UI actions (Add, Edit, Delete, Archive, Duplicate) to API handlers.
    - [X] Implement filtering and searching functionality.
    - [X] Add confirmation dialogs for delete/archive actions.
    - [X] Testing & Refinement: Thoroughly test all CRUD operations and refine UI/UX.
- [X] **Prompt Archiving:** Implement functionality to archive prompts instead of hard deleting.
- [ ] **Prompt Version History & Revert:** Add a system to track changes to prompts and allow reverting to previous versions.
- [ ] **Documentation**: Update README or relevant docs if necessary.

### Phase 4: Monetization & Subscription

#### Stripe Integration
- [X] Install Stripe dependencies (`stripe`, `@stripe/stripe-js`, `@stripe/react-stripe-js`).
- [X] Add Stripe API keys (Publishable and Secret) to `.env.local`.
- [X] Configure Stripe products and prices in Stripe Dashboard (Plan A: $10, Plan B: $20).
- [X] Create API endpoint for creating Stripe Checkout sessions (`/api/stripe/checkout-session`).
- [X] Create API endpoint (webhook) for handling Stripe events (`/api/stripe/webhook`) (Needs secret configuration and testing).
- [X] Update Prisma schema (`User` model) to store Stripe customer ID and subscription status (`stripeCustomerId`, `stripeSubscriptionId`, `stripePriceId`, `stripeSubscriptionStatus`, `stripeCurrentPeriodEnd`).
- [X] Run `prisma migrate dev` for subscription schema changes.
- [ ] Add `STRIPE_WEBHOOK_SECRET` to `.env.local` after configuring endpoint in Stripe Dashboard.
- [X] Implement frontend logic to initiate Stripe Checkout.
- [X] Implement frontend logic to display subscription status/management options.
- [X] Secure webhook endpoint (verify signature - implemented, needs secret).
- [X] Update Payment Confirmation email template (`payment-confirmation-email.tsx`).
- [X] Send payment confirmation email upon successful payment webhook event.
- [X] Create success page (`/subscription/success`).
- [X] Create cancellation page (`/subscription/cancel`).
- [X] Add Header and Footer to `/subscription` page.
- [X] Ensure consistent background animation (if applicable).

### Phase 5: Plan Execution & Monitoring (Future)
{{ ... }}

### Task: AI Provider UI and Prompt Dialog Integration
- [x] Verify/Implement AI Model API Routes (Nested under Provider routes - confirmed existing)
- [x] Connect UI to APIs (Confirmed existing UI connects)
- [x] Update Prompt Dialog (Add Provider/Model dropdowns)
- [x] Update Prompt Save Logic (Frontend - Pass `modelId` from dialog)
- [x] Verify/Update Prompt Save Logic (Backend - Confirm API routes handle `modelId`)

### Task: Testing
- [x] Conduct thorough testing of the prompt creation/editing functionalities, ensuring `modelId` is saved and retrieved correctly.

### Contact Page
- [X] Create `/contact` page route.
- [X] Create contact form component (`components/contact/contact-form.tsx`).
- [X] Integrate form into page.
- [X] **Create API endpoint (`/api/contact`) to handle form submissions (e.g., send email).**
- [X] Add "Contact" link to Footer.
