import React, { useState } from 'react';
import HeroSection from "@/components/HeroSection";
import ProductShowcase from "@/components/ProductShowcase";
import StatsSection from "@/components/StatsSection";
import Footer from "@/components/Footer";
import LeadCaptureModal from "@/components/LeadCaptureModal";
import FloatingCTA from "@/components/FloatingCTA";

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection onOpenModal={openModal} />
      
      {/* Product Showcase */}
      <ProductShowcase onOpenModal={openModal} />
      
      {/* Stats Section */}
      <StatsSection />
      
      {/* Footer */}
      <Footer onOpenModal={openModal} />
      
      {/* Lead Capture Modal */}
      <LeadCaptureModal isOpen={isModalOpen} onClose={closeModal} />
      
      {/* Floating CTA */}
      <FloatingCTA onOpenModal={openModal} />
    </div>
  );
};

export default Index;
