import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formata telefone brasileiro para exibição
export function formatPhoneDisplay(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
}

// Valida se é um telefone brasileiro válido
export function isValidBrazilianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || cleaned.length === 11;
}

// Extrai apenas números de uma string
export function extractNumbers(str: string): string {
  return str.replace(/\D/g, '');
}

// Capitaliza primeira letra de cada palavra
export function capitalize(str: string): string {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

// Detecta se mensagem parece ser apenas um nome
export function looksLikeName(message: string): boolean {
  const cleaned = message.trim();
  
  // Se tem menos de 2 ou mais de 30 caracteres, provavelmente não é só um nome
  if (cleaned.length < 2 || cleaned.length > 30) return false;
  
  // Se tem números, provavelmente não é só um nome
  if (/\d/.test(cleaned)) return false;
  
  // Se tem muitas palavras (mais de 4), provavelmente não é só um nome
  const words = cleaned.split(/\s+/);
  if (words.length > 4) return false;
  
  // Se todas as palavras começam com maiúscula ou são preposições, provavelmente é um nome
  const namePattern = /^[A-Za-zÀ-ÿ\s]+$/;
  return namePattern.test(cleaned);
}

// Remove acentos para comparações
export function removeAccents(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Gera ID único para mensagens
export function generateMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
