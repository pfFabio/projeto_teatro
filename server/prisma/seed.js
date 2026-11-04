// =============================================================================
// Seed — Dados reais e oficiais do Theatrum Mundi (Reunião #02)
// Executa com: node prisma/seed.js
// =============================================================================

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🎭 Iniciando seed oficial do Theatrum Mundi...\n');

  // =========================================================================
  // 1. Criar admin padrão da companhia
  // =========================================================================
  const senhaHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@theatrum.com' },
    update: { senha: senhaHash },
    create: {
      email: 'admin@theatrum.com',
      senha: senhaHash,
      nome: 'Administrador Theatrum',
      papel: 'ADMIN',
    },
  });
  console.log(`✅ Admin pronto: ${admin.email} (login: admin ou admin@theatrum.com / senha: admin123)`);

  // =========================================================================
  // 2. Configurações oficiais do site (Theatrum Mundi)
  // =========================================================================
  const configs = [
    { chave: 'titulo_site', valor: 'Theatrum Mundi', tipo: 'TEXT' },
    { chave: 'subtitulo_site', valor: 'Pesquisa cênica, tradição e contemporaneidade nas artes da cena', tipo: 'TEXT' },
    { chave: 'propaganda_titulo', valor: 'Da Janela, o Mar — Em Temporada', tipo: 'TEXT' },
    { chave: 'propaganda_texto', valor: 'Espetáculo infantojuvenil contemplado pelo Edital Fluxos Fluminenses da SECEC/RJ. Teatro de animação, visualidade e sensibilidade poética. Garanta seus ingressos!', tipo: 'TEXT' },
    { chave: 'propaganda_botao_texto', valor: 'Ver Espetáculo', tipo: 'TEXT' },
    { chave: 'propaganda_botao_link', valor: '/obras', tipo: 'TEXT' },
    { chave: 'rodape_texto', valor: '© 2026 Theatrum Mundi — Silvana da Costa, 437, Itaipuaçú - Maricá/RJ', tipo: 'TEXT' },
    { chave: 'contato_email', valor: 'ciatheatrum@gmail.com', tipo: 'TEXT' },
    { chave: 'contato_telefone', valor: '+55 21 97309-2514', tipo: 'TEXT' },
    { chave: 'instagram_oficial', valor: '@theatrum.m', tipo: 'TEXT' },
  ];

  for (const config of configs) {
    await prisma.configSite.upsert({
      where: { chave: config.chave },
      update: { valor: config.valor },
      create: config,
    });
  }
  console.log(`✅ ${configs.length} configurações oficiais criadas/atualizadas`);

  // =========================================================================
  // 3. Colaboradores reais da companhia
  // =========================================================================
  const colaboradores = [
    {
      nome: 'Angelo Faria Turci',
      nomeArtistico: 'Angelo Faria Turci',
      funcao: 'Diretor e Dramaturgo',
      idade: 48,
      celular: '(21) 97309-2514',
      email: 'angelofariaturci@gmail.com',
      endereco: 'Rua Silvana da Costa, 437 — Itaipuaçú, Maricá, RJ',
      genero: 'Masculino',
      redeSocial: '@angelofariaturci',
      cidade: 'Maricá',
      estado: 'RJ',
      cep: '24936-600',
      historico: 'Fundador e diretor do Theatrum Mundi. Dramaturgo de Da Janela, o Mar e Os Contadores.',
    },
    {
      nome: 'Rodrigo da Silva Patriota',
      nomeArtistico: 'Rodrigo Patriota',
      funcao: 'Diretor de Movimento / Ator',
      idade: 33,
      celular: '(21) 97599-6419',
      email: 'rsp.patriota@gmail.com',
      endereco: 'Rua Teodoro da Silva, 808 casa 2 — Vila Isabel, Rio de Janeiro, RJ',
      genero: 'Cisgênero',
      orientacaoSexual: 'Não declarado',
      etniaRaca: 'Branco',
      cpf: '155.094.077-51',
      rg: '26.378.216-1',
      drtOmb: 'XXXXXXXX',
      redeSocial: '@rodrigopatriota',
      bairro: 'Vila Isabel',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      habilitacao: 'Carro',
      tipoSanguineo: 'O+',
      dataNascimento: '17/02/1993',
      dataAdmissao: '01/01/2012',
      saude: 'Nenhuma alergia ou restrição física severa.',
      historico: 'Ator e diretor de movimento da companhia desde a fundação em 2012.',
    },
    {
      nome: 'Renato Mangolin',
      nomeArtistico: 'Renato Mangolin',
      funcao: 'Fotógrafo Cênico',
      idade: 40,
      celular: '(21) 98888-7777',
      email: 'renato.mangolin@artecena.com',
      endereco: 'Laranjeiras, Rio de Janeiro, RJ',
      genero: 'Masculino',
      redeSocial: '@renatomangolin',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      historico: 'Fotógrafo oficial de artes cênicas de Da Janela, o Mar e dezenas de montagens cariocas.',
    },
  ];

  const colabsCriados = [];
  for (const colab of colaboradores) {
    const criado = await prisma.colaborador.upsert({
      where: { email: colab.email },
      update: colab,
      create: colab,
    });
    colabsCriados.push(criado);
  }
  console.log(`✅ ${colabsCriados.length} colaboradores oficiais registrados com sucesso`);

  // =========================================================================
  // 4. Peças Oficiais do Theatrum Mundi
  // =========================================================================
  const pecasOficiais = [
    {
      titulo: 'Da Janela, o Mar',
      resumo: 'Obra poética e sensível voltada ao público infantojuvenil que investiga sensibilidade, imaginação e neurodiversidade por meio de uma dramaturgia que articula teatro de animação, visualidade contemporânea e atuação física. O projeto foi contemplado pelo Edital Fluxos Fluminenses da Secretaria de Estado de Cultura e Economia Criativa do Rio de Janeiro (SECEC/RJ).',
      endereco: 'Centro de Artes da UFF — Rua Miguel de Frias, 9 — Icaraí, Niterói, RJ',
      latitude: -22.9056,
      longitude: -43.1189,
      dataEstreia: '2026-09-01',
      status: 'EM_CARTAZ',
      linkIngresso: 'https://sympla.com.br/theatrum-mundi-da-janela-o-mar',
    },
    {
      titulo: 'YARA',
      resumo: 'Espetáculo que revisita o mito da Mãe D’Água a partir de uma perspectiva indígena e contemporânea, refletindo sobre o apagamento cultural e a conexão visceral entre humanidade e natureza. Contemplado por editais públicos, com mini-documentário e potente trabalho de corpo e ancestralidade.',
      endereco: 'Teatro Gláucio Gill — Praça Cardeal Arcoverde, s/n — Copacabana, Rio de Janeiro, RJ',
      latitude: -22.9667,
      longitude: -43.1788,
      dataEstreia: '2024-04-12',
      status: 'EM_REPERTORIO',
      linkIngresso: null,
    },
    {
      titulo: 'Romeu e Julieta',
      resumo: 'Adaptação popular e vibrante da tragédia de William Shakespeare combinando teatro físico, música ao vivo e teatro de bonecos. Montagem com circulação no Centro de Artes da UFF e pelos circuitos culturais SESC/RJ e SESI/SP.',
      endereco: 'Teatro Ipanema — Rua Prudente de Morais, 824 — Ipanema, Rio de Janeiro, RJ',
      latitude: -22.9846,
      longitude: -43.2039,
      dataEstreia: '2017-08-10',
      status: 'EM_REPERTORIO',
      linkIngresso: null,
    },
    {
      titulo: 'Os Contadores',
      resumo: 'Espetáculo marco na história do Theatrum Mundi. Criação voltada ao público infantojuvenil sobre o ciclo da vida e da morte por meio de fábulas universais. Acumulou mais de 20 premiações nacionais, incluindo o Prêmio Zilka Salaberry de Teatro Infantil e FENATA.',
      endereco: 'Teatro Municipal de Niterói — Rua Quinze de Novembro, 35 — Centro, Niterói, RJ',
      latitude: -22.8953,
      longitude: -43.1235,
      dataEstreia: '2012-05-15',
      status: 'ENCERRADA',
      linkIngresso: null,
    },
    {
      titulo: 'Quarto do Joca',
      resumo: 'Próxima criação autoral da Theatrum Mundi. Uma imersão lúdica e sensorial no universo das descobertas, medos e fascínios da infância, combinando dramaturgia de objetos, luz expressiva e interação performática.',
      endereco: 'Espaço Theatrum — Itaipuaçú, Maricá, RJ',
      latitude: -22.9288,
      longitude: -42.8193,
      dataEstreia: '2027-03-20',
      status: 'PROJETO_FUTURO',
      linkIngresso: null,
    },
  ];

  const pecasCriadas = [];
  for (const pecaData of pecasOficiais) {
    let existente = await prisma.peca.findFirst({
      where: { titulo: pecaData.titulo },
    });
    if (!existente) {
      existente = await prisma.peca.create({ data: pecaData });
    } else {
      existente = await prisma.peca.update({
        where: { id: existente.id },
        data: pecaData,
      });
    }
    pecasCriadas.push(existente);
  }
  console.log(`✅ ${pecasCriadas.length} peças oficiais salvas com status e links`);

  // =========================================================================
  // 5. Fotos Oficiais de Renato Mangolin para "Da Janela, o Mar"
  // =========================================================================
  const pecaJanela = pecasCriadas[0]; // Da Janela, o Mar
  const fotosJanela = [
    { url: '/uploads/da_janela_01.jpg', descricao: 'Da Janela, o Mar — Foto: Renato Mangolin', tipo: 'IMAGEM', ordem: 0 },
    { url: '/uploads/da_janela_02.jpg', descricao: 'Da Janela, o Mar — Cena de Teatro de Animação (Renato Mangolin)', tipo: 'IMAGEM', ordem: 1 },
    { url: '/uploads/da_janela_03.jpg', descricao: 'Da Janela, o Mar — Visualidade Cênica e Corpo (Renato Mangolin)', tipo: 'IMAGEM', ordem: 2 },
    { url: '/uploads/da_janela_04.jpg', descricao: 'Da Janela, o Mar — Poesia e Luz (Renato Mangolin)', tipo: 'IMAGEM', ordem: 3 },
    { url: '/uploads/da_janela_05.jpg', descricao: 'Da Janela, o Mar — O Mar no Palco (Renato Mangolin)', tipo: 'IMAGEM', ordem: 4 },
  ];

  // Limpa fotos anteriores genéricas de Da Janela, o Mar se houver
  await prisma.fotoPeca.deleteMany({ where: { pecaId: pecaJanela.id } });
  for (const f of fotosJanela) {
    await prisma.fotoPeca.create({
      data: {
        pecaId: pecaJanela.id,
        url: f.url,
        descricao: f.descricao,
        tipo: f.tipo,
        ordem: f.ordem,
      },
    });
  }
  console.log(`✅ ${fotosJanela.length} fotos oficiais de Renato Mangolin vinculadas a "Da Janela, o Mar"`);

  // =========================================================================
  // 6. Downloads Técnicos (Press Kit) para "Da Janela, o Mar"
  // =========================================================================
  const downloadsJanela = [
    {
      titulo: 'Rider Técnico Completo',
      descricao: 'Especificações completas de iluminação, mapa de som, microfonação e dimensões de palco',
      url: '/downloads/RIDER_TECNICO_Da_Janela_o_Mar.pdf',
      tamanho: '3.4 MB',
      formato: 'PDF',
      ordem: 1,
    },
    {
      titulo: 'Projeto de Encenação e Portfólio',
      descricao: 'Conceito artístico, sinopse, histórico da obra e ficha técnica para curadores e programadores',
      url: '/downloads/PROJETO_Da_Janela_o_Mar.pdf',
      tamanho: '6.5 MB',
      formato: 'PDF',
      ordem: 2,
    },
    {
      titulo: 'Dramaturgia Original',
      descricao: 'Texto integral da dramaturgia poética por Angelo Faria Turci',
      url: '/downloads/DRAMATURGIA_Da_Janela_o_Mar.pdf',
      tamanho: '68 KB',
      formato: 'PDF',
      ordem: 3,
    },
    {
      titulo: 'Ficha Técnica & Detalhes de Produção',
      descricao: 'Elenco completo, operadores de técnica, equipe criativa e classificação indicativa',
      url: '/downloads/FICHA_TECNICA_Da_Janela_o_Mar.pdf',
      tamanho: '27 KB',
      formato: 'PDF',
      ordem: 4,
    },
  ];

  await prisma.downloadTecnico.deleteMany({ where: { pecaId: pecaJanela.id } });
  for (const d of downloadsJanela) {
    await prisma.downloadTecnico.create({
      data: {
        pecaId: pecaJanela.id,
        titulo: d.titulo,
        descricao: d.descricao,
        url: d.url,
        tamanho: d.tamanho,
        formato: d.formato,
        ordem: d.ordem,
      },
    });
  }
  console.log(`✅ ${downloadsJanela.length} materiais técnicos (press kit) cadastrados para download`);

  // =========================================================================
  // 7. Locais e Apresentações na Agenda
  // =========================================================================
  const locais = [
    {
      pecaId: pecaJanela.id,
      nomeLocal: 'Centro de Artes da UFF',
      cidade: 'Niterói, RJ',
      endereco: 'Rua Miguel de Frias, 9 — Icaraí, Niterói, RJ',
      latitude: -22.9056,
      longitude: -43.1189,
      dataEstreia: '2026-11-07',
      dataFim: '2026-11-29',
      horario: 'Sábados e Domingos às 16h',
      status: 'EM_CARTAZ',
    },
    {
      pecaId: pecaJanela.id,
      nomeLocal: 'Casa de Cultura Laura Alvim',
      cidade: 'Rio de Janeiro, RJ',
      endereco: 'Av. Vieira Souto, 176 — Ipanema, Rio de Janeiro, RJ',
      latitude: -22.9868,
      longitude: -43.2033,
      dataEstreia: '2026-12-05',
      dataFim: '2026-12-20',
      horario: 'Sábados e Domingos às 16h30',
      status: 'PROGRAMADA',
    },
  ];

  await prisma.localPeca.deleteMany({ where: { pecaId: pecaJanela.id } });
  for (const loc of locais) {
    await prisma.localPeca.create({ data: loc });
  }
  console.log(`✅ Locais de apresentação da temporada cadastrados`);

  // =========================================================================
  // 8. Alocação de Colaboradores à Peça
  // =========================================================================
  await prisma.pecaColaborador.deleteMany({ where: { pecaId: pecaJanela.id } });
  await prisma.pecaColaborador.create({
    data: {
      pecaId: pecaJanela.id,
      colaboradorId: colabsCriados[0].id, // Angelo
      funcaoNaPeca: 'Direção e Dramaturgia',
    },
  });
  await prisma.pecaColaborador.create({
    data: {
      pecaId: pecaJanela.id,
      colaboradorId: colabsCriados[1].id, // Rodrigo
      funcaoNaPeca: 'Direção de Movimento e Ator',
    },
  });
  await prisma.pecaColaborador.create({
    data: {
      pecaId: pecaJanela.id,
      colaboradorId: colabsCriados[2].id, // Renato Mangolin
      funcaoNaPeca: 'Fotografia Cênica',
    },
  });
  console.log(`✅ Equipe criativa alocada a "Da Janela, o Mar"`);

  // =========================================================================
  // 9. Itens da Memória da Companhia (Linha do Tempo)
  // =========================================================================
  const memoriaService = require('../src/services/memoriaService');
  await memoriaService.listar(); // Auto-popula itens padrão da história da Cia se não existirem
  console.log(`✅ Memória da Companhia inicializada com marco histórico 2012-2026`);

  console.log('\n🎭 Seed concluído com total sucesso!');
  console.log('   Admin: admin / admin123 ou admin@theatrum.com\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
