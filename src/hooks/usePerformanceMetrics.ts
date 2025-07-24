import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface PerformanceMetrics {
  tempoMedioResposta: string;
  satisfacaoCliente: string;
  totalConversas: number;
  conversasHoje: number;
  tempoMedioAtendimento: string;
  leadsPorFuncionario: { funcionario: string; leads: number; conversoes: number }[];
}

export function usePerformanceMetrics(funcionarioId?: string) {
  const { funcionario } = useAuth();
  
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['performance-metrics', funcionarioId || funcionario?.id],
    queryFn: async (): Promise<PerformanceMetrics> => {
      const targetFuncionarioId = funcionarioId || funcionario?.id;
      
      if (!targetFuncionarioId) {
        throw new Error('Funcionário não identificado');
      }

      // Buscar conversas do funcionário
      const { data: conversas } = await supabase
        .from('conversas')
        .select(`
          id,
          lead_id,
          funcionario_id,
          tipo,
          timestamp,
          leads!inner(id, status, created_at, funcionario_id)
        `)
        .eq('funcionario_id', targetFuncionarioId)
        .order('timestamp', { ascending: true });

      // Calcular tempo médio de resposta
      let tempoMedioResposta = '0min';
      if (conversas && conversas.length > 0) {
        const temposResposta: number[] = [];
        
        // Agrupar conversas por lead
        const conversasPorLead = conversas.reduce((acc: Record<string, any[]>, conversa) => {
          if (!acc[conversa.lead_id]) {
            acc[conversa.lead_id] = [];
          }
          acc[conversa.lead_id].push(conversa);
          return acc;
        }, {});

        // Calcular tempo de primeira resposta para cada lead
        Object.values(conversasPorLead).forEach((conversasLead: any[]) => {
          const primeiraRecebida = conversasLead.find(c => c.tipo === 'recebida');
          const primeiraEnviada = conversasLead.find(c => c.tipo === 'enviada' && 
            new Date(c.timestamp) > new Date(primeiraRecebida?.timestamp || 0));
          
          if (primeiraRecebida && primeiraEnviada) {
            const tempoResposta = new Date(primeiraEnviada.timestamp).getTime() - 
                                 new Date(primeiraRecebida.timestamp).getTime();
            temposResposta.push(tempoResposta);
          }
        });

        if (temposResposta.length > 0) {
          const mediaMs = temposResposta.reduce((sum, tempo) => sum + tempo, 0) / temposResposta.length;
          const mediaMinutos = Math.round(mediaMs / (1000 * 60));
          
          if (mediaMinutos < 60) {
            tempoMedioResposta = `${mediaMinutos}min`;
          } else {
            const horas = Math.floor(mediaMinutos / 60);
            const minutos = mediaMinutos % 60;
            tempoMedioResposta = `${horas}h${minutos > 0 ? ` ${minutos}min` : ''}`;
          }
        }
      }

      // Buscar leads do funcionário para calcular satisfação
      const { data: leadsDoFuncionario } = await supabase
        .from('leads')
        .select('id, status, created_at')
        .eq('funcionario_id', targetFuncionarioId);

      // Calcular satisfação baseada na taxa de conversão
      const totalLeads = leadsDoFuncionario?.length || 0;
      const leadsConvertidos = leadsDoFuncionario?.filter(lead => lead.status === 'convertido').length || 0;
      const taxaConversao = totalLeads > 0 ? (leadsConvertidos / totalLeads) * 100 : 0;
      
      // Estimar satisfação baseada na taxa de conversão (conversão alta = satisfação alta)
      let satisfacaoCliente = '0%';
      if (taxaConversao >= 30) {
        satisfacaoCliente = '95%';
      } else if (taxaConversao >= 20) {
        satisfacaoCliente = '85%';
      } else if (taxaConversao >= 10) {
        satisfacaoCliente = '75%';
      } else if (taxaConversao > 0) {
        satisfacaoCliente = '65%';
      }

      // Conversas hoje
      const hoje = new Date().toISOString().split('T')[0];
      const conversasHoje = conversas?.filter(c => 
        c.timestamp.startsWith(hoje)
      ).length || 0;

      // Tempo médio de atendimento (duração das conversas)
      let tempoMedioAtendimento = '< 1h';
      if (conversas && conversas.length > 0) {
        const duracoesPorLead = Object.values(conversasPorLead).map((conversasLead: any[]) => {
          if (conversasLead.length < 2) return 0;
          
          const primeira = new Date(conversasLead[0].timestamp);
          const ultima = new Date(conversasLead[conversasLead.length - 1].timestamp);
          return ultima.getTime() - primeira.getTime();
        }).filter(duracao => duracao > 0);

        if (duracoesPorLead.length > 0) {
          const mediaDuracao = duracoesPorLead.reduce((sum, dur) => sum + dur, 0) / duracoesPorLead.length;
          const mediaHoras = mediaDuracao / (1000 * 60 * 60);
          
          if (mediaHoras < 1) {
            tempoMedioAtendimento = `${Math.round(mediaHoras * 60)}min`;
          } else {
            tempoMedioAtendimento = `${mediaHoras.toFixed(1)}h`;
          }
        }
      }

      // Se for admin, buscar performance de todos os funcionários
      let leadsPorFuncionario: { funcionario: string; leads: number; conversoes: number }[] = [];
      
      if (funcionario?.nivel_acesso === 'admin' || funcionario?.nivel_acesso === 'OWNER') {
        const { data: todosFuncionarios } = await supabase
          .from('funcionarios')
          .select(`
            id,
            nome,
            leads!inner(id, status)
          `)
          .eq('ativo', true);

        leadsPorFuncionario = todosFuncionarios?.map(func => ({
          funcionario: func.nome,
          leads: func.leads?.length || 0,
          conversoes: func.leads?.filter((lead: any) => lead.status === 'convertido').length || 0
        })) || [];
      }

      return {
        tempoMedioResposta,
        satisfacaoCliente,
        totalConversas: conversas?.length || 0,
        conversasHoje,
        tempoMedioAtendimento,
        leadsPorFuncionario
      };
    },
    refetchInterval: 5 * 60 * 1000, // Atualizar a cada 5 minutos
    enabled: !!funcionario?.id
  });

  return { metrics, isLoading, error };
}
