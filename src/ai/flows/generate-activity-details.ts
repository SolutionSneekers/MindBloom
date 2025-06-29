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
    .max(10)
    .describe('The stress level of the user on a scale of 1 to 10.'),
  activity: z.string().describe('The self-care activity to get details for.'),
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
  prompt: `You are a warm, empathetic wellness coach. A user is feeling {{mood}} with a stress level of {{stressLevel}} out of 10. They have chosen the activity: "{{activity}}".

  Provide a detailed, encouraging, and step-by-step guide for this activity. Your explanation should be tailored to their specific mood and stress level.
  
  For example, if they are stressed and the activity is "Listen to calming music," you could suggest specific genres, explain why it helps with stress, and guide them to find a comfortable space to listen. If they are sad and the activity is "Journaling," you could provide gentle prompts to help them explore their feelings.

  Your tone should be supportive and non-judgmental. Format the response clearly, using paragraphs for readability.
  `,
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
