import { config } from 'dotenv';
config();

import '@/ai/flows/generate-journaling-prompts.ts';
import '@/ai/flows/generate-self-care-activities.ts';
import '@/ai/flows/generate-activity-details.ts';
import '@/ai/flows/generate-daily-affirmation.ts';
