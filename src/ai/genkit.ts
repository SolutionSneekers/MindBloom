import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai'; // Updated package

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleAI/gemini-2.5-flash', // Corrected casing string
});