'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating personalized self-care activity suggestions based on the user's mood.
 *
 * - generateSelfCareActivities - A function that takes a mood and stress level as input and returns self-care activity suggestions.
 * - GenerateSelfCareActivitiesInput - The input type for the generateSelfCareActivities function.
 * - GenerateSelfCareActivitiesOutput - The return type for the generateSelfCareActivities function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSelfCareActivitiesInputSchema = z.object({
  mood: z
    .string()
    .describe('The current mood of the user (e.g., happy, sad, stressed).'),
  stressLevel: z
    .number()
    .min(1)
    .max(10)
    .describe('The stress level of the user on a scale of 1 to 10.'),
  journalEntry: z
    .string()
    .optional()
    .describe('An optional journal entry from the user.'),
});
export type GenerateSelfCareActivitiesInput = z.infer<
  typeof GenerateSelfCareActivitiesInputSchema
>;

const GenerateSelfCareActivitiesOutputSchema = z.object({
  activities: z
    .array(z.string())
    .describe('An array of self-care activity suggestions.'),
});
export type GenerateSelfCareActivitiesOutput = z.infer<
  typeof GenerateSelfCareActivitiesOutputSchema
>;

export async function generateSelfCareActivities(
  input: GenerateSelfCareActivitiesInput
): Promise<GenerateSelfCareActivitiesOutput> {
  return generateSelfCareActivitiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSelfCareActivitiesPrompt',
  input: {schema: GenerateSelfCareActivitiesInputSchema},
  output: {schema: GenerateSelfCareActivitiesOutputSchema},
  prompt: `You are a helpful AI assistant that provides personalized self-care activity suggestions based on the user's current mood, stress level, and optional journal entry.

  Mood: {{{mood}}}
  Stress Level (1-10): {{{stressLevel}}}
  {{#if journalEntry}}
  User's thoughts: {{{journalEntry}}}
  {{/if}}

  Suggest a list of self-care activities that are appropriate for the user's current state. If the user provided their thoughts, use that as the primary context for your suggestions. Consider activities from categories like breathing, journaling, movement, music, games and the option for a 'Surprise Me' selection. Return ONLY an array of strings, and nothing else. No intro, explanation, or conclusion.
  `,
});

const generateSelfCareActivitiesFlow = ai.defineFlow(
  {
    name: 'generateSelfCareActivitiesFlow',
    inputSchema: GenerateSelfCareActivitiesInputSchema,
    outputSchema: GenerateSelfCareActivitiesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
