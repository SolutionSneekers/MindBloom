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
  prompt: `You are a compassionate and insightful AI assistant specializing in mental wellness. Your task is to generate a single, unique, and uplifting daily affirmation.

The affirmation should be a short, powerful sentence that promotes a positive mindset. Please ensure variety by touching on different themes such as:
- Self-love and acceptance (e.g., "I am worthy of love and respect, exactly as I am.")
- Gratitude (e.g., "I am grateful for the simple joys that today will bring.")
- Resilience and strength (e.g., "I have the inner strength to overcome any challenges I face.")
- Mindfulness and being present (e.g., "Today, I will focus on the present moment and find peace in it.")
- Growth and potential (e.g., "I am open to new possibilities and embrace opportunities for growth.")

Generate a new, inspiring affirmation. Do not include quotation marks or any other text around the affirmation itself.
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
