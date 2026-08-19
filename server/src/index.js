// =============================================================================
// Theatrum — Entry Point do Servidor
// Apenas inicializa o servidor. Configuração do app está em app.js
// =============================================================================

const app = require('./app');

const PORTA = process.env.PORT || 3001;

// =============================================================================
// Inicialização
// =============================================================================
app.listen(PORTA, () => {
  console.log(`\n🎭 Theatrum API rodando em http://localhost:${PORTA}`);
  console.log(`   Documentação: http://localhost:${PORTA}/api/saude\n`);
});
