import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, ShoppingCart, MessageCircle, Package, Star, TrendingDown, Eye, Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useProdutos } from '@/hooks/useProdutos';
import ChatbotModal from '@/components/ChatbotModal';
import logoHorizontalLight from '@/assets/logo/logo-horizontal-light.png';

export default function CategoriaDetalhes() {
  const { categoria } = useParams<{ categoria: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('nome');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [chatbotOpen, setChatbotOpen] = useState(false);

  const categoriaDecodificada = categoria ? decodeURIComponent(categoria) : '';
  const { data: produtos = [], isLoading } = useProdutos(categoriaDecodificada);

  // Filtrar e ordenar produtos
  const produtosFiltrados = useMemo(() => {
    let filtered = produtos.filter(produto =>
      produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'preco_menor':
          return Number(a.preco_atacado) - Number(b.preco_atacado);
        case 'preco_maior':
          return Number(b.preco_atacado) - Number(a.preco_atacado);
        case 'economia':
          const economiaA = ((Number(a.preco_varejo) - Number(a.preco_atacado)) / Number(a.preco_varejo)) * 100;
          const economiaB = ((Number(b.preco_varejo) - Number(b.preco_atacado)) / Number(b.preco_varejo)) * 100;
          return economiaB - economiaA;
        default:
          return a.nome.localeCompare(b.nome);
      }
    });

    return filtered;
  }, [produtos, searchTerm, sortBy]);

  const calcularEconomia = (precoVarejo: string, precoAtacado: string) => {
    const varejo = Number(precoVarejo);
    const atacado = Number(precoAtacado);
    if (varejo && atacado) {
      const economia = ((varejo - atacado) / varejo) * 100;
      const economiaReais = varejo - atacado;
      return { economia: Math.round(economia), economiaReais: economiaReais.toFixed(2) };
    }
    return { economia: 0, economiaReais: '0.00' };
  };

  const handleVoltarCategorias = () => {
    navigate('/categorias');
  };

  const handleVoltarHome = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-muted-foreground">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleVoltarHome}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <img
                  src={logoHorizontalLight}
                  alt="ASSISMAX"
                  className="h-12 md:h-14 lg:h-16 object-contain"
                />
              </button>
              <div className="hidden md:block ml-4">
                <h1 className="text-xl md:text-2xl font-bold text-primary">
                  {categoriaDecodificada}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {produtos.length} produto{produtos.length !== 1 ? 's' : ''} disponível{produtos.length !== 1 ? 'eis' : ''}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleVoltarCategorias}
                variant="outline"
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Categorias
              </Button>
              <Button 
                onClick={() => setChatbotOpen(true)}
                variant="accent"
                className="gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Ajuda
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-8">
        {/* Título Mobile */}
        <div className="md:hidden mb-6">
          <h1 className="text-2xl font-bold text-primary mb-2">
            {categoriaDecodificada}
          </h1>
          <p className="text-muted-foreground">
            {produtos.length} produto{produtos.length !== 1 ? 's' : ''} disponível{produtos.length !== 1 ? 'eis' : ''}
          </p>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-background/80 backdrop-blur-sm rounded-xl p-6 mb-8 shadow-medium">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder={`Buscar em ${categoriaDecodificada}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nome">Nome A-Z</SelectItem>
                  <SelectItem value="preco_menor">Menor Preço</SelectItem>
                  <SelectItem value="preco_maior">Maior Preço</SelectItem>
                  <SelectItem value="economia">Maior Economia</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-muted-foreground">
              {produtosFiltrados.length} produto{produtosFiltrados.length !== 1 ? 's' : ''} encontrado{produtosFiltrados.length !== 1 ? 's' : ''}
            </p>
            
            {searchTerm && (
              <Badge variant="secondary" className="gap-1">
                <Search className="w-3 h-3" />
                "{searchTerm}"
              </Badge>
            )}
          </div>
        </div>

        {/* Grid de Produtos */}
        {produtosFiltrados.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1 lg:grid-cols-2'
          }`}>
            {produtosFiltrados.map((produto, index) => {
              const economia = calcularEconomia(produto.preco_varejo, produto.preco_atacado);
              
              return (
                <Card 
                  key={produto.id} 
                  className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up border-2 hover:border-primary/30 ${
                    viewMode === 'list' ? 'flex-row overflow-hidden' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardHeader className={`space-y-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Package className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg leading-tight">{produto.nome}</h3>
                          <p className="text-sm text-muted-foreground">{produto.categoria}</p>
                        </div>
                      </div>
                      
                      {economia.economia > 0 && (
                        <Badge variant="destructive" className="gap-1">
                          <TrendingDown className="w-3 h-3" />
                          -{economia.economia}%
                        </Badge>
                      )}
                    </div>
                    
                    {produto.descricao && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {produto.descricao}
                      </p>
                    )}
                  </CardHeader>
                  
                  <CardContent className={`space-y-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Preço Atacado:</span>
                        <span className="text-2xl font-bold text-primary">
                          R$ {Number(produto.preco_atacado).toFixed(2)}
                        </span>
                      </div>
                      
                      {Number(produto.preco_varejo) > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Preço Varejo:</span>
                          <span className="line-through text-muted-foreground">
                            R$ {Number(produto.preco_varejo).toFixed(2)}
                          </span>
                        </div>
                      )}
                      
                      {economia.economia > 0 && (
                        <div className="bg-green-50 dark:bg-green-950 rounded-lg p-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-green-700 dark:text-green-300 font-medium">
                              Você economiza:
                            </span>
                            <span className="text-green-700 dark:text-green-300 font-bold">
                              R$ {economia.economiaReais}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button className="flex-1 gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        Solicitar
                      </Button>
                      <Button variant="outline" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchTerm 
                ? 'Nenhum produto encontrado' 
                : `Nenhum produto em ${categoriaDecodificada}`}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm
                ? 'Tente ajustar o termo de busca'
                : 'Esta categoria está sendo organizada. Entre em contato para consultar disponibilidade.'}
            </p>
            <Button 
              onClick={() => setChatbotOpen(true)}
              className="gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Consultar Produtos
            </Button>
          </div>
        )}
      </div>

      {/* Chatbot Modal */}
      <ChatbotModal 
        isOpen={chatbotOpen} 
        onClose={() => setChatbotOpen(false)} 
      />
    </div>
  );
}
