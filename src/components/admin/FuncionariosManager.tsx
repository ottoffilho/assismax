import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Phone, 
  Shield, 
  Edit, 
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

interface Funcionario {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  nivel_acesso: 'admin' | 'funcionario';
  ativo: boolean;
  user_id: string;
  created_at: string;
}

export function FuncionariosManager() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState<Funcionario | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    nivel_acesso: 'funcionario' as 'admin' | 'funcionario',
    senha: ''
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar funcionários
  const { data: funcionarios, isLoading, error } = useQuery({
    queryKey: ['funcionarios'],
    queryFn: async () => {
      console.log('🔍 Buscando funcionários...');

      // Verificar usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();
      console.log('👤 Usuário autenticado:', user?.id, user?.email);

      const { data, error } = await supabase
        .from('funcionarios')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('📊 Resultado funcionários:', { data, error });

      if (error) {
        console.error('❌ Erro ao buscar funcionários:', error);
        throw error;
      }

      console.log('✅ Funcionários encontrados:', data?.length || 0);
      return data as Funcionario[];
    },
    staleTime: 0, // Sempre buscar dados frescos
    refetchOnMount: true, // Refetch quando componente monta
  });

  // Criar funcionário
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      console.log('Iniciando cadastro de funcionário:', data.email);

      const { data: result, error } = await supabase.functions.invoke('create-funcionario', {
        body: {
          nome: data.nome,
          email: data.email,
          telefone: data.telefone || null,
          nivel_acesso: data.nivel_acesso,
          senha: data.senha
        }
      });

      if (error) {
        throw new Error(error.message || 'Erro ao criar funcionário');
      }

      if (!result?.success) {
        throw new Error(result?.error || 'Erro ao criar funcionário');
      }

      console.log('Funcionário criado com sucesso:', result.funcionario.id);
      return result.funcionario;
    },
    onSuccess: (funcionario) => {
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
      setIsCreateOpen(false);
      resetForm();

      toast({
        title: 'Funcionário criado!',
        description: `${funcionario.nome} foi cadastrado com sucesso e pode fazer login.`,
      });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro ao cadastrar o funcionário.';
      toast({
        title: 'Erro ao criar funcionário',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  });

  // Atualizar funcionário
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Funcionario> & { id: string }) => {
      const { error } = await supabase
        .from('funcionarios')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
      setEditingFuncionario(null);
      toast({
        title: 'Funcionário atualizado!',
        description: 'As informações foram atualizadas com sucesso.',
      });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar funcionário';
      toast({
        title: 'Erro ao atualizar',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  });

  // Desativar/Ativar funcionário
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase
        .from('funcionarios')
        .update({ ativo })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
      toast({
        title: variables.ativo ? 'Funcionário ativado!' : 'Funcionário desativado!',
        description: variables.ativo 
          ? 'O funcionário pode acessar o sistema novamente.'
          : 'O acesso do funcionário foi bloqueado.',
      });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao alterar status';
      toast({
        title: 'Erro ao alterar status',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      nivel_acesso: 'funcionario',
      senha: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingFuncionario) {
      updateMutation.mutate({
        id: editingFuncionario.id,
        nome: formData.nome,
        telefone: formData.telefone || null,
        nivel_acesso: formData.nivel_acesso
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar funcionários. Tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Funcionários</h2>
          <p className="text-muted-foreground">
            Gerencie o acesso dos funcionários ao sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['funcionarios'] })}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); }}>
                <UserPlus className="w-4 h-4 mr-2" />
                Novo Funcionário
              </Button>
            </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingFuncionario ? 'Editar Funcionário' : 'Novo Funcionário'}
                </DialogTitle>
                <DialogDescription>
                  {editingFuncionario 
                    ? 'Atualize as informações do funcionário'
                    : 'Cadastre um novo funcionário no sistema'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome completo</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={!!editingFuncionario}
                  />
                  {editingFuncionario && (
                    <p className="text-sm text-muted-foreground">
                      Email não pode ser alterado
                    </p>
                  )}
                </div>
                
                {!editingFuncionario && (
                  <div className="space-y-2">
                    <Label htmlFor="senha">Senha</Label>
                    <Input
                      id="senha"
                      type="password"
                      value={formData.senha}
                      onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                      required
                      minLength={6}
                    />
                    <p className="text-sm text-muted-foreground">
                      Mínimo 6 caracteres
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nivel_acesso">Nível de Acesso</Label>
                  <Select 
                    value={formData.nivel_acesso}
                    onValueChange={(value: 'admin' | 'funcionario') => 
                      setFormData({ ...formData, nivel_acesso: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="funcionario">Funcionário</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingFuncionario(null);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    editingFuncionario ? 'Atualizar' : 'Cadastrar'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lista de Funcionários */}
      <div className="grid gap-4">
        {funcionarios?.map((funcionario) => (
          <Card key={funcionario.id}>
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  {funcionario.nivel_acesso === 'admin' ? (
                    <Shield className="w-6 h-6 text-primary" />
                  ) : (
                    <Users className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{funcionario.nome}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-3 h-3" />
                    {funcionario.email}
                    {funcionario.telefone && (
                      <>
                        <Separator orientation="vertical" className="h-4" />
                        <Phone className="w-3 h-3" />
                        {funcionario.telefone}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant={funcionario.nivel_acesso === 'admin' ? 'default' : 'secondary'}>
                    {funcionario.nivel_acesso === 'admin' ? 'Administrador' : 'Funcionário'}
                  </Badge>
                  <Badge variant={funcionario.ativo ? 'outline' : 'destructive'}>
                    {funcionario.ativo ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Ativo
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 mr-1" />
                        Inativo
                      </>
                    )}
                  </Badge>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingFuncionario(funcionario);
                    setFormData({
                      nome: funcionario.nome,
                      email: funcionario.email,
                      telefone: funcionario.telefone || '',
                      nivel_acesso: funcionario.nivel_acesso,
                      senha: ''
                    });
                    setIsCreateOpen(true);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant={funcionario.ativo ? 'destructive' : 'default'}
                  size="sm"
                  onClick={() => toggleActiveMutation.mutate({ 
                    id: funcionario.id, 
                    ativo: !funcionario.ativo 
                  })}
                  disabled={toggleActiveMutation.isPending}
                >
                  {funcionario.ativo ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {funcionarios?.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">Nenhum funcionário cadastrado</h3>
            <p className="text-muted-foreground">
              Clique em "Novo Funcionário" para começar
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}