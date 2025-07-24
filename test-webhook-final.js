// Script para testar o webhook N8N com a URL correta
const webhookUrl = 'https://assismax.app.n8n.cloud/webhook/assismax';

const testData = {
  nome: 'João Teste Final',
  telefone: '(61) 99999-9999',
  email: 'joao.teste@email.com',
  origem: 'chatbot',
  data: new Date().toISOString(),
  status: 'novo'
};

console.log('🚀 Testando webhook N8N com URL correta...');
console.log('URL:', webhookUrl);
console.log('Dados:', JSON.stringify(testData, null, 2));

fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(response => {
  console.log('📊 Status da resposta:', response.status);
  console.log('📊 Status text:', response.statusText);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.text();
})
.then(data => {
  console.log('✅ SUCESSO! Webhook funcionando!');
  console.log('📋 Resposta do N8N:', data);
  console.log('🎉 Os leads agora devem chegar corretamente!');
})
.catch(error => {
  console.error('❌ Erro ao enviar para webhook:', error);
  console.error('❌ Detalhes do erro:', error.message);
});