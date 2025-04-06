import OpenAI from 'openai';
import { Plan } from '@prisma/client'; // Use correct Plan type, remove PlanVersion
import { PlanContent, ResearchData, ImplementationPrompts } from '@/lib/types'; // Import all types
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

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
  
  // Define example JSON objects as constants to avoid template literal parsing issues
  const exampleResearchResponse = {
    "targetAudience": {
      "description": "...",
      "onlineBehavior": "...",
      "needs": "..."
    },
    "competitorAnalysis": [
      {
        "name": "...",
        "features": ["..."],
        "strengths": ["..."],
        "weaknesses": ["..."],
        "targetAudience": "..."
      }
      // More competitors would be here
    ],
    "technologyTrends": ["...", "..."],
    "uniqueValueProposition": "...",
    "monetizationStrategies": ["...", "..."]
  };

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
7.  **Monetization Strategy:** Research potential monetization avenues.

Provide your findings in a structured JSON format for easy parsing, including the specific competitors mentioned. Ensure all fields in the JSON are populated.

**Example JSON Response:**
${JSON.stringify(exampleResearchResponse, null, 2)}

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
 * Generates a comprehensive "One-Shot Prompt" for building the entire application.
 * @param projectDescription - The user's website description.
 * @param researchData - The structured data from performDeepResearch.
 * @param planText - The existing plan text.
 * @returns The generated One-Shot Prompt as a string.
 */
export async function generateOneShotPrompt(
  projectDescription: string,
  researchData: ResearchData,
  planText: string
): Promise<string | null> {
  console.log("Generating One-Shot Prompt...");

  // Load instructions from file
  const instructionsPath = path.join(process.cwd(), 'prompts', 'generateOneShotPromptInstructions.txt');
  let instructions = '';
  try {
    instructions = fs.readFileSync(instructionsPath, 'utf-8');
    // Replace placeholders in instructions
    instructions = instructions.replace('${projectDescription}', projectDescription);
    // Handle potential null researchData
    const researchDataString = researchData ? JSON.stringify(researchData, null, 2) : 'No research data provided.';
    instructions = instructions.replace('${researchDataString}', researchDataString);
    instructions = instructions.replace('${planText}', planText);
  } catch (error) {
    console.error("Could not load AI instructions for One-Shot Prompt:", error);
    return null;
  }

  const prompt = instructions; // Use loaded instructions as the prompt

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo', // Use a model supporting JSON mode
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000, // Adjust as needed
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("AI response content is empty for One-Shot Prompt.");
    }

    console.log("One-Shot Prompt generated successfully.");
    return responseContent;
  } catch (error: any) {
    console.error('--- Error Generating One-Shot Prompt ---');
    console.error("Full OpenAI Error:", error); // Log the entire error object
    if (error.response) {
      console.error("OpenAI API Status:", error.response.status);
      console.error("OpenAI API Headers:", JSON.stringify(error.response.headers));
      console.error("OpenAI API Data:", JSON.stringify(error.response.data));
    }
    return null;
  }
}


// --- One-Shot Prompt Functions ---

/**
 * Generates a comprehensive "One-Shot Prompt" for building the entire application
 * based on the refined plan, user choices, and profile.
 *
 * @param refinedPlan - The latest Plan object containing planContent, researchData, etc.
 * @param codeEditor - The target code editor (e.g., "vscode", "cursor").
 * @param databaseInfo - Information about the chosen database (e.g., type, schema details).
 * @param userProfile - Information about the user's coding preferences or history (TBD).
 * @param planContent - The main content of the plan.
 * @param researchData - The research data associated with the plan.
 * @param implementationPrompts - The generated implementation prompts.
 * @param codeEditor - The target code editor (e.g., "vscode", "cursor").
 * @param databaseInfo - Information about the chosen database (e.g., type, schema details).
 * @param userProfile - Information about the user's coding preferences or history (TBD).
 * @returns The generated One-Shot Prompt as a string, or null on failure.
 */
