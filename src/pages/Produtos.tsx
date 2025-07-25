import React, { useState, useMemo } from 'react';
import { Search, Filter, ShoppingCart, MessageCircle, Package, Star, TrendingDown, Eye, Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useProdutos, useCategorias } from '@/hooks/useProdutos';
import { useNavigate } from 'react-router-dom';
import ChatbotModal from '@/components/ChatbotModal';
import logoHorizontalLight from '@/assets/logo/logo-horizontal-light.png';

export default function Produtos() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [sortBy, setSortBy] = useState('nome');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [chatbotOpen, setChatbotOpen] = useState(false);

  const { data: produtos = [], isLoading } = useProdutos(selectedCategory);
  const { data: categorias = [] } = useCategorias();

  // Filtros e ordenação
  const produtosFiltrados = useMemo(() => {
    let filtered = produtos.filter(produto =>
      produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (produto.descricao && produto.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'preco_baixo':
          return Number(a.preco_atacado) - Number(b.preco_atacado);
        case 'preco_alto':
          return Number(b.preco_atacado) - Number(a.preco_atacado);
        case 'economia':
          const economiaA = a.preco_varejo && a.preco_atacado 
            ? ((Number(a.preco_varejo) - Number(a.preco_atacado)) / Number(a.preco_varejo)) * 100
            : 0;
          const economiaB = b.preco_varejo && b.preco_atacado 
            ? ((Number(b.preco_varejo) - Number(b.preco_atacado)) / Number(b.preco_varejo)) * 100
            : 0;
          return economiaB - economiaA;
        default:
          return a.nome.localeCompare(b.nome);
      }
    });

    return filtered;
  }, [produtos, searchTerm, sortBy]);

  const handleChatWithAI = (produto: any) => {
    setChatbotOpen(true);
  };

  const calcularEconomia = (precoVarejo: string | null, precoAtacado: string | null) => {
    if (!precoVarejo || !precoAtacado) return 0;
    return Math.round(((Number(precoVarejo) - Number(precoAtacado)) / Number(precoVarejo)) * 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header com Logo */}
      <div className="bg-background/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <img
                  src={logoHorizontalLight}
                  alt="ASSISMAX"
                  className="h-12 md:h-14 lg:h-16 object-contain"
                />
              </button>
              <h1 className="text-xl md:text-2xl font-bold text-primary hidden md:block ml-4">
                Catálogo de Produtos
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setChatbotOpen(true)}
                className="hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Consultor Virtual</span>
              </Button>
              
              <div className="flex border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4" />
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  {categorias.map(categoria => (
                    <SelectItem key={categoria} value={categoria}>
                      {categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nome">Nome A-Z</SelectItem>
                  <SelectItem value="preco_baixo">Menor Preço</SelectItem>
                  <SelectItem value="preco_alto">Maior Preço</SelectItem>
                  <SelectItem value="economia">Maior Economia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              {produtosFiltrados.length} produto{produtosFiltrados.length !== 1 ? 's' : ''} encontrado{produtosFiltrados.length !== 1 ? 's' : ''}
            </p>
            
            {selectedCategory !== 'todos' && (
              <Badge variant="secondary" className="gap-1">
                <Filter className="w-3 h-3" />
                {selectedCategory}
              </Badge>
            )}
          </div>
        </div>

        {/* Grid de Produtos */}
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
                        <Badge variant="outline" className="text-xs">
                          {produto.categoria}
                        </Badge>
                      </div>
                    </div>
                    
                    {economia > 0 && (
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                        -{economia}%
                      </Badge>
                    )}
                  </div>

                  {produto.descricao && (
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {produto.descricao}
                    </p>
                  )}
                </CardHeader>

                <CardContent className={`space-y-4 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
                  <div className="space-y-3">
                    {produto.preco_varejo && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Preço Varejo:</span>
                        <span className="text-sm line-through text-muted-foreground">
                          R$ {Number(produto.preco_varejo).toFixed(2)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Nosso Preço:</span>
                      <span className="text-2xl font-bold text-green-600">
                        R$ {Number(produto.preco_atacado).toFixed(2)}
                      </span>
                    </div>

                    {economia > 0 && (
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-950 rounded-lg px-3 py-2">
                        <TrendingDown className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Economia de R$ {(Number(produto.preco_varejo) - Number(produto.preco_atacado)).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleChatWithAI(produto)}
                      variant="outline" 
                      className="flex-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Consultar
                    </Button>
                    
                    <Button 
                      variant="default" 
                      className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Orçamento
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {produtosFiltrados.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchTerm || selectedCategory !== 'todos' 
                ? 'Nenhum produto encontrado' 
                : 'Catálogo em construção'}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedCategory !== 'todos'
                ? 'Tente ajustar os filtros ou termo de busca'
                : 'Estamos organizando nosso catálogo. Entre em contato para consultar disponibilidade.'}
            </p>
            {(!searchTerm && selectedCategory === 'todos') && (
              <Button 
                onClick={() => setChatbotOpen(true)}
                className="mt-4"
              >
                <MessageCircle className="w-4 h-4" />
                Consultar Produtos
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Chatbot Modal */}
      <ChatbotModal
        open={chatbotOpen}
        onOpenChange={setChatbotOpen}
      />
    </div>
  );
}