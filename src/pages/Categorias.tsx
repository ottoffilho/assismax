import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Droplets, Wine, Sparkles, ShoppingCart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCategorias } from '@/hooks/useProdutos';
import logoHorizontalLight from '@/assets/logo/logo-horizontal-light.png';

interface CategoriaInfo {
  nome: string;
  descricao: string;
  icon: React.ComponentType<any>;
  gradient: string;
  produtos: string[];
  destaque: string;
}

const categoriasInfo: CategoriaInfo[] = [
  {
    nome: 'Alimentos',
    descricao: 'Produtos básicos essenciais para o dia a dia',
    icon: Package,
    gradient: 'from-green-500 to-emerald-600',
    produtos: ['Arroz', 'Feijão', 'Óleo', 'Café', 'Leite'],
    destaque: 'Produtos básicos com os melhores preços'
  },
  {
    nome: 'Bebidas',
    descricao: 'Refrigerantes, sucos e bebidas não alcoólicas',
    icon: Droplets,
    gradient: 'from-blue-500 to-cyan-600',
    produtos: ['Refrigerantes', 'Sucos', 'Água', 'Energéticos', 'Chás'],
    destaque: 'Variedade completa de bebidas'
  },
  {
    nome: 'Bebidas destiladas',
    descricao: 'Cachaças, vodkas e destilados em geral',
    icon: Wine,
    gradient: 'from-purple-500 to-violet-600',
    produtos: ['Cachaças', 'Vodkas', 'Gin', 'Licores', 'Aperitivos'],
    destaque: 'Ofertas especiais do dia'
  },
  {
    nome: 'Limpeza',
    descricao: 'Produtos de higiene e limpeza para casa',
    icon: Sparkles,
    gradient: 'from-orange-500 to-amber-600',
    produtos: ['Detergentes', 'Sabões', 'Papel higiênico', 'Desinfetantes', 'Higiene'],
    destaque: 'Tudo para manter sua casa limpa'
  }
];

export default function Categorias() {
  const navigate = useNavigate();
  const { data: categoriasDoBanco = [] } = useCategorias();

  const handleCategoriaClick = (categoria: string) => {
    navigate(`/categoria/${encodeURIComponent(categoria)}`);
  };

  const handleVoltarHome = () => {
    navigate('/');
  };

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
              <h1 className="text-xl md:text-2xl font-bold text-primary hidden md:block ml-4">
                Nossos Produtos
              </h1>
            </div>
            
            <Button 
              onClick={handleVoltarHome}
              variant="outline"
              className="gap-2"
            >
              Voltar ao Início
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-8">
        {/* Título e Descrição */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Escolha uma Categoria
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Navegue por nossas categorias e encontre os melhores produtos com preços de atacado
          </p>
        </div>

        {/* Grid de Categorias */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {categoriasInfo.map((categoria, index) => {
            const Icon = categoria.icon;
            const temProdutos = categoriasDoBanco.includes(categoria.nome);
            
            return (
              <Card 
                key={categoria.nome}
                className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 hover:border-primary/30 animate-fade-in-up ${
                  !temProdutos ? 'opacity-60' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => temProdutos && handleCategoriaClick(categoria.nome)}
              >
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-16 h-16 bg-gradient-to-br ${categoria.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    {temProdutos && (
                      <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{categoria.nome}</h3>
                    <p className="text-muted-foreground">{categoria.descricao}</p>
                  </div>
                  
                  <Badge variant="secondary" className="w-fit">
                    {categoria.destaque}
                  </Badge>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wide">
                      Produtos inclusos:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {categoria.produtos.map((produto) => (
                        <Badge key={produto} variant="outline" className="text-xs">
                          {produto}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {temProdutos ? (
                    <Button 
                      className="w-full gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCategoriaClick(categoria.nome);
                      }}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Ver Produtos
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      disabled
                    >
                      Em breve
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Informações Adicionais */}
        <div className="text-center mt-16 bg-gradient-card rounded-2xl p-8 shadow-medium">
          <h3 className="text-2xl font-bold mb-4">
            Precisa de ajuda para escolher?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Nossa equipe está pronta para te ajudar a encontrar os melhores produtos com os melhores preços.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="accent" 
              size="lg" 
              className="gap-2"
              onClick={() => window.open('https://wa.me/5561991597126', '_blank')}
            >
              <Package className="w-5 h-5" />
              Falar com Vendedor
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              Ver Ofertas do Dia
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
