import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  MessageSquare, 
  CheckCircle, 
  ArrowLeft,
  Calendar,
  Clock,
  Target,
  RefreshCw,
  Phone,
  Mail,
  MessageCircle,
  UserCheck,
  LogOut,
  UserPlus,
  TrendingUp
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { DashboardLayout } from '@/components/dashboard/layout/DashboardLayout';
import { MetricCard } from '@/components/dashboard/cards/MetricCard';
import { LeadsTable } from '@/components/dashboard/LeadsTable';
import { useLeads, useLeadActions } from '@/hooks/useDashboard';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { DonutChart } from '@/components/dashboard/charts/DonutChart';
import { LineChart } from '@/components/dashboard/charts/LineChart';

export default function FuncionariosDashboard() {
  const { funcionario, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Ler tab da URL
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'meus-leads';

  const handleTabChange = (value: string) => {
    navigate(`/funcionarios?tab=${value}`);
  };
  
  // Filtros baseados no funcionário autenticado
  const filters = funcionario ? { funcionario_id: funcionario.id } : {};
  
  const { leads, isLoadingLeads, refetchLeads } = useLeads(filters);
  const { updateLeadStatus, assignLeadToFuncionario } = useLeadActions();
  const { toast } = useToast();

  // Calcular métricas do funcionário
  const meusLeads = leads || [];
  const leadsNovos = meusLeads.filter(lead => lead.status === 'novo').length;
  const leadsEmAtendimento = meusLeads.filter(lead => lead.status === 'em_atendimento').length;
  const leadsConvertidos = meusLeads.filter(lead => lead.status === 'convertido').length;
  const leadsHoje = meusLeads.filter(lead => {
    const hoje = new Date().toISOString().split('T')[0];
    return lead.created_at.startsWith(hoje);
  }).length;

  const handleAceitarLead = async (leadId: string) => {
    try {
      await assignLeadToFuncionario(leadId, funcionario!.id);
      toast({
        title: 'Lead aceito!',
        description: 'O lead foi atribuído a você.',
      });
      refetchLeads();
    } catch (error) {
      toast({
        title: 'Erro ao aceitar lead',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
    }
  };

  // Dados de performance baseados nos leads do funcionário
  const performanceData = React.useMemo(() => {
    if (!meusLeads || meusLeads.length === 0) {
      return [];
    }

    const hoje = new Date();
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    return Array.from({ length: 7 }, (_, i) => {
      const data = new Date(hoje);
      data.setDate(hoje.getDate() - (6 - i));
      const dataStr = data.toISOString().split('T')[0];
      const diaSemana = diasSemana[data.getDay()];
      
      const leadsDoDia = meusLeads.filter(lead => {
        return lead.created_at.startsWith(dataStr) || lead.updated_at.startsWith(dataStr);
      });
      
      const atendimentos = leadsDoDia.filter(lead => 
        lead.status === 'em_atendimento' || lead.status === 'qualificado' || lead.status === 'convertido'
      ).length;
      
      const conversoes = leadsDoDia.filter(lead => lead.status === 'convertido').length;
      
      return {
        name: diaSemana,
        conversoes,
        atendimentos
      };
    });
  }, [meusLeads]);

  const leadStatusData = [
    { name: 'Novos', value: leadsNovos, color: '#3B82F6' },
    { name: 'Em Atendimento', value: leadsEmAtendimento, color: '#FFD831' },
    { name: 'Convertidos', value: leadsConvertidos, color: '#10B981' },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard do Funcionário</h1>
            <p className="text-muted-foreground mt-1">
              Olá {funcionario?.nome}, acompanhe seus leads e performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1">
              <Calendar className="w-3 h-3" />
              {new Date().toLocaleDateString('pt-BR')}
            </Badge>
            <Button onClick={refetchLeads} size="sm" variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-soft">
            <TabsTrigger value="meus-leads" className="data-[state=active]:bg-accent data-[state=active]:text-primary">
              <Users className="w-4 h-4 mr-2" />
              Meus Leads
            </TabsTrigger>
            <TabsTrigger value="novos-leads" className="data-[state=active]:bg-accent data-[state=active]:text-primary">
              <UserPlus className="w-4 h-4 mr-2" />
              Novos Leads
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-accent data-[state=active]:text-primary">
              <TrendingUp className="w-4 h-4 mr-2" />
              Performance
            </TabsTrigger>
          </TabsList>

          {/* MEUS LEADS */}
          <TabsContent value="meus-leads" className="space-y-6 animate-fade-in-up">
            {/* KPIs do Funcionário */}
            <div className="grid gap-4 md:grid-cols-4">
              <MetricCard
                title="Leads Atribuídos"
                value={meusLeads.length}
                description="Total sob sua responsabilidade"
                icon={<Users />}
                color="info"
                trend={{ value: 12, type: 'up' }}
              />
              <MetricCard
                title="Em Atendimento"
                value={leadsEmAtendimento}
                description="Leads ativos"
                icon={<MessageSquare />}
                color="warning"
              />
              <MetricCard
                title="Convertidos"
                value={leadsConvertidos}
                description="Leads fechados"
                icon={<CheckCircle />}
                color="success"
                trend={{ value: 8, type: 'up' }}
              />
              <MetricCard
                title="Novos Hoje"
                value={leadsHoje}
                description="Recebidos hoje"
                icon={<Clock />}
                color="default"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Lista de Leads - 2 colunas */}
              <div className="lg:col-span-2">
                <Card className="shadow-soft hover:shadow-medium transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">Seus Leads</CardTitle>
                    <CardDescription>
                      Leads atribuídos para seu atendimento
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingLeads ? (
                      <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                        ))}
                      </div>
                    ) : meusLeads.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium">Nenhum lead atribuído</h3>
                        <p className="text-muted-foreground">
                          Verifique a aba "Novos Leads" para aceitar leads
                        </p>
                      </div>
                    ) : (
                      <LeadsTable leads={meusLeads} onRefresh={refetchLeads} />
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Gráfico de Status - 1 coluna */}
              <div>
                <DonutChart
                  data={leadStatusData}
                  title="Distribuição de Leads"
                  description="Status dos seus leads"
                />
              </div>
            </div>
          </TabsContent>

          {/* NOVOS LEADS */}
          <TabsContent value="novos-leads" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Novos Leads Disponíveis</h2>
                <p className="text-muted-foreground">
                  Leads aguardando atendimento - aceite para atribuir a você
                </p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Leads Não Atribuídos</CardTitle>
                <CardDescription>
                  Clique em "Aceitar Lead" para assumir o atendimento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Funcionalidade em desenvolvimento</p>
                  <p className="text-sm">
                    Sistema de atribuição automática será implementado em breve
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PERFORMANCE */}
          <TabsContent value="performance" className="space-y-6 animate-fade-in-up">
            {/* Métricas de Performance */}
            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard
                title="Taxa de Conversão"
                value={meusLeads.length > 0 ? `${Math.round((leadsConvertidos / meusLeads.length) * 100)}%` : '0%'}
                description="Leads convertidos / Total"
                icon={<Target />}
                color={leadsConvertidos / Math.max(meusLeads.length, 1) > 0.25 ? 'success' : 'warning'}
                trend={{ value: 5, type: 'up' }}
              />
              <MetricCard
                title="Tempo Médio"
                value="< 2h"
                description="Resposta inicial"
                icon={<Clock />}
                color="success"
              />
              <MetricCard
                title="Satisfação"
                value="95%"
                description="Feedback dos clientes"
                icon={<CheckCircle />}
                color="success"
                trend={{ value: 2, type: 'up' }}
              />
            </div>

            {/* Gráfico de Performance */}
            <LineChart
              data={performanceData}
              lines={[
                { dataKey: 'conversoes', name: 'Conversões', color: '#10B981' },
                { dataKey: 'atendimentos', name: 'Atendimentos', color: '#FFD831' }
              ]}
              title="Performance Semanal"
              description="Evolução de atendimentos e conversões"
              showArea
            />

            {/* Dicas de Atendimento */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dicas de Atendimento</CardTitle>
                  <CardDescription>Melhores práticas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Contato Rápido</h4>
                      <p className="text-sm text-muted-foreground">
                        Entre em contato com leads novos em até 2 horas
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">WhatsApp Primeiro</h4>
                      <p className="text-sm text-muted-foreground">
                        Use WhatsApp para primeira abordagem se autorizado
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Follow-up por Email</h4>
                      <p className="text-sm text-muted-foreground">
                        Envie resumo da conversa por email
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status dos Leads</CardTitle>
                  <CardDescription>Quando alterar cada status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <Badge variant="outline">Novo</Badge>
                    <span className="text-sm">Lead recém capturado</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                    <Badge variant="secondary">Em Atendimento</Badge>
                    <span className="text-sm">Primeiro contato feito</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                    <Badge variant="outline">Qualificado</Badge>
                    <span className="text-sm">Cliente demonstrou interesse</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <Badge className="bg-green-100 text-green-800">Convertido</Badge>
                    <span className="text-sm">Venda realizada</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}