export async function generateOneShotPrompt_new( // Renamed to avoid conflict with existing function
  planContent: string | null,
  researchData: ResearchData | null,
  implementationPrompts: ImplementationPrompts | null,
  codeEditor: string,
  databaseInfo: any, // Define a proper type later
  userProfile: any // Define a proper type later
): Promise<string | null> {
  console.log(`Generating One-Shot Prompt for Editor: ${codeEditor}`);

  // 1. Use the provided data directly
  const currentPlanContent = planContent || '';

  // 2. Construct the detailed prompt for the AI
  //    - Combine initial plan, research, implementation prompts, db info, user profile.
  //    - Add specific instructions for structure, detail level, error handling, etc.
  //    - Tailor instructions based on the 'codeEditor' parameter.
  const detailedPrompt = `
    You are an expert AI programming assistant tasked with generating a single, comprehensive "One-Shot Prompt".
    This prompt, when given to an AI code editor (${codeEditor}), should enable it to build the entire web application described below.

    **Project Context:**
    - **Plan Content:** ${currentPlanContent}
    - **Research Data:** ${JSON.stringify(researchData, null, 2)}
    - **Implementation Prompts:** ${JSON.stringify(implementationPrompts, null, 2)}
    - **Database Info:** ${JSON.stringify(databaseInfo, null, 2)}
    - **User Profile/Preferences:** ${JSON.stringify(userProfile, null, 2)}
    - **Target Code Editor:** ${codeEditor}

    **Instructions for the One-Shot Prompt:**
    - Structure the prompt logically (Setup, DB, Backend, Frontend, APIs, Deployment, etc.).
    - Provide extremely detailed, step-by-step instructions for each part.
    - Include specific code snippets, examples, file names, and constraints where necessary.
    - Define API endpoints clearly (routes, methods, request/response formats).
    - Specify user flows and admin flows.
    - Detail error handling strategies.
    - Incorporate SEO considerations from the plan.
    - Include instructions for testing.
    - Adapt syntax and detail level for the target code editor: ${codeEditor}.
    - Ensure the final output is a single, coherent text prompt.

    Generate the One-Shot Prompt now.
  `;

  // 3. Call the AI model (e.g., OpenAI)
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo', // Or another powerful model
      messages: [{ role: 'user', content: detailedPrompt }],
      max_tokens: 4096, // Use max tokens possible, One-Shot prompts can be large
      temperature: 0.5, // Adjust temperature for creativity vs. precision
    });

    const oneShotPromptContent = completion.choices[0]?.message?.content;
    if (!oneShotPromptContent) {
      throw new Error("AI response content is empty for One-Shot Prompt generation.");
    }

    console.log("One-Shot Prompt generated successfully.");
    return oneShotPromptContent;

  } catch (error: unknown) {
    console.error('--- Error Generating One-Shot Prompt ---');
    // Log error details (similar to other functions)
    if (error instanceof OpenAI.APIError) {
      console.error('OpenAI API Error:', error.status, error.type, error.code, error.message);
    } else if (error instanceof Error) {
      console.error('Error:', error.name, error.message);
    } else {
      console.error('Unknown Error Type:', error);
    }
    return null;
  }
}

/**
 * Refines an existing One-Shot Prompt based on user feedback.
 *
 * @param existingOneShotPrompt - The current One-Shot Prompt text.
 * @param userFeedback - The feedback provided by the user.
 * @param codeEditor - The target code editor (might influence refinement).
 * @returns The refined One-Shot Prompt as a string, or null on failure.
 */
