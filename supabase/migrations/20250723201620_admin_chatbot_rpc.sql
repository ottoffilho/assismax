-- Migração para suporte ao chatbot administrativo
-- Criação de função RPC para execução segura de SQL

-- Função para executar SQL de forma controlada (apenas SELECT)
CREATE OR REPLACE FUNCTION execute_sql(sql_query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
    normalized_query text;
BEGIN
    -- Normalizar query para minúsculas
    normalized_query := lower(trim(sql_query));
    
    -- Verificar se é apenas SELECT
    IF NOT normalized_query LIKE 'select%' THEN
        RAISE EXCEPTION 'Apenas consultas SELECT são permitidas';
    END IF;
    
    -- Verificar operações perigosas
    IF normalized_query ~ '(insert|update|delete|drop|create|alter|truncate|grant|revoke)' THEN
        RAISE EXCEPTION 'Operações de modificação não são permitidas';
    END IF;
    
    -- Executar query e retornar resultado como JSON
    EXECUTE 'SELECT json_agg(row_to_json(t)) FROM (' || sql_query || ') t' INTO result;
    
    -- Se não há resultados, retornar array vazio
    IF result IS NULL THEN
        result := '[]'::json;
    END IF;
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro na execução da query: %', SQLERRM;
END;
$$;

-- Grant de execução apenas para service_role
GRANT EXECUTE ON FUNCTION execute_sql(text) TO service_role;

-- Função para obter estatísticas do sistema de forma segura
CREATE OR REPLACE FUNCTION get_system_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    stats json;
BEGIN
    SELECT json_build_object(
        'total_leads', (SELECT COUNT(*) FROM leads WHERE empresa_id = '231f795a-b14c-438b-a896-2f2e479cfa02'),
        'leads_hoje', (SELECT COUNT(*) FROM leads WHERE empresa_id = '231f795a-b14c-438b-a896-2f2e479cfa02' AND DATE(created_at) = CURRENT_DATE),
        'leads_semana', (SELECT COUNT(*) FROM leads WHERE empresa_id = '231f795a-b14c-438b-a896-2f2e479cfa02' AND created_at >= DATE_TRUNC('week', CURRENT_DATE)),
        'leads_mes', (SELECT COUNT(*) FROM leads WHERE empresa_id = '231f795a-b14c-438b-a896-2f2e479cfa02' AND created_at >= DATE_TRUNC('month', CURRENT_DATE))
    ) INTO stats;
    
    RETURN stats;
END;
$$;

-- Grant de execução para service_role
GRANT EXECUTE ON FUNCTION get_system_stats() TO service_role;