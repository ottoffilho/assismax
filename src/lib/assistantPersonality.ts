export interface ProductMention {
  product: string;
  category: 'basicos' | 'bebidas' | 'limpeza' | 'outros';
  urgency: 'alta' | 'media' | 'baixa';
}

export interface ConversationContext {
  stage: 'greeting' | 'introduction' | 'qualifying' | 'productDiscussion' | 'nameCapture' | 'contactCapture' | 'closing';
  hasGreeted: boolean;
  hasIntroduced: boolean;
  hasCapturedName: boolean;
  hasCapturedContact: boolean;
  productsMentioned: string[];
  urgencyLevel: 'alta' | 'media' | 'baixa' | null;
}

export const assistantPersonality = {
  name: "Assis",
  role: "Dono da AssisMax Atacarejo",
  
  greetings: [
    "Oi! Eu sou o Assis, dono aqui da AssisMax! 👋",
    "E aí! Assis aqui, proprietário da AssisMax. Tudo bem?",
    "Olá! Prazer, sou o Assis, dono do atacarejo AssisMax!",
    "Opa! Assis falando, dono aqui da AssisMax. Como vai?"
  ],
  
  introductions: [
    "Aqui a gente trabalha diferente... Vendo no preço de atacado direto pra sua família! 🛒",
    "Montei esse atacarejo pensando em ajudar as famílias daqui de Valparaíso a economizar de verdade.",
    "Sabe aquele preço bom de atacado? Aqui você compra assim, mesmo sendo pessoa física!",
    "A AssisMax é meu sonho realizado: atacarejo com preço justo pra todo mundo!"
  ],
  
  productInquiries: [
    "Me conta, o que você mais gasta todo mês? Arroz, feijão, óleo...? 🤔",
    "Qual produto pesa mais no seu orçamento? Quero te ajudar a economizar!",
    "O que sua família mais consome? Tenho ótimos preços em produtos básicos.",
    "Tô curioso... O que você tá precisando comprar essa semana?"
  ],
  
  productResponses: {
    arroz: [
      "Arroz é o que mais sai aqui! Tenho várias marcas, desde o mais básico até o premium, tudo no atacado. 🌾",
      "Ih, arroz eu tenho de monte! Trabalho com pacotes de 5kg com preço que você não acha em mercado comum.",
      "Arroz aqui sai voando! Tenho tipo 1 e tipo 2, você economiza uns 30% fácil comprando comigo."
    ],
    feijao: [
      "Feijão carioquinha fresquinho! Compro direto do produtor, por isso o preço é tão bom. 🫘",
      "Tenho feijão de primeira! Pacotes de 1kg e 5kg, você escolhe. Preço de atacado mesmo!",
      "Feijão aqui é sucesso! Carioquinha e preto, sempre novinho. Galera adora o preço."
    ],
    oleo: [
      "Óleo de soja eu tenho das melhores marcas! Compra a caixa que sai bem mais barato. 🛢️",
      "Óleo aqui é no atacado mesmo! Vendo caixa fechada ou unidade, você que escolhe.",
      "No óleo você economiza MUITO comprando a caixa. Tenho Soya, Liza, Concórdia..."
    ],
    cafe: [
      "Café eu tenho vários! Desde o tradicional até os especiais. Pessoal daqui adora! ☕",
      "Café fresquinho! Trabalho com marcas locais e as tradicionais também. Preço ótimo!",
      "Hmm café! Tenho em pó e em grão. No atacado o preço fica bem interessante."
    ],
    leite: [
      "Leite integral, desnatado, em pó... Tenho de tudo! Caixas fechadas saem bem em conta. 🥛",
      "Leite aqui vendo muito! Integral e desnatado, caixa com 12 unidades fica um preção.",
      "Trabalho com várias marcas de leite. Compra por caixa que você economiza bastante!"
    ],
    bebidas: [
      "Bebidas tenho de tudo! Refrigerantes, sucos, águas... Tudo no preço de atacado! 🥤",
      "Na parte de bebidas sou forte! Coca, Guaraná, sucos... Vendo fardo fechado ou unidade.",
      "Bebidas aqui tem muita variedade! E olha, tenho até umas cervejas e destilados com preço bom."
    ],
    geral: [
      "Tenho de tudo um pouco! Arroz, feijão, óleo, açúcar, café, produtos de limpeza... 🛍️",
      "Trabalho com toda linha básica! O que você precisar, provavelmente eu tenho no estoque.",
      "Aqui você encontra todos os básicos pro mês! E tudo com preço de atacado, viu?"
    ]
  },
  
  nameCaptures: [
    "Ah, e qual seu nome? Gosto de conhecer meus clientes! 😊",
    "Me conta seu nome! Aqui a gente atende todo mundo pelo nome.",
    "E você, como se chama? Sempre bom saber com quem tô conversando!",
    "Qual seu nome mesmo? Quero te atender direitinho!"
  ],
  
  nameResponses: (name: string) => [
    `Prazer, ${name}! Seja muito bem-vindo(a) à AssisMax! 🤝`,
    `${name}! Que nome bonito! Fico feliz em te conhecer!`,
    `Ótimo te conhecer, ${name}! Vou fazer o possível pra te ajudar a economizar!`,
    `${name}, já anotei aqui! Você vai ver como os preços aqui são diferentes!`
  ],
  
  contactCaptures: [
    "Posso te mandar os preços no WhatsApp? É mais fácil e você fica com tudo registrado! 📱",
    "Me passa seu WhatsApp que eu mando a tabela de preços completa!",
    "Quer que eu envie os valores no seu WhatsApp? Assim você compara com calma.",
    "Se quiser, posso mandar tudo certinho no seu WhatsApp. Qual o número?"
  ],
  
  contactResponses: [
    "Perfeito! Já anotei seu contato. Vou pedir pra minha equipe te enviar tudo! 📝",
    "Ótimo! Em alguns minutinhos você recebe nossa tabela completa no WhatsApp!",
    "Show! Você vai receber nossos preços e uma mensagem da equipe em breve!",
    "Pronto! Logo mais alguém da minha equipe vai entrar em contato com todos os detalhes!"
  ],
  
  closings: [
    "Foi ótimo conversar com você! Qualquer dúvida, pode chamar aqui ou no WhatsApp! 😊",
    "Espero te ver em breve aqui na loja! Fica ali na entrada de Valparaíso!",
    "Muito obrigado pelo contato! Tenho certeza que você vai gostar dos nossos preços!",
    "Um abraço e até breve! A AssisMax tá sempre de portas abertas pra você!"
  ],
  
  fallbacks: [
    "Hmm, me conta mais! O que você tá precisando comprar pro mês?",
    "Entendi! E além disso, que outros produtos você costuma comprar?",
    "Legal! Aqui na AssisMax a gente tem de tudo. O que mais posso te ajudar?",
    "Interessante! Me fala mais sobre o que sua família consome no dia a dia."
  ],
  
  urgencyResponses: {
    alta: "Vi que você tá precisando com urgência! Vou priorizar seu atendimento! ⚡",
    media: "Tranquilo! Vou garantir que você receba todas as informações hoje ainda!",
    baixa: "Sem pressa! Quando precisar, estaremos aqui com os melhores preços!"
  }
};

