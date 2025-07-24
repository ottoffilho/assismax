import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, X, RefreshCw, Bot, Database, TrendingUp, Users, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import logoAssis from "@/assets/logo/logo.png";
import { useAdminChatbot } from "@/hooks/useAdminChatbot";
import '../ChatbotModal.css';

interface AdminChatbotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AdminChatbotModal({ open, onOpenChange }: AdminChatbotModalProps) {
  const [inputMessage, setInputMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    isTyping,
    sendMessage,
    resetConversation,
    isAuthenticated
  } = useAdminChatbot();

  // Scroll automático quando novas mensagens aparecem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end'
    });
  }, [messages, isTyping]);

  // Foca no input quando abre o modal
  useEffect(() => {
    if (open && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [open]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;
    
    await sendMessage(inputMessage);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  // Sugestões de perguntas
  const quickQuestions = [
    { icon: TrendingUp, text: "Quantos leads novos chegaram hoje?", color: "bg-green-100 text-green-800" },
    { icon: Users, text: "Qual funcionário tem melhor taxa de conversão?", color: "bg-blue-100 text-blue-800" },
    { icon: BarChart3, text: "Mostre o funil de conversão desta semana", color: "bg-purple-100 text-purple-800" },
    { icon: Database, text: "Produtos mais consultados pelos leads", color: "bg-orange-100 text-orange-800" }
  ];

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  if (!isAuthenticated) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] h-[400px] p-0 flex flex-col bg-card border-border shadow-strong">
          <DialogHeader className="px-6 py-4 border-b border-border bg-gradient-primary text-primary-foreground rounded-t-lg">
            <DialogTitle className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white border border-primary-foreground/20 flex items-center justify-center p-1">
                <img
                  src={logoAssis}
                  alt="AssisBot"
                  className="w-5 h-5 object-contain"
                />
              </div>
              AssisBot - Acesso Negado
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex items-center justify-center p-6 bg-background">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-white border border-border rounded-full flex items-center justify-center p-2">
                <img
                  src={logoAssis}
                  alt="AssisBot"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Acesso Restrito</h3>
              <p className="text-muted-foreground">
                Este assistente é exclusivo para administradores do sistema.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[700px] p-0 flex flex-col bg-card border-border shadow-strong">
        <DialogHeader className="px-6 py-4 border-b border-border bg-gradient-primary text-primary-foreground rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-white border border-primary-foreground/20 flex items-center justify-center p-1">
                  <img
                    src={logoAssis}
                    alt="AssisBot"
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-success border-2 border-primary-foreground rounded-full flex items-center justify-center">
                  <span className="w-2 h-2 bg-primary-foreground rounded-full online-indicator"></span>
                </span>
              </div>
              <div>
                <DialogTitle className="text-primary-foreground font-semibold text-lg">
                  AssisBot
                </DialogTitle>
                <p className="text-xs text-primary-foreground/80 flex items-center gap-1">
                  <span className="w-2 h-2 bg-success rounded-full"></span>
                  Assistente Executivo • Marketing • Gestão • Analytics
                </p>
              </div>
              <Badge variant="secondary" className="bg-accent/20 text-accent border border-accent/30">
                Admin Only
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 chatbot-button"
                onClick={resetConversation}
                title="Nova conversa"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 chatbot-button"
                onClick={() => onOpenChange(false)}
                title="Fechar chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6 bg-background chatbot-scroll" ref={scrollAreaRef}>
          <div className="space-y-6">
            {/* Mensagem de boas-vindas se não há mensagens */}
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-white border border-border rounded-full flex items-center justify-center p-2">
                  <img
                    src={logoAssis}
                    alt="AssisBot"
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Olá! Sou seu AssisBot 🤖
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Seu assistente executivo especializado em marketing digital, gestão de atacarejo e análise de pessoas.
                  Faça perguntas sobre leads, funcionários, produtos e métricas!
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg mx-auto">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleQuickQuestion(question.text)}
                      className={`${question.color} p-3 rounded-lg text-sm font-medium text-left hover:opacity-80 chatbot-button flex items-center gap-2`}
                    >
                      <question.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{question.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mensagens da conversa */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
              >
                {message.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center mr-3 flex-shrink-0 p-1">
                    <img
                      src={logoAssis}
                      alt="AssisBot"
                      className="w-5 h-5 object-contain"
                    />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.sender === 'user'
                      ? 'user-message text-primary-foreground rounded-br-sm'
                      : 'bot-message text-card-foreground rounded-bl-sm'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </div>
                  {/* Mostrar dados brutos se existirem */}
                  {message.metadata?.raw_data && message.metadata.raw_data.length > 0 && (
                    <details className="mt-3 text-xs">
                      <summary className="cursor-pointer text-slate-500 hover:text-slate-700">
                        Ver dados brutos ({message.metadata.data_count} registros)
                      </summary>
                      <pre className="mt-2 p-2 bg-slate-50 rounded text-xs overflow-x-auto">
                        {JSON.stringify(message.metadata.raw_data, null, 2)}
                      </pre>
                    </details>
                  )}
                  <p className={`text-xs mt-2 ${
                    message.sender === 'user' ? 'text-slate-300' : 'text-slate-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {/* Indicador de digitação */}
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center mr-3 flex-shrink-0 p-1">
                  <img
                    src={logoAssis}
                    alt="AssisBot"
                    className="w-5 h-5 object-contain"
                  />
                </div>
                <div className="bot-message rounded-2xl px-4 py-3 rounded-bl-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full typing-dot-1"></span>
                      <span className="w-2 h-2 bg-muted-foreground rounded-full typing-dot-2"></span>
                      <span className="w-2 h-2 bg-muted-foreground rounded-full typing-dot-3"></span>
                    </div>
                    <span className="text-xs text-muted-foreground">Analisando dados...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Elemento invisível para scroll automático */}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input de mensagem */}
        <div className="border-t border-border p-4 bg-card">
          <div className="flex gap-3">
            <Textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isTyping ? "Aguarde a resposta..." : "Pergunte sobre leads, funcionários, produtos, métricas..."}
              className="resize-none border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-accent focus:border-accent"
              rows={2}
              disabled={isTyping}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="px-4 bg-primary hover:bg-primary-hover text-primary-foreground shadow-soft chatbot-button disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              Pressione Enter para enviar • Shift+Enter para nova linha
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Database className="h-3 w-3" />
              <span>Acesso total ao BD</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}