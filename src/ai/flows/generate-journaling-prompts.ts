// The use server directive is required for all flow files.
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating journaling prompts based on a user's mood.
 *
 * It includes:
 * - `generateJournalingPrompts`: An exported function to trigger the flow.
 * - `GenerateJournalingPromptsInput`: The input type for the flow, defining the user's mood and journal entry.
 * - `GenerateJournalingPromptsOutput`: The output type for the flow, containing the generated journaling prompt.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the flow
const GenerateJournalingPromptsInputSchema = z.object({
  mood: z
    .string()
    .describe('The current mood of the user (e.g., sad, angry, anxious).'),
  journalEntry: z
    .string()
    .optional()
    .describe('Optional journal entry the user has already written.'),
});
export type GenerateJournalingPromptsInput = z.infer<
  typeof GenerateJournalingPromptsInputSchema
>;

// Define the output schema for the flow
const GenerateJournalingPromptsOutputSchema = z.object({
  prompt: z
    .string()
    .describe('A journaling prompt tailored to the user\s mood and journal entry.'),
});
export type GenerateJournalingPromptsOutput = z.infer<
  typeof GenerateJournalingPromptsOutputSchema
>;

// Exported function to generate journaling prompts
export async function generateJournalingPrompts(
  input: GenerateJournalingPromptsInput
): Promise<GenerateJournalingPromptsOutput> {
  return generateJournalingPromptsFlow(input);
}

// Define the prompt
const prompt = ai.definePrompt({
  name: 'generateJournalingPromptsPrompt',
  input: {schema: GenerateJournalingPromptsInputSchema},
  output: {schema: GenerateJournalingPromptsOutputSchema},
  prompt: `You are a helpful AI assistant designed to provide journaling prompts to users based on their current mood.

  The goal is to help users explore their feelings and encourage self-reflection.

  Generate a single journaling prompt that is tailored to the user's mood.

  Mood: {{{mood}}}
  {{~#if journalEntry}}Journal Entry: {{{journalEntry}}}{{/if}}
  `,
});

// Define the flow
const generateJournalingPromptsFlow = ai.defineFlow(
  {
    name: 'generateJournalingPromptsFlow',
    inputSchema: GenerateJournalingPromptsInputSchema,
    outputSchema: GenerateJournalingPromptsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
