'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const AdminHelpPage = () => {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Help: Prompt Management</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section allows administrators to create, manage, and organize the AI prompts used throughout the application.
            Effective prompt management ensures consistent and high-quality AI responses.
          </p>
        </CardContent>
      </Card>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {/* Creating & Editing Prompts */}
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-lg font-semibold">Creating & Editing Prompts</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <p>
              Use the "Add New Prompt" button or the "Edit" action on an existing prompt to open the Prompt Dialog.
            </p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li><strong>Name:</strong> A unique and descriptive name for the prompt within its category.</li>
              <li><strong>Description:</strong> Briefly explain the purpose and expected input/output of the prompt.</li>
              <li><strong>Category:</strong> Assign the prompt to a relevant category (e.g., PLAN_GENERATION). Categories help organize prompts.</li>
              <li><strong>Template:</strong> This is the core text of the prompt sent to the AI. Use variables for dynamic content.</li>
              <li><strong>Status:</strong> Controls visibility and usage (ACTIVE, DRAFT, ARCHIVED).</li>
              {/* Add Model Selection info if applicable */}
              {/* <li><strong>Model:</strong> (Optional) Assign a default AI model for this prompt.</li> */}
            </ul>
          </AccordionContent>
        </AccordionItem>

        {/* Understanding & Using Variables */}
        <AccordionItem value="item-2">
          <AccordionTrigger className="text-lg font-semibold">Understanding & Using Variables</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <p>
              Variables allow you to insert dynamic information into your prompts at runtime. They act as placeholders.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong>Syntax:</strong> Define variables in the Template using double curly braces: <code>{"{{variable_name}}"}</code>.
                Replace <code>variable_name</code> with a meaningful identifier (e.g., <code>{"{{project_type}}"}</code>, <code>{"{{user_input}}"}</code>).
              </li>
              <li>
                <strong>Extraction:</strong> Use the "Extract Variables" button in the Prompt Dialog to automatically find all correctly formatted variables (<code>{"{{...}}"}</code>) within your Template text and add them to the Variables list.
              </li>
              <li>
                <strong>Manual Addition:</strong> You can also manually type a variable name into the input field below the Variables list and click the "+" button or press Enter.
              </li>
              <li>
                <strong>Purpose:</strong> The Variables list serves as a record of expected inputs for the prompt. While it doesn't currently enforce input, it helps document the prompt's requirements.
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        {/* Managing Variables & Important Warning */}
        <AccordionItem value="item-3">
          <AccordionTrigger className="text-lg font-semibold">Managing Variables & Important Warning</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <p>
You can manage the list of variables associated with a prompt directly in the Prompt Dialog.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong>Adding:</strong> Use the "Extract Variables" button or the manual input field as described above.
              </li>
              <li>
                <strong>Removing:</strong> Click the 'X' icon next to a variable name in the list. A confirmation dialog will appear.
              </li>
            </ul>
            <div className="p-4 border-l-4 border-destructive bg-destructive/10 rounded-md">
              <h4 className="font-semibold text-destructive mb-2">⚠️ Important Warning: Removing Variables</h4>
              <p className="text-sm text-destructive">
                Removing a variable from the <strong>Variables list</strong> in the dialog DOES NOT automatically remove its corresponding <code>{"{{variable_name}}"}</code> placeholder from the <strong>Template text</strong>.
              </p>
              <p className="text-sm text-destructive mt-1">
                You <strong>MUST</strong> manually delete or update the <code>{"{{variable_name}}"}</code> placeholder within the Template text yourself if you no longer intend to use that variable. Failure to do so may lead to unexpected behavior or errors when the prompt is used if the system expects a value for a variable that is no longer listed.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Prompt Status */}
        <AccordionItem value="item-4">
          <AccordionTrigger className="text-lg font-semibold">Prompt Status</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <p>
              Prompts can have different statuses:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li><strong>ACTIVE:</strong> The prompt is available for use in the application.</li>
              <li><strong>DRAFT:</strong> The prompt is under development and not yet available for general use.</li>
              <li><strong>ARCHIVED:</strong> The prompt is hidden from the main list and cannot be used. It can be unarchived later. Use the Archive/Unarchive action buttons (confirming via dialog).</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        {/* Testing Prompts */}
        <AccordionItem value="item-5">
          <AccordionTrigger className="text-lg font-semibold">Testing Prompts</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <p>
              Use the "Test" action button next to a prompt to open a testing dialog (if implemented). This allows you to provide sample values for the prompt's variables and see the resulting AI output without affecting live data.
            </p>
            {/* Add more details if the testing feature is fully built out */}
          </AccordionContent>
        </AccordionItem>

        {/* AI Provider Management */}
        <AccordionItem value="item-7">
          <AccordionTrigger className="text-lg font-semibold">AI Provider & Model Management</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <p>
              AI Providers (like OpenAI, Anthropic, Google) and their specific models (e.g., GPT-4, Claude 3 Opus, Gemini Pro) are managed in a separate section of the Admin interface (usually under "AI Settings" or "Integrations"). This help section focuses on how they relate to prompts.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong>Configuration:</strong> Each provider typically requires configuration, such as an API Key. API Keys should be stored securely as environment variables (e.g., `OPENAI_API_KEY`) and referenced in the provider settings, not directly in prompts.
              </li>
              <li>
                <strong>Models:</strong> Specific models available from a provider (like `gpt-4-turbo` or `claude-3-haiku-20240307`) are usually listed under that provider's configuration.
              </li>
              <li>
                <strong>Prompt Association (Optional):</strong> While editing a prompt, you might have the option to associate a specific default AI model with it. If set, this model will be used by default when this prompt is invoked, unless overridden by the specific feature using the prompt.
              </li>
              <li>
                <strong>System Default:</strong> If a prompt doesn't have a specific model assigned, the system will typically use a globally defined default model.
              </li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Refer to the dedicated AI Provider/Model management section in the Admin panel for details on adding, editing, or removing providers and models.
            </p>
          </AccordionContent>
        </AccordionItem>

        {/* Best Practices */}
        <AccordionItem value="item-6">
          <AccordionTrigger className="text-lg font-semibold">Best Practices</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Keep prompt names clear and concise.</li>
              <li>Write detailed descriptions explaining the prompt's goal and context.</li>
              <li>Use categories effectively to group related prompts.</li>
              <li>Define variables clearly using the <code>{"{{variable_name}}"}</code> syntax.</li>
              <li>Ensure the Variables list accurately reflects the placeholders used in the Template.</li>
              <li>Regularly review and archive unused or outdated prompts.</li>
              <li>Test prompts thoroughly before setting them to ACTIVE.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  );
};

export default AdminHelpPage;
