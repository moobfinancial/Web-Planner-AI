import { z } from 'zod';

// Define the schema for the request body of the POST /api/plans/[id]/versions endpoint
export const refineBodySchema = z.object({
  latestVersionId: z.string().min(1, { message: 'latestVersionId is required' }),
  userWrittenFeedback: z.record(z.string(), z.string(), {
    invalid_type_error: 'userWrittenFeedback must be an object mapping strings to strings',
  }),
  selectedSuggestionIds: z.array(z.string(), {
    invalid_type_error: 'selectedSuggestionIds must be an array of strings',
  }),
});

export type RefineRequestBody = z.infer<typeof refineBodySchema>;
