# Project Plan: AI Web Planner

## 1. Overall Goal

To create a web application where users can input a website idea, receive AI-driven research and planning assistance, refine the plan based on feedback, and generate prompts for website implementation. The system should support versioning of plans and user authentication.

## 2. Core User Flow

```mermaid
graph LR
    A[User Enters Website Idea (Name, Description)] --> B(AI: Deep Research);
    B --> C{Research Successful?};
    C -- Yes --> D(AI: Generate Initial Plan);
    C -- No --> E[Display Error/Retry Option];
    D --> F[User Reviews Initial Plan & Research];
    F --> G{User Provides Feedback?};
    G -- Yes --> H(AI: Generate Refined Plan);
    G -- No --> I[User Accepts Initial Plan];
    H --> J[Display Refined Plan];
    J --> G; // Allow further refinement
    I --> K[Generate Implementation Prompts];
    J --> K; // Generate prompts from refined plan
    K --> L[User Receives Implementation Prompts];
```

## 3. Key Features

### 3.1. Core Planning Workflow
    - **Project Creation:** User inputs website name and description.
    - **AI Deep Research:** Backend service performs research on target audience, competitors, keywords, tech trends, APIs, UVP, and monetization. Returns structured JSON.
    - **Initial Plan Generation:** AI generates a structured plan (Executive Summary, Goals, Audience, Features, Tech Stack, Architecture, SEO, Monetization) based on user input and research.
    - **Plan Review & Feedback:** User reviews the research and initial plan, provides textual feedback.
    - **Plan Refinement:** AI generates a refined plan incorporating user feedback, original plan, and research data.
    - **Plan Versioning:** Each refinement creates a new version of the plan, storing the plan content and associated feedback. Users can view previous versions.
    - **Prompt Generation:** AI generates sequential implementation prompts based on the final (or accepted initial) plan.

### 3.2. User Management & Authentication
    - User Signup & Login (Existing).
    - Admin Role for managing users, AI providers, prompts, etc. (Existing).
    - Projects and Plans associated with specific users.

### 3.3. Plan Sharing (Existing)
    - Users can share plans with others.

### 3.4. Admin Dashboard (Existing)
    - Manage Users, AI Providers, Prompts, Settings, Security, View Analytics.

## 4. Potential Future Enhancements (Based on Instruction Set 2)

    - **Advanced Feedback Analysis:** AI analyzes feedback impact across plan sections.
    - **Impact Analysis:** Track dependencies between plan sections, classify impact severity, preview changes.
    - **Advanced Version Control:** Version comparison tool, rollback functionality, potential branching.
    - **Visualization:** Generate and edit flowcharts/mind maps representing the plan, with versioning and export options.
    - **Collaboration Features:** Real-time editing or commenting on plans.
    - **Change Log:** Detailed logging of changes between versions.

## 5. Database Schema (Prisma)

