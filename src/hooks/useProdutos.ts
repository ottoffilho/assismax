import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type Produto = Tables<"produtos">;

export function useProdutos(categoria?: string) {
  return useQuery({
    queryKey: ["produtos", categoria],
    queryFn: async () => {
      let query = supabase
        .from("produtos")
        .select("*")
        .eq("ativo", true)
        .order("categoria", { ascending: true })
        .order("nome", { ascending: true });

      if (categoria && categoria !== "todos") {
        query = query.eq("categoria", categoria);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useCategorias() {
  return useQuery({
    queryKey: ["categorias"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select("categoria")
        .eq("ativo", true);

      if (error) throw error;

      // Extrair categorias únicas
      const categorias = [...new Set(data?.map((p) => p.categoria) || [])];
      return categorias.sort();
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