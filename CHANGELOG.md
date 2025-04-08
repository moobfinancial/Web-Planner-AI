# Changelog. --- NEVER OVERWRITE OR DELETE ANYTHING IN THIS CHANGELOG , ONLY ADD CHANGES TO THE FILE! 

All notable changes to the WebPlanner project will be documented in this file.
**** NEVER DELETE 
## [Unreleased] - 2025-04-07

### Added
- Added documentation files (.md) from external source into the `/docs` directory to serve as a knowledge base or tutorial resource.
- Added loading spinner to Save button in Admin User Dialog.
- **Admin:** Added Activity Log page (`/admin/activity`) to display user actions.
- **Admin:** Implemented role-based filtering (Admin/User/All) on the Activity Log page.
- Prompt archiving functionality: Users can now archive and unarchive prompts instead of deleting them via the Admin UI. (2025-04-07)
- Toggle added to Admin Prompt Management UI to show/hide archived prompts. (2025-04-07)
- Confirmation dialog (`AlertDialog`) before archiving or unarchiving prompts in the Admin Prompt Management UI to prevent accidental clicks.
- **Admin:** Added confirmation dialog before removing a variable in the Prompt Edit Dialog. (2025-04-07)
- **Admin:** Created Admin Help Documentation page (`/admin/help/page.tsx`) detailing prompt and variable management. (2025-04-07)
- **Admin:** Updated Admin Help Documentation page (`/admin/help/page.tsx`) to include information on the new Activity Log page and role-based filtering. (2025-04-07)
- Added changelog entry for integrating AI Provider/Model selection into the Prompt Dialog.
- Added changelog entries for Prompt Management UI enhancements (card display, loading spinner, dialog pre-population, API type fixes).
- **Stripe Integration:** Installed Stripe SDK (`stripe`, `@stripe/stripe-js`, `@stripe/react-stripe-js`) to begin payment gateway setup.
- **Email Verification (Admin):**
    - Generated unique verification tokens for new admin users.
    - Stored tokens and expiry dates in the `User` model.
    - Sent verification emails using Resend and a dedicated template (`admin-verification-email.tsx`).
    - Created an API endpoint (`/api/auth/verify-admin-email`) to handle token verification, update user status, and mark email as verified.
- **Welcome Emails:**
    - Implemented automatic welcome email sending upon new user creation using Resend via NextAuth `createUser` event.
    - Created a welcome email template (`welcome-email.tsx`).
- **Email Infrastructure:**
    - Added Resend API key and sender email to environment variables (`.env.local`).
    - Created a reusable email sending helper function (`lib/email.ts`) using `Resend` and `react-email`.
    - Created placeholder payment confirmation email template (`payment-confirmation-email.tsx`).
- **Database:** Added `emailVerified`, `emailVerificationToken`, and `verificationTokenExpiry` fields to the `User` model via Prisma migration.
- **Stripe Integration (Backend):**
    - Installed Stripe SDK (`stripe`, `@stripe/stripe-js`, `@stripe/react-stripe-js`).
    - Added Stripe Publishable and Secret Keys to `.env.local` (placeholder for webhook secret).
    - Defined Stripe products/prices in dashboard (Plan A: $10/mo `price_1RBTk2DsNaVptGN1DMyzhJCG`, Plan B: $20/mo `price_1RBTlPDsNaVptGN1IidrZuTp`).
    - Created Stripe SDK initialization utility (`lib/stripe.ts`).
    - Added Stripe fields (`stripeCustomerId`, `stripeSubscriptionId`, `stripePriceId`, `stripeSubscriptionStatus`, `stripeCurrentPeriodEnd`) to `User` model in `prisma/schema.prisma` and migrated database.
    - Created API endpoint (`/api/stripe/checkout-session`) to create Stripe Checkout sessions.
    - Created API endpoint (`/api/stripe/webhook`) to handle Stripe events (`checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`) with signature verification.