```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  role          UserRole  @default(USER)
  accounts      Account[]
  sessions      Session[]
  projects      Project[]
  sharedPlans   SharedPlan[] // Plans shared with this user
}

enum UserRole {
  USER
  ADMIN
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// --- Core Planning Models ---

model Project {
  id                 String       @id @default(cuid())
  projectName        String
  projectDescription String       @db.Text
  userId             String
  createdAt          DateTime     @default(now())
  updatedAt          DateTime     @updatedAt
  user               User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  plans              Plan[]
  sharedWith         SharedPlan[] // Users this project's plans are shared with
}

model Plan {
  id             String    @id @default(cuid())
  projectId      String
  planType       PlanType // 'initial' or 'refined'
  versionNumber  Int       // Starts at 1, increments with refinements
  planContent    String    @db.Text // The actual plan text
  researchData   Json?     // Storing the JSON research findings
  feedback       String?   @db.Text // User feedback that led to this version (if refined)
  prompts        Json?     // Generated implementation prompts
  createdAt      DateTime  @default(now())
  project        Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([projectId, versionNumber]) // Ensure unique version numbers per project
  @@index([projectId])
}

enum PlanType {
  INITIAL
  REFINED
}

model SharedPlan {
  id        String   @id @default(cuid())
  projectId String
  userId    String   // User the plan is shared with
  sharedAt  DateTime @default(now())
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([projectId, userId]) // Prevent sharing the same project multiple times with the same user
  @@index([userId])
}


// --- Admin Models ---

model AIProvider {
  id        String   @id @default(cuid())
  name      String   @unique // e.g., "OpenAI", "Google"
  apiKey    String?  // Store securely, potentially encrypted or use secrets manager
  baseUrl   String?  // Optional base URL for self-hosted or alternative endpoints
  models    AIModel[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model AIModel {
  id           String     @id @default(cuid())
  providerId   String
  modelName    String     // e.g., "gpt-4-turbo", "gemini-pro"
  description  String?
  inputCost    Float?     // Cost per 1k input tokens (optional)
  outputCost   Float?     // Cost per 1k output tokens (optional)
  contextWindow Int?      // Max context window size (optional)
  provider     AIProvider @relation(fields: [providerId], references: [id], onDelete: Cascade)
  prompts      Prompt[]

  @@unique([providerId, modelName])
}

model Prompt {
  id          String   @id @default(cuid())
  name        String   @unique // e.g., "DeepResearch", "InitialPlan"
  description String?
  template    String   @db.Text // The actual prompt template
  modelId     String?  // Optional: Default model for this prompt
  model       AIModel? @relation(fields: [modelId], references: [id], onDelete: SetNull)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// --- Potential Future Models (Instruction Set 2) ---
/*
model PlanVersion { ... } // More granular version details if needed
model FeedbackImpact { ... }
model SectionDependency { ... }
model ChangeLog { ... }
model PlanVisualization { ... }
model VisualizationVersion { ... }
model VisualizationElement { ... }
*/

```

## 6. API Endpoints

*(Adapting paths to existing structure)*

-   **Auth:** (Existing NextAuth routes)
    -   `GET /api/auth/session`
    -   `POST /api/auth/callback/...`
    -   `GET /api/auth/signout`
    -   `POST /api/auth/signin/...`
-   **Projects & Initial Plan:**
    -   `POST /api/plans/initiate`: (Replaces `POST /api/projects`) Creates a new `Project`, performs deep research, generates the initial `Plan` (version 1), saves both. Requires `projectName`, `projectDescription`. Returns the created project and initial plan.
    -   `GET /api/plans`: Get all projects/plans for the logged-in user.
    -   `GET /api/plans/[id]`: Get a specific project and its latest plan details.
-   **Plan Refinement:**
    -   `POST /api/plans/[id]/refine`: (Replaces `PUT /api/projects/:id`) Takes `userFeedback`. Gets the latest plan, performs research *again* (or reuses initial research?), generates a refined plan, saves it as a new `Plan` record with an incremented `versionNumber`. Returns the new plan version.
-   **Plan Versioning:**
    -   `GET /api/plans/[id]/versions`: List all plan versions for a specific project.
    -   `GET /api/plans/[id]/versions/[versionId]`: Get a specific version of a plan.
-   **Prompt Generation:**
    -   `GET /api/plans/[id]/prompts`: Generates (or retrieves if already generated) implementation prompts for the latest plan version.
    -   `GET /api/plans/[id]/versions/[versionId]/prompts`: Generates prompts for a specific plan version.
-   **Sharing:** (Existing)
    -   `POST /api/plans/share`: Share a plan with another user by email.
    -   `GET /dashboard/plans/shared`: (Frontend route) Displays plans shared with the user.
-   **Admin:** (Existing - Assumed structure based on UI)
    -   `GET /api/admin/users`, `POST /api/admin/users`, `PUT /api/admin/users/[id]`, `DELETE /api/admin/users/[id]`
    -   `GET /api/admin/ai-providers`, `POST /api/admin/ai-providers`, ...
    -   `GET /api/admin/prompts`, `POST /api/admin/prompts`, ...
    -   `GET /api/admin/analytics`
    -   `GET /api/admin/settings`, `PUT /api/admin/settings`
    -   `GET /api/admin/security`, `PUT /api/admin/security`

