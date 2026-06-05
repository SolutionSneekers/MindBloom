import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'gemini-1.5-flash', // Updated to the widely supported stable model identifier
});
