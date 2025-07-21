import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardMetrics {
  leadsHoje: number;
  leadsSemana: number;
  leadsMes: number;
  taxaConversao: number;
  leadsTotal: number;
  leadsPorOrigem: { origem: string; total: number }[];
  leadsPorStatus: { status: string; total: number }[];
  metricasPorDia: { data: string; leads: number }[];
}

export interface Lead {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  origem: string;
  status: string;
  funcionario_id?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  funcionario?: {
    nome: string;
    email: string;
  };
}

export interface LeadFilters {
  status?: string;
  origem?: string;
  funcionario_id?: string;
  data_inicio?: string;
  data_fim?: string;
  busca?: string;
}

export function useDashboard() {
  // Buscar métricas gerais
  const { data: metrics, isLoading: loadingMetrics, error: metricsError } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async (): Promise<DashboardMetrics> => {
      const hoje = new Date().toISOString().split('T')[0];
      const semanaAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const mesAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Buscar empresa padrão
      const { data: empresa } = await supabase
        .from('empresas')
        .select('id')
        .eq('ativo', true)
        .limit(1)
        .single();

      if (!empresa) {
        throw new Error('Empresa não encontrada');
      }

      // Leads hoje
      const { count: leadsHoje } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('empresa_id', empresa.id)
        .gte('created_at', hoje);

      // Leads última semana
      const { count: leadsSemana } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('empresa_id', empresa.id)
        .gte('created_at', semanaAtras);

      // Leads último mês
      const { count: leadsMes } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('empresa_id', empresa.id)
        .gte('created_at', mesAtras);

      // Total de leads
      const { count: leadsTotal } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('empresa_id', empresa.id);

      // Leads por origem
      const { data: leadsPorOrigem } = await supabase
        .from('leads')
        .select('origem')
        .eq('empresa_id', empresa.id);

      const origemCounts = leadsPorOrigem?.reduce((acc: Record<string, number>, lead) => {
        acc[lead.origem] = (acc[lead.origem] || 0) + 1;
        return acc;
      }, {}) || {};

      // Leads por status
      const { data: leadsPorStatus } = await supabase
        .from('leads')
        .select('status')
        .eq('empresa_id', empresa.id);

      const statusCounts = leadsPorStatus?.reduce((acc: Record<string, number>, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      }, {}) || {};

      // Métricas por dia (últimos 30 dias)
      const { data: metricasDiarias } = await supabase
        .from('leads')
        .select('created_at')
        .eq('empresa_id', empresa.id)
        .gte('created_at', mesAtras)
        .order('created_at', { ascending: true });

      const metricasPorDia = metricasDiarias?.reduce((acc: Record<string, number>, lead) => {
        const data = lead.created_at.split('T')[0];
        acc[data] = (acc[data] || 0) + 1;
        return acc;
      }, {}) || {};

      // Calcular taxa de conversão (leads convertidos / total)
      const leadsConvertidos = statusCounts['convertido'] || 0;
      const taxaConversao = leadsTotal ? (leadsConvertidos / leadsTotal) * 100 : 0;

      return {
        leadsHoje: leadsHoje || 0,
        leadsSemana: leadsSemana || 0,
        leadsMes: leadsMes || 0,
        leadsTotal: leadsTotal || 0,
        taxaConversao: Math.round(taxaConversao * 100) / 100,
        leadsPorOrigem: Object.entries(origemCounts).map(([origem, total]) => ({ origem, total })),
        leadsPorStatus: Object.entries(statusCounts).map(([status, total]) => ({ status, total })),
        metricasPorDia: Object.entries(metricasPorDia).map(([data, leads]) => ({ data, leads }))
      };
    },
    refetchInterval: 5 * 60 * 1000, // Atualizar a cada 5 minutos
  });

  return {
    metrics,
    isLoadingMetrics: loadingMetrics,
    metricsError
  };
}

export function useLeads(filters: LeadFilters = {}) {
  const [currentFilters, setCurrentFilters] = useState<LeadFilters>(filters);

  const { data: leads, isLoading: loadingLeads, error: leadsError, refetch } = useQuery({
    queryKey: ['leads', currentFilters],
    queryFn: async (): Promise<Lead[]> => {
      // Buscar empresa padrão
      const { data: empresa } = await supabase
        .from('empresas')
        .select('id')
        .eq('ativo', true)
        .limit(1)
        .single();

      if (!empresa) {
        throw new Error('Empresa não encontrada');
      }

      let query = supabase
        .from('leads')
        .select(`
          id,
          nome,
          telefone,
          email,
          origem,
          status,
          funcionario_id,
          observacoes,
          created_at,
          updated_at,
          funcionario:funcionarios(nome, email)
        `)
        .eq('empresa_id', empresa.id);

      // Aplicar filtros
      if (currentFilters.status) {
        query = query.eq('status', currentFilters.status);
      }
      
      if (currentFilters.origem) {
        query = query.eq('origem', currentFilters.origem);
      }
      
      if (currentFilters.funcionario_id) {
        query = query.eq('funcionario_id', currentFilters.funcionario_id);
      }
      
      if (currentFilters.data_inicio) {
        query = query.gte('created_at', currentFilters.data_inicio);
      }
      
      if (currentFilters.data_fim) {
        query = query.lte('created_at', currentFilters.data_fim);
      }

      if (currentFilters.busca) {
        query = query.or(
          `nome.ilike.%${currentFilters.busca}%,email.ilike.%${currentFilters.busca}%,telefone.ilike.%${currentFilters.busca}%`
        );
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        throw error;
      }

      return data || [];
    },
    refetchInterval: 2 * 60 * 1000, // Atualizar a cada 2 minutos
  });

  const updateFilters = (newFilters: LeadFilters) => {
    setCurrentFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setCurrentFilters({});
  };

  return {
    leads,
    isLoadingLeads: loadingLeads,
    leadsError,
    filters: currentFilters,
    updateFilters,
    clearFilters,
    refetchLeads: refetch
  };
}

export function useLeadActions() {
  const updateLeadStatus = async (leadId: string, status: string, observacoes?: string) => {
    const { error } = await supabase
      .from('leads')
      .update({ 
        status, 
        observacoes,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId);

    if (error) {
      throw error;
    }
  };

  const assignLeadToFuncionario = async (leadId: string, funcionarioId: string) => {
    const { error } = await supabase
      .from('leads')
      .update({ 
        funcionario_id: funcionarioId,
        status: 'em_atendimento',
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId);

    if (error) {
      throw error;
    }
  };

  return {
    updateLeadStatus,
    assignLeadToFuncionario
  };
}