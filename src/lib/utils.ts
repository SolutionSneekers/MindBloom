
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export const moods = [
  { name: 'Happy', emoji: '😄' },
  { name: 'Calm', emoji: '😌' },
  { name: 'Okay', emoji: '🙂' },
  { name: 'Sad', emoji: '😢' },
  { name: 'Anxious', emoji: '😟' },
  { name: 'Angry', emoji: '😠' },
];

export const moodToValue: { [key: string]: number } = {
  Angry: 1, Sad: 2, Anxious: 3, Okay: 4, Calm: 5, Happy: 6,
};

export const valueToMood: { [key: number]: string } = {
  1: "Angry", 2: "Sad", 3: "Anxious", 4: "Okay", 5: "Calm", 6: "Happy",
};

export const moodEmojis: { [key: string]: string } = {
  'Angry': '😠', 'Sad': '😢', 'Anxious': '😟', 'Okay': '🙂', 'Calm': '😌', 'Happy': '😄',
};
