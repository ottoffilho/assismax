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
        'leads_mes', (SELECT COUNT(*) FROM leads WHERE empresa_id = '231f795a-b14c-438b-a896-2f2e479cfa02' AND created_at >= DATE_TRUNC('month', CURRENT_DATE)),
        'total_funcionarios', (SELECT COUNT(*) FROM funcionarios WHERE empresa_id = '231f795a-b14c-438b-a896-2f2e479cfa02' AND ativo = true),
        'total_conversas', (SELECT COUNT(*) FROM conversas c JOIN leads l ON c.lead_id = l.id WHERE l.empresa_id = '231f795a-b14c-438b-a896-2f2e479cfa02'),
        'conversas_hoje', (SELECT COUNT(*) FROM conversas c JOIN leads l ON c.lead_id = l.id WHERE l.empresa_id = '231f795a-b14c-438b-a896-2f2e479cfa02' AND DATE(c.timestamp) = CURRENT_DATE),
        'leads_por_status', (
            SELECT json_object_agg(status, count)
            FROM (
                SELECT status, COUNT(*) as count
                FROM leads 
                WHERE empresa_id = '231f795a-b14c-438b-a896-2f2e479cfa02'
                GROUP BY status
            ) t
        ),
        'leads_por_origem', (
            SELECT json_object_agg(origem, count)
            FROM (
                SELECT origem, COUNT(*) as count
                FROM leads 
                WHERE empresa_id = '231f795a-b14c-438b-a896-2f2e479cfa02'
                GROUP BY origem
            ) t
        ),
        'performance_funcionarios', (
            SELECT json_agg(
                json_build_object(
                    'nome', f.nome,
                    'leads_atribuidos', COALESCE(stats.leads_count, 0),
                    'leads_convertidos', COALESCE(stats.converted_count, 0),
                    'taxa_conversao', CASE 
                        WHEN COALESCE(stats.leads_count, 0) > 0 
                        THEN ROUND((COALESCE(stats.converted_count, 0)::numeric / stats.leads_count) * 100, 2)
                        ELSE 0 
                    END
                )
            )
            FROM funcionarios f
            LEFT JOIN (
                SELECT 
                    funcionario_id,
                    COUNT(*) as leads_count,
                    COUNT(CASE WHEN status = 'convertido' THEN 1 END) as converted_count
                FROM leads
                WHERE empresa_id = '231f795a-b14c-438b-a896-2f2e479cfa02'
                AND funcionario_id IS NOT NULL
                GROUP BY funcionario_id
            ) stats ON f.id = stats.funcionario_id
            WHERE f.empresa_id = '231f795a-b14c-438b-a896-2f2e479cfa02' AND f.ativo = true
        ),
        'leads_ultimos_7_dias', (
            SELECT json_agg(
                json_build_object(
                    'data', data,
                    'count', count
                )
                ORDER BY data
            )
            FROM (
                SELECT 
                    DATE(created_at) as data,
                    COUNT(*) as count
                FROM leads
                WHERE empresa_id = '231f795a-b14c-438b-a896-2f2e479cfa02'
                AND created_at >= CURRENT_DATE - INTERVAL '7 days'
                GROUP BY DATE(created_at)
                ORDER BY data
            ) t
        )
    ) INTO stats;
    
    RETURN stats;
END;
$$;

-- Grant de execução para service_role
GRANT EXECUTE ON FUNCTION get_system_stats() TO service_role;

-- Função para buscar leads com filtros avançados
CREATE OR REPLACE FUNCTION search_leads_advanced(
    status_filter text DEFAULT NULL,
    origem_filter text DEFAULT NULL,
    funcionario_filter uuid DEFAULT NULL,
    date_from date DEFAULT NULL,
    date_to date DEFAULT NULL,
    search_term text DEFAULT NULL,
    limit_count integer DEFAULT 50
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
    where_conditions text[] := ARRAY[]::text[];
    sql_query text;
BEGIN
    -- Construir condições WHERE dinamicamente
    where_conditions := where_conditions || ARRAY['l.empresa_id = ''231f795a-b14c-438b-a896-2f2e479cfa02'''];
    
    IF status_filter IS NOT NULL THEN
        where_conditions := where_conditions || ARRAY['l.status = ' || quote_literal(status_filter)];
    END IF;
    
    IF origem_filter IS NOT NULL THEN
        where_conditions := where_conditions || ARRAY['l.origem = ' || quote_literal(origem_filter)];
    END IF;
    
    IF funcionario_filter IS NOT NULL THEN
        where_conditions := where_conditions || ARRAY['l.funcionario_id = ' || quote_literal(funcionario_filter::text)];
    END IF;
    
    IF date_from IS NOT NULL THEN
        where_conditions := where_conditions || ARRAY['DATE(l.created_at) >= ' || quote_literal(date_from)];
    END IF;
    
    IF date_to IS NOT NULL THEN
        where_conditions := where_conditions || ARRAY['DATE(l.created_at) <= ' || quote_literal(date_to)];
    END IF;
    
    IF search_term IS NOT NULL THEN
        where_conditions := where_conditions || ARRAY['(l.nome ILIKE ' || quote_literal('%' || search_term || '%') || ' OR l.email ILIKE ' || quote_literal('%' || search_term || '%') || ' OR l.telefone ILIKE ' || quote_literal('%' || search_term || '%') || ')'];
    END IF;
    
    -- Construir query final
    sql_query := 'SELECT json_agg(
        json_build_object(
            ''id'', l.id,
            ''nome'', l.nome,
            ''telefone'', l.telefone,
            ''email'', l.email,
            ''origem'', l.origem,
            ''status'', l.status,
            ''funcionario_nome'', f.nome,
            ''created_at'', l.created_at,
            ''updated_at'', l.updated_at,
            ''observacoes'', l.observacoes
        )
    )
    FROM leads l
    LEFT JOIN funcionarios f ON l.funcionario_id = f.id
    WHERE ' || array_to_string(where_conditions, ' AND ') || '
    ORDER BY l.created_at DESC
    LIMIT ' || limit_count;
    
    EXECUTE sql_query INTO result;
    
    IF result IS NULL THEN
        result := '[]'::json;
    END IF;
    
    RETURN result;
