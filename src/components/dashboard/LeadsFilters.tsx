import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { LeadFilters } from '@/hooks/useDashboard';

interface LeadsFiltersProps {
  filters: LeadFilters;
  onFiltersChange: (filters: LeadFilters) => void;
  onClearFilters: () => void;
}

export function LeadsFilters({ filters, onFiltersChange, onClearFilters }: LeadsFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof LeadFilters, value: string) => {
    const newValue = value === 'all' ? undefined : value;
    onFiltersChange({ [key]: newValue });
  };

  const activeFiltersCount = Object.values(filters).filter(value =>
    value !== undefined && value !== ''
  ).length;

  // Abrir automaticamente quando há filtros ativos
  useEffect(() => {
    if (activeFiltersCount > 0 && !isOpen) {
      setIsOpen(true);
    }
  }, [activeFiltersCount, isOpen]);



  const getActiveFilters = () => {
    const active = [];
    
    if (filters.status) {
      const statusLabels = {
        novo: 'Novo',
        em_atendimento: 'Em Atendimento',
        qualificado: 'Qualificado',
        convertido: 'Convertido',
        perdido: 'Perdido'
      };
      active.push({
        key: 'status',
        label: `Status: ${statusLabels[filters.status as keyof typeof statusLabels] || filters.status}`
      });
    }
    
    if (filters.origem) {
      const origemLabels = {
        landing_page: 'Landing Page',
        google_ads: 'Google Ads',
        facebook_ads: 'Facebook Ads',
        organico: 'Orgânico',
        indicacao: 'Indicação'
      };
      active.push({
        key: 'origem',
        label: `Origem: ${origemLabels[filters.origem as keyof typeof origemLabels] || filters.origem}`
      });
    }
    
    if (filters.busca) {
      active.push({
        key: 'busca',
        label: `Busca: "${filters.busca}"`
      });
    }
    
    if (filters.data_inicio) {
      active.push({
        key: 'data_inicio',
        label: `De: ${new Date(filters.data_inicio).toLocaleDateString('pt-BR')}`
      });
    }
    
    if (filters.data_fim) {
      active.push({
        key: 'data_fim',
        label: `Até: ${new Date(filters.data_fim).toLocaleDateString('pt-BR')}`
      });
    }
    
    return active;
  };

  const removeFilter = (key: string) => {
    onFiltersChange({ [key]: undefined });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary">
                    {activeFiltersCount}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && !isOpen && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span>{activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} ativo{activeFiltersCount > 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span className="max-w-[200px] truncate">
                      {getActiveFilters().map(f => f.label.split(': ')[1] || f.label).join(', ')}
                    </span>
                  </div>
                )}
                {isOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
        {/* Busca por nome, email ou telefone */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou telefone..."
            value={filters.busca || ''}
            onChange={(e) => handleFilterChange('busca', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtros em linha */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status */}
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="novo">Novo</SelectItem>
              <SelectItem value="em_atendimento">Em Atendimento</SelectItem>
              <SelectItem value="qualificado">Qualificado</SelectItem>
              <SelectItem value="convertido">Convertido</SelectItem>
              <SelectItem value="perdido">Perdido</SelectItem>
            </SelectContent>
          </Select>

          {/* Origem */}
          <Select
            value={filters.origem || 'all'}
            onValueChange={(value) => handleFilterChange('origem', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Origem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as origens</SelectItem>
              <SelectItem value="landing_page">Landing Page</SelectItem>
              <SelectItem value="google_ads">Google Ads</SelectItem>
              <SelectItem value="facebook_ads">Facebook Ads</SelectItem>
              <SelectItem value="organico">Orgânico</SelectItem>
              <SelectItem value="indicacao">Indicação</SelectItem>
            </SelectContent>
          </Select>

          {/* Data inicial */}
          <Input
            type="date"
            value={filters.data_inicio || ''}
            onChange={(e) => handleFilterChange('data_inicio', e.target.value)}
            placeholder="Data inicial"
          />

          {/* Data final */}
          <Input
            type="date"
            value={filters.data_fim || ''}
            onChange={(e) => handleFilterChange('data_fim', e.target.value)}
            placeholder="Data final"
          />
        </div>

        {/* Filtros ativos */}
        {activeFiltersCount > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Filtros ativos:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="h-7"
              >
                Limpar todos
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {getActiveFilters().map((filter) => (
                <Badge
                  key={filter.key}
                  variant="secondary"
                  className="pr-1 gap-1"
                >
                  {filter.label}
                  <button
                    type="button"
                    onClick={() => removeFilter(filter.key)}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                    title={`Remover filtro: ${filter.label}`}
                    aria-label={`Remover filtro: ${filter.label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}