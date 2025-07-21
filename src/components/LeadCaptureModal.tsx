import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useLeadCapture, useLeadValidation, leadValidations, type LeadFormData } from "@/hooks/useLeadCapture";

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LeadCaptureModal({ isOpen, onClose }: LeadCaptureModalProps) {
  const { isLoading, isSubmitted, error, submitLead, reset } = useLeadCapture();
  const { errors, validateField, clearError, hasErrors } = useLeadValidation();
  
  const [formData, setFormData] = useState<LeadFormData>({
    nome: '',
    telefone: '',
    email: '',
    empresa: '',
    aceite_termos: false,
    aceite_marketing: false,
    aceite_whatsapp: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar todos os campos
    const isNomeValid = validateField('nome', formData.nome);
    const isEmailValid = validateField('email', formData.email);
    const isTelefoneValid = validateField('telefone', formData.telefone);
    
    if (!isNomeValid || !isEmailValid || !isTelefoneValid || !formData.aceite_termos) {
      return;
    }

    const success = await submitLead(formData);
    
    if (success) {
      // Reset form after delay
      setTimeout(() => {
        setFormData({
          nome: '',
          telefone: '',
          email: '',
          empresa: '',
          aceite_termos: false,
          aceite_marketing: false,
          aceite_whatsapp: false
        });
        reset();
        onClose();
      }, 3000);
    }
  };

  const handleInputChange = (field: keyof LeadFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro quando usuário começar a digitar
    if (typeof value === 'string' && value) {
      clearError(field);
    }
    
    // Formatação automática do telefone
    if (field === 'telefone' && typeof value === 'string') {
      const formatted = leadValidations.formatTelefone(value);
      if (formatted !== value) {
        setFormData(prev => ({ ...prev, [field]: formatted }));
      }
    }
  };

  // Reset form quando modal fechar
  useEffect(() => {
    if (!isOpen && !isSubmitted) {
      setFormData({
        nome: '',
        telefone: '',
        email: '',
        empresa: '',
        aceite_termos: false,
        aceite_marketing: false,
        aceite_whatsapp: false
      });
      reset();
    }
  }, [isOpen, isSubmitted]);

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-600 mb-2">
              🎉 Cadastro Realizado!
            </h3>
            <p className="text-muted-foreground mb-4">
              Obrigado! Seu interesse foi registrado com sucesso.
            </p>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <strong>Próximos passos:</strong><br />
                • Nossa equipe entrará em contato em até 2 horas<br />
                • Você receberá preços especiais de atacado<br />
                • Verificar WhatsApp para ofertas exclusivas
              </p>
            </div>
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
                onBlur={() => validateField('nome', formData.nome)}
                required
                placeholder="Seu nome completo"
                className={errors.nome ? 'border-red-500 focus:border-red-500' : ''}
              />
              {errors.nome && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  {errors.nome}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone/WhatsApp *</Label>
              <Input
                id="telefone"
                type="tel"
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                onBlur={() => validateField('telefone', formData.telefone)}
                required
                placeholder="(61) 99999-9999"
                maxLength={15}
                className={errors.telefone ? 'border-red-500 focus:border-red-500' : ''}
              />
              {errors.telefone && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  {errors.telefone}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={() => validateField('email', formData.email)}
              required
              placeholder="seu@email.com"
              className={errors.email ? 'border-red-500 focus:border-red-500' : ''}
            />
            {errors.email && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errors.email}
              </div>
            )}
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
                checked={formData.aceite_termos}
                onCheckedChange={(checked) => handleInputChange('aceite_termos', !!checked)}
              />
              <Label htmlFor="termos" className="text-sm leading-relaxed">
                Aceito os <span className="text-primary font-medium cursor-pointer hover:underline">termos de uso</span> e 
                <span className="text-primary font-medium cursor-pointer hover:underline"> política de privacidade</span> *
              </Label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="marketing"
                checked={formData.aceite_marketing}
                onCheckedChange={(checked) => handleInputChange('aceite_marketing', !!checked)}
              />
              <Label htmlFor="marketing" className="text-sm leading-relaxed">
                Autorizo o envio de ofertas e promoções por e-mail
              </Label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="whatsapp"
                checked={formData.aceite_whatsapp}
                onCheckedChange={(checked) => handleInputChange('aceite_whatsapp', !!checked)}
              />
              <Label htmlFor="whatsapp" className="text-sm leading-relaxed">
                Autorizo contato via WhatsApp para ofertas exclusivas
              </Label>
            </div>
          </div>

          {/* Erro geral */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Erro:</span>
              </div>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          )}

          {/* Alerta se termos não aceitos */}
          {!formData.aceite_termos && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                ⚠️ É necessário aceitar os termos de uso para continuar.
              </p>
            </div>
          )}

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
              disabled={isLoading || !formData.aceite_termos || hasErrors}
              className="flex-1 btn-hero"
            >
              {isLoading ? "Processando..." : "Solicitar Orçamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}