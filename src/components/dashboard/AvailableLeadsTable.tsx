import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Lead } from '@/hooks/useDashboard';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AvailableLeadsTableProps {
  leads: Lead[];
  isLoading: boolean;
  onAcceptLead: (leadId: string) => Promise<void>;
  onRefresh: () => void;
}

export function AvailableLeadsTable({ 
  leads, 
  isLoading, 
  onAcceptLead, 
  onRefresh 
}: AvailableLeadsTableProps) {
  const [acceptingLeads, setAcceptingLeads] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleAcceptLead = async (lead: Lead) => {
    if (acceptingLeads.has(lead.id)) return;

    try {
      setAcceptingLeads(prev => new Set(prev).add(lead.id));
      await onAcceptLead(lead.id);
      
      toast({
        title: 'Lead aceito!',
        description: `${lead.nome} foi atribuído a você.`,
        duration: 3000,
      });
      
      onRefresh();
    } catch (error) {
      console.error('Erro ao aceitar lead:', error);
      toast({
        title: 'Erro ao aceitar lead',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
    } finally {
      setAcceptingLeads(prev => {
        const newSet = new Set(prev);
        newSet.delete(lead.id);
        return newSet;
      });
    }
  };

  const getUrgencyBadge = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const hoursAgo = (now.getTime() - created.getTime()) / (1000 * 60 * 60);

    if (hoursAgo > 4) {
      return <Badge variant="destructive" className="text-xs">Urgente</Badge>;
    } else if (hoursAgo > 2) {
      return <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">Importante</Badge>;
    } else {
      return <Badge variant="outline" className="text-xs">Novo</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'novo': { label: 'Novo', variant: 'default' as const },
      'qualificado': { label: 'Qualificado', variant: 'secondary' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return config ? (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    ) : null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!leads || leads.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-medium">Nenhum lead disponível</h3>
            <p className="text-muted-foreground text-sm">
              Todos os leads foram atribuídos ou não há novos leads no momento
            </p>
            <Button 
              onClick={onRefresh} 
              size="sm" 
              variant="outline" 
              className="mt-4"
            >
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {leads.map((lead) => {
        const isAccepting = acceptingLeads.has(lead.id);
        const timeAgo = formatDistanceToNow(new Date(lead.created_at), {
          addSuffix: true,
          locale: ptBR
        });

        return (
          <Card key={lead.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{lead.nome}</span>
                      </div>
                      {getStatusBadge(lead.status)}
                      {getUrgencyBadge(lead.created_at)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {timeAgo}
                    </div>
                  </div>

                  {/* Contatos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-500" />
                      <span className="font-mono">{lead.telefone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-green-500" />
                      <span className="truncate">{lead.email}</span>
                    </div>
                  </div>

                  {/* Origem */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>Origem: {lead.origem}</span>
                  </div>

                  {/* Observações */}
                  {lead.observacoes && (
                    <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                      {lead.observacoes}
                    </div>
                  )}
                </div>

                {/* Ação */}
                <div className="ml-4">
                  <Button
                    onClick={() => handleAcceptLead(lead)}
                    disabled={isAccepting}
                    size="sm"
                    className="w-28"
                  >
                    {isAccepting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Aceitando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Aceitar Lead
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}