### Fixed
- **Admin Login Flow:**
  - Corrected admin login page (`/admin/login`) layout to prevent inheritance of main admin header/sidebar by adding a dedicated minimal layout (`app/admin/login/layout.tsx`).
  - Updated admin logout functionality (`components/admin/admin-user-nav.tsx`) to redirect to `/admin/login` instead of `/`.
  - Refactored middleware (`middleware.ts`) to explicitly handle authorization checks and redirect unauthorized `/admin` access attempts to `/admin/login`, while other unauthorized access goes to `/login`.
  - Fixed inconsistent NextAuth session handling by updating the session callback in `app/api/auth/[...nextauth]/route.ts` to fetch user roles directly from the database, ensuring proper admin role detection.
- Adjusted `next-auth` configuration for compatibility. (2025-04-07)
- Corrected Prisma schema relations and types based on error messages. (2025-04-07)
- Resolved middleware logic to correctly handle redirects and API protection. (2025-04-07)
- Fixed `ts-node` path resolution issues in `prisma/seed.ts` by using `process.cwd()`. (2025-04-07)
- Temporarily commented out seeding for `refineOneShotPromptInstructions.txt` in `prisma/seed.ts` as the file is missing. (2025-04-07)
- Refined error handling in the `lib/email.ts` helper function.

### Changed
- **Database:** Added `variables Json?` field to `Prompt` model in `prisma/schema.prisma` to store prompt variables and ran migration. (2025-04-07)
- **API:** Updated `POST /api/admin/prompts` and `PUT /api/admin/prompts/[promptId]` routes to handle saving and updating the `variables` field for prompts. (2025-04-07)
- **API:** Updated `GET /api/admin/prompts` and `PUT /api/admin/prompts/[promptId]` routes to include related `model` and `model.provider` data in the response. (2025-04-07)
- **Admin:** Added "AI Provider & Model Management" section to Help Documentation (`/admin/help/page.tsx`). (2025-04-07)
- **Admin Prompt Dialog:** Integrated AI Provider and Model selection dropdowns into the Prompt create/edit dialog (`components/admin/prompt-dialog.tsx`). Updated parent component (`components/admin/prompt-management.tsx`) to pass provider data and handle saving the selected `modelId` via API. (2025-04-07)
- **Admin Prompt Management UI:** (2025-04-07)
    - Added AI Provider and Model name display to prompt cards (`components/admin/prompt-management.tsx`).
    - Added loading spinner to the save button in the prompt dialog (`components/admin/prompt-dialog.tsx`).
    - Implemented pre-population of Provider/Model dropdowns when editing a prompt in the dialog (`components/admin/prompt-dialog.tsx`).
    - Fixed TypeScript/Prisma type errors in backend API route (`/api/admin/prompts/[promptId]/route.ts`).
- Updated `Build_Plan.md` to mark Email Integration tasks as complete and add Stripe Integration tasks.
- Updated `appName` in `welcome-email.tsx` to "Aiprompti.com".
- Updated `Build_Plan.md` to mark completed Stripe backend tasks.

### Security
- Ensured admin routes are properly protected by middleware. (2025-04-07)

## [Unreleased] - 2025-04-05

### Fixed
- **Major Fix:** Resolved persistent JSX syntax error in `components/plan-prompts.tsx` by completely rewriting the component using `React.createElement()` instead of JSX syntax. The component has been temporarily simplified to ensure build stability, with named exports maintained to preserve compatibility with importing components.
  - Created backup of original file as `plan-prompts.tsx.bak` for reference
  - Multiple approaches were tried including: correcting export statements, semicolon placement, refactoring nested functions
  - Production build now completes successfully, though development mode may still show React.use() related warnings
