import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, X, RefreshCw, ShoppingCart, Coffee, Package } from "lucide-react";
import logoAssis from "@/assets/logo/logo.png";
import { useChatbotConversation } from "@/hooks/useChatbotConversation";

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
      <DialogContent className="sm:max-w-[425px] h-[600px] p-0 flex flex-col">
        <DialogHeader className="px-4 py-3 border-b bg-primary text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={logoAssis}
                  alt="Assis"
                  className="w-10 h-10 rounded-full bg-white p-1"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <DialogTitle className="text-white font-semibold">Assis - Dono da AssisMax</DialogTitle>
                <p className="text-xs text-white/80">Online agora • Responde rápido</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
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
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <>
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
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
                        <img
                          src={logoAssis}
                          alt="Assis"
                          className="w-8 h-8 rounded-full bg-gray-100 p-1 mr-2 flex-shrink-0"
                        />
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          message.sender === 'user'
                            ? 'bg-primary text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {isTyping && (
                  <div className="flex justify-start animate-fade-in">
                    <img
                      src={logoAssis}
                      alt="Assis"
                      className="w-8 h-8 rounded-full bg-gray-100 p-1 mr-2 flex-shrink-0"
                    />
                    <div className="bg-gray-100 rounded-2xl px-4 py-2 rounded-bl-sm">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                )}
                {/* Elemento invisível para scroll automático */}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="border-t p-4">
              <div className="flex gap-2">
                <Textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={getPlaceholder()}
                  className="resize-none"
                  rows={1}
                  disabled={isTyping}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Pressione Enter para enviar
              </p>
            </div>
        </>
      </DialogContent>
    </Dialog>
  );
}