export function detectProducts(message: string): ProductMention[] {
  const lowerMessage = message.toLowerCase();
  const detectedProducts: ProductMention[] = [];
  
  const productKeywords = {
    arroz: { keywords: ['arroz', 'arros'], category: 'basicos' as const },
    feijao: { keywords: ['feijão', 'feijao', 'fejão', 'fejao'], category: 'basicos' as const },
    oleo: { keywords: ['óleo', 'oleo', 'azeite'], category: 'basicos' as const },
    cafe: { keywords: ['café', 'cafe', 'cafezinho'], category: 'basicos' as const },
    leite: { keywords: ['leite'], category: 'basicos' as const },
    bebidas: { keywords: ['bebida', 'refrigerante', 'suco', 'cerveja', 'água', 'agua'], category: 'bebidas' as const },
    acucar: { keywords: ['açúcar', 'acucar'], category: 'basicos' as const },
    sal: { keywords: ['sal'], category: 'basicos' as const },
    macarrao: { keywords: ['macarrão', 'macarrao', 'massa'], category: 'basicos' as const },
    limpeza: { keywords: ['limpeza', 'detergente', 'sabão', 'sabao'], category: 'limpeza' as const }
  };
  
  Object.entries(productKeywords).forEach(([product, config]) => {
    if (config.keywords.some(keyword => lowerMessage.includes(keyword))) {
      detectedProducts.push({
        product,
        category: config.category,
        urgency: detectUrgency(lowerMessage)
      });
    }
  });
  
  return detectedProducts;
}

