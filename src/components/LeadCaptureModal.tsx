import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { X, CheckCircle } from "lucide-react";

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  nome: string;
  telefone: string;
  email: string;
  empresa: string;
  aceitaTermos: boolean;
  aceitaMarketing: boolean;
  aceitaWhatsapp: boolean;
}

export default function LeadCaptureModal({ isOpen, onClose }: LeadCaptureModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    telefone: '',
    email: '',
    empresa: '',
    aceitaTermos: false,
    aceitaMarketing: false,
    aceitaWhatsapp: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.aceitaTermos) {
      toast({
        title: "Aceite os termos",
        description: "É necessário aceitar os termos para continuar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simular envio para Supabase
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSubmitted(true);
      
      toast({
        title: "Lead capturado com sucesso!",
        description: "Em breve nossa equipe entrará em contato.",
      });

      // Reset form after delay
      setTimeout(() => {
        setFormData({
          nome: '',
          telefone: '',
          email: '',
          empresa: '',
          aceitaTermos: false,
          aceitaMarketing: false,
          aceitaWhatsapp: false
        });
        setIsSubmitted(false);
        onClose();
      }, 2000);

    } catch (error) {
      toast({
        title: "Erro ao capturar lead",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-success mb-2">
              Sucesso!
            </h3>
            <p className="text-muted-foreground">
              Seu interesse foi registrado. Nossa equipe entrará em contato em breve!
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gradient-primary">
            Solicite seu Orçamento
          </DialogTitle>
          <DialogDescription>
            Preencha seus dados e receba preços especiais de atacado
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo *</Label>
              <Input
                id="nome"
                type="text"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                required
                placeholder="Seu nome"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone/WhatsApp *</Label>
              <Input
                id="telefone"
                type="tel"
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                required
                placeholder="(61) 99999-9999"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              placeholder="seu@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="empresa">Empresa/Estabelecimento</Label>
            <Input
              id="empresa"
              type="text"
              value={formData.empresa}
              onChange={(e) => handleInputChange('empresa', e.target.value)}
              placeholder="Nome da sua empresa (opcional)"
            />
          </div>

          {/* LGPD Compliance */}
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="termos"
                checked={formData.aceitaTermos}
                onCheckedChange={(checked) => handleInputChange('aceitaTermos', !!checked)}
              />
              <Label htmlFor="termos" className="text-sm leading-relaxed">
                Aceito os <span className="text-primary font-medium cursor-pointer hover:underline">termos de uso</span> e 
                <span className="text-primary font-medium cursor-pointer hover:underline"> política de privacidade</span> *
              </Label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="marketing"
                checked={formData.aceitaMarketing}
                onCheckedChange={(checked) => handleInputChange('aceitaMarketing', !!checked)}
              />
              <Label htmlFor="marketing" className="text-sm leading-relaxed">
                Autorizo o envio de ofertas e promoções por e-mail
              </Label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="whatsapp"
                checked={formData.aceitaWhatsapp}
                onCheckedChange={(checked) => handleInputChange('aceitaWhatsapp', !!checked)}
              />
              <Label htmlFor="whatsapp" className="text-sm leading-relaxed">
                Autorizo contato via WhatsApp para ofertas exclusivas
              </Label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.aceitaTermos}
              className="flex-1 btn-hero"
            >
              {isLoading ? "Enviando..." : "Solicitar Orçamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}