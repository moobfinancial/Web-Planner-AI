// Define shared types used across the application
import type { JsonValue } from '@prisma/client/runtime/library'

// Structure for the content stored in PlanVersion, including plan text and suggestions
export interface PlanContent {
  planText: string; // Or a more structured object
  suggestions: Array<{
    id: string;
    text: string;
    justification: string;
    rank: number;
    selected: boolean;
  }>;
}

export interface PlanVersion {
  id: string;
  projectId?: string;
  planType?: 'INITIAL' | 'REFINED';
  versionNumber?: number;
  content?: string;
  researchData?: JsonValue;
  triggeringFeedbackText?: string;
  prompts?: JsonValue;
  createdAt: Date;
  project?: Project;
  feedback?: Feedback[];
}

// Structure for AI research data stored in Plan
export interface ResearchData {
  targetAudience: {
    description: string;
    onlineBehavior: string;
    needs: string;
  };
  competitorAnalysis: Array<{
    name: string;
    strengths: string;
    weaknesses: string;
    keyFeatures: string;
    seoTactics: string;
  }>;
  keywords: string[];
  technologyTrends: string[];
  apiIntegrations: string[];
  uniqueValueProposition: string;
  monetizationStrategies: string[];
  keyGoals?: string;
  codeEditor?: string;
}

// Structure for generated implementation prompts
export interface ImplementationPrompts {
    [category: string]: Array<{
        title: string;
        promptText: string;
    }>;
    // Example:
    // frontend?: Array<{ title: string; promptText: string }>;
    // backend?: Array<{ title: string; promptText: string }>;
    // database?: Array<{ title: string; promptText: string }>;
}

// Add other shared types here as needed

export interface Project {
  id: string;
  projectName: string;
  projectDescription?: string;
  codeEditor?: string;
  targetAudience?: string;
  keyGoals?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Feedback {
  id: string;
  sectionIdentifier?: string;
  originalText?: string;
  userComment?: string;
  planId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
