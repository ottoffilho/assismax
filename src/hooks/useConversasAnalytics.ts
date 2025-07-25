import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ConversaIA {
  id: string;
  lead_id: string | null;
  mensagem: string;
  resposta: string;
  contexto: any;
  timestamp: string;
}

interface AnalyticsData {
  totalConversas: number;
  conversasHoje: number;
  conversasSemana: number;
  produtosMaisPerguntados: Array<{
    produto: string;
    mencoes: number;
  }>;
  duvidasMaisFrequentes: Array<{
    categoria: string;
    count: number;
    exemplos: string[];
  }>;
  horariosPico: Array<{
    hora: number;
    conversas: number;
  }>;
  taxaEngajamento: {
    conversasComNome: number;
    conversasComTelefone: number;
    conversasQualificadas: number;
  };
  palavrasChave: Array<{
    palavra: string;
    frequencia: number;
  }>;
}

export function useConversasAnalytics(periodo: 'hoje' | 'semana' | 'mes' | 'todos' = 'semana') {
  return useQuery({
    queryKey: ['conversas-analytics', periodo],
    queryFn: async (): Promise<AnalyticsData> => {
      // Calcular data de início baseado no período
      const agora = new Date();
      let dataInicio: Date;
      
      switch (periodo) {
        case 'hoje':
          dataInicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
          break;
        case 'semana':
          dataInicio = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'mes':
          dataInicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
          break;
        default:
          dataInicio = new Date(0); // Todos os dados
      }

      // Buscar conversas do período
      const { data: conversas, error } = await supabase
        .from('conversas_ia')
        .select('*')
        .gte('timestamp', dataInicio.toISOString())
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Erro ao buscar conversas:', error);
        throw error;
      }

      const conversasData = conversas as ConversaIA[];

      // Calcular métricas básicas
      const totalConversas = conversasData.length;
      
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const conversasHoje = conversasData.filter(c => 
        new Date(c.timestamp) >= hoje
      ).length;

      const semanaAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const conversasSemana = conversasData.filter(c => 
        new Date(c.timestamp) >= semanaAtras
      ).length;

      // Analisar produtos mais perguntados
      const produtosMencoes = new Map<string, number>();
      conversasData.forEach(conversa => {
        const produtosMencionados = conversa.contexto?.produtos_mencionados || [];
        produtosMencionados.forEach((produto: string) => {
          produtosMencoes.set(produto, (produtosMencoes.get(produto) || 0) + 1);
        });
      });

      const produtosMaisPerguntados = Array.from(produtosMencoes.entries())
        .map(([produto, mencoes]) => ({ produto, mencoes }))
        .sort((a, b) => b.mencoes - a.mencoes)
        .slice(0, 10);

      // Categorizar dúvidas mais frequentes
      const categoriasDuvidas = new Map<string, { count: number; exemplos: string[] }>();
      
      conversasData.forEach(conversa => {
        const mensagem = conversa.mensagem.toLowerCase();
        let categoria = 'outros';
        
        if (mensagem.includes('preço') || mensagem.includes('valor') || mensagem.includes('custa')) {
          categoria = 'preços';
        } else if (mensagem.includes('entrega') || mensagem.includes('frete')) {
          categoria = 'entrega';
        } else if (mensagem.includes('produto') || mensagem.includes('tem ')) {
          categoria = 'disponibilidade';
        } else if (mensagem.includes('atacado') || mensagem.includes('quantidade')) {
          categoria = 'atacado';
        } else if (mensagem.includes('qualidade') || mensagem.includes('marca')) {
          categoria = 'qualidade';
        } else if (mensagem.includes('pagamento') || mensagem.includes('forma')) {
          categoria = 'pagamento';
        }

        const atual = categoriasDuvidas.get(categoria) || { count: 0, exemplos: [] };
        atual.count++;
        if (atual.exemplos.length < 3) {
          atual.exemplos.push(conversa.mensagem);
        }
        categoriasDuvidas.set(categoria, atual);
      });

      const duvidasMaisFrequentes = Array.from(categoriasDuvidas.entries())
        .map(([categoria, data]) => ({ categoria, ...data }))
        .sort((a, b) => b.count - a.count);

      // Analisar horários de pico
      const horarios = new Map<number, number>();
      conversasData.forEach(conversa => {
        const hora = new Date(conversa.timestamp).getHours();
        horarios.set(hora, (horarios.get(hora) || 0) + 1);
      });

      const horariosPico = Array.from(horarios.entries())
        .map(([hora, conversas]) => ({ hora, conversas }))
        .sort((a, b) => b.conversas - a.conversas);

      // Calcular taxa de engajamento
      const conversasComNome = conversasData.filter(c => 
        c.contexto?.nome_lead && c.contexto.nome_lead !== ''
      ).length;

      const conversasComTelefone = conversasData.filter(c => 
        c.contexto?.telefone_lead && c.contexto.telefone_lead !== ''
      ).length;

      const conversasQualificadas = conversasData.filter(c => 
        c.contexto?.stage === 'sales_mode' || c.contexto?.stage === 'data_complete'
      ).length;

      // Extrair palavras-chave mais frequentes
      const palavras = new Map<string, number>();
      conversasData.forEach(conversa => {
        const texto = conversa.mensagem.toLowerCase();
        const palavrasTexto = texto.split(/\s+/).filter(p => p.length > 3);
        
        palavrasTexto.forEach(palavra => {
          // Filtrar palavras comuns
          const palavrasComuns = ['para', 'com', 'que', 'uma', 'tem', 'você', 'aqui', 'mais', 'como', 'qual', 'onde', 'quando'];
          if (!palavrasComuns.includes(palavra)) {
            palavras.set(palavra, (palavras.get(palavra) || 0) + 1);
          }
        });
      });

      const palavrasChave = Array.from(palavras.entries())
        .map(([palavra, frequencia]) => ({ palavra, frequencia }))
        .sort((a, b) => b.frequencia - a.frequencia)
        .slice(0, 20);

      return {
        totalConversas,
        conversasHoje,
        conversasSemana,
        produtosMaisPerguntados,
        duvidasMaisFrequentes,
        horariosPico,
        taxaEngajamento: {
          conversasComNome,
          conversasComTelefone,
          conversasQualificadas
        },
        palavrasChave
      };
    },
    refetchInterval: 5 * 60 * 1000, // Atualizar a cada 5 minutos
    staleTime: 2 * 60 * 1000, // Considerar dados frescos por 2 minutos
  });
}

// Hook para buscar conversas individuais
export function useConversasDetalhadas(limite: number = 50) {
  return useQuery({
    queryKey: ['conversas-detalhadas', limite],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversas_ia')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limite);

      if (error) throw error;
      return data as ConversaIA[];
    },
    refetchInterval: 30 * 1000, // Atualizar a cada 30 segundos
  });
}

// Hook para buscar conversas de um lead específico
export function useConversasLead(leadId: string) {
  return useQuery({
    queryKey: ['conversas-lead', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversas_ia')
        .select('*')
        .eq('lead_id', leadId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      return data as ConversaIA[];
    },
    enabled: !!leadId,
  });
}
