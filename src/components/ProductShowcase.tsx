import React from 'react';
import { ShoppingCart, TrendingDown, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProdutos } from "@/hooks/useProdutos";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  retailPrice: number;
  wholesalePrice: number;
  savings: number;
  icon: React.ComponentType<{ className?: string }>;
}


interface ProductShowcaseProps {
  onOpenModal: () => void;
}

export default function ProductShowcase({ onOpenModal }: ProductShowcaseProps) {
  const navigate = useNavigate();
  const { data: produtosDoBanco, isLoading } = useProdutos();
  
  const produtosExibidos = produtosDoBanco && produtosDoBanco.length > 0 
    ? produtosDoBanco.slice(0, 6).map(produto => ({
        id: produto.id,
        name: produto.nome,
        category: produto.categoria,
        description: produto.descricao || '',
        retailPrice: Number(produto.preco_varejo) || 0,
        wholesalePrice: Number(produto.preco_atacado) || 0,
        savings: produto.preco_varejo && produto.preco_atacado 
          ? Math.round(((Number(produto.preco_varejo) - Number(produto.preco_atacado)) / Number(produto.preco_varejo)) * 100)
          : 0,
        icon: Package,
      }))
    : [];

  const handleVerCatalogoCompleto = () => {
    navigate('/categorias');
  };

  if (isLoading) {
    return (
      <section className="section-padding bg-gradient-to-b from-muted/30 to-background">
        <div className="container-responsive">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-muted rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-gradient-to-b from-muted/30 to-background">
      <div className="container-responsive">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gradient-primary">
            Produtos com Preços de Atacado
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Compare nossos preços e veja a economia real que você pode ter comprando diretamente na fonte
          </p>
        </div>

        {/* Products Grid */}
        {produtosExibidos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {produtosExibidos.map((product, index) => (
            <div 
              key={product.id} 
              className="card-product hover-lift animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <product.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                  </div>
                </div>
                <div className="bg-success/10 text-success text-xs font-medium px-2 py-1 rounded-full">
                  -{product.savings}%
                </div>
              </div>

              <p className="text-muted-foreground mb-6">{product.description}</p>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Preço Varejo:</span>
                  <span className="text-sm line-through text-muted-foreground">
                    R$ {product.retailPrice.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Nosso Preço:</span>
                  <span className="text-2xl font-bold text-success">
                    R$ {product.wholesalePrice.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-success">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Economia de R$ {(product.retailPrice - product.wholesalePrice).toFixed(2)}
                  </span>
                </div>
              </div>

              <Button 
                onClick={onOpenModal}
                variant="outline" 
                className="w-full hover-glow"
              >
                <ShoppingCart className="w-4 h-4" />
                Solicitar Orçamento
              </Button>
            </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 mb-16">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Produtos em breve!</h3>
            <p className="text-muted-foreground">
              Estamos organizando nosso catálogo. Em breve você terá acesso a todos os produtos com preços especiais.
            </p>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center bg-gradient-card rounded-2xl p-8 shadow-medium">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Quer ver todos os nossos produtos?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Temos centenas de produtos com preços especiais. Solicite seu orçamento personalizado e descubra quanto você pode economizar.
          </p>
          <Button 
            onClick={handleVerCatalogoCompleto}
            variant="accent" 
            size="lg"
            className="text-lg px-8 py-4"
          >
            Ver Catálogo Completo
            <ShoppingCart className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}