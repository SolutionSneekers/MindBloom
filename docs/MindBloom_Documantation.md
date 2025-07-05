# MindBloom - Comprehensive Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [System Architecture](#system-architecture)
3. [Feature Documentation](#feature-documentation)
   - [User Authentication](#user-authentication)
   - [Dashboard](#dashboard)
   - [Mood Tracking](#mood-tracking)
   - [Journaling](#journaling)
   - [Self-Care Activities](#self-care-activities)
   - [Breathing Exercises](#breathing-exercises)
   - [Daily Affirmations](#daily-affirmations)
4. [AI Integration](#ai-integration)
5. [Database Schema](#database-schema)
6. [UI Components](#ui-components)
7. [Development Guidelines](#development-guidelines)
8. [Deployment](#deployment)
9. [Future Enhancements](#future-enhancements)

## Introduction

MindBloom is a comprehensive mental wellness application designed to help users track their emotional well-being, practice mindfulness, and discover personalized self-care strategies. This document provides detailed information about the application's architecture, features, and implementation.

## System Architecture

MindBloom follows a modern web application architecture:

### Frontend

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **State Management**: React Hooks and Context API
- **Styling**: Tailwind CSS with ShadCN UI components

### Backend

- **Authentication & Database**: Firebase (Authentication and Firestore)
- **AI Services**: Google Gemini models via Genkit
- **Serverless Functions**: Next.js API routes and server components

### Data Flow

1. User interacts with the UI
2. Client-side code handles the interaction
3. Data is sent to Firebase or AI services as needed
4. Results are displayed to the user

## Feature Documentation

### User Authentication

MindBloom uses Firebase Authentication for secure user management.

#### Implementation Details

- **Authentication Methods**: Email/password and Google OAuth
- **User Profile**: Stores user information including name, date of birth, and preferences
- **Security**: Firebase handles token management, password hashing, and session management

#### Key Files

- `src/lib/firebase.ts`: Firebase configuration
- `src/app/register/page.tsx`: User registration
- `src/app/page.tsx`: Login page
- `src/app/forgot-password/page.tsx`: Password reset

### Dashboard

The dashboard provides an overview of the user's wellness journey and quick access to key features.

#### Implementation Details

- **Mood Overview**: Displays recent mood trends using Recharts
- **Quick Access Cards**: Links to main features (Mood Check-In, Journaling, Breathing)
- **Stats**: Shows journal streak, check-in count, and overall mood
- **Daily Affirmation**: Displays an AI-generated affirmation

#### Key Files

- `src/app/home/page.tsx`: Main dashboard implementation
- `src/components/mood-history-chart.tsx`: Chart component for mood visualization

### Mood Tracking

Allows users to log their emotional state and stress level.

#### Implementation Details

- **Mood Selection**: Six mood options (Happy, Calm, Okay, Sad, Anxious, Angry)
- **Stress Level**: Scale from 1-5
- **Optional Journal**: Text area for additional context
- **Data Storage**: Saved to Firestore with timestamp

#### Key Files

- `src/app/home/mood/check-in/page.tsx`: Mood check-in form
- `src/lib/utils.ts`: Mood definitions and utility functions

### Journaling

Provides a space for users to write and reflect on their thoughts with AI-generated prompts.

#### Implementation Details

- **AI Prompts**: Generated based on selected mood and user age
- **Journal Editor**: Text area for writing entries
- **Entry Management**: View, edit, and delete past entries
- **Data Storage**: Entries saved to Firestore with metadata

#### Key Files

- `src/app/home/journal/page.tsx`: Journaling interface
- `src/ai/flows/generate-journaling-prompts.ts`: AI prompt generation

### Self-Care Activities

Offers personalized self-care suggestions based on the user's mood and context.

#### Implementation Details

- **Activity Generation**: Uses Genkit to create tailored suggestions
- **Categories**: Activities grouped by type (Breathing, Journaling, Movement, Music, Games, Surprise Me)
- **Detailed Guides**: Expanded instructions for each activity
- **Context Awareness**: Considers mood, stress level, journal entries, and age

#### Key Files

- `src/app/home/activities/self-care/page.tsx`: Self-care activities interface
- `src/ai/flows/generate-self-care-activities.ts`: Activity generation flow
- `src/ai/flows/generate-activity-details.ts`: Detailed instructions generation

### Breathing Exercises

Guided breathing techniques to help users manage stress and anxiety.

#### Implementation Details

- **Exercise Types**: Multiple breathing patterns (Box, 4-7-8, Belly, Pursed-Lip, Alternate Nostril)
- **Visual Guide**: Animated circle that expands and contracts with breathing phases
- **Timer**: Countdown for each phase (inhale, hold, exhale, pause)
- **Instructions**: Detailed guides for each technique

#### Key Files

- `src/app/home/activities/breathing/page.tsx`: Breathing exercises implementation

### Daily Affirmations

Positive statements to inspire and motivate users.

#### Implementation Details

- **AI Generation**: Created using Genkit and Google Gemini
- **Caching**: Stored locally and refreshed daily
- **Display**: Featured prominently on the dashboard

#### Key Files

- `src/ai/flows/generate-daily-affirmation.ts`: Affirmation generation flow

## AI Integration

MindBloom leverages Google's Gemini models through Genkit to provide personalized experiences.

### AI Flows

1. **Self-Care Activities Generation**
   - **Input**: User's mood, stress level, journal entry (optional), and age (optional)
   - **Output**: List of personalized self-care activities
   - **Implementation**: `src/ai/flows/generate-self-care-activities.ts`

2. **Activity Details Generation**
   - **Input**: Selected activity, user's mood, stress level, journal entry (optional), and age (optional)
   - **Output**: Detailed instructions tailored to the user's current emotional state
   - **Implementation**: `src/ai/flows/generate-activity-details.ts`

3. **Journaling Prompts Generation**
   - **Input**: User's mood and age (optional)
   - **Output**: Thoughtful journaling prompt
   - **Implementation**: `src/ai/flows/generate-journaling-prompts.ts`

4. **Daily Affirmation Generation**
   - **Output**: Positive, motivational affirmation
   - **Implementation**: `src/ai/flows/generate-daily-affirmation.ts`

### Prompt Engineering

All prompts are carefully designed to:

- Be supportive and empathetic
- Avoid harmful or triggering content
- Provide personalized, relevant suggestions
- Maintain appropriate boundaries

### Safety Measures

- **Content Filtering**: Genkit safety settings block potentially harmful content
- **Input Validation**: All user inputs are validated before processing
- **Output Verification**: AI-generated content is structured using Zod schemas

## Database Schema

MindBloom uses Firebase Firestore for data storage with the following collections:

### Users Collection

```
users/
  {userId}/
    displayName: string
    email: string
    photoURL: string (optional)
    dob: timestamp (optional)
    createdAt: timestamp
```

### Moods Collection

```
moods/
  {moodId}/
    userId: string
    mood: string
    stressLevel: number
    journalEntry: string (optional)
    createdAt: timestamp
```

### Journal Entries Collection

```
journalEntries/
  {entryId}/
    userId: string
    entry: string
    mood: string (optional)
    prompt: string (optional)
    createdAt: timestamp
```

## UI Components

MindBloom uses ShadCN UI, a collection of reusable components built on top of Tailwind CSS and Radix UI primitives.

### Key Components

- **Layout Components**: Cards, Dialogs, Tabs
- **Form Elements**: Inputs, Textareas, Selects, Sliders
- **Feedback Components**: Toast notifications, Skeletons for loading states
- **Interactive Elements**: Buttons, Dropdowns
- **Data Display**: Charts, Badges

### Custom Components

- **MoodHistoryChart**: Visualizes mood and stress trends
- **Animator**: Guides breathing exercises with visual cues

## Development Guidelines

### Code Structure

- **Feature-based Organization**: Code is organized by feature rather than type
- **Server vs. Client Components**: Next.js components are marked with 'use client' directive when needed
- **AI Flow Separation**: AI prompts and flows are kept in dedicated files

### Best Practices

- **Type Safety**: TypeScript is used throughout the codebase
- **Error Handling**: Comprehensive error handling for API calls and Firebase operations
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Accessibility**: ARIA attributes and keyboard navigation

### Development Workflow

1. **Local Development**: `npm run dev` starts the Next.js development server
2. **AI Development**: `npm run genkit:dev` or `npm run genkit:watch` for Genkit development
3. **Type Checking**: `npm run typecheck` verifies TypeScript types
4. **Linting**: `npm run lint` checks for code quality issues

## Deployment

MindBloom can be deployed to various platforms:

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy with default settings

### Firebase Hosting

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize Firebase: `firebase init`
4. Build the application: `npm run build`
5. Deploy to Firebase: `firebase deploy`

### Environment Variables

The following environment variables are required:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Google AI (Gemini) API Key
GENKIT_API_KEY=your_genkit_api_key
```

## Future Enhancements

Potential improvements for future versions:

### Short-term Enhancements

1. **Offline Support**: Add PWA capabilities for offline access
2. **Notifications**: Reminders for daily check-ins and journaling
3. **Social Sharing**: Option to share affirmations or achievements
4. **Dark/Light Mode Toggle**: Enhanced theme support

### Medium-term Enhancements

1. **Mood Insights**: Advanced analytics and pattern recognition
2. **Guided Meditation**: Audio-guided meditation sessions
3. **Goal Setting**: Personal wellness goals and tracking
4. **Community Features**: Optional anonymous community support

### Long-term Vision

1. **Professional Integration**: Optional sharing with mental health professionals
2. **Wearable Integration**: Connect with fitness trackers for physical health correlation
3. **Personalized Learning**: AI that adapts to user preferences and effectiveness
4. **Multi-language Support**: Localization for global accessibility

---

*This documentation is intended for developers and contributors to the MindBloom project. For user documentation, please refer to the application's help section.*