- **Additional Fix:** Resolved development mode error in `app/dashboard/plans/[id]/page.tsx` caused by improper usage of `React.use()`. Modified the component to safely handle both Promise and direct object parameters.
- **Fix:** Corrected a persistent JSX build error (`Unexpected token div`) in `components/plan-prompts.tsx` by removing a misplaced `export default PlanPrompts;` statement located inside the `fetchCategorizedPrompts` function and ensuring the export was correctly placed at the end of the file.
- **Refactor (Previous Attempt):** Refactored `components/plan-prompts.tsx` to use a single main return with conditional rendering and removed a semicolon after an internal function definition (`renderPromptsForCategory`) in earlier attempts to fix the build error.
- Resolved Next.js and NextAuth peer dependency conflict causing 500 errors and build failures:
  - Downgraded Next.js from 15.2.4 to 14.2.0 to ensure compatibility with NextAuth 4.24.7 and `@next-auth/prisma-adapter`.
  - Cleaned `.next` cache, `node_modules`, and lockfile.
  - Reinstalled dependencies with `--legacy-peer-deps`.
- Confirmed no `useLayoutEffect` usage in user codebase; warning originated from Next.js Dev Overlay internals and is harmless.

### Added
- **Feature Implementation: One-Shot Prompt & Build Plan Foundation:**
    - Implemented core requirements for the One-Shot Prompt feature.
    - Laid the foundation for Build Plan progress tracking.
    - **Database Schema (`prisma/schema.prisma`):** Added `oneShotPrompt`, `buildPlanProgress`, `buildPlanChangelog`, and `buildPlanMetadata` fields to `Plan` model and applied migration.
    - **AI Service (`lib/ai-service.ts`):** Added `generateOneShotPrompt_new` and `refineOneShotPrompt` functions.
    - **API (`app/api/plans/[id]/one-shot-prompt/route.ts`):**
        - Implemented `GET` (fetch/generate) and `PUT` (refine) endpoints for One-Shot Prompt. (Includes Prisma type workarounds).
        - Added activity logging (`ONESHOT_GENERATED`, `ONESHOT_REFINED`) and dashboard revalidation (`revalidateDashboardPaths`) on successful generation/refinement.
    - **API (`app/api/plans/[id]/build/route.ts`):** Created `GET` and `POST` endpoints for basic build progress updates. (Includes type workarounds).
    - **Frontend (`components/plan-prompts.tsx`):**
        - Integrated `ProgressIndicator`.
        - Added state/functions (`fetchOneShotPrompt`, `handleRefineOneShotPrompt`).
        - Added "One-Shot Prompt" tab.
        - Implemented UI for displaying prompt, feedback, refinement trigger.
        - Added loading skeletons and error handling.
        - Added placeholder checkboxes to categorized prompts and implemented state management (`checkedTasks`).
        - Implemented `handleCheckboxChange` to update state and call `POST /api/plans/[versionId]/build` endpoint to save progress counts.
        - Added tooltips to relevant buttons.
        - Added placeholder comment for future Share button.
- **Feature Definition: One-Shot Prompt:**
    - Defined core requirements for generating a comprehensive "One-Shot Prompt" capable of guiding AI code generation for the entire application.
    - Outlined detailed implementation plan including:
        - Data model changes (`PlanVersion.oneShotPrompt` field).
        - AI service modifications (`lib/ai-service.ts`) for generating (`generateOneShotPrompt`) and refining (`refineOneShotPrompt`) the prompt, adapting to different code editors.
        - New API endpoints (`GET` and `PUT /api/plans/[id]/one-shot-prompt`).
        - Frontend integration (`PlanPrompts` component) for displaying, refining, and potentially sharing the prompt.
    - Specified considerations for prompt engineering, token limits, error handling, and security.
    - Added plan for enhanced prompt UI (tooltips, sharing).
- PDF export functionality with modal preview
- Client-side PDF generation using jsPDF
- Toast notifications for export success/error states
- Recent Activity integration for PDF exports

### Added
- Added activity logging (`PLAN_VERSION_CREATED`) to the `POST /api/plans/[id]/versions` route to track the creation of new plan versions based on feedback.

