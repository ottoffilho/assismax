import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";

interface FloatingCTAProps {
  onOpenModal: () => void;
}

export default function FloatingCTA({ onOpenModal }: FloatingCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isDismissed) {
        setIsVisible(true);
      }
    }, 3000);

    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > 30 && !isDismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-scale-in">
      <div className="relative">
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs z-10 hover:scale-110 transition-transform"
        >
          <X className="w-3 h-3" />
        </button>

        {/* Main CTA */}
        <div className="bg-white rounded-2xl shadow-strong p-4 max-w-sm">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center flex-shrink-0 animate-pulse-glow">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">
                💰 Preços Especiais!
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Solicite seu orçamento e economize até 20% em produtos essenciais
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={onOpenModal}
                  size="sm" 
                  variant="accent"
                  className="text-xs flex-1"
                >
                  Quero Economizar
                </Button>
                <Button 
                  onClick={() => window.open('https://wa.me/556199999999', '_blank')}
                  size="sm" 
                  variant="outline"
                  className="text-xs"
                >
                  WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Pulse animation */}
        <div className="absolute inset-0 bg-accent/20 rounded-2xl animate-ping"></div>
      </div>
    </div>
  );
}