import OpenAI from 'openai';
import { Plan } from '@prisma/client'; // Use correct Plan type, remove PlanVersion
import { PlanContent, ResearchData, ImplementationPrompts } from '@/lib/types'; // Import all types
import { v4 as uuidv4 } from 'uuid';

// Log the API key presence before initializing
console.log(`[ai-service] Attempting to initialize OpenAI. API Key Present: ${!!process.env.OPENAI_API_KEY}`);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure OPENAI_API_KEY is set in your .env file
});

// Define expected structure for research data (adjust as needed)
// interface ResearchData { ... } // Already defined in types.ts

// Define expected structure for plan content (adjust as needed)
// interface PlanContent { ... } // Already defined in types.ts

/**
 * Performs deep research using an AI model based on the project description.
 * @param projectDescription - The user's description of the website idea.
 * @returns Structured research data.
 */
export async function performDeepResearch(projectDescription: string): Promise<ResearchData | null> {
  console.log("Performing deep research for:", projectDescription.substring(0, 50) + "...");
  const prompt = `
You are a highly skilled research assistant and information synthesis expert. Your task is to conduct thorough research based on the user's website idea description below and provide a structured summary of your findings.

**Website Idea Description:**
${projectDescription}

Conduct research to gather the following information:

1.  **Target Audience:** Identify the target audience for the website, including their demographics, interests, online behavior, and needs. Where are they online?
2.  **Competitor Analysis:** Analyze the top 3-5 competitors in the same industry or niche. Identify their strengths, weaknesses, key features, pricing strategies, and SEO tactics. What features or attributes do all the successful competitors have?
3.  **Keywords and SEO:** Identify relevant keywords and search terms that the target audience is likely to use when searching for websites like this. What keywords do top ranking competitors target?
4.  **Technology Trends:** Research current technology trends and best practices for building websites in this industry or niche. Which frameworks, CMS's, or libraries are trending?
5.  **API and Service Integrations:** Identify any relevant APIs or third-party services that could be integrated into the website to enhance its functionality.
6.  **Unique Value Proposition:** Synthesize a compelling unique value proposition. How can this site be both better and different than competitors?
7.  **Monetization Strategies:** Research potential monetization avenues.

Provide your findings in a structured JSON format for easy parsing, including the specific competitors mentioned. Ensure all fields in the JSON are populated.

**Example JSON Response:**
\`\`\`json
{
    "targetAudience": {
        "description": "...",
        "onlineBehavior": "...",
        "needs": "..."
    },
    "competitorAnalysis": [
        {
            "name": "...",
            "strengths": "...",
            "weaknesses": "...",
            "keyFeatures": "...",
            "seoTactics": "..."
        }
    ],
    "keywords": ["...", "..."],
    "technologyTrends": ["...", "..."],
    "apiIntegrations": ["...", "..."],
    "uniqueValueProposition": "...",
    "monetizationStrategies":["...", "..."]
}
\`\`\`
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo', // Use a model supporting JSON mode
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" }, // Use JSON mode if available
      max_tokens: 2500, // Adjust as needed
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("AI response content is empty.");
    }

    // Attempt to parse JSON
    let researchData: ResearchData;
    try {
        researchData = JSON.parse(responseContent) as ResearchData;
    } catch (parseError) {
        console.error("--- Error Parsing AI Response (Deep Research) ---");
        console.error("Raw Response Content:", responseContent); // Log raw content on parse failure
        console.error("Parse Error:", parseError);
        console.error("---------------------------------------------");
        throw new Error("Failed to parse AI response as JSON."); // Re-throw specific error
    }

    console.log("Deep research completed successfully.");
    // Add validation logic here if needed to ensure all fields are present
    return researchData;
  } catch (error: unknown) { // Type error as unknown
    console.error('--- Error During Deep Research ---');
    if (error instanceof OpenAI.APIError) {
      console.error('OpenAI API Error Status:', error.status);
      console.error('OpenAI API Error Type:', error.type);
      console.error('OpenAI API Error Code:', error.code);
      console.error('OpenAI API Error Message:', error.message);
    } else if (error instanceof Error) {
      // Catching specific JSON parse error from above or other generic errors
      console.error('Error Name:', error.name);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
    } else {
      console.error('Unknown Error Type:', error);
    }
    console.error('---------------------------------');
    return null; // Return null to indicate failure
  }
}

/**
 * Generates the initial website plan based on the description and research data.
 * @param projectDescription - The user's website description.
 * @param researchData - The structured data from performDeepResearch.
 * @returns The initial plan content including suggestions.
 */
export async function generateInitialPlan(
  projectDescription: string,
  researchData: ResearchData
): Promise<PlanContent | null> {
  console.log("Generating initial plan...");
  const prompt = `
You are an expert website architect and project planner. Your task is to generate a detailed initial plan for a new website based on the user's description and the provided research data. Include a list of actionable feature suggestions based on the research.

**User-Provided Website Description:**
${projectDescription}

**Research Data:**
\`\`\`json
${JSON.stringify(researchData, null, 2)}
\`\`\`

Based on the information above, generate a detailed initial website plan. The plan should include:

1.  **Executive Summary:** A concise overview of the website's purpose, target audience, and unique value proposition (based on the research).
2.  **Goals:** SMART goals for the website.
3.  **Target Audience:** Detailed description (based on research).
4.  **Core Features:** A list of essential features derived directly from the user description and core competitor features.
5.  **Technology Stack:** Recommended technologies (frameworks, languages, DB, hosting, APIs) with justifications based on requirements, trends, and research.
6.  **Site Architecture Diagram:** **IMPORTANT:** Generate a visual representation of the site structure using **Mermaid syntax** (specifically, a top-down graph: graph TD). Show the main pages/sections and their relationships. The output for this section **MUST START WITH graph TD and contain ONLY the Mermaid code block itself**, no surrounding text or Markdown headers.
7.  **User Flow Diagram:** **IMPORTANT:** If applicable based on the project description, generate a simple user flow diagram using **Mermaid syntax** (specifically, a flowchart: graph LR or flowchart LR). Show key steps a user might take. The output for this section **MUST START WITH graph LR or flowchart LR and contain ONLY the Mermaid code block itself**. If not applicable, omit this section or leave its content empty.
8.  **Database Schema Diagram:** **IMPORTANT:** If applicable based on the project description and features, generate a high-level database schema diagram using **Mermaid syntax** (specifically, an entity relationship diagram: erDiagram). Show main entities and their relationships. The output for this section **MUST START WITH erDiagram and contain ONLY the Mermaid code block itself**. If not applicable, omit this section or leave its content empty.
9.  **Mind Map Diagram:** **IMPORTANT:** If applicable based on the project description, generate a mind map summarizing key concepts or features using **Mermaid syntax** (specifically, mindmap). The output for this section **MUST START WITH mindmap and contain ONLY the Mermaid code block itself**. If not applicable, omit this section or leave its content empty.
10. **SEO Considerations:** Basic strategy (keywords, sitemap, technical requirements) based on research. // Renumbered
11. **Monetization Strategy:** Suggested strategies based on research. // Renumbered

Additionally, provide a separate list of **Actionable Feature Suggestions** derived from the competitor analysis, technology trends, and API integrations found in the research. Rank these suggestions by potential impact or importance. Each suggestion should have a unique ID (e.g., "sugg-001"), text, justification, and rank.

Output ONLY a valid JSON object with two keys: "planText" (containing the structured plan as a single Markdown string) and "suggestions" (an array of suggestion objects, each including 'id', 'text', 'justification', 'rank', and 'selected: false').

**Example JSON Output:**
\`\`\`json
{
  "planText": "# Executive Summary\\n...\\n\\n# Goals\\n...",
  "suggestions": [
    { "id": "sugg-001", "text": "Implement user profiles", "justification": "Common feature among competitors X and Y.", "rank": 1, "selected": false },
    { "id": "sugg-002", "text": "Integrate with Stripe API for payments", "justification": "Supports suggested monetization strategy.", "rank": 2, "selected": false }
  ]
}
\`\`\`
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo', // Use a model supporting JSON mode
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 3000, // Adjust as needed
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("AI response content is empty for initial plan.");
    }

    let planData: PlanContent;
    try {
        planData = JSON.parse(responseContent) as PlanContent;
    } catch (parseError) {
        console.error("--- Error Parsing AI Response (Initial Plan) ---");
        console.error("Raw Response Content:", responseContent);
        console.error("Parse Error:", parseError);
        console.error("---------------------------------------------");
        throw new Error("Failed to parse AI response for initial plan as JSON.");
    }

    console.log("Initial plan generated successfully.");
    // Add validation for planData structure if needed
    return planData;
  } catch (error: unknown) {
    console.error('--- Error Generating Initial Plan ---');
     if (error instanceof OpenAI.APIError) {
      console.error('OpenAI API Error Status:', error.status);
      console.error('OpenAI API Error Type:', error.type);
      console.error('OpenAI API Error Code:', error.code);
      console.error('OpenAI API Error Message:', error.message);
    } else if (error instanceof Error) {
      console.error('Error Name:', error.name);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
    } else {
      console.error('Unknown Error Type:', error);
    }
    console.error('------------------------------------');
    return null;
  }
}

/**
 * Generates a refined website plan based on feedback and previous version.
 * @param projectDescription - Original project description.
 * @param previousPlanVersionContent - The JSON content of the previous plan version.
 * @param userWrittenFeedback - Text feedback from the user.
 * @param selectedSuggestionIds - Array of IDs of suggestions selected by the user.
 * @param researchData - Original research data.
 * @returns The refined plan content including potentially updated suggestions.
 */
export async function generateRefinedPlan(
  projectDescription: string,
  previousPlanVersionContent: PlanContent, // Assuming PlanContent structure
  userWrittenFeedback: string,
  selectedSuggestionIds: string[],
  researchData: ResearchData
): Promise<string | null> { // Changed return type to string | null
  console.log("Generating refined plan...");

  // Mark selected suggestions in the previous content
  // FIX: Add fallback to empty array in case suggestions property is missing
  const previousSuggestions = (previousPlanVersionContent.suggestions || []).map(s => ({
    ...s,
    selected: selectedSuggestionIds.includes(s.id)
  }));

  const prompt = `
**System Message:** You are an expert web development consultant. Your task is to refine an existing website plan based on user feedback and selected suggestions, ensuring the output is a valid JSON object.

**Context:**

**User-Provided Website Description:**
${projectDescription}

**Research Data:**
\`\`\`json
${JSON.stringify(researchData, null, 2)}
\`\`\`

**Previous Website Plan (including suggestions):**
\`\`\`json
${JSON.stringify({ ...previousPlanVersionContent, suggestions: previousSuggestions }, null, 2)}
\`\`\`
*Note: The 'selected: true' flag in the suggestions above indicates features the user explicitly wants to include.*

**User's Written Feedback:**
${userWrittenFeedback || "No written feedback provided."}

**Task:**
Generate a **new, refined website plan** by performing the following steps:

1.  **Integrate Written Feedback:** Carefully review the "User's Written Feedback" and modify the "Previous Website Plan" text accordingly. Address the user's comments and requested changes.
2.  **Incorporate Selected Suggestions:** Identify all suggestions in the "Previous Website Plan" JSON where \`"selected": true\`. **Rewrite the relevant sections of the plan text (e.g., Core Features, Technology Stack) to explicitly include these selected features.** Do NOT simply list them; integrate them naturally into the plan description.
 3.  **Generate NEW Suggestions:** Based *specifically* on the **User Feedback** provided, generate a list of 1-3 NEW, actionable, and creative feature or improvement suggestions that were *not* covered by the user's explicit feedback or selected items but are relevant to addressing the underlying goals implied by the feedback. For each NEW suggestion, provide a brief justification.
 4.  **Maintain Structure & Context:** Ensure the refined plan retains the original structure (Executive Summary, Goals, etc.) and remains consistent with the "User-Provided Website Description" and "Research Data".
  5.  **Handle Diagram Sections (Mermaid):**
     *   Identify sections in the "Previous Website Plan" with titles like **'Site Architecture Diagram', 'User Flow Diagram', 'Database Schema Diagram', 'Mind Map Diagram'**.
     *   For each such section, **preserve the existing Mermaid syntax** unless the user's feedback specifically requests changes to that particular diagram/structure. The content MUST remain ONLY valid Mermaid code starting with the appropriate declaration (e.g., graph TD, erDiagram, mindmap).
     *   If feedback *does* require changes to a specific diagram section, **regenerate the appropriate Mermaid syntax** for that section (e.g., graph TD for Site Architecture Diagram, graph LR/flowchart LR for User Flow Diagram, erDiagram for Database Schema Diagram, mindmap for Mind Map Diagram) to reflect the changes.
     *   The output for any diagram section **MUST START with the correct declaration and contain ONLY the Mermaid code block itself**, without surrounding text or Markdown headers within the section content.

**Output Format:**
Output ONLY a valid JSON object with two keys:
- \`"planText"\`: A string containing the complete, refined plan in Markdown format. This text **must** now include the features from the selected suggestions.
- \`"suggestions"\`: An array of *new* suggestion objects generated during refinement (or an empty array \`[]\`). Each suggestion object should have \`id\` (UUID), \`title\` (string), \`description\` (string), \`category\` (string, e.g., 'UI/UX', 'Functionality', 'Monetization'), and \`selected\` (boolean, always false for new suggestions).

**Example JSON Output:**
\`\`\`json
{
  "planText": "# Executive Summary\\n...\\n\\n# Goals\\n...",
  "suggestions": [
    { "id": "new-sugg-001", "title": "Implement gamification", "description": "To increase user engagement.", "category": "Functionality", "selected": false },
    { "id": "new-sugg-002", "title": "Integrate with social media", "description": "To enhance user sharing capabilities.", "category": "UI/UX", "selected": false }
  ]
}
\`\`\`
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo', // Use a model supporting JSON mode
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 3500, // Adjust as needed
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("AI response content is empty for refined plan.");
    }

    console.log('[ai-service - generateRefinedPlan] Raw AI Response:\n', responseContent);

    // Use the improved parser
    const refinedPlanData = parseAIResponse(responseContent);

    if (!refinedPlanData) { // Check if parsing failed
      console.error("[ai-service - generateRefinedPlan] Failed to parse AI response after attempting direct and code block parsing.");
      return null; // Explicitly return null if parsing fails
    }

    // DEBUG: Log parsed data on success
    console.log("[ai-service - generateRefinedPlan] Successfully parsed AI response."); 

    // If parsing was successful (refinedPlanData is not null)
    console.log('[ai-service - generateRefinedPlan] AI refinement completed successfully. Returning stringified JSON.');

    // Ensure suggestions have unique IDs if they don't already
    const finalPlanData = ensureUniqueSuggestionIds(refinedPlanData);

    // FIX: Return the stringified version of the PARSED and potentially modified data
    return JSON.stringify(finalPlanData);

  } catch (error: any) { // Catch errors from OpenAI API call itself
    console.error("--- Error Calling OpenAI API (Refined Plan) ---");
    console.error("Full OpenAI Error:", error); // Log the entire error object
    if (error.response) {
      console.error("OpenAI API Status:", error.response.status);
      console.error("OpenAI API Headers:", JSON.stringify(error.response.headers));
      console.error("OpenAI API Data:", JSON.stringify(error.response.data));
    }
    return null;
  }
}

/**
 * Parses the AI response, attempting to handle JSON directly or extract from code blocks.
 * @param responseContent Raw content string from AI.
 * @returns Parsed PlanContent object or null if parsing fails.
 */
const parseAIResponse = (responseContent: string): PlanContent | null => {
  console.log("[ai-service - parseAIResponse] Attempting to parse AI response.");
  if (!responseContent) {
    console.error("[ai-service - parseAIResponse] Error: Received empty response content.");
    return null;
  }

  try {
    // First, try direct JSON parsing
    const parsed = JSON.parse(responseContent) as PlanContent;
    console.log("[ai-service - parseAIResponse] Successfully parsed response directly as JSON.");
    return parsed;
  } catch (e) {
    console.warn("[ai-service - parseAIResponse] Direct JSON parsing failed. Attempting to extract from code block...");
    // If direct parsing fails, try extracting from markdown code block
    const match = responseContent.match(/```(?:json)?\n([\s\S]*?)\n```/);
    if (match && match[1]) {
      try {
        const parsedFromBlock = JSON.parse(match[1]) as PlanContent;
        console.log("[ai-service - parseAIResponse] Successfully parsed JSON extracted from code block.");
        return parsedFromBlock;
      } catch (parseError) {
        console.error("--- Error Parsing AI Response (Refined Plan - Code Block) ---");
        console.error("Extracted Content:", match[1]);
        console.error("Parse Error:", parseError);
        return null; // Correct: return null on inner parse error
      }
    } else {
      console.error("--- Error Parsing AI Response (Refined Plan - No JSON Found) ---");
      console.error("Raw Response Content:", responseContent);
      console.error("Original Parse Error:", e);
      return null; // FIX: Explicitly return null if no JSON found
    }
  }
};

/**
 * Ensures that all suggestions in the plan content have unique IDs.
 * @param planContent The plan content to process.
 * @returns The plan content with unique suggestion IDs.
 */
const ensureUniqueSuggestionIds = (planContent: PlanContent): PlanContent => {
  if (!planContent.suggestions) {
    return planContent;
  }

  const existingIds = new Set<string>();
  const updatedSuggestions = planContent.suggestions.map(suggestion => {
    if (!suggestion.id || existingIds.has(suggestion.id)) {
      let newId: string;
      do {
        newId = uuidv4();
      } while (existingIds.has(newId)); // Ensure the new ID is also unique
      existingIds.add(newId);
      return { ...suggestion, id: newId };
    } else {
      existingIds.add(suggestion.id);
      return suggestion;
    }
  });

  return { ...planContent, suggestions: updatedSuggestions };
};

/**
 * Generates implementation prompts based on the final plan content.
 * @param planContentText - The main text content (planText) of the latest plan version.
 * @returns Structured prompts (e.g., { frontend: [], backend: [], database: [] }).
 */
export async function generateImplementationPrompts(
  planContentText: string
): Promise<ImplementationPrompts | null> {
  console.log("Generating implementation prompts...");
  const prompt = `
You are an expert software development assistant. Based on the provided website plan, generate a series of actionable implementation prompts categorized by Frontend, Backend, and Database tasks. Each prompt should have a clear title and detailed instructions.

**Website Plan:**
${planContentText}

Generate a JSON object where keys are categories ("frontend", "backend", "database") and values are arrays of prompt objects, each containing "title" and "promptText".

**Example JSON Output:**
\`\`\`json
{
  "frontend": [
    {
      "title": "Create User Profile Page UI",
      "promptText": "Using React and Tailwind CSS, create the UI components for the user profile page as described in the plan. Include fields for username, email, profile picture upload, and bio."
    }
  ],
  "backend": [
    {
      "title": "Implement User Authentication API",
      "promptText": "Create API endpoints for user registration, login, and session management using Node.js, Express, and bcrypt for password hashing. Store user data in the PostgreSQL database according to the schema."
    }
  ],
  "database": [
    {
      "title": "Define User Table Schema",
      "promptText": "Write the SQL or Prisma schema definition for the 'User' table, including columns for id, name, email (unique), password_hash, profile_picture_url, bio, createdAt, updatedAt."
    }
  ]
}
\`\`\`
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo', // Use a model supporting JSON mode
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 2000, // Adjust as needed
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("AI response content is empty for implementation prompts.");
    }

    let promptsData: ImplementationPrompts;
    try {
        promptsData = JSON.parse(responseContent) as ImplementationPrompts;
    } catch (parseError) {
        console.error("--- Error Parsing AI Response (Prompts) ---");
        console.error("Raw Response Content:", responseContent);
        console.error("Parse Error:", parseError);
        console.error("---------------------------------------------");
        throw new Error("Failed to parse AI response for prompts as JSON.");
    }

    console.log("Implementation prompts generated successfully.");
    // Add validation for promptsData structure if needed
    return promptsData;
  } catch (error: unknown) {
    console.error('--- Error Generating Implementation Prompts ---');
     if (error instanceof OpenAI.APIError) {
      console.error('OpenAI API Error Status:', error.status);
      console.error('OpenAI API Error Type:', error.type);
      console.error('OpenAI API Error Code:', error.code);
      console.error('OpenAI API Error Message:', error.message);
    } else if (error instanceof Error) {
      console.error('Error Name:', error.name);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
    } else {
      console.error('Unknown Error Type:', error);
    }
    console.error('--------------------------------------------');
    return null;
  }
}
