import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Produtos from "./pages/Produtos";
import Categorias from "./pages/Categorias";
import CategoriaDetalhes from "./pages/CategoriaDetalhes";
import TestConversas from "./pages/TestConversas";
import Login from "./pages/Login";
import Setup from "./pages/Setup";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import FuncionariosDashboard from "./pages/FuncionariosDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/categoria/:categoria" element={<CategoriaDetalhes />} />
            <Route path="/test-conversas" element={<TestConversas />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin={true} redirectTo="/login">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/funcionarios" 
              element={
                <ProtectedRoute redirectTo="/login">
                  <FuncionariosDashboard />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
