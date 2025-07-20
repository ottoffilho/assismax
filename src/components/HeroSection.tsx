import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Phone, Clock } from "lucide-react";
import heroImage from "@/assets/hero-warehouse.jpg";

interface HeroSectionProps {
  onOpenModal: () => void;
}

export default function HeroSection({ onOpenModal }: HeroSectionProps) {
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
          {/* Company Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6 animate-fade-in">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">Valparaíso de Goiás, GO</span>
          </div>

          {/* Logo */}
          <div className="flex justify-center mb-4 animate-fade-in-up">
            <img 
              src="/lovable-uploads/ffc3c5d5-3865-4497-aea9-6104400c0994.png" 
              alt="AssisMax Atacarejo" 
              className="h-52 md:h-64 lg:h-80 w-auto"
            />
          </div>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl lg:text-3xl mb-8 font-light leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Preços de <span className="font-semibold text-accent">atacado</span> para pessoa física.<br />
            Economia real para seu orçamento.
          </p>

          {/* Value Proposition */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse-glow"></div>
              <span className="font-medium">Arroz • Feijão • Óleo</span>
            </div>
            <div className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse-glow" style={{ animationDelay: '0.5s' }}></div>
              <span className="font-medium">Café • Leite • Bebidas</span>
            </div>
            <div className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
              <span className="font-medium">Produtos Essenciais</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <Button 
              onClick={onOpenModal}
              size="lg"
              variant="hero"
              className="text-lg px-8 py-4 min-w-[200px]"
            >
              Solicitar Orçamento
              <ArrowRight className="w-5 h-5" />
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4 min-w-[200px] bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
              onClick={() => window.open('https://wa.me/556199999999', '_blank')}
            >
              <Phone className="w-5 h-5" />
              WhatsApp
            </Button>
          </div>

          {/* Business Hours */}
          <div className="flex items-center justify-center gap-2 text-white/80 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <Clock className="w-4 h-4" />
            <span className="text-sm">Segunda a Sábado: 7h às 18h</span>
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