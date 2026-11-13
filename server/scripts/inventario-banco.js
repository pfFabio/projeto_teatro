// =============================================================================
// Theatrum — Script de Inventário e Validação de Integridade do Banco de Dados
// Usado na pré e pós-migração (Render -> Supabase) para conferência de registros
// Execução: node scripts/inventario-banco.js
// =============================================================================

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}
const prisma = require('../src/lib/prisma');

async function realizarInventario() {
  console.log('\n=============================================================');
  console.log('📊 INVENTÁRIO DO BANCO DE DADOS THEATRUM MUNDI');
  console.log('=============================================================');
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  
  // Mascara a URL para não vazar credenciais nos logs
  const dbUrl = process.env.DATABASE_URL || '';
  const dbMascarada = dbUrl ? dbUrl.replace(/:([^@]+)@/, ':****@') : '(não definida)';
  console.log(`🔗 DATABASE_URL: ${dbMascarada}\n`);

  try {
    // 1. Contagens de todas as entidades
    const [
      usuarios,
      colaboradores,
      pecas,
      fotosPecas,
      locaisPecas,
      downloadsTecnicos,
      pecaColaboradores,
      propagandas,
      fotosPropagandas,
      mensagensIdeias,
      configSite,
      memoria,
      comprovantes,
      arquivos,
    ] = await Promise.all([
      prisma.usuario.count(),
      prisma.colaborador.count(),
      prisma.peca.count(),
      prisma.fotoPeca.count(),
      prisma.localPeca.count(),
      prisma.downloadTecnico.count(),
      prisma.pecaColaborador.count(),
      prisma.propaganda.count(),
      prisma.fotoPropaganda.count(),
      prisma.mensagemIdeia.count(),
      prisma.configSite.count(),
      prisma.memoriaItem.count(),
      prisma.comprovante.count(),
      prisma.arquivo.count(),
    ]);

    // 2. Métricas dos arquivos binários (tabela de persistência contra perda em disco)
    const arquivosAgregados = await prisma.arquivo.aggregate({
      _sum: { tamanho: true },
      _max: { id: true },
    });
    const bytesTotais = arquivosAgregados._sum.tamanho || 0;
    const megabytesTotais = (bytesTotais / (1024 * 1024)).toFixed(2);

    // 3. Métricas contábeis dos comprovantes
    const comprovantesAgregados = await prisma.comprovante.aggregate({
      _sum: { valor: true },
      _max: { id: true },
    });
    const totalComprovantesIA = await prisma.comprovante.count({
      where: { extraidoPorIA: true },
    });

    // 4. IDs máximos para validação de sequências
    const [maxPeca, maxColab, maxUsuario] = await Promise.all([
      prisma.peca.aggregate({ _max: { id: true } }),
      prisma.colaborador.aggregate({ _max: { id: true } }),
      prisma.usuario.aggregate({ _max: { id: true } }),
    ]);

    const dados = [
      { Tabela: 'usuarios', Registros: usuarios, 'Max ID': maxUsuario._max.id ?? '-' },
      { Tabela: 'colaboradores', Registros: colaboradores, 'Max ID': maxColab._max.id ?? '-' },
      { Tabela: 'pecas', Registros: pecas, 'Max ID': maxPeca._max.id ?? '-' },
      { Tabela: 'fotos_pecas', Registros: fotosPecas, 'Max ID': '-' },
      { Tabela: 'locais_pecas', Registros: locaisPecas, 'Max ID': '-' },
      { Tabela: 'downloads_tecnicos', Registros: downloadsTecnicos, 'Max ID': '-' },
      { Tabela: 'peca_colaboradores', Registros: pecaColaboradores, 'Max ID': '-' },
      { Tabela: 'propagandas', Registros: propagandas, 'Max ID': '-' },
      { Tabela: 'fotos_propagandas', Registros: fotosPropagandas, 'Max ID': '-' },
      { Tabela: 'mensagens_ideias', Registros: mensagensIdeias, 'Max ID': '-' },
      { Tabela: 'config_site', Registros: configSite, 'Max ID': '-' },
      { Tabela: 'memoria', Registros: memoria, 'Max ID': '-' },
      { Tabela: 'comprovantes', Registros: comprovantes, 'Max ID': comprovantesAgregados._max.id ?? '-' },
      { Tabela: 'arquivos (binários)', Registros: arquivos, 'Max ID': arquivosAgregados._max.id ?? '-' },
    ];

    console.table(dados);

    console.log('\n--- 📂 Detalhamento de Arquivos Binários (bytea) ---');
    console.log(`📦 Total de arquivos salvaguardados: ${arquivos}`);
    console.log(`💾 Volume total ocupado: ${megabytesTotais} MB (${bytesTotais} bytes)`);

    console.log('\n--- 🧾 Detalhamento de Comprovantes & IA ---');
    console.log(`💰 Valor total registrado: R$ ${(comprovantesAgregados._sum.valor || 0).toFixed(2)}`);
    console.log(`🤖 Comprovantes extraídos via IA: ${totalComprovantesIA} de ${comprovantes}`);

    console.log('\n✅ Inventário concluído com sucesso!');
  } catch (erro) {
    console.error('❌ Falha ao executar inventário:', erro);
  } finally {
    await prisma.$disconnect();
  }
}

realizarInventario();
