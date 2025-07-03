
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a detailed explanation for a self-care activity.
 *
 * - generateActivityDetails - A function that takes a mood, stress level, and activity, and returns a detailed explanation.
 * - GenerateActivityDetailsInput - The input type for the function.
 * - GenerateActivityDetailsOutput - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateActivityDetailsInputSchema = z.object({
  mood: z
    .string()
    .describe('The current mood of the user (e.g., happy, sad, stressed).'),
  stressLevel: z
    .number()
    .min(1)
    .max(5)
    .describe('The stress level of the user on a scale of 1 to 5.'),
  activity: z.string().describe('The self-care activity to get details for.'),
  journalEntry: z
    .string()
    .optional()
    .describe('An optional journal entry from the user.'),
  age: z.number().optional().describe('The age of the user.'),
});
export type GenerateActivityDetailsInput = z.infer<
  typeof GenerateActivityDetailsInputSchema
>;

const GenerateActivityDetailsOutputSchema = z.object({
  details: z
    .string()
    .describe('A detailed explanation of the self-care activity, tailored to the user\'s mood and stress level.'),
});
export type GenerateActivityDetailsOutput = z.infer<
  typeof GenerateActivityDetailsOutputSchema
>;

export async function generateActivityDetails(
  input: GenerateActivityDetailsInput
): Promise<GenerateActivityDetailsOutput> {
  return generateActivityDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateActivityDetailsPrompt',
  input: {schema: GenerateActivityDetailsInputSchema},
  output: {schema: GenerateActivityDetailsOutputSchema},
  prompt: `You are a warm, empathetic, and safe wellness coach. Your primary goal is to provide gentle and supportive guidance.

**IMPORTANT SAFETY GUIDELINES:**
- Your tone must be supportive and non-judgmental at all times.
- NEVER suggest anything harmful, dangerous, or extreme.
- Do not make medical claims or give medical advice. Frame your advice as gentle suggestions.
- Keep the guidance simple, informative, and easy to follow.

A user is feeling {{mood}} with a stress level of {{stressLevel}} out of 5. They have chosen the activity: "{{activity}}".
{{#if age}}The user is {{age}} years old.{{/if}}
{{#if journalEntry}}
They also wrote about what's on their mind: "{{{journalEntry}}}"
{{/if}}

Provide a short, encouraging, and easy-to-understand guide for this activity. The guide should be tailored to their specific mood, stress level, and age, and take their journal entry into account if provided. Keep the explanation concise, around 2-3 paragraphs.

For example, if they are stressed and the activity is "Listen to calming music," you could suggest specific genres and briefly explain why it helps with stress. If they are sad and the activity is "Journaling," you could provide a couple of gentle prompts.

Your tone should be supportive and non-judgmental.
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

const generateActivityDetailsFlow = ai.defineFlow(
  {
    name: 'generateActivityDetailsFlow',
    inputSchema: GenerateActivityDetailsInputSchema,
    outputSchema: GenerateActivityDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
