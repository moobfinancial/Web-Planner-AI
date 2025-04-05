# Changelog

All notable changes to the WebPlanner project will be documented in this file.

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

## [1.0.1] - 2025-04-01

### Fixed
- Dashboard now displays real plans data instead of hardcoded mock data
- Fixed syntax error in ai-service.ts that was causing plan refinement to fail
- Added detailed logging to API routes to help diagnose authorization issues

### Changed
- Improved error handling in plan fetching logic
- Enhanced dashboard to show accurate statistics and recent activity
- Added ProjectStatus enum to the Project model to track project completion state

### Added
- Created CHANGELOG.md to track project changes
- Added status field to Project model with DRAFT, IN_PROGRESS, COMPLETED, and ARCHIVED options

## [Unreleased] - 2025-04-02

### Added
*   **Project Details Editing:**
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

### Fixed
*   Corrected Prisma client import in profile image upload API route (`app/api/user/profile/image/route.ts`) to use named import (`{ prisma }`).
*   Resolved `ReferenceError: session is not defined` in the error logging block of the profile image upload API by adjusting variable scope.
*   **Profile Image Display:** Updated NextAuth `session` callback (`lib/auth.ts`) to fetch the latest user data (including `image` URL) from the database, ensuring the correct profile picture is shown after upload and page reload.
*   Resolved 500 error during plan refinement by correcting syntax errors and improving error handling/logging in the `POST /api/plans/[id]/versions` route handler (`app/api/plans/[id]/versions/route.ts`).

### Changed
*   Refactored activity logging in profile image upload API route to use direct `prisma.activity.create` calls instead of a non-existent `logActivity` helper function, aligning with logging patterns in other API routes.

### Refactor
- Removed internal `isLoading` state from `PlanDetails` component. The component now relies on its parent (`PlanPageContent`) to manage the initial loading display, simplifying state management and potentially resolving a conflict causing runtime errors.

### Removed
- (Nothing yet)

## [Unreleased] - 2025-04-03

### Added
- **AI Suggestions Display:** Updated `components/plan-details.tsx` to parse and display AI-generated suggestions from the `planContent` JSON data in a dedicated card.
- **AI Suggestion Selection:** Added checkboxes to the AI Suggestions card in `components/plan-details.tsx`, allowing users to select/deselect suggestions. Implemented state management (`selectedSuggestionIds`) to track selections.

### Changed
- **AI Refinement Prompt:** Modified the hardcoded prompt for `generateRefinedPlan` in `lib/ai-service.ts` to explicitly instruct the AI to generate 1-3 new suggestions based on user feedback, in addition to refining plan content.

## [Unreleased] - 2025-04-04

### Added
- Add `userId` to `Project` model and update related queries.
- SessionProvider and getServerSession for user authentication.
- Auth utility functions (`authOptions`, `getUserSession`).
- API route for fetching user session `/api/auth/session`.
- API route `/api/plans/initiate` for initial plan generation.
- Project creation form and API route `/api/projects`.
- Project list page and API route `/api/projects` (GET).
- Dynamic plan details page `[id]/page.tsx`.
- API route `/api/plans/[id]/versions` (GET) to fetch versions.
- Display plan content and suggestions in `plan-details.tsx`.
- Feedback submission UI (text areas, suggestion selection).
- Feedback confirmation modal.
- Logic to include selected suggestion IDs in feedback submission.
- Changelog :)

### Changed
- Updated `Plan` model: added `versionNumber`, `planType`.
- Modified `ai-service.ts` to handle plan generation and refinement.
- Refined API structure and request/response handling.
- Improved error handling and logging in API routes and frontend.
- Updated UI components for better display and interaction.
- Updated `plan-details.tsx` to handle feedback state and submission.
- Ensured `AlertDialog` accessibility compliance (`aria-describedby`).
- Refined `generateRefinedPlan` prompt to avoid redundant suggestions (work in progress).
- **Fixed `POST /api/plans/[id]/versions` to correctly calculate the next `versionNumber`, preventing unique constraint errors.**

### Removed
- Removed placeholder `plan-details.tsx` content.

### Fixed
- Addressed various Prisma query issues and potential errors.
- Corrected session handling and user authorization checks.
- Fixed Zod schema validation for feedback submission.
- Resolved issue where feedback modal showed `undefined` for suggestions.
- Addressed `AlertDialogContent` accessibility warning (re-applied fix).
- **Corrected `versionNumber` calculation logic in plan version creation API to prevent database unique constraint errors.**

## [0.1.3] - 2024-07-11
### Fixed
- Corrected `newVersionNumber` calculation in `POST /api/plans/[id]/versions` to query the latest version, preventing unique constraint errors when previous versions were deleted or missing.

## [0.1.4] - 2024-07-11
### Added
- Loading indicator (spinner, disabled button) to the feedback submission confirmation modal during the API call.
### Fixed
- Resolved `<p>` tag nesting error in the feedback confirmation modal description by restructuring content using JSX (`div`, `ul`, `li`).
- Fixed accessibility warning by adding `aria-describedby` to `AlertDialogContent` to correctly link it with its description.

## [Unreleased] - 2025-04-05

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
## [Unreleased] - 2025-04-03

### Added
- **AI Suggestions:** Implemented UI in Plan Details to display AI-generated suggestions.
- **Suggestion Selection:** Added checkboxes for users to select/deselect AI suggestions.
- **Feedback Submission:**
    - Implemented UI for users to provide written feedback per plan section.
    - Added a confirmation dialog summarizing feedback and selected suggestions.
    - Implemented API call (`POST /api/plans/[id]/versions`) to submit feedback and selected suggestion IDs for plan refinement.
    - Added loading state (`isSubmitting`) and button disabling during feedback submission.
- **Backend Refinement Logic:**
    - Updated `generateRefinedPlan` in `ai-service.ts` to accept selected suggestion IDs.
    - Added `parseAIResponse` helper for robust JSON parsing from AI output (handles direct JSON and markdown code blocks).
    - Adjusted prompt for `generateRefinedPlan` to request new suggestions based on feedback.

### Fixed
- **Accessibility:** Added `AlertDialogDescription` to the feedback confirmation dialog in `plan-details.tsx` to resolve accessibility warnings.
- **AI Service Robustness:** Improved error handling in `generateRefinedPlan` to return `null` on parsing errors, preventing downstream crashes in the API route.
