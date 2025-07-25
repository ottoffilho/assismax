import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  Users, 
  Package, 
  HelpCircle,
  Calendar,
  BarChart3,
  Eye
} from "lucide-react";
import { useConversasAnalytics, useConversasDetalhadas } from "@/hooks/useConversasAnalytics";

interface ConversasAnalyticsDashboardProps {
  className?: string;
}

export default function ConversasAnalyticsDashboard({ className }: ConversasAnalyticsDashboardProps) {
  const [periodo, setPeriodo] = useState<'hoje' | 'semana' | 'mes' | 'todos'>('semana');
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);
  
  const { data: analytics, isLoading, error } = useConversasAnalytics(periodo);
  const { data: conversasDetalhadas } = useConversasDetalhadas(20);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando análises...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <HelpCircle className="h-8 w-8 mx-auto mb-2" />
          <p>Erro ao carregar análises das conversas</p>
        </div>
      </Card>
    );
  }

  if (!analytics) return null;

  const taxaQualificacao = analytics.totalConversas > 0 
    ? Math.round((analytics.taxaEngajamento.conversasQualificadas / analytics.totalConversas) * 100)
    : 0;

  const taxaNome = analytics.totalConversas > 0 
    ? Math.round((analytics.taxaEngajamento.conversasComNome / analytics.totalConversas) * 100)
    : 0;

  const taxaTelefone = analytics.totalConversas > 0 
    ? Math.round((analytics.taxaEngajamento.conversasComTelefone / analytics.totalConversas) * 100)
    : 0;

  return (
    <div className={className}>
      {/* Header com filtros */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Analytics do Chatbot IA</h2>
          <p className="text-muted-foreground">Análise das conversas e insights estratégicos</p>
        </div>
        
        <div className="flex gap-2">
          <div className="flex gap-1">
            {(['hoje', 'semana', 'mes', 'todos'] as const).map((p) => (
              <Button
                key={p}
                variant={periodo === p ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriodo(p)}
              >
                {p === 'hoje' ? 'Hoje' : p === 'semana' ? 'Semana' : p === 'mes' ? 'Mês' : 'Todos'}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMostrarDetalhes(!mostrarDetalhes)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {mostrarDetalhes ? 'Ocultar' : 'Ver'} Detalhes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="duvidas">Dúvidas</TabsTrigger>
          <TabsTrigger value="engajamento">Engajamento</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Cards de métricas principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Conversas</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalConversas}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.conversasHoje} hoje, {analytics.conversasSemana} esta semana
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa Qualificação</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{taxaQualificacao}%</div>
                <Progress value={taxaQualificacao} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Coleta de Nome</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{taxaNome}%</div>
                <Progress value={taxaNome} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Coleta de Telefone</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{taxaTelefone}%</div>
                <Progress value={taxaTelefone} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Horários de pico */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Horários de Pico
              </CardTitle>
              <CardDescription>
                Horários com mais conversas ativas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-2">
                {analytics.horariosPico.slice(0, 12).map(({ hora, conversas }) => (
                  <div key={hora} className="text-center p-2 bg-muted rounded">
                    <div className="text-sm font-medium">{hora}h</div>
                    <div className="text-xs text-muted-foreground">{conversas}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="produtos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Produtos Mais Perguntados
              </CardTitle>
              <CardDescription>
                Produtos que geram mais interesse nas conversas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.produtosMaisPerguntados.slice(0, 10).map(({ produto, mencoes }) => (
                  <div key={produto} className="flex items-center justify-between">
                    <span className="font-medium">{produto}</span>
                    <Badge variant="secondary">{mencoes} menções</Badge>
                  </div>
                ))}
                {analytics.produtosMaisPerguntados.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum produto mencionado ainda
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="duvidas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Dúvidas Mais Frequentes
              </CardTitle>
              <CardDescription>
                Categorias de perguntas mais comuns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.duvidasMaisFrequentes.map(({ categoria, count, exemplos }) => (
                  <div key={categoria} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium capitalize">{categoria}</h4>
                      <Badge>{count} perguntas</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p className="mb-1">Exemplos:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {exemplos.slice(0, 2).map((exemplo, idx) => (
                          <li key={idx} className="truncate">{exemplo}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engajamento" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Palavras-Chave Frequentes</CardTitle>
                <CardDescription>Termos mais usados pelos usuários</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analytics.palavrasChave.slice(0, 15).map(({ palavra, frequencia }) => (
                    <Badge key={palavra} variant="outline">
                      {palavra} ({frequencia})
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Engajamento</CardTitle>
                <CardDescription>Efetividade na coleta de dados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Conversas com Nome</span>
                    <span>{analytics.taxaEngajamento.conversasComNome}/{analytics.totalConversas}</span>
                  </div>
                  <Progress value={taxaNome} />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Conversas com Telefone</span>
                    <span>{analytics.taxaEngajamento.conversasComTelefone}/{analytics.totalConversas}</span>
                  </div>
                  <Progress value={taxaTelefone} />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Conversas Qualificadas</span>
                    <span>{analytics.taxaEngajamento.conversasQualificadas}/{analytics.totalConversas}</span>
                  </div>
                  <Progress value={taxaQualificacao} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Conversas detalhadas */}
      {mostrarDetalhes && conversasDetalhadas && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Conversas Recentes</CardTitle>
            <CardDescription>Últimas 20 conversas registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {conversasDetalhadas.map((conversa) => (
                <div key={conversa.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm text-muted-foreground">
                      {new Date(conversa.timestamp).toLocaleString('pt-BR')}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {conversa.contexto?.nome_lead || 'Anônimo'}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-blue-50 p-2 rounded text-sm">
                      <strong>Usuário:</strong> {conversa.mensagem}
                    </div>
                    <div className="bg-green-50 p-2 rounded text-sm">
                      <strong>IA:</strong> {conversa.resposta}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
