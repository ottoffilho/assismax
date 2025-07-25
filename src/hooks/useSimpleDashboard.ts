import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SimpleLead {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  origem: string;
  status: string;
  funcionario_id: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  funcionarios?: {
    nome: string;
    email: string;
  } | null;
}

export function useSimpleDashboard() {
  const { data: leads, isLoading, error } = useQuery({
    queryKey: ['simple-leads-with-funcionarios'],
    retry: 1,
    staleTime: 0,
    queryFn: async (): Promise<SimpleLead[]> => {
      console.log('🔍 Buscando leads com funcionários...');

      // Usar SQL direto via RPC para garantir que o JOIN funcione
      const { data, error } = await supabase.rpc('get_leads_with_funcionarios');

      console.log('🔍 Query resultado - data:', data);
      console.log('🔍 Query resultado - error:', error);

      if (error) {
        console.error('❌ Erro ao buscar leads:', error);
        throw error;
      }

      console.log('✅ Leads encontrados:', data?.length || 0);
      console.log('📊 Dados dos leads:', data);

      // Debug específico para o funcionario
      if (data && data.length > 0) {
        data.forEach((lead: any, index: number) => {
          console.log(`🔍 Lead ${index + 1}:`, {
            nome: lead.nome,
            funcionario_id: lead.funcionario_id,
            funcionario_nome: lead.funcionario_nome,
            funcionario_email: lead.funcionario_email,
            status: lead.status,
            'Object.keys(lead)': Object.keys(lead)
          });
        });
      }

      // Transformar os dados para o formato esperado
      const transformedData = data?.map((lead: any) => ({
        ...lead,
        funcionarios: lead.funcionario_nome ? {
          nome: lead.funcionario_nome,
          email: lead.funcionario_email
        } : null
      })) || [];

      console.log('🔄 Dados transformados:', transformedData);

      return transformedData;
    },
  });

  return { leads, isLoading, error };
}