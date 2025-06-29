'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a daily affirmation.
 *
 * - generateDailyAffirmation - A function that returns a daily affirmation.
 * - GenerateDailyAffirmationOutput - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDailyAffirmationOutputSchema = z.object({
  affirmation: z
    .string()
    .describe('A short, positive affirmation for the user.'),
});
export type GenerateDailyAffirmationOutput = z.infer<
  typeof GenerateDailyAffirmationOutputSchema
>;

export async function generateDailyAffirmation(): Promise<GenerateDailyAffirmationOutput> {
  return generateDailyAffirmationFlow();
}

const prompt = ai.definePrompt({
  name: 'generateDailyAffirmationPrompt',
  output: {schema: GenerateDailyAffirmationOutputSchema},
  prompt: `You are an AI assistant that provides a short, positive, and encouraging daily affirmation.
  
  The affirmation should be a single sentence. For example: "I am capable of achieving great things." or "I choose to be happy and to love myself today."
  
  Do not include quotation marks or any other text around the affirmation.
  `,
});

const generateDailyAffirmationFlow = ai.defineFlow(
  {
    name: 'generateDailyAffirmationFlow',
    outputSchema: GenerateDailyAffirmationOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    return output!;
  }
);