### Fixed
- Fixed dashboard recent activity display by using `revalidatePath('/dashboard')` in the plan version creation API route (`POST /api/plans/[id]/versions`) to ensure data freshness, replacing the previous `force-dynamic` approach on the dashboard page.
- Fixed feedback submission loading state logic in `components/plan-details.tsx` to ensure the loading state (`isSubmittingFeedback`) is correctly reset using a `finally` block.
- Prevented feedback confirmation dialog (`AlertDialog`) from closing prematurely in `components/plan-details.tsx` by replacing `AlertDialogAction` with a standard `Button`, allowing the loading spinner to be visible during submission.
- **API Routes:** Corrected issue where `params` object was accessed before `await` in `app/api/plans/[id]/versions/route.ts` and `app/api/plans/[id]/versions/[versionId]/route.ts` GET/POST handlers, preventing potential race conditions or undefined errors.
- **API Routes:** Simplified logic for handling `project.targetAudience` in `generateRefinedPlan` function within `app/api/plans/[id]/versions/route.ts`, removing unnecessary intermediate variables and potential parsing errors when `targetAudience` was a string.
- **API Routes:** Corrected import paths for `authOptions` (to `@/lib/auth`) and `prisma` (to `{ prisma }`) in `app/api/plans/[id]/versions/route.ts` and `app/api/plans/[id]/versions/[versionId]/route.ts` to resolve linting errors.
- **Component Fix:** Resolved HTML nesting errors (`<p>` in `<p>`, `<ul>` in `<p>`, `<div>` in `<p>`) and related accessibility warning in the feedback confirmation modal (`components/plan-details.tsx`) by using the `asChild` prop on `AlertDialogDescription` and wrapping the dynamic content in a `div`.
- **API Fix:** Recreated missing `schema.ts` file in `app/api/plans/[id]/versions/` containing the Zod schema (`refineBodySchema`) for validating the POST request body, resolving the "Module not found" build error.

## [Unreleased] - YYYY-MM-DD

### Added
- Implemented frontend API integration for Prompt Management (Add, Edit, Delete, Archive).

### Changed
- N/A

### Fixed
- N/A

## [Unreleased] - 2025-04-05

### Fixed
- **TypeScript Build Errors:** Resolved TypeScript build errors in `lib/ai-service.ts` by:
  - Refactoring JSON examples in template literals to use separate JavaScript objects with `JSON.stringify()`
  - Properly escaping backticks in Mermaid diagram examples
  - Using template literals with backtick escaping for complex multi-line strings
  - Fixing string escaping in JSON examples to prevent TypeScript from interpreting them as code

## [Unreleased] - 2025-04-05

### Fixed
- **TypeScript Syntax Errors:** Corrected TypeScript syntax errors in `lib/ai-service.ts` caused by unescaped backticks within prompt template literals. Resolved a potential lint error (`'with' statements not allowed`) by rephrasing an instruction in the `generateRefinedPlan` prompt.

- **DOM Manipulation Error:** Fixed "Failed to execute 'removeChild' on 'Node'" error in the Mermaid diagram component by:
  - Separating SVG content management into React state
  - Adding proper cleanup on component unmount
  - Using a safer approach to DOM updates with separate useEffect hooks
  - Implementing better error boundaries for DOM manipulation

- **ChunkLoadError in Mermaid Diagrams:** Resolved the `ChunkLoadError` when loading Mermaid diagram chunks by:
  - Adding robust error handling in the Mermaid component initialization
  - Implementing a fallback rendering approach when the primary render method fails
  - Adding proper loading state management to improve user experience
  - Setting `securityLevel: 'loose'` to allow proper rendering within the component
  - Improving error boundary to gracefully handle chunk loading failures

