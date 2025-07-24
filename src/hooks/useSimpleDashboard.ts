import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SimpleLead {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  origem: string;
  status: string;
  created_at: string;
}

export function useSimpleDashboard() {
  const { data: leads, isLoading, error } = useQuery({
    queryKey: ['simple-leads'],
    retry: 1,
    staleTime: 0,
    queryFn: async (): Promise<SimpleLead[]> => {
      console.log('Buscando leads...');

      const { data, error } = await supabase
        .from('leads')
        .select('id, nome, telefone, email, origem, status, created_at')
        .order('created_at', { ascending: false });

      console.log('Query resultado - data:', data);
      console.log('Query resultado - error:', error);

      if (error) {
        console.error('❌ Erro ao buscar leads:', error);
        throw error;
      }

      console.log('✅ Leads encontrados:', data?.length || 0);
      console.log('📊 Dados dos leads:', data);

      return data || [];
    },
  });

  return { leads, isLoading, error };
}