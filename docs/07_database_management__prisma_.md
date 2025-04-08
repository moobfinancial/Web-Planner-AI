# Chapter 7: Database Management (Prisma)

Welcome back! In [Chapter 6: API Endpoints (Next.js API Routes)](06_api_endpoints__next_js_api_routes_.md), we learned how the frontend (your browser) sends requests to the backend (our server) using API endpoints. When you click "Create Plan" after describing your new website idea, the API endpoint `/api/plans/initiate` receives this request. But where does the server *permanently store* your project's name, description, and the generated plan? And how does it find this information again later when you revisit your project?

## What's the Problem? Remembering Your Data!

Web applications need a way to store information persistently. If the server just kept your project details in its temporary memory, everything would disappear if the server restarted! We need a reliable system to:

1.  **Store Data:** Save information like user accounts, project details, plan versions, etc., in a safe place.
2.  **Organize Data:** Structure the data logically so related pieces of information are linked (e.g., this plan belongs to *that* project, which belongs to *this* user).
3.  **Retrieve Data:** Efficiently find specific pieces of data when needed (e.g., find all projects created by user "Alice").
4.  **Modify Data:** Update existing information (e.g., change a project's name) or delete it.

The traditional way to do this is using a **database**. In Web-Planner-AI, we use a powerful database called **PostgreSQL**. However, writing raw database commands (in a language called SQL) directly in our application code can be complex, error-prone, and tedious.

## The Solution: Prisma - Our Friendly Data Librarian

This is where **Prisma** comes in! Prisma is a modern database toolkit that makes working with our PostgreSQL database much easier and safer.

**Analogy:** Think of our PostgreSQL database as a huge library building, and all our application's data (users, projects, plans) are the books inside. Prisma acts as our super-efficient **librarian**.

The librarian (Prisma) helps us with several key tasks:

1.  **The Blueprint (`schema.prisma`):** Prisma defines the structure of our library – what kinds of shelves (tables) we have (`User`, `Project`, `Plan`) and what information is stored on each shelf (like `projectName` on the `Project` shelf). This blueprint ensures everything is organized consistently.
2.  **The Toolset (Prisma Client):** Prisma gives our application code easy-to-use tools (functions like `create`, `findUnique`, `update`) to interact with the library. Instead of writing complex SQL commands, we use these simple tools, and Prisma handles the underlying database communication. It's like telling the librarian, "Find me the book with this title," instead of searching the shelves yourself.
3.  **Managing Changes (Prisma Migrate):** When we need to change the library's structure (e.g., add a new type of shelf for "Activity Logs"), Prisma provides tools to safely update the database layout without losing existing data. It's like the librarian helping reorganize the shelves when new book categories are introduced.

Prisma is specifically known as an **ORM (Object-Relational Mapper)**. It lets us work with database records as if they were regular JavaScript objects, "mapping" between our code's objects and the database's relational tables.

## Key Concepts

Let's look at Prisma's main parts more closely:

### 1. Prisma Schema (`prisma/schema.prisma`)

This is the single source of truth for our database structure. It's a plain text file where we define our **models**. Each model represents a table in the database.

**Analogy:** This is the architectural blueprint for our library's bookshelves.

```prisma
// File: prisma/schema.prisma (Simplified Example)

datasource db {
  provider = "postgresql" // We're using PostgreSQL
  url      = env("DATABASE_URL") // Database connection link
}

generator client {
  provider = "prisma-client-js" // Generate the JavaScript client
}

// Model for Users
model User {
  id        String    @id @default(cuid()) // Unique ID
  email     String?   @unique // Email, must be unique
  name      String?
  // Link to Projects: A User can have many Projects
  projects  Project[]
}

// Model for Projects
model Project {
  id                 String   @id @default(cuid()) // Unique ID
  projectName        String
  projectDescription String   @db.Text
  createdAt          DateTime @default(now())
  // Link back to User: Each Project belongs to one User
  userId             String   // Stores the User's id
  user               User     @relation(fields: [userId], references: [id])
  // Link to Plans (Not shown for simplicity)
  // plans              Plan[]
}

// Other models like Plan, ActivityLog etc. would also be here...
```

**Explanation:**
*   `datasource db`: Tells Prisma we're using PostgreSQL and where to find it.
*   `generator client`: Tells Prisma to create the JavaScript toolkit (Prisma Client).
*   `model User`: Defines the `User` table with fields like `id`, `email`, `name`. `@id` means it's the primary key, `@unique` means no two users can have the same email. `Project[]` defines a one-to-many relation: one User can have many Projects.
*   `model Project`: Defines the `Project` table. `userId` and `@relation` define the link back to the `User` model, establishing the relationship.

### 2. Prisma Client

This is the auto-generated JavaScript/TypeScript library that our application code uses to talk to the database. It provides type-safe functions for all common database operations (CRUD: Create, Read, Update, Delete). "Type-safe" means our code editor can help us avoid mistakes by knowing exactly what fields exist on our models and what kind of data they expect.

**Analogy:** These are the librarian's tools – stamps, request forms, catalog lookup systems – tailored specifically for *our* library's blueprint.

You typically import and use it like this:

```typescript
// Example: Somewhere in our server code (e.g., an API route)
import { prisma } from '@/lib/prisma'; // Import the configured client

// --- Common Operations ---

// CREATE: Add a new project
// await prisma.project.create({ data: { /* project details */ } });

// READ (One): Find a specific project by its ID
// await prisma.project.findUnique({ where: { id: 'some-project-id' } });

// READ (Many): Find all projects for a user
// await prisma.project.findMany({ where: { userId: 'user-id' } });

// UPDATE: Change a project's name
// await prisma.project.update({
//   where: { id: 'some-project-id' },
//   data: { projectName: 'New Name' },
// });

// DELETE: Remove a project
// await prisma.project.delete({ where: { id: 'some-project-id' } });
```

**Explanation:**
*   We import the `prisma` client instance (we'll see how this is set up later).
*   We use methods like `prisma.project.create`, `prisma.project.findUnique`, etc. Notice how the model name (`project`) becomes part of the function call.
*   The `data`, `where`, and other options are JavaScript objects, making it feel natural to write these queries.

### 3. Prisma Migrate

This is a command-line tool (`prisma migrate dev`) used during development. Whenever you change your `schema.prisma` file (e.g., add a new field like `dueDate` to the `Project` model), you run this command.

**Analogy:** This is the process the librarian follows when you need to add new shelves or relabel existing sections.

`prisma migrate dev` automatically:
1.  Compares your `schema.prisma` file to the actual database structure.
2.  Generates the necessary SQL commands (like `ALTER TABLE`, `CREATE TABLE`) to update the database to match the schema.
3.  Applies these changes to your development database.
4.  Saves the changes as a "migration file" so you can apply the same changes reliably to your production database later.

## How We Use Prisma: Saving and Finding Projects

Let's revisit the use case from [Chapter 6: API Endpoints (Next.js API Routes)](06_api_endpoints__next_js_api_routes_.md): Creating a new project when a user clicks "Create & Generate Plan" and sends a request to `/api/plans/initiate`.

### Saving a New Project

The API route code uses Prisma Client to save the data:

```typescript
// File: app/api/plans/initiate/route.ts (Focus on Prisma)
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Our Prisma Client instance
// ... other imports like AI service, auth ...

export async function POST(request: Request) {
  // ... (Authentication check happens here - Chapter 1) ...
  const userId = /* ... get user ID from session ... */;

  try {
    const { projectName, projectDescription } = await request.json();
    // ... (AI calls happen here - Chapter 3) ...
    const initialPlanContent = /* ... AI result ... */;
    const researchData = /* ... AI result ... */;

    // *** Use Prisma Client to CREATE the Project and initial Plan ***
    const newProject = await prisma.project.create({
      data: {
        // Fields for the Project model
        projectName: projectName,
        projectDescription: projectDescription,
        userId: userId, // Link to the logged-in user
        // Nested write: Create the first Plan related to this Project
        plans: {
          create: {
            versionNumber: 1,
            planType: 'INITIAL', // Using Prisma Enum type
            planContent: JSON.stringify(initialPlanContent),
            researchData: researchData as any, // Store research JSON
          },
        },
      },
      include: { // Also fetch the created plans in the response
        plans: true,
      }
    });
    // *** End of Prisma interaction ***

    // Send the newly created project data back to the browser
    return NextResponse.json(newProject, { status: 201 });

  } catch (error) {
    // ... error handling ...
  }
}
```

**Explanation:**
*   We import `prisma` from `lib/prisma.ts`.
*   Inside `prisma.project.create({ data: { ... } })`, we provide the values for the new project, matching the fields defined in our `schema.prisma` (`projectName`, `projectDescription`, `userId`).
*   Prisma is smart! We can even create the related initial `Plan` record at the same time using the `plans: { create: { ... } }` syntax (a "nested write").
*   Prisma Client takes this JavaScript object, generates the correct SQL `INSERT` commands for both the `Project` and `Plan` tables (including linking them correctly), sends them to the PostgreSQL database, and returns the newly created project data (including the nested plan, thanks to `include`).

### Finding a Project

When you navigate to view a specific project, the frontend might request data from an endpoint like `GET /api/plans/[id]`. The backend code for that endpoint uses Prisma to find the project:

```typescript
// File: app/api/plans/[id]/route.ts (Simplified GET handler)
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// ... other imports ...

export async function GET(
  request: Request,
  { params }: { params: { id: string } } // Get project ID from URL
) {
  const projectId = params.id;
  const userId = /* ... get user ID from session ... */;

  try {
    // *** Use Prisma Client to FIND a specific Project ***
    const project = await prisma.project.findUnique({
      where: {
        id: projectId, // Find the project with this specific ID
        // Security: Ensure the project belongs to the logged-in user
        userId: userId,
      },
      include: { // Also fetch related data
        // Get the latest plan version for this project
        plans: {
          orderBy: { versionNumber: 'desc' },
          take: 1, // Only fetch the latest one
        },
      },
    });
    // *** End of Prisma interaction ***

    if (!project) {
      return NextResponse.json({ message: 'Project not found or access denied' }, { status: 404 });
    }

    // Send the found project data back to the browser
    return NextResponse.json(project);

  } catch (error) {
    // ... error handling ...
  }
}
```

**Explanation:**
*   We use `prisma.project.findUnique({ where: { ... } })` to find a single project based on its `id`.
*   We add `userId: userId` to the `where` clause as a crucial security check, ensuring users can only fetch *their own* projects.
*   The `include` option allows us to fetch related data easily. Here, we fetch the latest related `Plan` by ordering by `versionNumber` descending and taking only `1`.
*   Prisma Client generates the appropriate SQL `SELECT` command with the necessary `WHERE` clause and `JOIN` (to get plan data), executes it, and returns the found project (or `null` if not found/access denied).

## Under the Hood

How does `prisma.project.create(...)` actually work?

1.  **API Call:** Your API Route code calls the `prisma.project.create` function with the project data object.
2.  **Query Generation:** The Prisma Client library (running on the server) analyzes your request and generates the appropriate SQL `INSERT INTO "Project" (...) VALUES (...) RETURNING *;` command(s), making sure the values match the database column types. If there's a nested write (like creating a `Plan`), it generates multiple linked SQL commands.
3.  **Database Connection:** Prisma Client uses the connection details from `schema.prisma` to send the generated SQL command(s) to the PostgreSQL database server.
4.  **Database Execution:** The PostgreSQL database receives the SQL, executes it (inserting the new row(s)), and sends back the result (e.g., the newly created row data).
5.  **Result Mapping:** Prisma Client receives the raw result from the database and maps it back into a nice JavaScript object that matches the structure you expect, based on your `include` options.
6.  **Return Value:** Prisma Client returns the resulting JavaScript object to your API Route code.

**Sequence Diagram (Creating a Project):**

```mermaid
sequenceDiagram
    participant API as API Route (/api/plans/initiate)
    participant PC as Prisma Client (Node.js Library)
    participant DB as PostgreSQL Database

    API->>PC: prisma.project.create({ data: { name: 'My Blog', ... } })
    PC->>PC: Generate SQL INSERT command(s)
    PC->>DB: Execute SQL INSERT INTO "Project" ...; INSERT INTO "Plan" ...;
    DB->>DB: Store data in tables
    DB-->>PC: Return success & new data
    PC->>PC: Map DB result to JavaScript object
    PC-->>API: Return newProject object
```

### Setting up the Client

Where does the `prisma` object we import come from? It's typically initialized in a dedicated file.

```typescript
// File: lib/prisma.ts (or prisma/client.ts)

import { PrismaClient } from '@prisma/client';

// Declare a global variable to hold the instance (prevents multiple instances in dev)
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Initialize PrismaClient, reusing global instance if it exists
export const prisma =
  global.prisma ||
  new PrismaClient({
    // Optional: Enable logging to see SQL queries Prisma generates
    // log: ['query'],
  });

// In development, assign the instance to the global variable
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
```

**Explanation:**
*   This code creates a single, reusable instance of `PrismaClient`.
*   The `global` variable trick is often used in Next.js development to prevent creating many database connections during code reloads.
*   We then `export const prisma` so other files (like our API routes) can import and use it.

## Conclusion

Prisma acts as the essential librarian for our Web-Planner-AI application's data stored in PostgreSQL. It simplifies database interactions immensely by providing:

1.  A clear **Schema** definition (`schema.prisma`) for our data structure.
2.  A type-safe **Prisma Client** to easily create, read, update, and delete data using JavaScript objects instead of raw SQL.
3.  A **Migration** tool (`prisma migrate dev`) to manage database schema changes safely.

By using Prisma (our ORM), we can write cleaner, safer, and more maintainable backend code for handling all user, project, and plan information. It translates our simple JavaScript function calls into the complex SQL needed to interact with the database.

Now that we understand how core data is managed, how can we keep track of important events happening within the application, like when a user creates a plan or exports a PDF?

**Next Up:** We'll explore how we record these actions in [Chapter 8: Activity Logging](08_activity_logging.md), which also relies on Prisma to store the log data!

---

Generated by [AI Codebase Knowledge Builder](https://github.com/The-Pocket/Tutorial-Codebase-Knowledge)