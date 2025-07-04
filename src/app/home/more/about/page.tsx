'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Target, Eye, Heart, Brain, Shield, Lightbulb, LifeBuoy } from 'lucide-react';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';

const principles = [
  {
    icon: Heart,
    title: "Personalized Guidance",
    description: "Leveraging AI to provide tailored mood analysis, journaling prompts, and self-care activities that resonate with your current state."
  },
  {
    icon: Brain,
    title: "Mindful Tools",
    description: "Offering a suite of features including guided breathing exercises, mood tracking, and a private journal to encourage daily self-reflection."
  },
  {
    icon: Shield,
    title: "A Safe & Private Space",
    description: "Ensuring your data is private and your experience is non-judgmental, creating a secure environment for you to explore your feelings."
  },
  {
    icon: Lightbulb,
    title: "Built for Growth",
    description: "Designing an intuitive and easy-to-use application that makes mental wellness support accessible whenever you need it."
  }
];

export default function AboutUsPage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center space-y-4 py-8">
        <Logo iconClassName="h-16 w-16" textClassName="text-4xl" />
        <h1 className="text-3xl md:text-4xl font-bold font-headline mt-4">Nurturing Mental Well-being</h1>
        <p className="text-muted-foreground max-w-3xl text-lg">
          MindBloom is a modern, AI-powered web application designed to help you understand your emotions, practice self-reflection, and discover personalized self-care strategies. It's a safe and private companion for your mental wellness journey.
        </p>
      </div>

      {/* Mission & Vision Section */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-headline text-2xl">
              <Target className="h-8 w-8 text-primary" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-base">
            <p>
              To empower individuals to build positive, consistent habits for their mental health. We believe everyone deserves a supportive space to understand their emotions and discover personalized self-care strategies, making wellness an intuitive part of daily life.
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-headline text-2xl">
              <Eye className="h-8 w-8 text-primary" />
              Our Vision
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-base">
            <p>
              We envision a world where mental wellness tools are seamlessly integrated into everyday routines. By harnessing thoughtful technology, we aim to help you cultivate resilience, find calm in the chaos, and bloom into your best, most authentic self.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Core Principles Section */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl font-headline">Our Core Principles</CardTitle>
          <CardDescription>These values guide every feature we build.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 max-w-4xl mx-auto">
            {principles.map((principle) => (
              <div key={principle.title} className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full mt-1">
                  <principle.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{principle.title}</h3>
                  <p className="text-muted-foreground">{principle.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Get in Touch Section */}
      <Card className="bg-muted/70 dark:bg-muted/40 border-dashed hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
                <LifeBuoy className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="flex items-center justify-center gap-2 font-headline text-2xl">
              Get In Touch
            </CardTitle>
             <CardDescription>Have questions, feedback, or need support? We&apos;re here to help.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-muted-foreground text-center max-w-md">
                Your feedback is valuable to us. Please don&apos;t hesitate to reach out to our team for any assistance or to share your thoughts.
            </p>
            <a href="mailto:support@mindbloom.app">
                <Button>Contact Support</Button>
            </a>
          </CardContent>
        </Card>
    </div>
  );
}
