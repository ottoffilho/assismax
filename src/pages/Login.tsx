import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import logoHeroDark from '@/assets/logo/logo hero-dark.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Pegar o redirect da query string se existir
  const searchParams = new URLSearchParams(location.search);
  const setupComplete = searchParams.get('setup') === 'complete';

  // Mensagem vinda do setup via state
  const setupMessage = location.state?.message;
  const setupEmail = location.state?.email;

  // Pré-preencher email se veio do setup
  useEffect(() => {
    if (setupEmail && !email) {
      setEmail(setupEmail);
    }
  }, [setupEmail, email]);

  // Se já está autenticado, o redirecionamento será feito pelo AuthContext
  // baseado no nível de acesso do usuário

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 Form submit para:', email);
    setError('');
    setIsLoading(true);

    try {
      console.log('🔐 Chamando signIn...');
      await signIn(email, password);
      console.log('✅ signIn completado com sucesso');
      // O redirecionamento é feito automaticamente pelo AuthContext
    } catch (error) {
      console.error('❌ Erro no handleSubmit:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer login';
      setError(errorMessage);
    } finally {
      console.log('🏁 Finalizando handleSubmit');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <img 
              src={logoHeroDark} 
              alt="ASSISMAX Atacarejo" 
              className="h-48 w-auto"
            />
          </div>
        </div>

        {/* Card de Login */}
        <Card>
          <CardHeader>
            <CardTitle>Acesso ao Sistema</CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar o painel
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {(setupComplete || setupMessage) && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    {setupMessage || 'Sistema configurado com sucesso! Use suas credenciais para entrar.'}
                  </AlertDescription>
                </Alert>
              )}
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>Não tem uma conta?</p>
              <p>Entre em contato com o administrador</p>
            </div>
            
            <Link to="/" className="w-full">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao site
              </Button>
            </Link>
          </CardFooter>
        </Card>

      </div>
    </div>
  );
}