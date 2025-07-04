'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Target, Eye, Heart, Brain, Shield, Lightbulb } from 'lucide-react';
import { Logo } from '@/components/icons';

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
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <Logo iconClassName="h-12 w-12" textClassName="text-3xl" />
        <h1 className="text-2xl md:text-3xl font-bold font-headline mt-4">About MindBloom</h1>
        <p className="text-muted-foreground max-w-2xl mt-2">
          Nurturing mental well-being through accessible, AI-powered tools designed for self-discovery and growth.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Target className="h-6 w-6 text-primary" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              Our mission is to empower individuals to build positive, consistent habits for their mental health. We believe that everyone deserves a safe and supportive space to understand their emotions, practice self-reflection, and discover personalized self-care strategies. MindBloom aims to make wellness practices feel less like a chore and more like a continuous journey of self-discovery.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Eye className="h-6 w-6 text-primary" />
              Our Vision
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              We envision a world where mental wellness tools are seamlessly integrated into daily life. We strive to be a trusted companion on your wellness journey, providing accessible, engaging, and personalized support. By harnessing the power of thoughtful technology, we aim to help you cultivate resilience, find calm in the chaos, and bloom into your best self.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-headline">Our Core Principles</CardTitle>
          <CardDescription>These values guide every feature we build.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-6">
            {principles.map((principle) => (
              <li key={principle.title} className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <principle.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{principle.title}</h3>
                  <p className="text-muted-foreground">{principle.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Users className="h-6 w-6 text-primary" />
              Our Team
            </CardTitle>
             <CardDescription>The minds behind MindBloom.</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              MindBloom was created by a passionate team of developers, designers, and mental health advocates dedicated to making a positive impact. While we may be powered by AI, our core is deeply human, driven by empathy, and committed to your well-being.
            </p>
          </CardContent>
        </Card>
    </div>
  );
}