- **TypeScript Build Errors:** Resolved TypeScript build errors in `lib/ai-service.ts` by:
  - Refactoring JSON examples in template literals to use separate JavaScript objects with `JSON.stringify()`
  - Properly escaping backticks in Mermaid diagram examples
  - Using template literals with backtick escaping for complex multi-line strings
  - Fixing string escaping in JSON examples to prevent TypeScript from interpreting them as code

## [Unreleased] - 2025-04-05

### Fixed
- **Mermaid Parse Error:** Fixed Mermaid parse errors caused by invalid syntax (e.g., HTML comments `<!-- -->`) in generated diagrams by refining AI prompts in `lib/ai-service.ts` to:
  - Forbid HTML comments within Mermaid code blocks.
  - Restrict diagram generation to specifically allowed sections (Site Architecture, User Flow, Admin Flow, etc.).
  - Prevent diagrams under incorrect sections like Technology Stack.
- **TypeScript Syntax Errors:** Corrected TypeScript syntax errors in `lib/ai-service.ts` caused by unescaped backticks within prompt template literals.
- **DOM Manipulation Error:** Fixed \"Failed to execute 'removeChild' on 'Node'\" error in the Mermaid diagram component by:
  - Separating SVG content management into React state
  - Adding proper cleanup on component unmount

## [Unreleased] - 2025-04-05

### Fixed
- **TypeScript Syntax Errors:** Corrected TypeScript syntax errors in `lib/ai-service.ts` caused by unescaped backticks within prompt template literals. Resolved a potential lint error (`'with' statements not allowed`) by rephrasing an instruction in the `generateRefinedPlan` prompt.

## [Unreleased] - 2025-04-03

### Added
- **Interactive Mermaid Diagrams:**
    - Created `MermaidDiagram.tsx` component using `react-zoom-pan-pinch` for interactive (zoom/pan) rendering of Mermaid syntax.
    - Implemented graceful error handling in `MermaidDiagram.tsx` to render a user-friendly placeholder (icon + message) on syntax/rendering errors.
    - Updated `PlanDetails.tsx` to conditionally render `MermaidDiagram` for sections identified as Mermaid candidates (e.g., 'Site Architecture', 'User Flow', 'Database Schema').
    - Added a collapsible accordion in `PlanDetails.tsx` to show raw Mermaid code/text details secondarily when a diagram is displayed.
    - Updated AI prompts in `ai-service.ts` (`generateInitialPlan`, `generateRefinedPlan`) to explicitly request appropriate Mermaid syntax (e.g., `graph TD`, `graph LR`, `erDiagram`) for different candidate sections and handle their preservation/regeneration during refinement.

### Changed
- **Mermaid Diagram Styling:** Adjusted styling for the `MermaidDiagram` component wrapper and controls overlay for better theme integration.

### Fixed
- Resolved `async`/`await` related TypeScript error in `MermaidDiagram.tsx` after switching to `mermaid.render`.
- Resolved persistent JSX syntax errors in `PlanDetails.tsx` related to rendering mapped elements within conditional logic.

## [Unreleased] - YYYY-MM-DD 

