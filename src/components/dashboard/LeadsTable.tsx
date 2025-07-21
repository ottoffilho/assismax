import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Phone, Mail, MessageCircle } from 'lucide-react';
import { Lead, useLeadActions } from '@/hooks/useDashboard';
import { useToast } from '@/hooks/use-toast';

interface LeadsTableProps {
  leads: Lead[];
  onRefresh?: () => void;
}

export function LeadsTable({ leads, onRefresh }: LeadsTableProps) {
  const { updateLeadStatus } = useLeadActions();
  const { toast } = useToast();

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      novo: { variant: 'default' as const, label: 'Novo' },
      em_atendimento: { variant: 'secondary' as const, label: 'Em Atendimento' },
      qualificado: { variant: 'outline' as const, label: 'Qualificado' },
      convertido: { variant: 'default' as const, label: 'Convertido', className: 'bg-green-100 text-green-800' },
      perdido: { variant: 'destructive' as const, label: 'Perdido' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.novo;
    
    return (
      <Badge 
        variant={config.variant} 
        className={config.className}
      >
        {config.label}
      </Badge>
    );
  };

  const getOrigemBadge = (origem: string) => {
    const origemConfig = {
      landing_page: { label: 'Landing Page', className: 'bg-blue-100 text-blue-800' },
      google_ads: { label: 'Google Ads', className: 'bg-green-100 text-green-800' },
      facebook_ads: { label: 'Facebook Ads', className: 'bg-purple-100 text-purple-800' },
      organico: { label: 'Orgânico', className: 'bg-gray-100 text-gray-800' },
      indicacao: { label: 'Indicação', className: 'bg-yellow-100 text-yellow-800' }
    };

    const config = origemConfig[origem as keyof typeof origemConfig] || 
                   { label: origem, className: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge variant="secondary" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      await updateLeadStatus(leadId, newStatus);
      toast({
        title: 'Status atualizado!',
        description: 'O status do lead foi alterado com sucesso.',
      });
      onRefresh?.();
    } catch (error) {
      toast({
        title: 'Erro ao atualizar status',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPhone = (phone: string) => {
    // Formatar telefone brasileiro
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  };

  if (leads.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Nenhum lead encontrado</p>
          <p className="text-sm">Os leads capturados aparecerão aqui</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Funcionário</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell className="font-medium">
                <div>
                  <div className="font-medium">{lead.nome}</div>
                  {lead.observacoes && (
                    <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {lead.observacoes}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-3 h-3" />
                    {formatPhone(lead.telefone)}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-3 h-3" />
                    {lead.email}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {getOrigemBadge(lead.origem)}
              </TableCell>
              <TableCell>
                {getStatusBadge(lead.status)}
              </TableCell>
              <TableCell>
                {lead.funcionario ? (
                  <div className="text-sm">
                    <div className="font-medium">{lead.funcionario.nome}</div>
                    <div className="text-muted-foreground">{lead.funcionario.email}</div>
                  </div>
                ) : (
                  <Badge variant="outline">Não atribuído</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {formatDate(lead.created_at)}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => navigator.clipboard.writeText(lead.email)}
                    >
                      Copiar email
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigator.clipboard.writeText(lead.telefone)}
                    >
                      Copiar telefone
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Alterar Status</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(lead.id, 'em_atendimento')}
                    >
                      Em Atendimento
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(lead.id, 'qualificado')}
                    >
                      Qualificado
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(lead.id, 'convertido')}
                    >
                      Convertido
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(lead.id, 'perdido')}
                    >
                      Perdido
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}