import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, X } from "lucide-react";
import logoAssis from "@/assets/logo/logo.png";
import { useSimpleChatbot } from "@/hooks/useSimpleChatbot";

interface SimpleChatbotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SimpleChatbotModal({ open, onOpenChange }: SimpleChatbotModalProps) {
  const [inputMessage, setInputMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { messages, isTyping, stage, leadData, salesQuestionsCount, extendedQuestionsCount, initializeChat, sendMessage, reset } = useSimpleChatbot();

  // Quando o modal abre, inicializar o chat
  useEffect(() => {
    if (open) {
      initializeChat();
    } else {
      reset();
    }
  }, [open, initializeChat, reset]);

  // Scroll automático quando novas mensagens aparecem
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'end'
        });
        
        // Backup com scroll direto do container
        if (scrollAreaRef.current) {
          const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
          if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
          }
        }
      }
    };
    
    // Múltiplos timeouts para garantir o scroll
    scrollToBottom();
    setTimeout(scrollToBottom, 100);
    setTimeout(scrollToBottom, 300);
  }, [messages, isTyping]);

  // Manter foco no input sempre ativo
  useEffect(() => {
    if (open && textareaRef.current) {
      // Foca no input quando abre o modal
      textareaRef.current.focus();
    }
  }, [open]);

  // Refocar no input após mudanças no estado (mensagens, typing, etc)
  useEffect(() => {
    if (open && textareaRef.current && !isTyping) {
      // Pequeno delay para garantir que a mensagem foi processada
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [open, messages.length, isTyping, stage]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;
    
    await sendMessage(inputMessage);
    setInputMessage('');
    
    // Refocar imediatamente após enviar
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Prevenir perda de foco quando clica em outras áreas
  const handleBlur = () => {
    // Refocar após um pequeno delay se o modal ainda estiver aberto
    if (open) {
      setTimeout(() => {
        if (textareaRef.current && !textareaRef.current.disabled) {
          textareaRef.current.focus();
        }
      }, 10);
    }
  };

  // Placeholder dinâmico baseado no estágio
  const getPlaceholder = () => {
    if (isTyping) return "Aguarde...";
    
    switch (stage) {
      case 'collecting_name':
        return "Digite seu nome completo...";
      case 'collecting_phone':
        return "Digite seu WhatsApp com DDD...";
      case 'collecting_email':
        return "Digite seu email...";
      case 'sales_mode':
        if (salesQuestionsCount >= 5) return "Aguarde transição...";
        return "Pergunte sobre preços e produtos...";
      case 'extended_chat':
        if (extendedQuestionsCount >= 5) return "Conversa finalizada";
        return "Faça qualquer pergunta sobre nosso negócio...";
      case 'closing':
        return "Conversa finalizada";
      default:
        return "Digite sua mensagem...";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] h-[600px] p-0 flex flex-col bg-card border-border shadow-strong">
        <DialogHeader className="px-4 py-4 border-b border-border bg-gradient-primary text-primary-foreground rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-white border border-primary-foreground/20 flex items-center justify-center p-1">
                  <img
                    src={logoAssis}
                    alt="Assis"
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-success border-2 border-primary-foreground rounded-full flex items-center justify-center">
                  <span className="w-2 h-2 bg-primary-foreground rounded-full"></span>
                </span>
              </div>
              <div>
                <DialogTitle className="text-primary-foreground font-semibold text-base">
                  Assis - Dono da AssisMax
                  {stage === 'sales_mode' && (
                    <span className="ml-2 text-xs bg-yellow-500 text-black px-2 py-1 rounded-full font-normal">
                      Modo Vendas
                    </span>
                  )}
                  {stage === 'extended_chat' && (
                    <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-normal">
                      Chat Livre
                    </span>
                  )}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Chatbot da AssisMax para ajudar com produtos e atendimento
                </DialogDescription>
                <p className="text-xs text-primary-foreground/80 flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${isTyping ? 'bg-yellow-400 animate-pulse' : 'bg-success'}`}></span>
                  {stage === 'sales_mode' ? (
                    isTyping ? 'Consultando produtos...' : `Pergunta ${salesQuestionsCount + 1} de 5 • Preços especiais`
                  ) : stage === 'extended_chat' ? (
                    isTyping ? 'Pensando na resposta...' : `Pergunta ${extendedQuestionsCount + 1} de 5 • Chat livre com IA`
                  ) : stage === 'closing' ? (
                    'Conversa finalizada • Nossa equipe entrará em contato'
                  ) : (
                    isTyping ? 'Digitando...' : 'Online agora • Responde rápido'
                  )}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => onOpenChange(false)}
              title="Fechar chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4 bg-background overflow-y-auto max-h-[400px]" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center mr-2 flex-shrink-0 p-1">
                    <img
                      src={logoAssis}
                      alt="Assis"
                      className="w-5 h-5 object-contain"
                    />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted text-card-foreground rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center mr-2 flex-shrink-0 p-1 animate-pulse">
                  <img
                    src={logoAssis}
                    alt="Assis"
                    className="w-5 h-5 object-contain"
                  />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-3 rounded-bl-sm">
                  <div className="flex gap-1 items-center">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  </div>
                </div>
              </div>
            )}
            {/* Elemento invisível para scroll automático */}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t border-border bg-card p-4">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              onBlur={handleBlur}
              placeholder={getPlaceholder()}
              className="resize-none border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-accent focus:border-accent"
              rows={1}
              disabled={isTyping || stage === 'closing' || (stage === 'sales_mode' && salesQuestionsCount >= 5) || (stage === 'extended_chat' && extendedQuestionsCount >= 5)}
              autoFocus
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping || stage === 'closing' || (stage === 'sales_mode' && salesQuestionsCount >= 5)}
              className="px-3 bg-primary hover:bg-primary-hover text-primary-foreground shadow-soft disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {stage === 'sales_mode' && salesQuestionsCount < 5 ? (
              `${5 - salesQuestionsCount} pergunta(s) restante(s) • Pressione Enter`
            ) : stage === 'extended_chat' && extendedQuestionsCount < 5 ? (
              `${5 - extendedQuestionsCount} pergunta(s) restante(s) • Chat livre com IA`
            ) : stage === 'closing' || (stage === 'sales_mode' && salesQuestionsCount >= 5) || (stage === 'extended_chat' && extendedQuestionsCount >= 5) ? (
              'Conversa finalizada • Nossa equipe entrará em contato'
            ) : (
              'Pressione Enter para enviar'
            )}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}