### Added
- Initial project structure setup.
- Basic authentication with Next.js, TypeScript, Tailwind CSS, Shadcn UI, Prisma, and NextAuth.
- Dashboard layout and components.
- Plan creation form.
- Basic plan details display.
- Cascade deletes to Activity and PlanShare.
- API endpoint (`DELETE /api/projects/[id]`) for deleting projects.
- API endpoint (`GET /api/user/projects`) to fetch user's projects (id, name).
- Settings page (`/dashboard/settings`) with UI to select and delete a project, including a confirmation dialog.
- API endpoint (`PATCH /api/projects/[id]/status`) for updating project status.
- "Mark as Complete" button on the plan details page (`/dashboard/plans/[id]`) to set project status to COMPLETED.
- **Profile Image Upload:** Users can now upload a profile picture from the profile page. Images are stored on Cloudinary and the user's profile is updated.
- **Dynamic User Nav:** The user navigation dropdown in the header now dynamically displays the user's name, email, and profile picture (or initials) based on the current session. Sign out functionality is also implemented.
- **Profile Page Data:** The profile page now displays the user's current name, email, and profile picture fetched from the session.
- **Project Details Editing:**
    *   Added `GET /api/projects/[id]` endpoint to fetch full details of a specific project (including ownership check).
    *   Added `PATCH /api/projects/[id]` endpoint to update project metadata (name, description, etc.) with ownership check and validation.
    *   Logged activity of type `PROJECT_DETAILS_UPDATED` when project details are successfully modified.
    *   Modified the `/dashboard/settings` page:
        *   Uses the `GET` endpoint to fetch details of the selected project.
        *   Displays an editing form populated with the fetched project details.
        *   Added input fields for Project Name (required) and Project Description.
        *   Included a tooltip explaining that editing metadata does not regenerate the plan content.
        *   Implemented a "Save Changes" button that calls the `PATCH` endpoint.
        *   Shows loading states and handles potential errors during fetch/save.
        *   Updates the project name in the dropdown list after a successful save.

*   **Activity Logging:**
    *   Added activity logging for project deletion (`PROJECT_DELETED`) in `DELETE /api/projects/[id]`.
    *   Added activity logging for project status changes (`PROJECT_STATUS_CHANGED`) in `PATCH /api/projects/[id]/status`.
*   **Dashboard:**
    *   Updated the dashboard's recent activity section to fetch and display real activity logs from the database (`Activity` table).
    *   Implemented varied display messages based on activity type (`PROJECT_CREATED`, `PROJECT_DELETED`, `PROJECT_STATUS_CHANGED`, etc.).

### Debugging
- Added logging in `app/api/plans/[id]/versions/route.ts` to inspect the `prisma` object state before database query to debug `TypeError: Cannot read properties of undefined (reading 'findMany')`.

## 2025-04-06

### Added
- Restored checkbox task tracking functionality in the Plan Prompts component
- Added feedback and refinement functionality for the One-Shot Prompt
- Fixed dark mode text visibility for prompt code blocks
- Re-implemented progress bar for build plan task completion
- Corrected API request format for updating build progress

### Fixed
- Fixed authentication issues with build progress API calls by adding credentials to fetch requests
- Resolved contrast issues in dark mode for prompt text display
- Fixed Plan ID and Version ID visibility in dark mode
- Fixed checkbox state persistence by storing and retrieving detailed progress information
- Fixed prompt content display by correcting property name mismatch (promptText vs prompt)
- Enhanced build progress API to properly store and retrieve checkbox state between sessions
- Fixed progress bar functionality by properly handling buildPlanProgress data in the API
- Added detailed debugging logs to track progress data flow between client and server
- Improved checkbox state reactivity by creating a new state object when setting initial checked tasks
- Improved mobile responsiveness for Implementation Prompt tabs with better text wrapping and layout
- Added responsive tab layout that adapts to smaller screens
- Enhanced code block display with proper text wrapping for mobile devices
- Redesigned tab navigation with flexible layout to ensure all tabs are visible
- Reduced tab button padding and optimized text size for better space efficiency
- Implemented responsive design for tabs that works across different screen sizes

## 0.5.2 - 2025-04-05
*   **Fix:** Changed file path resolution in `lib/ai-service.ts` (`generateInitialPlan`, `generateRefinedPlan`) from using `__dirname` to `process.cwd()` when loading instruction files (`prompts/*.txt`). This resolves `Internal Server Error (500)` errors caused by the inability to find instruction files in built/production environments.

