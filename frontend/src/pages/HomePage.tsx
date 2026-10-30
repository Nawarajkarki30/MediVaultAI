import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { KeyBenefits } from '../components/landing/KeyBenefits';
import { HowItWorks } from '../components/landing/HowItWorks';
import { FamilyAndCaregivers } from '../components/landing/FamilyAndCaregivers';
import { AboutSection } from '../components/landing/AboutSection';
import { CtaSection } from '../components/landing/CtaSection';
import { Footer } from '../components/layout/Footer';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FBFF]">
      {/* Sticky Navigation Header */}
      <Navbar />

      {/* Main Landing Sections */}
      <main className="flex-grow">
        {/* Hero Section with Interactive Dashboard Preview */}
        <HeroSection />

        {/* Section C: Key Benefits (4 Cards matching wireframe) */}
        <KeyBenefits />

        {/* Section D: How MediVault AI Works (3 Sequential Steps with connecting arrows) */}
        <HowItWorks />

        {/* For Families & Caregivers In-Depth Sections */}
        <FamilyAndCaregivers />

        {/* About Project & Academic Capstone Vision */}
        <AboutSection />

        {/* Final CTA Banner */}
        <CtaSection />
      </main>

      {/* Professional Footer */}
      <Footer />
    </div>
  );
};
