# Changelog

All notable changes to the WebPlanner project will be documented in this file.
**** NEVER DELETE 
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
- **Interactive Mermaid Diagrams:**
    - Created `MermaidDiagram.tsx` component using `react-zoom-pan-pinch` for interactive (zoom/pan) rendering of Mermaid syntax.
    - Implemented graceful error handling in `MermaidDiagram.tsx` to render nothing on syntax/rendering errors, preventing user-facing technical details.
    - Updated `PlanDetails.tsx` to conditionally render `MermaidDiagram` for sections identified as Mermaid candidates (e.g., 'Site Architecture').
    - Added a collapsible accordion in `PlanDetails.tsx` to show raw Mermaid code/text details secondarily when a diagram is displayed.
    - Updated AI prompts in `ai-service.ts` (`generateInitialPlan`, `generateRefinedPlan`) to explicitly request Mermaid syntax (`graph TD`) for 'Site Architecture' and handle its preservation/regeneration during refinement.

### Fixed
- Resolved `async`/`await` related TypeScript error in `MermaidDiagram.tsx` after switching to `mermaid.render`.
- Resolved persistent JSX syntax errors in `PlanDetails.tsx` related to rendering mapped elements within a ternary operator by refactoring the component to calculate elements before the return statement.

## [Unreleased] - 2025-04-01

### Fixed
- Resolved TypeScript errors related to the `ProjectStatus` enum after Prisma client regeneration.
- Fixed dashboard build timeout by optimizing the database queries for calculating monthly statistics.
- Added missing imports for `Card` components (`Card`, `CardContent`, `CardHeader`, etc.) in `components/plan-details.tsx` to resolve `Card is not defined` runtime error.
- Corrected parameter destructuring in the API route `app/api/plans/[id]/versions/[versionId]/route.ts` to properly access `params.id` and `params.versionId` in the `GET` handler, resolving server-side errors.
- Corrected parameter destructuring in the API route `app/api/plans/[id]/versions/route.ts` to properly access `params.id` in the `GET` handler, resolving server-side errors.
- **Fix:** Updated API route `app/api/plans/[id]/versions/route.ts` to use the correct Prisma model name `Plan` instead of the old name `PlanVersion`, resolving `TypeError: Cannot read properties of undefined (reading 'findMany')`.
- **Fix:** Corrected the `select` statement in `app/api/plans/[id]/versions/route.ts` to query for the existing `planType` field instead of the non-existent `isRefined` field, resolving `PrismaClientValidationError`.
- **Fix:** Updated API route `app/api/plans/[id]/versions/[versionId]/route.ts` to use the correct Prisma model name `Plan` instead of `PlanVersion`, resolving `TypeError: Cannot read properties of undefined (reading 'findUnique')`.
- **Fix:** Updated type imports and usage in `components/plan-details.tsx` from `PlanVersion` to the correct model type `Plan`.
- **Fix:** Regenerated Prisma client to ensure type alignment with the schema after model rename (`PlanVersion` -> `Plan`).
- **Fix:** Imported `useToast` hook in `components/plan-details.tsx` to resolve `Cannot find name 'toast'` error.
- **Fix:** Corrected Prisma query in `/api/plans/[id]/versions/[versionId]/route.ts` to `include: { feedback: true }` instead of `suggestions: true` based on `schema.prisma`.
- **Fix:** Modified API routes (`.../versions/route.ts` and `.../versions/[versionId]/route.ts`) to access route `params` via the `context` argument inside the handler function, resolving Next.js parameter access warnings.
- **Fix:** Installed missing `@next-auth/prisma-adapter` dependency to resolve `Module not found` error in NextAuth configuration (`/app/api/auth/[...nextauth]/route.ts`).
- **Fix:** Defined missing constant `SECTION_PLAN_CONTENT` (and related constants) in `components/plan-details.tsx` to resolve frontend `ReferenceError`.
- **Fix:** Imported missing `ThumbsUp`, `ThumbsDown`, and `MessageSquarePlus` icons from `lucide-react` in `components/plan-details.tsx`.
- **Fix:** Made `researchData` and `planContent` parsing in `components/plan-details.tsx` more robust to handle non-string or invalid JSON data.
- **Fix:** Commented out non-functional `fetchSuggestions` call in `components/plan-details.tsx` causing 404 errors.
- **Fix:** Correctly handled `researchData` in `components/plan-details.tsx` as a pre-parsed object (due to Prisma `Json` type) instead of attempting to `JSON.parse` it.
- **Fix:** Ensured `planContent` parsing in `components/plan-details.tsx` correctly accesses the nested `planText` property after parsing.
- User avatar visibility in the header should now be improved by using the actual user image or a fallback with initials.
- Corrected import path for `auth` and `prisma` in profile image upload API route.
- Corrected authentication method in profile image upload API route (switched from invalid `auth()` call to `getServerSession`).
- Restored `CustomerProfile` component usage on the profile page, fixing the `CustomerProfile is not defined` error.

### Changed
- Refactored dashboard data fetching (`getDashboardData`) to use a single query for monthly stats instead of multiple `count` queries.
- Updated `prisma/schema.prisma` to add `onDelete: Cascade` to `Activity` and `PlanShare` relations on `Project` to prevent orphaned data upon project deletion.
- Enhanced API route (`GET /api/plans/[id]/versions/[versionId]`) to include project status and name in the response.
- Refactored plan details page (`/dashboard/plans/[id]/page.tsx`) data fetching logic for clarity and to retrieve project status.
- Positioned tooltip in Settings page for better readability.
- **Profile Page Refactor:** Refactored the Profile page (`/dashboard/profile/page.tsx`) and the `CustomerProfile` component (`/components/customer/customer-profile.tsx`). The page now fetches session data and passes the user object and upload logic (`handleFileChange`, `isUploading`) as props to the `CustomerProfile` component. `CustomerProfile` was updated to receive these props and display the data, removing its internal mock state and handlers.
- Updated profile image upload API route (`/api/user/profile/image/route.ts`) to use `getServerSession` with `authOptions` for correct server-side session retrieval.

### Added
- Initial project structure setup.
- Basic authentication with NextAuth.js.
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

## v0.5.1 (2025-04-06)

*   **Feature:** Added a dedicated "One-shot" tab to the "Implement Prompts" section in the Plan Details page. This tab displays the specific `oneShotPrompt` associated with the selected plan version, fetched alongside the categorized prompts.
*   **Fix:** Corrected API route (`/api/plans/[id]/prompts`) to accept a `versionId` query parameter, allowing fetching/generation of prompts for a specific plan version instead of always defaulting to the latest.
*   **Fix:** Updated frontend fetch call in `PlanPrompts` component to use the correct API route structure (Project ID in path, Version ID as query param).
*   **Refactor:** Continued using `React.createElement` in `plan-prompts.tsx` to avoid persistent JSX build issues.
*   **Fix:** Addressed NextAuth `404` errors on `/api/auth/session` by configuring `middleware.ts` to ignore `/api/auth/**` routes.

{{ ... }}