## 0.5.1 - 2025-04-05
*   **Fix:** Implemented post-processing in `lib/ai-service.ts` (`generateInitialPlan` and `generateRefinedPlan`) to automatically remove invalid HTML comments (`<!--`, `-->`) from generated Mermaid code blocks. This resolves Mermaid parsing errors caused by the AI occasionally including these comments despite prompt instructions.
*   **Refactor:** Refactored `generateRefinedPlan` in `lib/ai-service.ts` to load detailed AI instructions from a separate file (`prompts/generateRefinedPlanInstructions.txt`). This cleans up the code, resolves TypeScript template literal parsing errors, and makes prompt management easier.
*   **Fix:** Adjusted prompt instructions in `lib/ai-service.ts` to explicitly forbid HTML comments (`<!-- -->`) within Mermaid code and reinforce that diagrams should only appear under specified headings, attempting to prevent Mermaid parse errors.

## 0.5.0 - 2024-01-28

## [Unreleased] - 2025-04-05

### Fixed
- **Fix:** Corrected a persistent JSX build error (`Unexpected token div`) in `components/plan-prompts.tsx` by removing a misplaced `export default PlanPrompts;` statement located inside the `fetchCategorizedPrompts` function and ensuring the export was correctly placed at the end of the file.
- **Refactor (Previous Attempt):** Refactored `components/plan-prompts.tsx` to use a single main return with conditional rendering and removed a semicolon after an internal function definition (`renderPromptsForCategory`) in earlier attempts to fix the build error.

## [Unreleased] - YYYY-MM-DD

### Added
- Implemented AI Provider and Model management in Admin settings.
- Functionality to add, edit, and view AI Providers.
- Functionality to add, edit, and view AI Models associated with providers.
- Backend API routes (`/api/admin/ai-providers` and `/api/admin/ai-providers/[providerId]/models`) for CRUD operations.
- Frontend UI components (`AIProviderManagement`, `AIProviderDialog`, `AIModelDialog`) using Shadcn UI.
- Implemented DELETE functionality for AI Providers (with cascade delete for associated models) and individual AI Models.
- Added confirmation dialogs (`AlertDialog`) for delete actions to prevent accidental data loss.
- Integrated `react-hot-toast` for user feedback on add/edit/delete operations.

### Changed
- Refactored dialog logic in `AIProviderManagement` to ensure dialog components are always mounted.
- Updated `AIModelDialog` to align with the backend schema for model properties (cost, context window, etc.).
- Ensured API routes perform necessary authorization checks (Admin role).
- Adjusted UI layout in `AIProviderManagement` for better display of providers and models.

### Fixed
- Corrected prop usage for Dialog components (`open` instead of `isOpen`).
- Handled potential null values for optional provider fields (`apiKeyEnvVarName`, `baseUrl`) before sending to API.
- Ensured model costs/context window are correctly parsed as numbers before API calls.
- Added missing `useToast` import.

## [Unreleased] - YYYY-MM-DD

### Added
- Added changelog entry for AI Provider/Model delete functionality.

### Changed
- N/A

### Fixed
- N/A

## [Unreleased] - YYYY-MM-DD

### Added
- Added changelog entry for prompt editing fix and API route query simplification.

### Changed
- N/A

### Fixed
- N/A

## [0.1.4] - 2025-04-07
### Fixed
- Corrected prop passing mismatch between `PromptManagement` and `PromptDialog` components to enable prompt editing functionality.
- Simplified Prisma query in `GET /api/admin/prompts` API route to avoid internal server errors potentially caused by nested includes on null relations after seeding.

### Added
- N/A

### Changed
- N/A

## [0.1.5] - 2025-04-07
### Added
- Confirmation dialog (`AlertDialog`) before archiving or unarchiving prompts in the Admin Prompt Management UI to prevent accidental clicks.

### Changed
- Updated `handleToggleArchive` in `PromptManagement` component to trigger confirmation dialog instead of immediate API call.
- Created `confirmToggleArchive` function to handle API call after confirmation.

### Fixed
- N/A

## [0.1.6] - 2025-04-07
### Added
- Created new API route `PATCH /api/admin/prompts/[promptId]/status` to handle updating the status (ACTIVE/ARCHIVED) of a specific prompt.

### Changed
- N/A

