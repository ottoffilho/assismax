import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  MoreHorizontal,
  Eye,
  EyeOff,
  Save,
  X
} from 'lucide-react';
import { useProdutos, useCategorias, Produto } from '@/hooks/useProdutos';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface ProdutoForm {
  nome: string;
  categoria: string;
  descricao: string;
  preco_varejo: string;
  preco_atacado: string;
  estoque: string;
  ativo: boolean;
}

interface CategoriaForm {
  nome: string;
  descricao: string;
}

const initialForm: ProdutoForm = {
  nome: '',
  categoria: '',
  descricao: '',
  preco_varejo: '',
  preco_atacado: '',
  estoque: '0',
  ativo: true
};

export function ProdutosManager() {
  const { data: produtos = [], isLoading } = useProdutos(undefined, true); // Incluir inativos para o admin
  const { data: categorias = [] } = useCategorias();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Produto | null>(null);
  const [form, setForm] = useState<ProdutoForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState<CategoriaForm>({ nome: '', descricao: '' });
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);

  // Filtrar produtos
  const produtosFiltrados = produtos.filter(produto => {
    const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (produto.descricao && produto.descricao.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'todos' || produto.categoria === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleOpenDialog = (produto: Produto | null = null) => {
    if (produto) {
      setEditingProduct(produto);
      setForm({
        nome: produto.nome,
        categoria: produto.categoria,
        descricao: produto.descricao || '',
        preco_varejo: produto.preco_varejo?.toString() || '',
        preco_atacado: produto.preco_atacado?.toString() || '',
        estoque: produto.estoque?.toString() || '0',
        ativo: produto.ativo
      });
    } else {
      setEditingProduct(null);
      setForm(initialForm);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setForm(initialForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const produtoData = {
        nome: form.nome.trim(),
        categoria: form.categoria.trim(),
        descricao: form.descricao.trim() || null,
        preco_varejo: form.preco_varejo ? parseFloat(form.preco_varejo) : null,
        preco_atacado: parseFloat(form.preco_atacado),
        estoque: parseInt(form.estoque) || 0,
        ativo: form.ativo
      };

      if (editingProduct) {
        // Atualizar produto existente
        const { error } = await supabase
          .from('produtos')
          .update(produtoData)
          .eq('id', editingProduct.id);

        if (error) throw error;

        toast({
          title: "Produto atualizado!",
          description: `${form.nome} foi atualizado com sucesso.`,
        });
      } else {
        // Criar novo produto
        const { error } = await supabase
          .from('produtos')
          .insert([produtoData]);

        if (error) throw error;

        toast({
          title: "Produto criado!",
          description: `${form.nome} foi adicionado ao catálogo.`,
        });
      }

      // Refresh dos dados
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      
      handleCloseDialog();
    } catch (error: unknown) {
      toast({
        title: "Erro ao salvar produto",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusToggle = async (produto: Produto) => {
    try {
      const { error } = await supabase
        .from('produtos')
        .update({ ativo: !produto.ativo })
        .eq('id', produto.id);

      if (error) throw error;

      toast({
        title: produto.ativo ? "Produto desativado" : "Produto ativado",
        description: `${produto.nome} foi ${produto.ativo ? 'desativado' : 'ativado'} com sucesso.`,
      });

      queryClient.invalidateQueries({ queryKey: ['produtos'] });
    } catch (error: unknown) {
      toast({
        title: "Erro ao alterar status",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (produto: Produto) => {
    if (!confirm(`Tem certeza que deseja excluir o produto "${produto.nome}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', produto.id);

      if (error) throw error;

      toast({
        title: "Produto excluído",
        description: `${produto.nome} foi removido do catálogo.`,
      });

      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    } catch (error: unknown) {
      toast({
        title: "Erro ao excluir produto",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCategory(true);

    try {
      const categoryName = categoryForm.nome.trim();
      
      // Verificar se a categoria já existe
      if (categorias.includes(categoryName)) {
        toast({
          title: "Categoria já existe",
          description: `A categoria "${categoryName}" já foi cadastrada.`,
          variant: "destructive",
        });
        return;
      }

      // Criar um produto temporário para registrar a categoria
      // (Alternativa: criar uma tabela separada para categorias)
      const { error } = await supabase
        .from('produtos')
        .insert([{
          nome: `__CATEGORIA_TEMP_${Date.now()}__`,
          categoria: categoryName,
          descricao: categoryForm.descricao || null,
          preco_atacado: 0,
          estoque: 0,
          ativo: false // Produto temporário inativo
        }]);

      if (error) throw error;

      toast({
        title: "Categoria criada!",
        description: `A categoria "${categoryName}" foi adicionada com sucesso.`,
      });

      // Refresh das categorias
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      
      // Selecionar a nova categoria no formulário principal
      setForm({ ...form, categoria: categoryName });
      
      // Fechar dialog e limpar form
      setIsCategoryDialogOpen(false);
      setCategoryForm({ nome: '', descricao: '' });
      
    } catch (error: unknown) {
      toast({
        title: "Erro ao criar categoria",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingCategory(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestão de Produtos</h2>
          <p className="text-muted-foreground">
            Gerencie o catálogo de produtos da loja
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </DialogTitle>
              <DialogDescription>
                {editingProduct 
                  ? 'Atualize as informações do produto' 
                  : 'Preencha os dados para cadastrar um novo produto'
                }
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Produto *</Label>
                  <Input
                    id="nome"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    placeholder="Ex: Arroz Tipo 1 - 5kg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  {showNewCategoryForm ? (
                    <div className="flex gap-2">
                      <Input
                        id="categoria"
                        value={form.categoria}
                        onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                        placeholder="Digite o nome da nova categoria"
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowNewCategoryForm(false);
                          setForm({ ...form, categoria: '' });
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Select 
                        value={form.categoria} 
                        onValueChange={(value) => {
                          if (value === '__nova_categoria__') {
                            setShowNewCategoryForm(true);
                            setForm({ ...form, categoria: '' });
                          } else {
                            setForm({ ...form, categoria: value });
                          }
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categorias.map(categoria => (
                            <SelectItem key={categoria} value={categoria}>
                              {categoria}
                            </SelectItem>
                          ))}
                          <SelectItem value="__nova_categoria__">
                            <span className="flex items-center gap-2">
                              <Plus className="w-4 h-4" />
                              Nova categoria
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsCategoryDialogOpen(true)}
                        title="Gerenciar categorias"
                      >
                        <Filter className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Descrição detalhada do produto..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preco_atacado">Preço Atacado (R$) *</Label>
                  <Input
                    id="preco_atacado"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.preco_atacado}
                    onChange={(e) => setForm({ ...form, preco_atacado: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preco_varejo">Preço Varejo (R$)</Label>
                  <Input
                    id="preco_varejo"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.preco_varejo}
                    onChange={(e) => setForm({ ...form, preco_varejo: e.target.value })}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estoque">Quantidade em Estoque</Label>
                  <Input
                    id="estoque"
                    type="number"
                    min="0"
                    value={form.estoque}
                    onChange={(e) => setForm({ ...form, estoque: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={form.ativo}
                  onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="ativo">Produto ativo (visível no catálogo)</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Salvando...' : 'Salvar Produto'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog para Gerenciar Categorias */}
        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Gerenciar Categorias</DialogTitle>
              <DialogDescription>
                Adicione uma nova categoria de produtos
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category-nome">Nome da Categoria *</Label>
                <Input
                  id="category-nome"
                  value={categoryForm.nome}
                  onChange={(e) => setCategoryForm({ ...categoryForm, nome: e.target.value })}
                  placeholder="Ex: Cereais, Bebidas, Limpeza"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category-descricao">Descrição</Label>
                <Textarea
                  id="category-descricao"
                  value={categoryForm.descricao}
                  onChange={(e) => setCategoryForm({ ...categoryForm, descricao: e.target.value })}
                  placeholder="Descrição da categoria (opcional)"
                  rows={2}
                />
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm">Categorias Existentes:</h4>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {categorias.map(categoria => (
                    <Badge key={categoria} variant="outline" className="text-xs">
                      {categoria}
                    </Badge>
                  ))}
                  {categorias.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nenhuma categoria cadastrada</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmittingCategory}>
                  <Plus className="w-4 h-4 mr-2" />
                  {isSubmittingCategory ? 'Adicionando...' : 'Adicionar'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCategoryDialogOpen(false);
                    setCategoryForm({ nome: '', descricao: '' });
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as Categorias</SelectItem>
                {categorias.map(categoria => (
                  <SelectItem key={categoria} value={categoria}>
                    {categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Produtos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Produtos ({produtosFiltrados.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço Atacado</TableHead>
                  <TableHead>Preço Varejo</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtosFiltrados.map((produto) => (
                  <TableRow key={produto.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{produto.nome}</div>
                        {produto.descricao && (
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {produto.descricao}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{produto.categoria}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">
                        R$ {Number(produto.preco_atacado).toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {produto.preco_varejo ? (
                        <span className="text-muted-foreground line-through">
                          R$ {Number(produto.preco_varejo).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={produto.estoque && produto.estoque > 0 ? 'text-foreground' : 'text-red-500'}>
                        {produto.estoque || 0} un.
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={produto.ativo ? 'default' : 'secondary'}>
                        {produto.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusToggle(produto)}
                          title={produto.ativo ? 'Desativar' : 'Ativar'}
                        >
                          {produto.ativo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(produto)}
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(produto)}
                          className="text-red-600 hover:text-red-700"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {produtosFiltrados.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm || selectedCategory !== 'todos' 
                    ? 'Nenhum produto encontrado' 
                    : 'Nenhum produto cadastrado'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedCategory !== 'todos'
                    ? 'Tente ajustar os filtros de busca'
                    : 'Comece adicionando seu primeiro produto ao catálogo'}
                </p>
                {!searchTerm && selectedCategory === 'todos' && (
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Produto
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}