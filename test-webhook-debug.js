async function testWebhook() {
  console.log('🔍 Testando webhook N8N...\n');
  
  const webhookUrl = 'https://assismax.app.n8n.cloud/webhook/assismax';
  
  const testData = {
    empresa_id: '231f795a-b14c-438b-a896-2f2e479cfa02',
    nome: 'João Teste Debug',
    telefone: '(61) 99999-9999',
    email: 'joao.teste@email.com',
    origem: 'chatbot-debug',
    data: new Date().toISOString(),
    status: 'novo'
  };

  console.log('📤 Enviando dados:', JSON.stringify(testData, null, 2));
  console.log('🎯 URL:', webhookUrl);
  console.log('');

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('📊 Status da resposta:', response.status);
    console.log('📊 Status text:', response.statusText);
    
    const responseText = await response.text();
    console.log('📋 Resposta do servidor:', responseText);
    
    if (response.ok) {
      console.log('\n✅ Webhook funcionando! Dados enviados com sucesso.');
    } else {
      console.log('\n❌ Erro no webhook. Verifique a configuração.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao conectar com o webhook:', error.message);
  }
}

testWebhook();