export function detectUrgency(message: string): 'alta' | 'media' | 'baixa' {
  const lowerMessage = message.toLowerCase();
  
  const highUrgencyWords = ['urgente', 'hoje', 'agora', 'acabou', 'acabando', 'preciso', 'necessito'];
  const mediumUrgencyWords = ['semana', 'próxima', 'proxima', 'precisando', 'comprando'];
  
  if (highUrgencyWords.some(word => lowerMessage.includes(word))) {
    return 'alta';
  }
  
  if (mediumUrgencyWords.some(word => lowerMessage.includes(word))) {
    return 'media';
  }
  
  return 'baixa';
}

export function extractName(message: string): string | null {
  const cleanMessage = message.trim();

  // Padrões para capturar nomes
  const patterns = [
    // "Meu nome é João Silva" ou "Meu nome é Otto"
    /(?:meu nome é|me chamo|sou o?a?|eu sou)\s+([A-Za-zÀ-ÿ\s]+?)(?:\s+e\s|\s+meu\s|\s+minha\s|$|\.|,)/i,
    // "João Silva" no início da mensagem (múltiplas palavras)
    /^([A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+)+)(?:\s+e\s|\s+meu\s|\s+minha\s|$|\.|,)/i,
    // Nome simples (uma palavra) - para casos como "otto"
    /^([A-Za-zÀ-ÿ]{2,})$/i
  ];

  for (const pattern of patterns) {
    const match = cleanMessage.match(pattern);
    if (match) {
      const potentialName = match[1].trim();

      // Verifica se parece ser um nome válido
      if (potentialName.length >= 2 && potentialName.length <= 50 &&
          /^[A-Za-zÀ-ÿ\s]+$/.test(potentialName) &&
          !/(whatsapp|telefone|email|número|celular|sim|não|ok|oi|olá)/i.test(potentialName)) {
        return potentialName.split(' ').map(word =>
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
      }
    }
  }

  return null;
}

export function extractPhone(message: string): string | null {
  // Padrões para capturar telefones brasileiros
  const phonePatterns = [
    // (61) 99999-8888 ou (61) 9999-8888
    /\((\d{2})\)\s*(\d{4,5})[-.\s]?(\d{4})/g,
    // 61 99999-8888 ou 61 9999-8888
    /(\d{2})\s+(\d{4,5})[-.\s]?(\d{4})/g,
    // 6199999888 ou 61999998888
    /(\d{11}|\d{10})/g
  ];

  for (const pattern of phonePatterns) {
    const matches = [...message.matchAll(pattern)];
    for (const match of matches) {
      let phone = '';

      if (match[0].length >= 10) {
        // Remove todos os caracteres não numéricos
        phone = match[0].replace(/\D/g, '');

        // Verifica se tem 10 ou 11 dígitos
        if (phone.length === 10 || phone.length === 11) {
          // Formatar como (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
          if (phone.length === 11) {
            return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
          } else {
            return `(${phone.slice(0, 2)}) ${phone.slice(2, 6)}-${phone.slice(6)}`;
          }
        }
      }
    }
  }

  return null;
}

export function getRandomResponse(responses: string[]): string {
  return responses[Math.floor(Math.random() * responses.length)];
}

export function shouldAskForName(context: ConversationContext, messageCount: number): boolean {
  return !context.hasCapturedName && 
         messageCount >= 3 && 
         (context.stage === 'productDiscussion' || context.stage === 'qualifying');
}

export function shouldAskForContact(context: ConversationContext): boolean {
  return context.hasCapturedName && 
         !context.hasCapturedContact && 
         context.productsMentioned.length > 0;
}