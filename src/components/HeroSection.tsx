import React from 'react';
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import heroImage from "@/assets/hero-warehouse.jpg";
import logoHero from "@/assets/logo/logo hero.png";
import logoAssis from "@/assets/logo/logo.png";

interface HeroSectionProps {
  onOpenModal: () => void;
  onOpenChat?: () => void;
}

export default function HeroSection({ onOpenModal, onOpenChat }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="AssisMax Atacarejo - Distribuição Atacarejo" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-secondary/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 container-responsive text-center text-white">
        <div className="max-w-4xl mx-auto">

          {/* Logo */}
          <div className="flex justify-center mb-8 animate-fade-in-up">
            <img
              src={logoHero}
              alt="AssisMax Atacarejo"
              className="w-64 sm:w-80 md:w-96 lg:w-[450px] h-auto"
            />
          </div>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl lg:text-3xl mb-12 font-light leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Preços de <span className="font-semibold text-accent">atacado</span> para pessoa física.<br />
            Economia real para seu orçamento.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Button
              onClick={onOpenModal}
              size="lg"
              variant="hero"
              className="text-lg px-8 py-4 min-w-[200px]"
            >
              Solicitar Orçamento
            </Button>

            {onOpenChat && (
              <Button
                onClick={onOpenChat}
                size="lg"
                variant="accent"
                className="text-lg px-8 py-4 min-w-[200px] bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <img
                  src={logoAssis}
                  alt="Assis"
                  className="w-5 h-5 mr-2"
                />
                Falar com Assis
              </Button>
            )}
          </div>

          {/* Business Hours */}
          <div className="flex items-center justify-center gap-2 text-white/80 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <Clock className="w-4 h-4" />
            <span className="text-sm">Segunda a Sábado: 7:30h às 17h</span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-float">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}