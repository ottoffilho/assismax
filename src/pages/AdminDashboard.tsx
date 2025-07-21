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
  Download
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { KPICard } from '@/components/dashboard/KPICard';
import { LeadsTable } from '@/components/dashboard/LeadsTable';
import { LeadsFilters } from '@/components/dashboard/LeadsFilters';
import { useDashboard, useLeads } from '@/hooks/useDashboard';

export default function AdminDashboard() {
  const { metrics, isLoadingMetrics, metricsError } = useDashboard();
  const { leads, isLoadingLeads, leadsError, filters, updateFilters, clearFilters, refetchLeads } = useLeads();
  const [activeTab, setActiveTab] = useState('overview');

  const handleRefresh = () => {
    refetchLeads();
    window.location.reload(); // Para atualizar métricas também
  };

  if (metricsError || leadsError) {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-xl font-semibold">Dashboard ASSISMAX</h1>
                <p className="text-sm text-muted-foreground">Painel Administrativo</p>
              </div>
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
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="leads">Gestão de Leads</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* VISÃO GERAL */}
          <TabsContent value="overview" className="space-y-6">
            {/* KPIs Principais */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <KPICard
                title="Leads Hoje"
                value={isLoadingMetrics ? '...' : metrics?.leadsHoje || 0}
                description="Captados nas últimas 24h"
                icon={<Users className="w-4 h-4" />}
                color="default"
              />
              <KPICard
                title="Leads esta Semana"
                value={isLoadingMetrics ? '...' : metrics?.leadsSemana || 0}
                description="Últimos 7 dias"
                icon={<TrendingUp className="w-4 h-4" />}
                color="success"
              />
              <KPICard
                title="Taxa de Conversão"
                value={isLoadingMetrics ? '...' : `${metrics?.taxaConversao || 0}%`}
                description="Leads → Clientes"
                icon={<Target className="w-4 h-4" />}
                color="warning"
              />
              <KPICard
                title="Total de Leads"
                value={isLoadingMetrics ? '...' : metrics?.leadsTotal || 0}
                description="Desde o início"
                icon={<MessageSquare className="w-4 h-4" />}
                color="default"
              />
            </div>

            {/* Estatísticas Rápidas */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Leads por Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Leads por Status</CardTitle>
                  <CardDescription>Distribuição atual dos leads</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingMetrics ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                      <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {metrics?.leadsPorStatus?.map((item) => (
                        <div key={item.status} className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">
                            {item.status.replace('_', ' ')}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full"
                                style={{ 
                                  width: `${(item.total / (metrics.leadsTotal || 1)) * 100}%` 
                                }}
                              />
                            </div>
                            <Badge variant="outline" className="min-w-[40px] justify-center">
                              {item.total}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Leads por Origem */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Leads por Origem</CardTitle>
                  <CardDescription>Canais de captação</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingMetrics ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                      <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {metrics?.leadsPorOrigem?.map((item) => (
                        <div key={item.origem} className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {item.origem === 'landing_page' ? 'Landing Page' : item.origem}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full"
                                style={{ 
                                  width: `${(item.total / (metrics.leadsTotal || 1)) * 100}%` 
                                }}
                              />
                            </div>
                            <Badge variant="outline" className="min-w-[40px] justify-center">
                              {item.total}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

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
                  <LeadsTable leads={leads?.slice(0, 10) || []} onRefresh={refetchLeads} />
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
                  {isLoadingLeads ? 'Carregando...' : `${leads?.length || 0} leads encontrados`}
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
                {isLoadingLeads ? (
                  <div className="space-y-3">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <LeadsTable leads={leads || []} onRefresh={refetchLeads} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ANALYTICS */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Analytics</h2>
                <p className="text-muted-foreground">
                  Análise detalhada de performance
                </p>
              </div>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar Relatório
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <KPICard
                title="Leads este Mês"
                value={isLoadingMetrics ? '...' : metrics?.leadsMes || 0}
                description="Últimos 30 dias"
                icon={<BarChart3 className="w-4 h-4" />}
              />
              <KPICard
                title="Taxa de Captação"
                value={isLoadingMetrics ? '...' : `${((metrics?.leadsMes || 0) / 30).toFixed(1)}/dia`}
                description="Média diária"
                icon={<TrendingUp className="w-4 h-4" />}
              />
              <KPICard
                title="Leads Convertidos"
                value={isLoadingMetrics ? '...' : 
                  metrics?.leadsPorStatus?.find(s => s.status === 'convertido')?.total || 0
                }
                description="Total convertidos"
                icon={<Target className="w-4 h-4" />}
                color="success"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Métricas Detalhadas</CardTitle>
                <CardDescription>
                  Relatórios e análises avançadas serão implementados aqui
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Gráficos e relatórios detalhados</p>
                  <p className="text-sm">Em desenvolvimento - próxima atualização</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}