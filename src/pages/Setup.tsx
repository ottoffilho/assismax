import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import InputMask from 'react-input-mask';
import {
  Loader2,
  Building2,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import logoHeroDark from '@/assets/logo/logo hero-dark.png';
// CreateFuncionarioModal removido - usando apenas setup inicial

export default function Setup() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSetup, setIsCheckingSetup] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Dados do admin (único step necessário)
  const [adminData, setAdminData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    telefone: ''
  });

  const checkIfSetupCompleted = useCallback(async () => {
    try {
      // Verificar se setup já foi concluído via Edge Function
      const { data, error } = await supabase.functions.invoke('initial-setup', {
        method: 'GET'
      });

      if (error) {
        console.error('Erro ao verificar setup:', error);
        // Em caso de erro, permitir acesso ao setup
        return;
      }

      if (data?.setupCompleted) {
        // Setup já foi concluído, redirecionar para login
        navigate('/login', {
          state: {
            message: 'Sistema já foi configurado. Faça login para acessar.'
          }
        });
      }
    } catch (error) {
      console.error('Erro ao verificar setup:', error);
      // Em caso de erro, permitir acesso ao setup
    } finally {
      setIsCheckingSetup(false);
    }
  }, [navigate]);

  // Verificar se o sistema já foi configurado
  useEffect(() => {
    checkIfSetupCompleted();
  }, [checkIfSetupCompleted]);

  const validateAdminData = () => {
    if (!adminData.nome.trim()) {
      setError('Nome do administrador é obrigatório');
      return false;
    }
    if (!adminData.email.trim()) {
      setError('Email do administrador é obrigatório');
      return false;
    }
    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminData.email)) {
      setError('Email inválido');
      return false;
    }
    if (!adminData.senha) {
      setError('Senha é obrigatória');
      return false;
    }
    if (adminData.senha.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return false;
    }
    if (adminData.senha !== adminData.confirmarSenha) {
      setError('Senhas não conferem');
      return false;
    }
    return true;
  };

  const handleSetupComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateAdminData()) return;

    setIsLoading(true);

    try {
      // Dados fixos da ASSISMAX (empresa exclusiva)
      const empresaData = {
        nome: 'ASSISMAX Atacarejo',
        telefone: '(61) 3333-4444',
        email: 'contato@assismax.com.br',
        endereco: 'Valparaíso de Goiás - GO'
      };

      // Chamar Edge Function para setup automatizado
      console.log('Enviando dados para Edge Function:', { empresaData, adminData });

      const { data, error } = await supabase.functions.invoke('initial-setup', {
        body: { empresaData, adminData }
      });

      console.log('Resposta da Edge Function:', { data, error });

      if (error) {
        console.error('Erro detalhado:', error);
        throw new Error(error.message || 'Erro ao configurar sistema');
      }

      if (data?.success) {
        // Setup concluído com sucesso
        navigate('/login', {
          state: {
            message: 'Sistema configurado com sucesso! Faça login com suas credenciais.',
            email: adminData.email
          }
        });
      }

    } catch (error) {
      console.error('Erro no setup:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao configurar sistema';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Verificando configuração do sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Logo e Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img 
              src={logoHeroDark} 
              alt="ASSISMAX Atacarejo" 
              className="h-32 w-auto"
            />
          </div>
          <h1 className="text-2xl font-bold mb-2">Configuração Inicial</h1>
          <p className="text-muted-foreground">
            Configure seu sistema ASSISMAX em poucos passos
          </p>
        </div>

        {/* Informações da empresa ASSISMAX */}
        <div className="text-center bg-muted/30 rounded-lg p-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">ASSISMAX Atacarejo</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Valparaíso de Goiás - GO • Atacarejo especializado em produtos básicos
          </p>
        </div>

        {/* Formulário do Administrador */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Criar Primeiro Administrador
            </CardTitle>
            <CardDescription>
              Configure sua conta de administrador para acessar o sistema ASSISMAX
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSetupComplete} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="admin-nome">Nome Completo *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="admin-nome"
                    placeholder="Seu nome completo"
                    value={adminData.nome}
                    onChange={(e) => setAdminData({...adminData, nome: e.target.value})}
                    className="pl-10"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="seu@email.com.br"
                    value={adminData.email}
                    onChange={(e) => setAdminData({...adminData, email: e.target.value})}
                    className="pl-10"
                    disabled={isLoading}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Este email será usado para fazer login no sistema
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-senha">Senha *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="admin-senha"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={adminData.senha}
                      onChange={(e) => setAdminData({...adminData, senha: e.target.value})}
                      className="pl-10"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-confirmar-senha">Confirmar Senha *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="admin-confirmar-senha"
                      type="password"
                      placeholder="Confirme sua senha"
                      value={adminData.confirmarSenha}
                      onChange={(e) => setAdminData({...adminData, confirmarSenha: e.target.value})}
                      className="pl-10"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-telefone">Telefone (opcional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                  <InputMask
                    mask="(99) 99999-9999"
                    value={adminData.telefone}
                    onChange={(e) => setAdminData({...adminData, telefone: e.target.value})}
                    disabled={isLoading}
                  >
                    {(inputProps: any) => (
                      <Input
                        {...inputProps}
                        id="admin-telefone"
                        placeholder="(61) 99999-9999"
                        className="pl-10"
                      />
                    )}
                  </InputMask>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Configurando sistema...
                  </>
                ) : (
                  'Configurar Sistema ASSISMAX'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Seção para criar funcionários se já existe empresa */}
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle>Acessar Sistema</CardTitle>
            <CardDescription>
              Faça login ou configure funcionários no painel admin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Use isso se você já tem uma conta no sistema mas não consegue fazer login.
                Isso criará um registro de funcionário para seu email.
              </AlertDescription>
            </Alert>
            
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                Para criar funcionários, acesse o painel administrativo após fazer login.
              </p>
            </div>
            
            <div className="text-center">
              <Button variant="outline" onClick={() => navigate('/login')}>
                Já tenho conta - Ir para Login
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}