export async function refineOneShotPrompt(
  existingOneShotPrompt: string,
  userFeedback: string,
  codeEditor: string
): Promise<string | null> {
  console.log(`Refining One-Shot Prompt for Editor: ${codeEditor}`);

  // 1. Construct the prompt for the AI to refine the existing prompt
  const refinementPrompt = `
    You are an expert AI programming assistant. Your task is to refine the provided "One-Shot Prompt" based on the user's feedback.
    The target code editor is ${codeEditor}.

    **Existing One-Shot Prompt:**
    \`\`\`
    ${existingOneShotPrompt}
    \`\`\`

    **User Feedback:**
    \`\`\`
    ${userFeedback}
    \`\`\`

    **Instructions:**
    - Analyze the user feedback carefully.
    - Identify the specific areas in the existing prompt that need modification.
    - Modify the prompt to address the feedback accurately and comprehensively.
    - Maintain the structure and detail level appropriate for a One-Shot Prompt and the target editor (${codeEditor}).
    - Ensure the output is the complete, refined One-Shot Prompt text.

    Generate the refined One-Shot Prompt now.
  `;

  // 2. Call the AI model
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo', // Or another powerful model
      messages: [{ role: 'user', content: refinementPrompt }],
      max_tokens: 4096, // Allow ample tokens for refinement
      temperature: 0.5,
    });

    const refinedPromptContent = completion.choices[0]?.message?.content;
    if (!refinedPromptContent) {
      throw new Error("AI response content is empty for One-Shot Prompt refinement.");
    }

    console.log("One-Shot Prompt refined successfully.");
    return refinedPromptContent;

  } catch (error: unknown) {
    console.error('--- Error Refining One-Shot Prompt ---');
     // Log error details (similar to other functions)
    if (error instanceof OpenAI.APIError) {
      console.error('OpenAI API Error:', error.status, error.type, error.code, error.message);
    } else if (error instanceof Error) {
      console.error('Error:', error.name, error.message);
    } else {
      console.error('Unknown Error Type:', error);
    }
    return null;
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
  
  // Load instructions from file
  const instructionsPath = path.join(process.cwd(), 'prompts', 'generateInitialPlanInstructions.txt');
  let instructions = '';
  try {
    instructions = fs.readFileSync(instructionsPath, 'utf-8');
    // Replace placeholders in instructions
    instructions = instructions.replace('${projectDescription}', projectDescription);
    // Handle potential null researchData
    const researchDataString = researchData ? JSON.stringify(researchData, null, 2) : 'No research data provided.';
    instructions = instructions.replace('${researchDataString}', researchDataString);
  } catch (error) {
    console.error("Could not load AI instructions for initial plan:", error);
    throw new Error("Could not load AI instructions for initial plan.");
  }

  const prompt = instructions; // Use loaded instructions as the prompt

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
    planData.planText = cleanMermaidCode(planData.planText); // Clean Mermaid code
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
  const previousSuggestions = (previousPlanVersionContent.suggestions || []).map(suggestion => ({
    ...suggestion,
    selected: selectedSuggestionIds.includes(suggestion.id)
  }));

  // Load instructions from file
  const instructionsPath = path.join(process.cwd(), 'prompts', 'generateRefinedPlanInstructions.txt');
  let instructions = '';
  try {
    instructions = fs.readFileSync(instructionsPath, 'utf-8');
  } catch (error) {
    console.error("Error reading instructions file:", instructionsPath, error);
    // Handle error appropriately, maybe throw or return a default error response
    throw new Error("Could not load AI instructions for refining the plan.");
  }

  // Define example JSON objects as constants to avoid template literal parsing issues
  const exampleRefinedOutput = {
    "planText": "# Executive Summary\\n...\\n# Site Architecture Diagram\\n\\`\\`\\`mermaid\\ngraph TD;\\n    A-->B;\\n\\`\\`\\`\\n... rest of the plan ...",
    "suggestions": [
      { "id": "new-sugg-001", "title": "Implement gamification", "description": "To increase user engagement.", "category": "Functionality", "selected": false }
      // ... other new suggestions
    ]
  };

  // Construct the prompt dynamically
  const prompt = `${instructions}${JSON.stringify(exampleRefinedOutput, null, 2)}\n\n---\n**Inputs:**\n\n**Previous Plan Text:**\n\\\`\\\`\\\`markdown\n${previousPlanVersionContent.planText}\n\\\`\\\`\\\`\n\n**User Feedback:**\n\\\`\\\`\\\`\n${userWrittenFeedback}\n\\\`\\\`\\\`\n\n**Selected Suggestions:**\n\\\`\\\`\\\`json\n${JSON.stringify(previousSuggestions, null, 2)}\n\\\`\\\`\\\`\n---\n\n**Refined Plan JSON Output:**`;

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

    // Clean Mermaid code before returning
    finalPlanData.planText = cleanMermaidCode(finalPlanData.planText);

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
 * Cleans Mermaid code blocks within a given text by removing HTML comment tags.
 * @param text The text containing potential Mermaid code blocks.
 * @returns The text with HTML comments removed from Mermaid blocks.
 */
function cleanMermaidCode(text: string): string {
  if (!text) return text;
  // Regex to find mermaid code blocks and replace <!-- and --> within them
  return text.replace(/(\\`\\`\\`mermaid\\n?)([\\s\\S]*?)(\\n?\\`\\`\\`)/g, (match, start, content, end) => {
    const cleanedContent = content.replace(/<!--|-->/g, ''); // Remove the HTML comment tags
    return `${start}${cleanedContent}${end}`; // Reconstruct the block
  });
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
  
  // Define example JSON objects as constants to avoid template literal parsing issues
  const exampleImplementationOutput = {
    "frontend": [
      {
        "title": "Setup React Project Structure",
        "promptText": "Generate the initial folder structure for a React project using Create React App, including folders for components, services, and styles."
      }
    ],
    "backend": [
      {
        "title": "Create User Authentication Endpoint",
        "promptText": "Write the Node.js/Express code for a POST endpoint '/api/auth/login' that validates user credentials against a database."
      }
    ],
    "database": [
      {
        "title": "Design User Schema",
        "promptText": "Provide the SQL schema for a 'users' table including id, username, email, password_hash, created_at, and updated_at fields."
      }
    ]
  };

  const prompt = `
You are an expert software development assistant. Based on the provided website plan, generate a series of actionable implementation prompts categorized by Frontend, Backend, and Database tasks. Each prompt should have a clear title and detailed instructions.

**Website Plan:**
${planContentText}

Generate a JSON object where keys are categories ("frontend", "backend", "database") and values are arrays of prompt objects, each containing "title" and "promptText".

**Example JSON Output:**
${JSON.stringify(exampleImplementationOutput, null, 2)}
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