END;
$$;

-- Grant de execução para service_role
GRANT EXECUTE ON FUNCTION search_leads_advanced(text, text, uuid, date, date, text, integer) TO service_role;

-- Função para análise de conversões por período
CREATE OR REPLACE FUNCTION get_conversion_analysis(
    period_days integer DEFAULT 30
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
BEGIN
    SELECT json_build_object(
        'periodo_dias', period_days,
        'total_leads', COUNT(*),
        'leads_convertidos', COUNT(CASE WHEN status = 'convertido' THEN 1 END),
        'taxa_conversao_geral', ROUND(
            (COUNT(CASE WHEN status = 'convertido' THEN 1 END)::numeric / NULLIF(COUNT(*), 0)) * 100, 2
        ),
        'conversao_por_origem', (
            SELECT json_object_agg(
                origem,
                json_build_object(
                    'total', total_leads,
                    'convertidos', convertidos,
                    'taxa_conversao', ROUND((convertidos::numeric / NULLIF(total_leads, 0)) * 100, 2)
                )
            )
            FROM (
                SELECT 
                    origem,
                    COUNT(*) as total_leads,
                    COUNT(CASE WHEN status = 'convertido' THEN 1 END) as convertidos
                FROM leads
                WHERE empresa_id = '231f795a-b14c-438b-a896-2f2e479cfa02'
                AND created_at >= CURRENT_DATE - INTERVAL '%s days'
                GROUP BY origem
            ) t
        ),
        'conversao_por_funcionario', (
            SELECT json_agg(
                json_build_object(
                    'funcionario', f.nome,
                    'total_leads', COALESCE(stats.total, 0),
                    'convertidos', COALESCE(stats.convertidos, 0),
                    'taxa_conversao', COALESCE(
                        ROUND((stats.convertidos::numeric / NULLIF(stats.total, 0)) * 100, 2), 
                        0
                    )
                )
            )
            FROM funcionarios f
            LEFT JOIN (
                SELECT 
                    funcionario_id,
                    COUNT(*) as total,
                    COUNT(CASE WHEN status = 'convertido' THEN 1 END) as convertidos
                FROM leads
                WHERE empresa_id = '231f795a-b14c-438b-a896-2f2e479cfa02'
                AND funcionario_id IS NOT NULL
                AND created_at >= CURRENT_DATE - INTERVAL '%s days'
                GROUP BY funcionario_id
            ) stats ON f.id = stats.funcionario_id
            WHERE f.empresa_id = '231f795a-b14c-438b-a896-2f2e479cfa02' AND f.ativo = true
        ),
        'tendencia_semanal', (
            SELECT json_agg(
                json_build_object(
                    'semana', semana,
                    'total_leads', total_leads,
                    'convertidos', convertidos,
                    'taxa_conversao', ROUND((convertidos::numeric / NULLIF(total_leads, 0)) * 100, 2)
                )
                ORDER BY semana
            )
            FROM (
                SELECT 
                    DATE_TRUNC('week', created_at)::date as semana,
                    COUNT(*) as total_leads,
                    COUNT(CASE WHEN status = 'convertido' THEN 1 END) as convertidos
                FROM leads
                WHERE empresa_id = '231f795a-b14c-438b-a896-2f2e479cfa02'
                AND created_at >= CURRENT_DATE - INTERVAL '%s days'
                GROUP BY DATE_TRUNC('week', created_at)
                ORDER BY semana
            ) t
        )
    ) INTO result
    FROM leads
    WHERE empresa_id = '231f795a-b14c-438b-a896-2f2e479cfa02'
    AND created_at >= CURRENT_DATE - INTERVAL format('%s days', period_days)::interval;
    
    RETURN result;
END;
$$;

-- Grant de execução para service_role
GRANT EXECUTE ON FUNCTION get_conversion_analysis(integer) TO service_role;

-- Comentários para documentação
COMMENT ON FUNCTION execute_sql(text) IS 'Função para execução segura de queries SELECT apenas. Usada pelo chatbot administrativo.';
COMMENT ON FUNCTION get_system_stats() IS 'Retorna estatísticas gerais do sistema para o dashboard administrativo.';
COMMENT ON FUNCTION search_leads_advanced(text, text, uuid, date, date, text, integer) IS 'Busca avançada de leads com múltiplos filtros.';
COMMENT ON FUNCTION get_conversion_analysis(integer) IS 'Análise detalhada de conversões por período, origem e funcionário.';