import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface LeadFormData {
  nome: string;
  telefone: string;
  email: string;
  empresa?: string;
  aceite_termos: boolean;
  aceite_marketing: boolean;
  aceite_whatsapp: boolean;
}

export interface UseLeadCaptureReturn {
  isLoading: boolean;
  isSubmitted: boolean;
  error: string | null;
  submitLead: (data: LeadFormData) => Promise<boolean>;
  reset: () => void;
}

export function useLeadCapture(): UseLeadCaptureReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const submitLead = async (formData: LeadFormData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validações client-side
      if (!formData.nome.trim() || formData.nome.length < 2) {
        throw new Error('Nome deve ter pelo menos 2 caracteres');
      }

      if (!formData.email.trim()) {
        throw new Error('Email é obrigatório');
      }

      // Validação de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Email inválido');
      }

      if (!formData.telefone.trim()) {
        throw new Error('Telefone é obrigatório');
      }

      // Validação de telefone brasileiro
      const telefoneClean = formData.telefone.replace(/\D/g, '');
      if (telefoneClean.length < 10 || telefoneClean.length > 11) {
        throw new Error('Telefone deve ter 10 ou 11 dígitos');
      }

      if (!formData.aceite_termos) {
        throw new Error('É necessário aceitar os termos de uso');
      }

      // Obter informações do cliente
      const ip_address = await getClientIP();
      const user_agent = navigator.userAgent;

      // Chamar Edge Function
      const { data, error } = await supabase.functions.invoke('capture-lead', {
        body: {
          lead: {
            nome: formData.nome.trim(),
            telefone: telefoneClean,
            email: formData.email.toLowerCase().trim(),
            empresa: formData.empresa?.trim() || null,
            aceite_termos: formData.aceite_termos,
            aceite_marketing: formData.aceite_marketing,
            aceite_whatsapp: formData.aceite_whatsapp,
          },
          ip_address,
          user_agent,
        },
      });

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Erro na Edge Function:', error);
        }
        throw new Error(error.message || 'Erro ao processar solicitação');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Erro desconhecido');
      }

      // Sucesso
      setIsSubmitted(true);
      
      toast({
        title: "🎉 Cadastro realizado!",
        description: data.message || "Nossa equipe entrará em contato em breve.",
        duration: 5000,
      });

      // Analytics/métricas client-side (opcional)
      try {
        // Enviar evento para analytics (Google Analytics, etc.)
        if (typeof gtag !== 'undefined') {
          gtag('event', 'lead_captured', {
            event_category: 'engagement',
            event_label: 'landing_page',
            value: 1
          });
        }
      } catch (analyticsError) {
        if (import.meta.env.DEV) {
          console.log('Analytics não disponível:', analyticsError);
        }
      }

      return true;

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.';
      setError(errorMessage);
      
      toast({
        title: "❌ Erro ao cadastrar",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setIsLoading(false);
    setIsSubmitted(false);
    setError(null);
  };

  return {
    isLoading,
    isSubmitted,
    error,
    submitLead,
    reset,
  };
}

// Função auxiliar para obter IP do cliente
async function getClientIP(): Promise<string | null> {
  try {
    // Usando serviço público para obter IP
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.log('Não foi possível obter IP:', error);
    }
    return null;
  }
}

// Validações auxiliares
export const leadValidations = {
  validateNome: (nome: string): string | null => {
    if (!nome.trim()) return 'Nome é obrigatório';
    if (nome.length < 2) return 'Nome deve ter pelo menos 2 caracteres';
    if (nome.length > 100) return 'Nome deve ter no máximo 100 caracteres';
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(nome)) return 'Nome deve conter apenas letras e espaços';
    return null;
  },

  validateEmail: (email: string): string | null => {
    if (!email.trim()) return 'Email é obrigatório';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Email inválido';
    if (email.length > 150) return 'Email muito longo';
    return null;
  },

  validateTelefone: (telefone: string): string | null => {
    if (!telefone.trim()) return 'Telefone é obrigatório';
    const telefoneClean = telefone.replace(/\D/g, '');
    if (telefoneClean.length < 10) return 'Telefone deve ter pelo menos 10 dígitos';
    if (telefoneClean.length > 11) return 'Telefone deve ter no máximo 11 dígitos';
    // Validação específica para números brasileiros
    if (telefoneClean.length === 11 && telefoneClean[2] !== '9') {
      return 'Celular deve começar com 9 após o DDD';
    }
    return null;
  },

  formatTelefone: (telefone: string): string => {
    const clean = telefone.replace(/\D/g, '');
    if (clean.length === 11) {
      return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (clean.length === 10) {
      return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return telefone;
  }
};

// Hook para validação em tempo real
export function useLeadValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: string) => {
    let error: string | null = null;

    switch (field) {
      case 'nome':
        error = leadValidations.validateNome(value);
        break;
      case 'email':
        error = leadValidations.validateEmail(value);
        break;
      case 'telefone':
        error = leadValidations.validateTelefone(value);
        break;
    }

    setErrors(prev => ({
      ...prev,
      [field]: error || ''
    }));

    return !error;
  };

  const clearError = (field: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  const hasErrors = Object.values(errors).some(error => error !== '');

  return {
    errors,
    validateField,
    clearError,
    hasErrors
  };
}