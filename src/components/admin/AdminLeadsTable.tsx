import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Phone, Mail } from 'lucide-react';
import { SimpleLead } from '@/hooks/useSimpleDashboard';

interface AdminLeadsTableProps {
  leads: SimpleLead[];
  onRefresh?: () => void;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'novo':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'em_atendimento':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'qualificado':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'convertido':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'perdido':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusLabel = (status: string) => {
  switch (status.toLowerCase()) {
    case 'novo':
      return 'Novo';
    case 'em_atendimento':
      return 'Em Atendimento';
    case 'qualificado':
      return 'Qualificado';
    case 'convertido':
      return 'Convertido';
    case 'perdido':
      return 'Perdido';
    default:
      return status;
  }
};

const getOrigemLabel = (origem: string) => {
  switch (origem.toLowerCase()) {
    case 'landing_page':
      return 'Landing Page';
    case 'whatsapp':
      return 'WhatsApp';
    case 'facebook':
      return 'Facebook';
    case 'instagram':
      return 'Instagram';
    case 'google':
      return 'Google';
    case 'indicacao':
      return 'Indicação';
    default:
      return origem;
  }
};

export function AdminLeadsTable({ leads, onRefresh }: AdminLeadsTableProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

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
            <TableHead className="w-[70px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{lead.nome}</div>
                  {lead.observacoes && (
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {lead.observacoes}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4" />
                    {lead.telefone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {lead.email}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{getOrigemLabel(lead.origem)}</Badge>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(lead.status)}>
                  {getStatusLabel(lead.status)}
                </Badge>
              </TableCell>
              <TableCell>
                {lead.funcionarios ? (
                  <div className="text-sm">
                    <div className="font-medium">{lead.funcionarios.nome}</div>
                    <div className="text-muted-foreground">{lead.funcionarios.email}</div>
                  </div>
                ) : (
                  <Badge variant="outline">Não atribuído</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {format(new Date(lead.created_at), 'dd/MM/yyyy, HH:mm', {
                    locale: ptBR,
                  })}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => copyToClipboard(lead.email)}>
                      Copiar email
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => copyToClipboard(lead.telefone)}>
                      Copiar telefone
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Visualizar</DropdownMenuLabel>
                    <DropdownMenuItem>
                      Ver detalhes
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
