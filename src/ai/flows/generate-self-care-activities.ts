
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
    .max(5)
    .describe('The stress level of the user on a scale of 1 to 5.'),
  journalEntry: z
    .string()
    .optional()
    .describe('An optional journal entry from the user.'),
  age: z.number().optional().describe('The age of the user.'),
});
export type GenerateSelfCareActivitiesInput = z.infer<
  typeof GenerateSelfCareActivitiesInputSchema
>;

const GenerateSelfCareActivitiesOutputSchema = z.object({
  activities: z
    .array(
      z.object({
        title: z.string().describe('The title of the activity.'),
        category: z
          .string()
          .describe(
            'The category of the activity. Must be one of: Breathing, Journaling, Movement, Music, Games, Surprise Me.'
          ),
        description: z
          .string()
          .describe('A short, one-sentence description of the activity.'),
      })
    )
    .describe('An array of self-care activity objects.'),
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
  prompt: `You are a helpful and empathetic AI assistant that provides personalized, safe, and simple self-care activity suggestions. Your tone should always be gentle and supportive.

**IMPORTANT SAFETY GUIDELINES:**
- NEVER suggest anything harmful, dangerous, or extreme.
- All suggestions must be simple, small, and easily achievable activities.
- Avoid making medical claims or giving medical advice.
- Focus on positive, constructive, and gentle activities.

User context:
Mood: {{{mood}}}
Stress Level (1-5): {{{stressLevel}}}
{{#if age}}
Age: {{{age}}}
{{/if}}
{{#if journalEntry}}
User's thoughts: {{{journalEntry}}}
{{/if}}

Suggest a list of 5-6 self-care activities that are appropriate for the user's current state. If the user provided their thoughts, use that as the primary context for your suggestions. Factor in the user's age for age-appropriate suggestions.

For each activity, provide a title, a short one-sentence informative description, and a category. The category MUST be one of the following: Breathing, Journaling, Movement, Music, Games, Surprise Me.

Return ONLY a JSON object with an "activities" key containing an array of these activity objects, and nothing else. No intro, explanation, or conclusion.
`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
    ],
  },
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
