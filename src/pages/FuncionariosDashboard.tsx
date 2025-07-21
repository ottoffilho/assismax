import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
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
  UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { KPICard } from '@/components/dashboard/KPICard';
import { LeadsTable } from '@/components/dashboard/LeadsTable';
import { useLeads, useLeadActions } from '@/hooks/useDashboard';
import { useToast } from '@/hooks/use-toast';

export default function FuncionariosDashboard() {
  const [funcionarioEmail, setFuncionarioEmail] = useState('');
  const [funcionarioLogado, setFuncionarioLogado] = useState<{
    id: string;
    nome: string;
    email: string;
  } | null>(null);
  
  // Para demo, vamos simular filtros para um funcionário específico
  const filters = funcionarioLogado ? { funcionario_id: funcionarioLogado.id } : {};
  
  const { leads, isLoadingLeads, refetchLeads } = useLeads(filters);
  const { updateLeadStatus, assignLeadToFuncionario } = useLeadActions();
  const { toast } = useToast();

  // Simular login básico
  const handleLogin = () => {
    if (funcionarioEmail) {
      // Para demo, criar um funcionário fictício
      setFuncionarioLogado({
        id: 'func-demo-001',
        nome: 'Funcionário Demo',
        email: funcionarioEmail
      });
      toast({
        title: 'Login realizado!',
        description: `Bem-vindo, ${funcionarioEmail}`,
      });
    }
  };

  const handleLogout = () => {
    setFuncionarioLogado(null);
    setFuncionarioEmail('');
  };

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
      await assignLeadToFuncionario(leadId, funcionarioLogado.id);
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

  if (!funcionarioLogado) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Painel do Funcionário</CardTitle>
            <CardDescription>
              Faça login para acessar seus leads
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email do funcionário:</label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={funcionarioEmail}
                onChange={(e) => setFuncionarioEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <Button onClick={handleLogin} className="w-full" disabled={!funcionarioEmail}>
              Acessar Painel
            </Button>
            <div className="text-center">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao site
                </Button>
              </Link>
            </div>
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
                  Site
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-xl font-semibold">Meus Leads</h1>
                <p className="text-sm text-muted-foreground">
                  Olá, {funcionarioLogado.nome}
                </p>
              </div>
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
              <Button onClick={handleLogout} size="sm" variant="outline">
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        <Tabs defaultValue="meus-leads" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="meus-leads">Meus Leads</TabsTrigger>
            <TabsTrigger value="novos-leads">Novos Leads</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* MEUS LEADS */}
          <TabsContent value="meus-leads" className="space-y-6">
            {/* KPIs do Funcionário */}
            <div className="grid gap-4 md:grid-cols-4">
              <KPICard
                title="Leads Atribuídos"
                value={meusLeads.length}
                description="Total sob sua responsabilidade"
                icon={<Users className="w-4 h-4" />}
                color="default"
              />
              <KPICard
                title="Em Atendimento"
                value={leadsEmAtendimento}
                description="Leads ativos"
                icon={<MessageSquare className="w-4 h-4" />}
                color="warning"
              />
              <KPICard
                title="Convertidos"
                value={leadsConvertidos}
                description="Leads fechados"
                icon={<CheckCircle className="w-4 h-4" />}
                color="success"
              />
              <KPICard
                title="Novos Hoje"
                value={leadsHoje}
                description="Recebidos hoje"
                icon={<Clock className="w-4 h-4" />}
                color="default"
              />
            </div>

            {/* Lista de Leads do Funcionário */}
            <Card>
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
          <TabsContent value="performance" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Sua Performance</h2>
              <p className="text-muted-foreground">
                Acompanhe suas métricas de atendimento
              </p>
            </div>

            {/* Métricas de Performance */}
            <div className="grid gap-4 md:grid-cols-3">
              <KPICard
                title="Taxa de Conversão"
                value={meusLeads.length > 0 ? `${Math.round((leadsConvertidos / meusLeads.length) * 100)}%` : '0%'}
                description="Leads convertidos / Total"
                icon={<Target className="w-4 h-4" />}
                color={leadsConvertidos / Math.max(meusLeads.length, 1) > 0.25 ? 'success' : 'warning'}
              />
              <KPICard
                title="Tempo Médio"
                value="< 2h"
                description="Resposta inicial"
                icon={<Clock className="w-4 h-4" />}
                color="success"
              />
              <KPICard
                title="Satisfação"
                value="95%"
                description="Feedback dos clientes"
                icon={<CheckCircle className="w-4 h-4" />}
                color="success"
              />
            </div>

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
    </div>
  );
}