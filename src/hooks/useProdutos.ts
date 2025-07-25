import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type Produto = Tables<"produtos">;

export function useProdutos(categoria?: string, includeInactive = false) {
  return useQuery({
    queryKey: ["produtos", categoria, includeInactive],
    queryFn: async () => {
      let query = supabase
        .from("produtos")
        .select("*")
        .order("categoria", { ascending: true })
        .order("nome", { ascending: true });

      // Para o admin, pode incluir inativos
      if (!includeInactive) {
        query = query.eq("ativo", true);
      }

      if (categoria && categoria !== "todos") {
        query = query.eq("categoria", categoria);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Filtrar produtos temporários de categoria
      const filteredData = (data || []).filter(
        produto => !produto.nome.startsWith('__CATEGORIA_TEMP_')
      );
      
      return filteredData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useCategorias() {
  return useQuery({
    queryKey: ["categorias"],
    queryFn: async () => {
      // Buscar todas as categorias (incluindo de produtos inativos)
      const { data, error } = await supabase
        .from("produtos")
        .select("categoria");

      if (error) throw error;

      // Extrair categorias únicas, excluindo produtos temporários
      const categorias = [...new Set(
        data
          ?.filter(p => !p.categoria?.startsWith('__CATEGORIA_TEMP_'))
          ?.map((p) => p.categoria) || []
      )];
      
      return categorias.filter(Boolean).sort();
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

export function useProduto(id: string) {
  return useQuery({
    queryKey: ["produto", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .eq("id", id)
        .eq("ativo", true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}