## 7. Frontend Components

*(Mapping to existing components where possible)*

-   **Core Planning:**
    -   `components/dashboard/plan-creation-form.tsx`: (Maps to `CreateProjectForm`) Captures name/description, calls `POST /api/plans/initiate`.
    -   `app/dashboard/plans/[id]/page.tsx`: Main page to display plan details.
    -   `components/plan-details.tsx`: Displays the content of the selected plan version (research, plan sections).
    -   `components/plan-feedback.tsx`: Text area for feedback, button calls `POST /api/plans/[id]/refine`.
    -   `components/plan-versions.tsx`: Lists available plan versions, allows selecting a version to view via `GET /api/plans/[id]/versions/[versionId]`.
    -   `components/plan-prompts.tsx`: Displays generated prompts after calling `GET /api/plans/[id]/prompts` (or specific version).
    -   Error Handling UI: Component to show research/plan generation errors with a retry button.
-   **Dashboard & Navigation:**
    -   `components/dashboard-nav.tsx` (Existing)
    -   `components/user-nav.tsx` (Existing)
    -   `app/dashboard/page.tsx` (Existing)
    -   `app/dashboard/plans/page.tsx`: Lists user's plans.
    -   `app/dashboard/plans/new/page.tsx`: Hosts the `plan-creation-form`.
-   **Sharing:**
    -   `components/plans/share-modal.tsx` (Existing)
    -   `app/dashboard/plans/shared/page.tsx` (Existing)
-   **Admin:** (Existing components in `components/admin/`)
-   **Auth:**
    -   `app/login/page.tsx` (Existing)
    -   `app/signup/page.tsx` (Existing)

## 8. AI Service Integration (`lib/ai-service.ts`)

-   **`performDeepResearch(projectDescription)`:**
    -   Uses configured AI Provider/Model (e.g., `gpt-4-turbo`).
    -   Uses the detailed research prompt provided.
    -   **Crucially, requests JSON output from the LLM.** Parses and returns the JSON object. Includes error handling.
-   **`generateInitialPlan(projectDescription, researchData)`:**
    -   Uses configured AI Provider/Model.
    -   Uses the initial plan prompt, injecting description and research data.
    -   Returns the generated plan text. Includes error handling.
-   **`generateRefinedPlan(projectDescription, initialPlan, userFeedback, researchData)`:**
    -   Uses configured AI Provider/Model.
    -   Uses the refined plan prompt, injecting description, previous plan, feedback, and research data.
    -   Returns the refined plan text. Includes error handling.
-   **`generateImplementationPrompts(planContent)`:**
    -   Uses configured AI Provider/Model.
    -   Uses a prompt designed to break down the `planContent` into actionable, sequential implementation steps/prompts.
    -   Returns the generated prompts (likely as structured JSON or a list of strings). Includes error handling.

## 9. Implementation Phases (Suggested)

1.  **Backend Setup:**
    -   Finalize Prisma schema (Core models: User, Project, Plan, SharedPlan).
    -   Implement API routes: `/initiate`, `/[id]/refine`, `/[id]/versions`, `/[id]/versions/[versionId]`, `/[id]/prompts`.
    -   Integrate `ai-service.ts` functions into the API routes. Ensure JSON mode is used for research.
2.  **Frontend Core Flow:**
    -   Implement `plan-creation-form`.
    -   Implement the main plan display page (`app/dashboard/plans/[id]/page.tsx`) integrating `plan-details`, `plan-feedback`, `plan-versions`, `plan-prompts`.
    -   Connect UI elements to the backend API endpoints.
    -   Implement version switching logic.
    -   Add loading states and error handling.
3.  **Refinement & Testing:**
    -   Thoroughly test the end-to-end flow.
    -   Refine prompts in `ai-service.ts` based on testing results.
    -   Improve UI/UX based on feedback.
4.  **Future Enhancements:**
    -   Implement features from Section 4 (Impact Analysis, Visualization, etc.) based on priority. This would involve adding the corresponding database models, API routes, and UI components.