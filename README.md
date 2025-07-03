# MindBloom - Your Personal Wellness Companion

_A supportive space to nurture your mental well-being._

MindBloom is a modern, AI-powered web application designed to help you understand your emotions, practice self-reflection, and discover personalized self-care strategies. It's a safe and private companion for your mental wellness journey.

## ✨ Core Purpose & Goal

The primary goal of MindBloom is to empower users to build positive, consistent habits for their mental health. It provides accessible, engaging, and personalized tools that make wellness practices feel less like a chore and more like a moment of self-discovery. Whether you need a space for quiet reflection, a guide to calm your breath, or a new coping strategy, MindBloom is here to support you.

---

## 📋 Table of Contents

- [Key Features](#-key-features)
  - [Personalized Dashboard](#1-personalized-dashboard)
  - [Intelligent Mood Tracking](#2-intelligent-mood-tracking)
  - [AI-Powered Journaling](#3-ai-powered-journaling)
  - [Guided Self-Care Activities](#4-guided-self-care-activities)
  - [Guided Breathing Exercises](#5-guided-breathing-exercises)
  - [Secure Profile Management](#6-secure-profile-management)
- [🛠️ Technology Stack](#️-technology-stack)
- [🚀 Running the Project](#-running-the-project)
- [©️ License](#️-license)

---

## 🚀 Key Features

MindBloom integrates several core features to provide a holistic wellness experience.

### 1. Personalized Dashboard

The dashboard is your central hub, offering a quick and insightful overview of your wellness journey at a glance.

- **Daily Affirmation:** Start your day with a positive, AI-generated affirmation to set an encouraging tone.
- **Wellness Stats:** Track your progress with key metrics like your journaling streak and the number of mood check-ins, reinforcing positive habits.
- **Mood Overview:** A visual chart displays your mood trends from your last seven entries, helping you quickly identify recent patterns in your emotional state and stress levels.
- **Quick Access:** Jump directly into key activities like a new mood check-in, journaling, or a breathing exercise.

### 2. Intelligent Mood Tracking

Understanding your emotions is the first step to managing them. Our mood tracking tools are designed to be quick, intuitive, and insightful.

- **Daily Check-ins:** Log your current mood using a simple, emoji-based selection. You can also add an optional journal entry to capture what's on your mind and set your current stress level on a 1-to-5 scale.
- **Mood History & Trends:** The history page provides a beautiful chart visualizing your mood and stress fluctuations over time. A detailed log of all past check-ins is available, and you can edit or delete entries to ensure your history is accurate.

### 3. AI-Powered Journaling

Journaling is a powerful tool for self-reflection. MindBloom makes it easier to start and more insightful.

- **Personalized Prompts:** If you're unsure what to write, select a mood and let our AI generate a thoughtful, relevant journaling prompt tailored to your feelings and age.
- **Secure & Private Entries:** A clean, rich-text editor gives you a private space to write, save, and reflect. All entries are securely stored and tied to your account.
- **Entry Management:** Easily review, edit, or delete past journal entries at any time.

### 4. Guided Self-Care Activities

Move beyond generic advice with self-care suggestions that are personalized just for you.

- **Tailored Suggestions:** After a mood check-in, the app uses Genkit to generate a list of self-care activities. Suggestions are intelligently tailored based on your mood, stress level, age, and even the context from your recent journal entry.
- **AI-Generated Guides:** Click on any suggested activity to receive a detailed, step-by-step guide. The AI frames the explanation to be especially helpful for your current emotional state, making the activity more effective.

### 5. Guided Breathing Exercises

Harness the power of your breath to find calm and focus in moments of stress or anxiety.

- **Multiple Techniques:** The app includes several evidence-based breathing exercises, including Box Breathing, 4-7-8 Breathing, and Pursed-Lip Breathing.
- **Animated Visual Guide:** A clean, intuitive animator helps you synchronize your breath with the instructions (inhale, hold, exhale). This visual feedback makes it easy for anyone to follow along and get the full benefits of the practice.

### 6. Secure Profile Management

Your account is your personal space. Manage your details securely and personalize your experience.

- **Secure Authentication:** Sign up or log in securely using your email and password or with your Google account for quick access.
- **Personalized Profile:** Manage your name, date of birth, and avatar. Providing your date of birth allows the AI to tailor its responses to be more age-appropriate.
- **Custom Avatars:** Choose from a library of beautifully designed default avatars or provide a URL to your own image.

---

## 🛠️ Technology Stack

MindBloom is built with a modern, robust, and scalable tech stack to deliver a seamless user experience.

- **Framework:** **Next.js** (using the App Router)
- **Language:** **TypeScript**
- **UI Components:** **ShadCN UI**
- **Styling:** **Tailwind CSS**
- **Generative AI:** **Genkit** with **Google's Gemini models**
- **Backend & Database:** **Firebase** (Authentication for users, Firestore for data storage)
- **UI Animation:** **Framer Motion**

---

## 🚀 Running the Project

To run this project, you will need to configure your environment variables.

### 1. Install Dependencies

If you have cloned this repository locally, install the necessary dependencies:
```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root of the project and add your Firebase project configuration keys. You can find these in your Firebase project settings.

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Run the Development Server

Start the Next.js development server:
```bash
npm run dev
```

The application should now be available on your local development server, typically [http://localhost:9002](http://localhost:9002).

---

## ©️ License

This project is open source and available under the MIT License.
