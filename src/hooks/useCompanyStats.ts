import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CompanyStats {
  clientesSatisfeitos: string;
  produtosDisponiveis: string;
  entregasPorSemana: string;
  anosExperiencia: string;
  faturamentoMensal: string;
}

export function useCompanyStats() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['company-stats'],
    queryFn: async (): Promise<CompanyStats> => {
      // Buscar número de leads convertidos (clientes satisfeitos)
      const { count: leadsConvertidos } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'convertido');

      // Buscar número de produtos ativos
      const { count: produtosAtivos } = await supabase
        .from('produtos')
        .select('*', { count: 'exact', head: true })
        .eq('ativo', true);

      // Buscar métricas de entrega (baseado em conversões semanais)
      const semanaAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const { count: conversoesSemanais } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'convertido')
        .gte('updated_at', semanaAtras);

      // Buscar data de criação da empresa para calcular anos de experiência
      const { data: empresa } = await supabase
        .from('empresas')
        .select('created_at')
        .single();

      let anosExperiencia = '1+';
      if (empresa?.created_at) {
        const criadaEm = new Date(empresa.created_at);
        const agora = new Date();
        const anos = Math.floor((agora.getTime() - criadaEm.getTime()) / (1000 * 60 * 60 * 24 * 365));
        anosExperiencia = anos > 0 ? `${anos}+` : '< 1';
      }

      // Calcular faturamento estimado baseado em conversões
      const faturamentoEstimado = (leadsConvertidos || 0) * 287.5; // Ticket médio estimado
      const faturamentoFormatado = faturamentoEstimado > 1000000 
        ? `R$ ${(faturamentoEstimado / 1000000).toFixed(1)}M`
        : faturamentoEstimado > 1000
        ? `R$ ${(faturamentoEstimado / 1000).toFixed(0)}k`
        : `R$ ${faturamentoEstimado.toFixed(0)}`;

      return {
        clientesSatisfeitos: leadsConvertidos ? `${leadsConvertidos}+` : '0',
        produtosDisponiveis: produtosAtivos ? `${produtosAtivos}+` : '0',
        entregasPorSemana: conversoesSemanais ? `${conversoesSemanais}+` : '0',
        anosExperiencia,
        faturamentoMensal: faturamentoFormatado
      };
    },
    refetchInterval: 30 * 60 * 1000, // Atualizar a cada 30 minutos
    staleTime: 15 * 60 * 1000, // Considerar dados válidos por 15 minutos
  });

  return { stats, isLoading, error };
}
