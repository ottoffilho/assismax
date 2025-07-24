import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, X, RefreshCw, ShoppingCart, Coffee, Package, Bot } from "lucide-react";
import logoAssis from "@/assets/logo/logo.png";
import { useChatbotConversation } from "@/hooks/useChatbotConversation";
import './ChatbotModal.css';

interface ChatbotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ChatbotModal({ open, onOpenChange }: ChatbotModalProps) {
  const [inputMessage, setInputMessage] = useState('');

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    isTyping,
    conversationState,
    sendMessage,
    startConversation,
    resetConversation,
    collectedData
  } = useChatbotConversation();

  // Scroll automático quando novas mensagens aparecem
  useEffect(() => {
    // Scroll suave para o final das mensagens
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

  // Reseta e inicia nova conversa sempre que o modal abre
  useEffect(() => {
    if (open) {
      // Sempre reseta a conversa quando abre o modal
      resetConversation();
      // Pequeno delay para garantir que o reset foi aplicado
      setTimeout(() => {
        startConversation();
      }, 100);
    }
  }, [open, resetConversation, startConversation]);

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

  // Placeholder para input baseado no estado da conversa
  const getPlaceholder = () => {
    if (isTyping) {
      return "Aguarde...";
    }
    
    // Verifica se precisa de dados específicos
    if (conversationState.needsDataCollection) {
      if (!collectedData.nome) {
        return "Digite seu nome completo...";
      }
      if (!collectedData.telefone) {
        return "Digite seu telefone com DDD...";
      }
      if (!collectedData.email) {
        return "Digite seu email...";
      }
    }
    
    return "Digite sua mensagem...";
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
                  <span className="w-2 h-2 bg-primary-foreground rounded-full online-indicator"></span>
                </span>
              </div>
              <div>
                <DialogTitle className="text-primary-foreground font-semibold text-base">Assis - Dono da AssisMax</DialogTitle>
                <p className="text-xs text-primary-foreground/80 flex items-center gap-1">
                  <span className="w-2 h-2 bg-success rounded-full"></span>
                  Online agora • Responde rápido
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 chatbot-button"
                onClick={() => {
                  resetConversation();
                  setTimeout(() => startConversation(), 100);
                }}
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

        <>
            <ScrollArea className="flex-1 p-4 bg-background chatbot-scroll" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => {
                  // Não renderiza mensagens vazias que não estão sendo digitadas
                  if (!message.content && !message.isTyping) return null;

                  return (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
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
                            ? 'user-message text-primary-foreground rounded-br-sm'
                            : 'bot-message text-card-foreground rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        <p className={`text-xs mt-2 ${
                          message.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {isTyping && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center mr-2 flex-shrink-0 p-1">
                      <img
                        src={logoAssis}
                        alt="Assis"
                        className="w-5 h-5 object-contain"
                      />
                    </div>
                    <div className="bot-message rounded-2xl px-4 py-3 rounded-bl-sm">
                      <div className="flex gap-1 items-center">
                        <span className="w-2 h-2 bg-muted-foreground rounded-full typing-dot-1"></span>
                        <span className="w-2 h-2 bg-muted-foreground rounded-full typing-dot-2"></span>
                        <span className="w-2 h-2 bg-muted-foreground rounded-full typing-dot-3"></span>
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
                  placeholder={getPlaceholder()}
                  className="resize-none border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-accent focus:border-accent"
                  rows={1}
                  disabled={isTyping}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="px-3 bg-primary hover:bg-primary-hover text-primary-foreground shadow-soft chatbot-button disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Pressione Enter para enviar
              </p>
            </div>
        </>
      </DialogContent>
    </Dialog>
  );
}