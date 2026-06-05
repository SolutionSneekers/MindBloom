import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleAI/gemini-2.0-flash', // Corrected to a valid, stable Gemini model version
});