### Fixed
- N/A

## [0.1.7] - 2025-04-07
### Fixed
- Removed duplicate import statement for `lucide-react` icons in `components/admin/prompt-management.tsx` to resolve compilation error.

### Added
- N/A

### Changed
- N/A

## v0.7.0 (Pending) - Admin Enhancements & AI Configuration

- **Feature:** Added Activity Log page in Admin panel (`/admin/activity`).
- **Feature:** Implemented role-based filtering (Admin/User/All) in Activity Log.
- **Feature:** Added System Settings management under `/admin/settings`.
- **Feature:** Integrated AI Model selection into System Settings.
- **Update:** `ai-service.ts` now dynamically uses the AI model configured in System Settings.

### v0.6.0 (2025-04-05) - One-Shot Prompt & Fixes
{{ ... }}

## vNEXT (YYYY-MM-DD)

- **Fix (Admin Login Flow - 2025-04-07):** Resolved persistent admin login redirection issue. Implemented the fix from a previous version (`webplanner-5 copy 4`) by moving the admin login page (`page.tsx`) and its dedicated layout (`layout.tsx`) from `/app/admin/login/` to a new, separate directory `/app/auth/admin-login/`. Updated `middleware.ts`, `admin-user-nav.tsx` (logout link), and simplified the NextAuth API route handler (`app/api/auth/[...nextauth]/route.ts`) to correctly import configurations from `lib/auth.ts`. This prevents interference from the main admin layout and resolves incorrect redirects.

{{ ... }}

## [Unreleased] - 2025-04-08

### Added
- Created subscription success page (`/subscription/success`).
- Created subscription cancellation page (`/subscription/cancel`).
- Integrated payment confirmation email sending via Stripe webhook (`checkout.session.completed` event).
- Updated payment confirmation email template (`emails/payment-confirmation-email.tsx`) to accept and display plan name.

### Changed
- Modified Stripe webhook handler (`/api/stripe/webhook`) to call `sendEmail` helper.

### Fixed
- Resolved TypeScript lint error where `stripe` client was potentially null in webhook handler.

## [Unreleased] - YYYY-MM-DD

### Added
- Added changelog entry for Header/Footer refactor and application to subscription page.
- Created reusable `Header` and `Footer` components in `components/layout`.
- Applied standard `Header` and `Footer` to the `/subscription` page.
- Updated `/` (Homepage) to use the reusable `Header` and `Footer` components.

### Changed
- Refactored header/footer structure for better maintainability and consistency across pages.

### Fixed
- N/A

## [Unreleased] - YYYY-MM-DD

### Added
- Added changelog entry for the new Contact Us page.
- Created `/contact` page route (`app/contact/page.tsx`).
- Created `ContactForm` component (`components/contact/contact-form.tsx`) based on v0.dev design.
- Integrated `ContactForm` into the `/contact` page.
- Added "Contact" link to the site `Footer`.
- Created reusable `Header` and `Footer` components in `components/layout`.

### Changed
- N/A

### Fixed
- N/A

## [Unreleased] - YYYY-MM-DD

### Added
- **Contact Page:** Restored design to match reference project:
    - Copied `ContactFAQ`, `ContactMap`, `ContactOptions` components.
    - Copied `circuit-bg`, `glow-text`, `futuristic-card`, `glow-border` styles and `circuit-flow` animation from reference `globals.css`.
    - Updated `tailwind.config.ts` to include `circuit-flow` animation.
    - Updated `app/contact/page.tsx` structure, components, header, footer, and styling to align with reference.
    - Synchronized CSS variables and base/component layer styles in `app/globals.css` with reference.
    - Investigated lingering visual discrepancies on Contact page, identified potential font rendering differences despite identical configuration (`Inter` font via `next/font`, `layout.tsx`, `tailwind.config.ts`, `globals.css`). Next step is browser dev tool inspection.

### Changed
- N/A

### Fixed
- N/A
