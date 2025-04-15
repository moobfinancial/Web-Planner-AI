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
- [x] Export functionality
- [x] AI-powered suggestions ( Done )
- [x] Plan Iteration via Feedback (Feedback UI & API Call Done)
- [x] **One-Shot Prompt & Build Plan Tracking** (Generation, Refinement, UI Tab, Activity Logging, Checkbox Task Tracking + API Integration implemented; Sharing pending)
- [x] Interactive mind maps and flowcharts (Mermaid rendering implemented for candidate sections like Site Architecture, User Flow, DB Schema; AI prompts updated to request specific diagram types; Needs styling refinement)

#### User Features
- [x] User registration
- [x] Profile management
- [x] Plan sharing (Backend Done)
- [ ] Collaboration tools

### 5. Admin Portal Implementation

#### Access Control
- [x] Admin authentication
- [x] Role-based access control
- [x] Admin session management

#### User Management
- [ ] User listing
- [ ] User roles management
- [ ] Account status control
- [ ] Activity monitoring

#### System Settings
- [ ] AI provider configuration
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
- [ ] Help documentation
- [ ] Announcement system

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
