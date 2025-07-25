-- =====================================================
-- SEED DE PRODUTOS PARA ASSISMAX
-- =====================================================

-- Inserir produtos básicos do atacarejo
INSERT INTO produtos (nome, categoria, descricao, preco_varejo, preco_atacado, quantidade_minima_atacado, estoque, ativo)
VALUES 
  -- Arroz
  ('Arroz Branco Tipo 1 5kg', 'alimentos_basicos', 'Arroz branco tipo 1, pacote de 5kg. Ideal para o dia a dia da sua família.', 28.90, 24.90, 10, 500, true),
  ('Arroz Parboilizado 5kg', 'alimentos_basicos', 'Arroz parboilizado, pacote de 5kg. Mais nutritivo e soltinho.', 29.90, 25.90, 10, 300, true),
  
  -- Feijão
  ('Feijão Carioca 1kg', 'alimentos_basicos', 'Feijão carioca tipo 1, pacote de 1kg. Grãos selecionados.', 8.90, 7.50, 20, 400, true),
  ('Feijão Preto 1kg', 'alimentos_basicos', 'Feijão preto tipo 1, pacote de 1kg. Ideal para feijoada.', 9.90, 8.50, 20, 250, true),
  
  -- Óleo
  ('Óleo de Soja 900ml', 'alimentos_basicos', 'Óleo de soja refinado, garrafa de 900ml.', 5.90, 4.90, 24, 600, true),
  ('Óleo de Milho 900ml', 'alimentos_basicos', 'Óleo de milho refinado, garrafa de 900ml. Mais saudável.', 7.90, 6.90, 24, 200, true),
  
  -- Café
  ('Café Torrado e Moído 500g', 'bebidas', 'Café torrado e moído tradicional, pacote de 500g.', 15.90, 13.90, 12, 350, true),
  ('Café Extra Forte 500g', 'bebidas', 'Café extra forte, pacote de 500g. Para quem gosta de café encorpado.', 17.90, 15.90, 12, 200, true),
  
  -- Leite
  ('Leite Integral UHT 1L', 'laticinios', 'Leite integral longa vida, caixa de 1 litro.', 5.49, 4.79, 12, 800, true),
  ('Leite Desnatado UHT 1L', 'laticinios', 'Leite desnatado longa vida, caixa de 1 litro.', 5.89, 5.19, 12, 400, true),
  
  -- Açúcar
  ('Açúcar Cristal 5kg', 'alimentos_basicos', 'Açúcar cristal especial, pacote de 5kg.', 22.90, 19.90, 10, 450, true),
  ('Açúcar Refinado 1kg', 'alimentos_basicos', 'Açúcar refinado especial, pacote de 1kg.', 5.49, 4.79, 20, 300, true),
  
  -- Farinha
  ('Farinha de Trigo 1kg', 'alimentos_basicos', 'Farinha de trigo tipo 1, pacote de 1kg.', 5.90, 4.90, 20, 500, true),
  ('Farinha de Mandioca 500g', 'alimentos_basicos', 'Farinha de mandioca torrada, pacote de 500g.', 6.90, 5.90, 20, 200, true),
  
  -- Macarrão
  ('Macarrão Espaguete 500g', 'alimentos_basicos', 'Macarrão tipo espaguete, pacote de 500g.', 4.90, 3.90, 20, 600, true),
  ('Macarrão Parafuso 500g', 'alimentos_basicos', 'Macarrão tipo parafuso, pacote de 500g.', 4.90, 3.90, 20, 500, true),
  
  -- Molho de Tomate
  ('Molho de Tomate Tradicional 340g', 'alimentos_basicos', 'Molho de tomate tradicional, sachê de 340g.', 2.49, 1.99, 24, 800, true),
  
  -- Sal
  ('Sal Refinado 1kg', 'alimentos_basicos', 'Sal refinado iodado, pacote de 1kg.', 2.90, 2.30, 20, 400, true),
  
  -- Bebidas
  ('Refrigerante Cola 2L', 'bebidas', 'Refrigerante sabor cola, garrafa de 2 litros.', 8.90, 7.50, 6, 300, true),
  ('Água Mineral 1,5L', 'bebidas', 'Água mineral sem gás, garrafa de 1,5 litros.', 2.90, 2.30, 12, 1000, true);

-- Log de auditoria
INSERT INTO audit_logs (
  nome_tabela, 
  operacao, 
  id_registro, 
  dados_novos,
  usuario_id
) VALUES (
  'produtos',
  'SEED_DATA', 
  '20250125_seed_produtos',
  '{"action": "initial_product_seed", "count": 20, "categories": ["alimentos_basicos", "bebidas", "laticinios"]}',
  'system'
);