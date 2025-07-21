import React from 'react';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FooterProps {
  onOpenModal: () => void;
}

export default function Footer({ onOpenModal }: FooterProps) {
  return (
    <footer className="bg-gradient-to-b from-primary to-primary-hover text-white">
      {/* Main Footer Content */}
      <div className="section-padding">
        <div className="container-responsive">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Company Info */}
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-4">AssisMax Atacarejo</h3>
                <p className="text-white/80 leading-relaxed">
                  Sua distribuidora de confiança em Valparaíso de Goiás. 
                  Produtos essenciais com preços de atacado para pessoa física.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-accent" />
                  <span className="text-sm">Valparaíso de Goiás, GO</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-accent" />
                  <span className="text-sm">(61) 99999-9999</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-accent" />
                  <span className="text-sm">contato@assismax.com.br</span>
                </div>
              </div>
            </div>

            {/* Horário de Funcionamento */}
            <div className="space-y-6">
              <h4 className="text-xl font-semibold">Horário de Funcionamento</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-accent" />
                  <div>
                    <p className="font-medium">Segunda a Sexta</p>
                    <p className="text-white/80 text-sm">7:00 às 18:00</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-accent" />
                  <div>
                    <p className="font-medium">Sábado</p>
                    <p className="text-white/80 text-sm">7:00 às 16:00</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-accent" />
                  <div>
                    <p className="font-medium">Domingo</p>
                    <p className="text-white/80 text-sm">Fechado</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Produtos */}
            <div className="space-y-6">
              <h4 className="text-xl font-semibold">Nossos Produtos</h4>
              <ul className="space-y-2 text-white/80">
                <li className="hover:text-accent transition-colors cursor-pointer">• Arroz e Cereais</li>
                <li className="hover:text-accent transition-colors cursor-pointer">• Feijão e Leguminosas</li>
                <li className="hover:text-accent transition-colors cursor-pointer">• Óleos e Gorduras</li>
                <li className="hover:text-accent transition-colors cursor-pointer">• Café e Bebidas</li>
                <li className="hover:text-accent transition-colors cursor-pointer">• Leite e Laticínios</li>
                <li className="hover:text-accent transition-colors cursor-pointer">• Produtos de Limpeza</li>
              </ul>
            </div>

            {/* CTA & Social */}
            <div className="space-y-6">
              <h4 className="text-xl font-semibold">Fale Conosco</h4>
              <p className="text-white/80 text-sm leading-relaxed">
                Solicite seu orçamento personalizado e descubra quanto você pode economizar conosco.
              </p>
              
              <Button 
                onClick={onOpenModal}
                variant="accent"
                className="w-full"
              >
                Solicitar Orçamento
              </Button>

              <div className="space-y-4">
                <h5 className="font-medium">Redes Sociais</h5>
                <div className="flex gap-4">
                  <button 
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                    onClick={() => window.open('https://wa.me/556199999999', '_blank')}
                  >
                    <MessageCircle className="w-5 h-5" />
                  </button>
                  <button 
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                    onClick={() => window.open('https://instagram.com/assismaxatacarejooficial', '_blank')}
                  >
                    <Instagram className="w-5 h-5" />
                  </button>
                  <button 
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                    onClick={() => window.open('https://facebook.com/assismaxatacarejooficial', '_blank')}
                  >
                    <Facebook className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/20 py-6">
        <div className="container-responsive">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/70">
            <div className="text-center md:text-left">
              <p>&copy; 2024 AssisMax Atacarejo. Todos os direitos reservados.</p>
            </div>
            <div className="flex gap-6 text-center md:text-right">
              <button className="hover:text-accent transition-colors">
                Política de Privacidade
              </button>
              <button className="hover:text-accent transition-colors">
                Termos de Uso
              </button>
              <button className="hover:text-accent transition-colors">
                LGPD
              </button>
              <a href="/admin" className="hover:text-accent transition-colors">
                Admin
              </a>
              <a href="/funcionarios" className="hover:text-accent transition-colors">
                Funcionários
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}