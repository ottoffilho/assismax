import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  TrendingUp, 
  MessageSquare, 
  Target, 
  RefreshCw, 
  ArrowLeft,
  Calendar,
  BarChart3,
  Download,
  LogOut,
  UserPlus,
  FileText,
  Activity,
  Package
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { DashboardLayout } from '@/components/dashboard/layout/DashboardLayout';
import { MetricCard } from '@/components/dashboard/cards/MetricCard';
import { LeadsTable } from '@/components/dashboard/LeadsTable';
import { LeadsFilters } from '@/components/dashboard/LeadsFilters';
import { FuncionariosManager } from '@/components/admin/FuncionariosManager';
import { ProdutosManager } from '@/components/admin/ProdutosManager';
import { useDashboard, useLeads } from '@/hooks/useDashboard';
import { useSimpleDashboard } from '@/hooks/useSimpleDashboard';
import { useAuth } from '@/hooks/useAuth';
import { DonutChart } from '@/components/dashboard/charts/DonutChart';
import { BarChart } from '@/components/dashboard/charts/BarChart';
import { LineChart } from '@/components/dashboard/charts/LineChart';

export default function AdminDashboard() {
  const { metrics, isLoadingMetrics, metricsError } = useDashboard();
  const { leads, isLoadingLeads, leadsError, filters, updateFilters, clearFilters, refetchLeads } = useLeads();
  const { leads: simpleLeads, isLoading: simpleLoading, error: simpleError } = useSimpleDashboard();
  const { funcionario, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Ler tab da URL
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'overview';

  const handleTabChange = (value: string) => {
    navigate(`/admin?tab=${value}`);
  };

  const handleRefresh = () => {
    refetchLeads();
    window.location.reload(); // Para atualizar métricas também
  };

  // Debug: log dos dados recebidos
  console.log('Simple leads:', simpleLeads);
  console.log('Simple loading:', simpleLoading);
  console.log('Simple error:', simpleError);

  // Preparar dados para gráficos usando useMemo
  const weeklyLeadsData = React.useMemo(() => {
    if (!metrics?.metricasPorDia || metrics.metricasPorDia.length === 0) {
      return [];
    }

    // Obter últimos 7 dias
    const hoje = new Date();
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    return Array.from({ length: 7 }, (_, i) => {
      const data = new Date(hoje);
      data.setDate(hoje.getDate() - (6 - i));
      const dataStr = data.toISOString().split('T')[0];
      const diaSemana = diasSemana[data.getDay()];
      
      const dadosDia = metrics.metricasPorDia.find(m => m.data === dataStr);
      const leads = dadosDia?.leads || 0;
      
      // Estimar conversões baseado na taxa de conversão geral
      const conversoes = Math.round(leads * (metrics.taxaConversao / 100));
      
      return {
        name: diaSemana,
        leads,
        conversoes
      };
    });
  }, [metrics?.metricasPorDia, metrics?.taxaConversao]);

  const conversionTrendData = React.useMemo(() => {
    if (!metrics?.metricasPorDia || metrics.metricasPorDia.length === 0) {
      return [];
    }

    // Agrupar dados por semana dos últimos 30 dias
    const dataAtual = new Date();
    const semanas = [];
    
    for (let i = 0; i < 6; i++) {
      const inicioSemana = new Date(dataAtual);
      inicioSemana.setDate(dataAtual.getDate() - (i * 7) - 6);
      const fimSemana = new Date(dataAtual);
      fimSemana.setDate(dataAtual.getDate() - (i * 7));
      
      const dadosSemana = metrics.metricasPorDia.filter(m => {
        const data = new Date(m.data);
        return data >= inicioSemana && data <= fimSemana;
      });
      
      const totalLeads = dadosSemana.reduce((sum, d) => sum + d.leads, 0);
      const conversoes = Math.round(totalLeads * (metrics.taxaConversao / 100));
      const taxa = totalLeads > 0 ? Math.round((conversoes / totalLeads) * 100) : 0;
      
      semanas.unshift({
        name: `S${i + 1}`,
        taxa: taxa
      });
    }
    
    return semanas.slice(0, 6);
  }, [metrics?.metricasPorDia, metrics?.taxaConversao]);

  if (metricsError || leadsError || simpleError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Erro ao carregar dados</CardTitle>
            <CardDescription>
              Não foi possível conectar ao banco de dados. Verifique a conexão.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()} className="w-full">
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Preparar dados para gráficos
  const leadStatusChartData = metrics?.leadsPorStatus?.map(item => ({
    name: item.status.replace('_', ' ').charAt(0).toUpperCase() + item.status.replace('_', ' ').slice(1),
    value: item.total,
    color: item.status === 'novo' ? '#3B82F6' : 
           item.status === 'em_atendimento' ? '#FFD831' : 
           item.status === 'qualificado' ? '#8B5CF6' :
           item.status === 'convertido' ? '#10B981' : '#EF4444'
  })) || [];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
            <p className="text-muted-foreground mt-1">
              Bem-vindo {funcionario?.nome}, acompanhe as métricas do ASSISMAX
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1">
              <Calendar className="w-3 h-3" />
              {new Date().toLocaleDateString('pt-BR')}
            </Badge>
            <Button onClick={handleRefresh} size="sm" variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-soft">
            <TabsTrigger value="overview" className="data-[state=active]:bg-accent data-[state=active]:text-primary">
              <Activity className="w-4 h-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="leads" className="data-[state=active]:bg-accent data-[state=active]:text-primary">
              <Users className="w-4 h-4 mr-2" />
              Leads
            </TabsTrigger>
            <TabsTrigger value="funcionarios" className="data-[state=active]:bg-accent data-[state=active]:text-primary">
              <UserPlus className="w-4 h-4 mr-2" />
              Funcionários
            </TabsTrigger>
            <TabsTrigger value="produtos" className="data-[state=active]:bg-accent data-[state=active]:text-primary">
              <Package className="w-4 h-4 mr-2" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="data-[state=active]:bg-accent data-[state=active]:text-primary">
              <FileText className="w-4 h-4 mr-2" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          {/* VISÃO GERAL */}
          <TabsContent value="overview" className="space-y-6 animate-fade-in-up">
            {/* KPIs Principais */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Leads Hoje"
                value={isLoadingMetrics ? '...' : metrics?.leadsHoje || 0}
                description="Captados nas últimas 24h"
                icon={<Users />}
                color="info"
                trend={{ value: 15, type: 'up' }}
              />
              <MetricCard
                title="Leads esta Semana"
                value={isLoadingMetrics ? '...' : metrics?.leadsSemana || 0}
                description="Últimos 7 dias"
                icon={<TrendingUp />}
                color="success"
                trend={{ value: 8, type: 'up' }}
              />
              <MetricCard
                title="Taxa de Conversão"
                value={isLoadingMetrics ? '...' : `${metrics?.taxaConversao || 0}%`}
                description="Leads → Clientes"
                icon={<Target />}
                color="warning"
                trend={{ value: 3, type: 'down' }}
              />
              <MetricCard
                title="Total de Leads"
                value={isLoadingMetrics ? '...' : metrics?.leadsTotal || 0}
                description="Desde o início"
                icon={<MessageSquare />}
                color="default"
              />
            </div>

            {/* Gráficos Principais */}
            <div className="grid gap-6 lg:grid-cols-2">
              <DonutChart
                data={leadStatusChartData}
                title="Distribuição de Leads por Status"
                description="Visão geral do funil de vendas"
              />
              <BarChart
                data={weeklyLeadsData}
                bars={[
                  { dataKey: 'leads', name: 'Leads Captados', color: '#FFD831' },
                  { dataKey: 'conversoes', name: 'Conversões', color: '#10B981' }
                ]}
                title="Atividade Semanal"
                description="Leads captados e convertidos por dia"
              />
            </div>

            {/* Gráfico de Tendência */}
            <LineChart
              data={conversionTrendData}
              lines={[
                { dataKey: 'taxa', name: 'Taxa de Conversão (%)', color: '#8B5CF6' }
              ]}
              title="Tendência de Conversão"
              description="Evolução da taxa de conversão nos últimos 6 meses"
              showArea
            />

            {/* Leads Recentes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Leads Recentes</CardTitle>
                <CardDescription>Últimos 10 leads capturados</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingLeads ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <div className="h-4 bg-muted rounded animate-pulse flex-1" />
                        <div className="h-4 bg-muted rounded animate-pulse w-20" />
                        <div className="h-4 bg-muted rounded animate-pulse w-16" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <LeadsTable leads={simpleLeads?.slice(0, 10) || []} onRefresh={refetchLeads} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* GESTÃO DE LEADS */}
          <TabsContent value="leads" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Gestão de Leads</h2>
                <p className="text-muted-foreground">
                  {simpleLoading ? 'Carregando...' : `${simpleLeads?.length || 0} leads encontrados`}
                </p>
              </div>
              <Button onClick={refetchLeads} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar Lista
              </Button>
            </div>

            <LeadsFilters
              filters={filters}
              onFiltersChange={updateFilters}
              onClearFilters={clearFilters}
            />

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lista de Leads</CardTitle>
                <CardDescription>
                  Gerencie todos os leads capturados pelo sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                {simpleLoading ? (
                  <div className="space-y-3">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <LeadsTable leads={simpleLeads || []} onRefresh={refetchLeads} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* RELATÓRIOS */}
          <TabsContent value="relatorios" className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Relatórios e Analytics</h2>
                <p className="text-muted-foreground">
                  Análise detalhada de performance e métricas
                </p>
              </div>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar Relatório
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard
                title="Leads este Mês"
                value={isLoadingMetrics ? '...' : metrics?.leadsMes || 0}
                description="Últimos 30 dias"
                icon={<BarChart3 />}
                color="info"
              />
              <MetricCard
                title="Taxa de Captação"
                value={isLoadingMetrics ? '...' : `${((metrics?.leadsMes || 0) / 30).toFixed(1)}/dia`}
                description="Média diária"
                icon={<TrendingUp />}
                color="default"
              />
              <MetricCard
                title="Leads Convertidos"
                value={isLoadingMetrics ? '...' : 
                  metrics?.leadsPorStatus?.find(s => s.status === 'convertido')?.total || 0
                }
                description="Total convertidos"
                icon={<Target />}
                color="success"
                trend={{ value: 12, type: 'up' }}
              />
            </div>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Relatórios Disponíveis</CardTitle>
                <CardDescription>
                  Selecione o tipo de relatório para gerar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Button variant="outline" className="h-auto p-4 justify-start">
                    <div className="text-left">
                      <p className="font-semibold">Relatório de Vendas</p>
                      <p className="text-sm text-muted-foreground">Análise de conversões e faturamento</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 justify-start">
                    <div className="text-left">
                      <p className="font-semibold">Relatório de Leads</p>
                      <p className="text-sm text-muted-foreground">Origem, status e distribuição</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 justify-start">
                    <div className="text-left">
                      <p className="font-semibold">Performance da Equipe</p>
                      <p className="text-sm text-muted-foreground">Métricas por funcionário</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 justify-start">
                    <div className="text-left">
                      <p className="font-semibold">Análise de Canais</p>
                      <p className="text-sm text-muted-foreground">ROI por canal de captação</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FUNCIONÁRIOS */}
          <TabsContent value="funcionarios" className="space-y-6 animate-fade-in-up">
            <FuncionariosManager />
          </TabsContent>

          {/* PRODUTOS */}
          <TabsContent value="produtos" className="space-y-6 animate-fade-in-up">
            <ProdutosManager />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}