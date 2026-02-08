'use client';

import { Navbar, Footer } from '@/components/shared';
import {
  Hero,
  ProblemStatement,
  HowItWorks,
  Features,
  TechStack,
  CallToAction,
} from '@/components/landing';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <ProblemStatement />
      <HowItWorks />
      <Features />
      <TechStack />
      <CallToAction />
      <Footer />
    </main>
  );
}
