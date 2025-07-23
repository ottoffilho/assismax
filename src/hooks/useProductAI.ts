import { useProdutos } from "./useProdutos";

export function useProductAI() {
  const { data: produtos = [] } = useProdutos();

  const getProductInfo = (productName: string) => {
    const normalizedSearch = productName.toLowerCase().trim();
    
    // Buscar produto por nome exato ou parcial
    const foundProduct = produtos.find(produto => 
      produto.nome.toLowerCase().includes(normalizedSearch) ||
      normalizedSearch.includes(produto.nome.toLowerCase())
    );

    if (foundProduct) {
      const precoVarejo = Number(foundProduct.preco_varejo) || 0;
      const precoAtacado = Number(foundProduct.preco_atacado) || 0;
      const economia = precoVarejo && precoAtacado 
        ? ((precoVarejo - precoAtacado) / precoVarejo * 100).toFixed(0)
        : 0;

      return {
        nome: foundProduct.nome,
        categoria: foundProduct.categoria,
        descricao: foundProduct.descricao || '',
        precoVarejo: precoVarejo,
        precoAtacado: precoAtacado,
        economia: Number(economia),
        economiaReais: (precoVarejo - precoAtacado).toFixed(2)
      };
    }

    return null;
  };

  const getProductsByCategory = (categoryName: string) => {
    const normalizedCategory = categoryName.toLowerCase().trim();
    
    return produtos.filter(produto => 
      produto.categoria.toLowerCase().includes(normalizedCategory)
    ).map(produto => {
      const precoVarejo = Number(produto.preco_varejo) || 0;
      const precoAtacado = Number(produto.preco_atacado) || 0;
      const economia = precoVarejo && precoAtacado 
        ? ((precoVarejo - precoAtacado) / precoVarejo * 100).toFixed(0)
        : 0;

      return {
        nome: produto.nome,
        categoria: produto.categoria,
        precoAtacado: precoAtacado,
        economia: Number(economia)
      };
    });
  };

  const getAllProducts = () => {
    return produtos.map(produto => ({
      nome: produto.nome,
      categoria: produto.categoria,
      precoAtacado: Number(produto.preco_atacado) || 0
    }));
  };

  const getProductResponse = (productName: string) => {
    const productInfo = getProductInfo(productName);
    
    if (!productInfo) {
      return `Deixa eu verificar se temos esse produto no estoque! Me manda uma mensagem no WhatsApp que eu consulto pra você.`;
    }

    const { nome, categoria, precoVarejo, precoAtacado, economia, economiaReais } = productInfo;
    
    if (precoVarejo > 0 && precoAtacado > 0) {
      return `${nome} (${categoria}) - Nosso preço: R$ ${precoAtacado.toFixed(2)}! ${
        economia > 0 
          ? `No varejo tá R$ ${precoVarejo.toFixed(2)} - você economiza ${economia}% (R$ ${economiaReais})!` 
          : ''
      } 🛒`;
    } else {
      return `Temos ${nome} sim! Me chama no WhatsApp que passo o preço atualizado pra você! 📱`;
    }
  };

  return {
    getProductInfo,
    getProductsByCategory,
    getAllProducts,
    getProductResponse,
    produtos
  };
}