import React, { useState } from 'react';
import HeroSection from "@/components/HeroSection";
import ProductShowcase from "@/components/ProductShowcase";
import StatsSection from "@/components/StatsSection";
import Footer from "@/components/Footer";
import LeadCaptureModal from "@/components/LeadCaptureModal";
import SimpleChatbotModal from "@/components/SimpleChatbotModal";

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const openChat = () => setIsChatOpen(true);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection onOpenModal={openModal} onOpenChat={openChat} />

      {/* Product Showcase */}
      <ProductShowcase onOpenModal={openModal} />

      {/* Stats Section */}
      <StatsSection />

      {/* Footer */}
      <Footer onOpenModal={openModal} />

      {/* Lead Capture Modal */}
      <LeadCaptureModal isOpen={isModalOpen} onClose={closeModal} />

      {/* Chatbot Modal - NOVO SIMPLES */}
      <SimpleChatbotModal open={isChatOpen} onOpenChange={setIsChatOpen} />
    </div>
  );
};

export default Index;
