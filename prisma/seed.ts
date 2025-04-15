import { PrismaClient, PromptCategory, PromptStatus } from '@prisma/client';
import { hash } from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Define the directory containing the prompt text files relative to the project root
const promptsDir = path.join(process.cwd(), 'prompts'); // Use process.cwd() and correct relative path

async function main() {
  console.log(`Start seeding ...`);

  // --- Upsert Admin User --- 
  const hashedPassword = await hash('admin123', 10);
  const existingAdminUser = await prisma.user.findUnique({
    where: {
      email: 'admin@webplanner.com',
    },
  });
  if (existingAdminUser) {
    // Re-hash the password
    const newHashedPassword = await hash('admin123', 10);

    // Update the existing admin user's password and role to ADMIN
    const updatedAdminUser = await prisma.user.update({
      where: {
        email: 'admin@webplanner.com',
      },
      data: {
        password: newHashedPassword,
        role: 'ADMIN',
      },
    });
    console.log('Admin user updated: admin@webplanner.com');
  } else {
    await prisma.user.create({
      data: {
        email: 'admin@webplanner.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
        adminSettings: {
          create: {
            settings: {
              theme: 'dark',
              notifications: true,
              language: 'en'
            }
          }
        }
      }
    });
    console.log('Admin user created: admin@webplanner.com');
  }

  // --- Seed Core Prompts Explicitly ---
  console.log('Seeding Core Prompts...');
  try {
    // 1. Deep Research Prompt (Inline from ai-service.ts)
    const deepResearchPromptTemplate = `
You are a highly skilled research assistant and information synthesis expert. Your task is to conduct thorough research based on the user's website idea description below and provide a structured summary of your findings.

**Website Idea Description:**
{{projectDescription}}

Conduct research to gather the following information:

1.  **Target Audience:** Identify the target audience for the website, including their demographics, interests, online behavior, and needs. Where are they online?
2.  **Competitor Analysis:** Analyze the top 3-5 competitors in the same industry or niche. Identify their strengths, weaknesses, key features, pricing strategies, and SEO tactics. What features or attributes do all the successful competitors have?
3.  **Keywords and SEO:** Identify relevant keywords and search terms that the target audience is likely to use when searching for websites like this. What keywords do top ranking competitors target?
4.  **Technology Trends:** Research current technology trends and best practices for building websites in this industry or niche. Which frameworks, CMS's, or libraries are trending?
5.  **API and Service Integrations:** Identify any relevant APIs or third-party services that could be integrated into the website to enhance its functionality.
6.  **Unique Value Proposition:** Synthesize a compelling unique value proposition. How can this site be both better and different than competitors?
7.  **Monetization Strategy:** Research potential monetization avenues.

Provide your findings in a structured JSON format for easy parsing, including the specific competitors mentioned. Ensure all fields in the JSON are populated.

**Example JSON Response:**
${JSON.stringify({ "targetAudience": { "description": "...", "onlineBehavior": "...", "needs": "..." }, "competitorAnalysis": [{ "name": "...", "features": ["..."], "strengths": ["..."], "weaknesses": ["..."], "targetAudience": "..." }], "technologyTrends": ["...", "..."], "uniqueValueProposition": "...", "monetizationStrategies": ["...", "..."] }, null, 2)}

`;
    await prisma.prompt.upsert({
      where: { category_name: { category: PromptCategory.GENERAL, name: 'Deep Research' } },
      update: { template: deepResearchPromptTemplate, variables: ['projectDescription'], status: PromptStatus.ACTIVE, description: "Generates structured research data based on project description." },
      create: {
        name: 'Deep Research',
        category: PromptCategory.GENERAL,
        description: "Generates structured research data based on project description.",
        template: deepResearchPromptTemplate,
        variables: ['projectDescription'],
        status: PromptStatus.ACTIVE,
      },
    });
    console.log("Upserted prompt: Deep Research");

    // 2. Initial Plan Generation (From file)
    const initialPlanPath = path.join(promptsDir, 'generateInitialPlanInstructions.txt');
    console.log("Attempting to read initial plan from:", initialPlanPath); // Log the path
    const initialPlanTemplate = fs.readFileSync(initialPlanPath, 'utf-8');
    await prisma.prompt.upsert({
      where: { category_name: { category: PromptCategory.PLAN_GENERATION, name: 'Initial Plan Generation' } }, // Use direct enum
      update: { template: initialPlanTemplate, variables: ['projectDescription', 'researchData'], status: PromptStatus.ACTIVE, description: "Generates the first draft of the web plan." },
      create: {
        name: 'Initial Plan Generation',
        category: PromptCategory.PLAN_GENERATION,
        description: "Generates the first draft of the web plan.",
        template: initialPlanTemplate,
        variables: ['projectDescription', 'researchData'],
        status: PromptStatus.ACTIVE,
      },
    });
    console.log("Upserted prompt: Initial Plan Generation");

    // 3. Refined Plan Generation (From file)
    const refinedPlanPath = path.join(promptsDir, 'generateRefinedPlanInstructions.txt');
    console.log("Attempting to read refined plan from:", refinedPlanPath); // Log the path
    const refinedPlanTemplate = fs.readFileSync(refinedPlanPath, 'utf-8');
    await prisma.prompt.upsert({
      where: { category_name: { category: PromptCategory.PLAN_REFINEMENT, name: 'Refined Plan Generation' } }, // Use direct enum
      update: { template: refinedPlanTemplate, variables: ['projectDescription', 'previousPlanVersionContent', 'userWrittenFeedback', 'selectedSuggestionIds', 'researchData'], status: PromptStatus.ACTIVE, description: "Refines an existing plan based on user feedback." },
      create: {
        name: 'Refined Plan Generation',
        category: PromptCategory.PLAN_REFINEMENT,
        description: "Refines an existing plan based on user feedback.",
        template: refinedPlanTemplate,
        variables: ['projectDescription', 'previousPlanVersionContent', 'userWrittenFeedback', 'selectedSuggestionIds', 'researchData'],
        status: PromptStatus.ACTIVE,
      },
    });
    console.log("Upserted prompt: Refined Plan Generation");

    // 4. Implementation Prompts Generation (Inline from ai-service.ts)
    const implementationPromptTemplate = `
Based on the comprehensive website plan provided below, generate a structured set of implementation prompts suitable for a large language model acting as a coding assistant (like Claude, GPT-4, Gemini, or Cursor IDE's AI features). The goal is to break down the plan into actionable coding tasks.

**Website Plan:**
{{planContentText}}

**Instructions:**

1.  **Analyze the Plan:** Carefully read through the entire plan, including sections like Technology Stack, Site Architecture, User Flows, Admin Features, Database Schema, API Endpoints, etc.
2.  **Categorize Prompts:** Group the generated prompts into logical categories: 'frontend', 'backend', 'database', 'deployment', 'general'.
3.  **Create Actionable Prompts:** For each logical component or feature identified in the plan, formulate a clear and specific prompt that instructs the AI on what code to generate or what task to perform.
    *   Prompts should be detailed enough for the AI to understand the requirements (e.g., specify language, framework, library, component name, functionality, data fields, etc.).
    *   Refer back to specific sections of the plan within the prompts where relevant (e.g., "Implement the user authentication endpoints as described in the API Endpoints section...").
    *   Ensure prompts cover file creation, code generation, configuration, schema definition, etc.
4.  **Output Format:** Provide the output as a single JSON object with keys corresponding to the categories ('frontend', 'backend', 'database', 'deployment', 'general'). Each key should have an array of strings as its value, where each string is a distinct implementation prompt.

**Example Output Structure:**
${JSON.stringify({ "frontend": { "description": "...", "onlineBehavior": "...", "needs": "..." }, "backend": { "name": "...", "features": ["..."], "strengths": ["..."], "weaknesses": ["..."], "targetAudience": "..." }, "technologyTrends": ["...", "..."], "uniqueValueProposition": "...", "monetizationStrategies": ["...", "..."] }, null, 2)}

Generate the JSON object containing the implementation prompts based *only* on the provided **Website Plan**.
`;
    await prisma.prompt.upsert({
      where: { category_name: { category: PromptCategory.GENERAL, name: 'Implementation Prompts Generation' } },
      update: { template: implementationPromptTemplate, variables: ['planContentText'], status: PromptStatus.ACTIVE, description: "Generates coding prompts based on the final plan." },
      create: {
        name: 'Implementation Prompts Generation',
        category: PromptCategory.GENERAL,
        description: "Generates coding prompts based on the final plan.",
        template: implementationPromptTemplate,
        variables: ['planContentText'],
        status: PromptStatus.ACTIVE,
      },
    });
    console.log("Upserted prompt: Implementation Prompts Generation");

    // --- Add other prompts as needed ---
    // e.g., One-Shot prompt (might need separate category or GENERAL)
    const oneShotPath = path.join(promptsDir, 'generateOneShotPromptInstructions.txt');
    console.log("Attempting to read one-shot plan from:", oneShotPath); // Log the path
    const oneShotTemplate = fs.readFileSync(oneShotPath, 'utf-8');
    await prisma.prompt.upsert({
      where: { category_name: { category: PromptCategory.GENERAL, name: 'One-Shot Generation' } }, // Use direct enum
      update: { template: oneShotTemplate, variables: ['projectDescription', 'researchDataString', 'planText', 'codeEditor', 'databaseInfo', 'userProfile', 'implementationPrompts'], status: PromptStatus.ACTIVE, description: "Generates a single large prompt for AI coding tools." },
      create: {
        name: 'One-Shot Generation',
        category: PromptCategory.GENERAL,
        description: "Generates a single large prompt for AI coding tools.",
        template: oneShotTemplate,
        variables: ['projectDescription', 'researchDataString', 'planText', 'codeEditor', 'databaseInfo', 'userProfile', 'implementationPrompts'],
        status: PromptStatus.ACTIVE,
      },
    });
    console.log("Upserted prompt: One-Shot Generation");

    // Refine One-Shot Prompt
    const refineOneShotPath = path.join(promptsDir, 'refineOneShotPromptInstructions.txt');
    console.log("Attempting to read refine one-shot plan from:", refineOneShotPath); // Log the path
    const refineOneShotTemplate = fs.readFileSync(refineOneShotPath, 'utf-8');
    await prisma.prompt.upsert({
      where: { category_name: { category: PromptCategory.GENERAL, name: 'Refine One-Shot Prompt' } }, // Use direct enum
      update: { template: refineOneShotTemplate, variables: ['existingOneShotPrompt', 'userFeedback', 'codeEditor'], status: PromptStatus.ACTIVE, description: "Refines the one-shot prompt based on user feedback." },
      create: {
        name: 'Refine One-Shot Prompt',
        category: PromptCategory.GENERAL, // Use direct enum
        description: "Refines the one-shot prompt based on user feedback.",
        template: refineOneShotTemplate,
        variables: ['existingOneShotPrompt', 'userFeedback', 'codeEditor'],
        status: PromptStatus.ACTIVE, // Use direct enum
      },
    });
    console.log("Upserted prompt: Refine One-Shot Prompt");

    console.log("Finished seeding prompts."); // Added completion log

  } catch (error) {
    console.error("Error seeding prompts:", error);
  }

  // --- Seed AI Providers and Models ---
  console.log('Seeding AI Providers and Models...');
  try {
    const openAI = await prisma.aIProvider.upsert({
      where: { name: 'OpenAI' },
      update: { apiKeyEnvVarName: 'OPENAI_API_KEY' },
      create: {
        name: 'OpenAI',
        apiKeyEnvVarName: 'OPENAI_API_KEY',
      },
    });
    console.log(`Created/Updated AI Provider: ${openAI.name}`);

    const gpt4Turbo = await prisma.aIModel.upsert({
      where: { providerId_modelName: { providerId: openAI.id, modelName: 'gpt-4-turbo' } },
      update: { description: 'Latest GPT-4 model with improved instruction following, JSON mode, reproducible outputs, parallel function calling, and more. Context window: 128k tokens.', inputCost: 0.01, outputCost: 0.03, contextWindow: 128000 },
      create: {
        providerId: openAI.id,
        modelName: 'gpt-4-turbo',
        description: 'Latest GPT-4 model with improved instruction following, JSON mode, reproducible outputs, parallel function calling, and more. Context window: 128k tokens.',
        inputCost: 0.01,
        outputCost: 0.03,
        contextWindow: 128000,
      },
    });
    console.log(`Upserted model: ${gpt4Turbo.modelName}`);

    // Add other OpenAI models
    const gpt35Turbo = await prisma.aIModel.upsert({
      where: { providerId_modelName: { providerId: openAI.id, modelName: 'gpt-3.5-turbo-0125' } },
      update: { description: 'Most capable GPT-3.5 Turbo model and optimized for chat at 1/10th the cost of gpt-3.5-turbo. Context window: 16k tokens.', inputCost: 0.0005, outputCost: 0.0015, contextWindow: 16385 },
      create: {
        providerId: openAI.id,
        modelName: 'gpt-3.5-turbo-0125',
        description: 'Most capable GPT-3.5 Turbo model and optimized for chat at 1/10th the cost of gpt-3.5-turbo. Context window: 16k tokens.',
        inputCost: 0.0005,
        outputCost: 0.0015,
        contextWindow: 16385,
      },
    });
    console.log(`Upserted model: ${gpt35Turbo.modelName}`);

    // Example for Google Gemini (add API Key Env Var if needed)
    const google = await prisma.aIProvider.upsert({
      where: { name: 'Google' },
      update: { apiKeyEnvVarName: 'GOOGLE_API_KEY' }, // Add if you have a separate key
      create: {
        name: 'Google',
        apiKeyEnvVarName: 'GOOGLE_API_KEY', // Add if you have a separate key
      },
    });
    console.log(`Created/Updated AI Provider: ${google.name}`);

    const geminiPro = await prisma.aIModel.upsert({
      where: { providerId_modelName: { providerId: google.id, modelName: 'gemini-1.5-pro-latest' } },
      update: { description: 'Googles latest best model. Multimodal model that can handle text, image, audio, and video input. 1M Context Window.', contextWindow: 1048576 },
      create: {
        providerId: google.id,
        modelName: 'gemini-1.5-pro-latest',
        description: 'Googles latest best model. Multimodal model that can handle text, image, audio, and video input. 1M Context Window.',
        contextWindow: 1048576, // Example context window
      },
    });
    console.log(`Upserted model: ${geminiPro.modelName}`);

  } catch (error) {
    console.error('Error seeding AI providers/models:', error);
  }

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
