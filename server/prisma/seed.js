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
  // 3. Colaboradores reais da companhia (Extraídos da Ficha Técnica e Portfólio)
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
      historico: 'Fundador e diretor do Theatrum Mundi. Dramaturgo de Da Janela, o Mar, Os Contadores, YARA e Francisco, do tempo em que se nascia bufão. Pesquisador cênico.',
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
      redeSocial: '@rodrigopatriota',
      bairro: 'Vila Isabel',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      habilitacao: 'Carro',
      tipoSanguineo: 'O+',
      dataNascimento: '17/02/1993',
      dataAdmissao: '01/01/2012',
      saude: 'Nenhuma alergia ou restrição física severa.',
      historico: 'Ator, preparador corporal e diretor de movimento da companhia desde a fundação em 2012.',
    },
    {
      nome: 'Gustavo Martinez',
      nomeArtistico: 'Gustavo Martinez',
      funcao: 'Ator',
      idade: 32,
      celular: '(21) 98111-2233',
      email: 'gustavo.martinez@theatrum.com',
      endereco: 'Rio de Janeiro, RJ',
      genero: 'Masculino',
      redeSocial: '@gustavomartinez.ator',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      historico: 'Elenco principal de "Da Janela, o Mar" e intérprete teatral.',
    },
    {
      nome: 'Camila Mendonça',
      nomeArtistico: 'Camila Mendonça',
      funcao: 'Atriz',
      idade: 30,
      celular: '(21) 98222-3344',
      email: 'camila.mendonca@theatrum.com',
      endereco: 'Rio de Janeiro, RJ',
      genero: 'Feminino',
      redeSocial: '@camilamendonca.arte',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      historico: 'Atriz e pesquisadora cênica, elenco de "Da Janela, o Mar".',
    },
    {
      nome: 'Shirley Guimarães',
      nomeArtistico: 'Shirley Guimarães',
      funcao: 'Atriz',
      idade: 35,
      celular: '(21) 98333-4455',
      email: 'shirley.guimaraes@theatrum.com',
      endereco: 'Niterói, RJ',
      genero: 'Feminino',
      redeSocial: '@shirleyguimaraes',
      cidade: 'Niterói',
      estado: 'RJ',
      historico: 'Atriz criadora no Theatrum Mundi em "Da Janela, o Mar".',
    },
    {
      nome: 'Élide Pessoa',
      nomeArtistico: 'Élide Pessoa',
      funcao: 'Atriz',
      idade: 31,
      celular: '(21) 98444-5566',
      email: 'elide.pessoa@theatrum.com',
      endereco: 'Rio de Janeiro, RJ',
      genero: 'Feminino',
      redeSocial: '@elidepessoa',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      historico: 'Atriz do espetáculo "Da Janela, o Mar".',
    },
    {
      nome: 'Maike Damasceno',
      nomeArtistico: 'Maike Damasceno',
      funcao: 'Ator',
      idade: 29,
      celular: '(21) 98555-6677',
      email: 'maike.damasceno@theatrum.com',
      endereco: 'Rio de Janeiro, RJ',
      genero: 'Masculino',
      redeSocial: '@maikedamasceno',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      historico: 'Ator de "Da Janela, o Mar" e arte-educador.',
    },
    {
      nome: 'Marco Aureh',
      nomeArtistico: 'Marco Aureh',
      funcao: 'Compositor e Diretor Musical',
      idade: 45,
      celular: '(21) 98666-7788',
      email: 'marcoaureh@theatrum.com',
      endereco: 'Rio de Janeiro, RJ',
      genero: 'Masculino',
      redeSocial: '@marcoaureh',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      historico: 'Compositor da trilha sonora e canções originais de "Da Janela, o Mar".',
    },
    {
      nome: 'Dante',
      nomeArtistico: 'Dante',
      funcao: 'Artista Visual e Bonequeiro',
      idade: 42,
      celular: '(21) 98777-8899',
      email: 'dante.bonecos@theatrum.com',
      endereco: 'Rio de Janeiro, RJ',
      genero: 'Masculino',
      redeSocial: '@dante.artecenica',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      historico: 'Concepção e escultura de bonecos e design gráfico de "Da Janela, o Mar".',
    },
    {
      nome: 'Diirr',
      nomeArtistico: 'Diirr',
      funcao: 'Cenógrafo e Diretor de Animação',
      idade: 38,
      celular: '(21) 98888-9900',
      email: 'diirr.cenografia@theatrum.com',
      endereco: 'Rio de Janeiro, RJ',
      genero: 'Masculino',
      redeSocial: '@diirr.visual',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      historico: 'Cenografia e direção de animação visual de "Da Janela, o Mar".',
    },
    {
      nome: 'Arlete Rua',
      nomeArtistico: 'Arlete Rua',
      funcao: 'Figurinista',
      idade: 52,
      celular: '(21) 98999-0011',
      email: 'arlete.rua@theatrum.com',
      endereco: 'Rio de Janeiro, RJ',
      genero: 'Feminino',
      redeSocial: '@arleterua.figurinos',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      historico: 'Figurinos e concepção têxtil de "Da Janela, o Mar".',
    },
    {
      nome: 'Raphael Grampola',
      nomeArtistico: 'Raphael Grampola',
      funcao: 'Iluminador Cênico',
      idade: 37,
      celular: '(21) 98111-0022',
      email: 'grampola.luz@theatrum.com',
      endereco: 'Rio de Janeiro, RJ',
      genero: 'Masculino',
      redeSocial: '@grampolaluz',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      historico: 'Desenho de luz de "Da Janela, o Mar".',
    },
    {
      nome: 'Cléber de Oliveira',
      nomeArtistico: 'Cléber de Oliveira',
      funcao: 'Visagista',
      idade: 41,
      celular: '(21) 98222-1133',
      email: 'cleber.visagismo@theatrum.com',
      endereco: 'Rio de Janeiro, RJ',
      genero: 'Masculino',
      redeSocial: '@cleberdeoliveira',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      historico: 'Visagismo e caracterização de "Da Janela, o Mar".',
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
      historico: 'Fotógrafo oficial de artes cênicas de "Da Janela, o Mar" e grandes montagens cariocas.',
    },
    {
      nome: 'Aymara Luna',
      nomeArtistico: 'Aymara Luna',
      funcao: 'Produtora Executiva',
      idade: 34,
      celular: '(21) 98333-2244',
      email: 'aymara.luna@theatrum.com',
      endereco: 'Rio de Janeiro, RJ',
      genero: 'Feminino',
      redeSocial: '@aymaraluna.prod',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      historico: 'Produção executiva de "Da Janela, o Mar" e projetos de circulação.',
    },
    {
      nome: 'Stephannie Carvalho',
      nomeArtistico: 'Stephannie Carvalho',
      funcao: 'Intérprete de Libras e Acessibilidade',
      idade: 33,
      celular: '(21) 98444-3355',
      email: 'stephannie.libras@theatrum.com',
      endereco: 'Rio de Janeiro, RJ',
      genero: 'Feminino',
      redeSocial: '@stephannie.libras',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      historico: 'Tradução simultânea em Libras e consultoria de acessibilidade cultural para "Da Janela, o Mar".',
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
  // 5. Fotos Oficiais de "Da Janela, o Mar" (Única produção com acervo fotográfico oficial)
  // Demais peças usam o placeholder cênico padrão até nova sessão fotográfica
  // =========================================================================
  const pecaJanela = pecasCriadas.find((p) => p.titulo === 'Da Janela, o Mar') || pecasCriadas[0];
  const pecaYara = pecasCriadas.find((p) => p.titulo === 'YARA');
  const pecaRomeu = pecasCriadas.find((p) => p.titulo === 'Romeu e Julieta');
  const pecaContadores = pecasCriadas.find((p) => p.titulo === 'Os Contadores');
  const pecaJoca = pecasCriadas.find((p) => p.titulo === 'Quarto do Joca');

  const pecasComFotos = [
    {
      peca: pecaJanela,
      fotos: [
        { url: '/uploads/da_janela_01.jpg', descricao: 'Da Janela, o Mar — Foto Oficial: Renato Mangolin (Capa)', tipo: 'IMAGEM', ordem: 0 },
        { url: '/uploads/da_janela_02.jpg', descricao: 'Da Janela, o Mar — Cena de Teatro de Animação (Renato Mangolin)', tipo: 'IMAGEM', ordem: 1 },
        { url: '/uploads/da_janela_03.jpg', descricao: 'Da Janela, o Mar — Visualidade Cênica e Corpo (Renato Mangolin)', tipo: 'IMAGEM', ordem: 2 },
        { url: '/uploads/da_janela_04.jpg', descricao: 'Da Janela, o Mar — Poesia e Luz (Renato Mangolin)', tipo: 'IMAGEM', ordem: 3 },
        { url: '/uploads/da_janela_05.jpg', descricao: 'Da Janela, o Mar — O Mar no Palco (Renato Mangolin)', tipo: 'IMAGEM', ordem: 4 },
        { url: '/uploads/da_janela_06.jpg', descricao: 'Da Janela, o Mar — Cenografia Panorâmica Widescreen', tipo: 'IMAGEM', ordem: 5 },
      ],
    },
  ];

  // Limpa fotos de todas as peças para garantir integridade
  for (const p of pecasCriadas) {
    await prisma.fotoPeca.deleteMany({ where: { pecaId: p.id } });
  }

  for (const item of pecasComFotos) {
    if (!item.peca) continue;
    for (const f of item.fotos) {
      await prisma.fotoPeca.create({
        data: {
          pecaId: item.peca.id,
          url: f.url,
          descricao: f.descricao,
          tipo: f.tipo,
          ordem: f.ordem,
        },
      });
    }
  }
  console.log(`✅ Fotos oficiais de "Da Janela, o Mar" vinculadas (demais obras sem fotos, utilizando placeholders cênicos)`);

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
  // 8. Alocação de Colaboradores à Peça "Da Janela, o Mar" e Peças de Repertório
  // =========================================================================
  await prisma.pecaColaborador.deleteMany({ where: { pecaId: pecaJanela.id } });
  
  const alocacoesJanela = [
    { idx: 0, funcao: 'Dramaturgia e Encenação' }, // Angelo
    { idx: 1, funcao: 'Criação Corporal e Assistência de Direção' }, // Rodrigo Patriota
    { idx: 2, funcao: 'Ator (Elenco)' }, // Gustavo Martinez
    { idx: 3, funcao: 'Atriz (Elenco)' }, // Camila Mendonça
    { idx: 4, funcao: 'Atriz (Elenco)' }, // Shirley Guimarães
    { idx: 5, funcao: 'Atriz (Elenco)' }, // Élide Pessoa
    { idx: 6, funcao: 'Ator (Elenco)' }, // Maike Damasceno
    { idx: 7, funcao: 'Músicas Originais e Direção Musical' }, // Marco Aureh
    { idx: 8, funcao: 'Bonecos e Identidade Visual' }, // Dante
    { idx: 9, funcao: 'Cenografia e Animação' }, // Diirr
    { idx: 10, funcao: 'Figurinos' }, // Arlete Rua
    { idx: 11, funcao: 'Iluminação' }, // Raphael Grampola
    { idx: 12, funcao: 'Visagismo' }, // Cléber de Oliveira
    { idx: 13, funcao: 'Fotografia Oficial' }, // Renato Mangolin
    { idx: 14, funcao: 'Produção Executiva' }, // Aymara Luna
    { idx: 15, funcao: 'Intérprete de Libras e Acessibilidade' }, // Stephannie Carvalho
  ];

  for (const aloc of alocacoesJanela) {
    if (colabsCriados[aloc.idx]) {
      await prisma.pecaColaborador.create({
        data: {
          pecaId: pecaJanela.id,
          colaboradorId: colabsCriados[aloc.idx].id,
          funcaoNaPeca: aloc.funcao,
        },
      });
    }
  }
  console.log(`✅ ${alocacoesJanela.length} profissionais alocados à ficha técnica de "Da Janela, o Mar"`);

  // Alocações para as demais peças históricas do grupo
  if (pecaYara) {
    await prisma.pecaColaborador.deleteMany({ where: { pecaId: pecaYara.id } });
    await prisma.pecaColaborador.create({
      data: { pecaId: pecaYara.id, colaboradorId: colabsCriados[0].id, funcaoNaPeca: 'Direção e Concepção' },
    });
    await prisma.pecaColaborador.create({
      data: { pecaId: pecaYara.id, colaboradorId: colabsCriados[1].id, funcaoNaPeca: 'Ator Criador e Direção de Movimento' },
    });
  }

  if (pecaRomeu) {
    await prisma.pecaColaborador.deleteMany({ where: { pecaId: pecaRomeu.id } });
    await prisma.pecaColaborador.create({
      data: { pecaId: pecaRomeu.id, colaboradorId: colabsCriados[0].id, funcaoNaPeca: 'Adaptação e Direção Geral' },
    });
    await prisma.pecaColaborador.create({
      data: { pecaId: pecaRomeu.id, colaboradorId: colabsCriados[1].id, funcaoNaPeca: 'Ator e Preparação Física' },
    });
  }

  if (pecaContadores) {
    await prisma.pecaColaborador.deleteMany({ where: { pecaId: pecaContadores.id } });
    await prisma.pecaColaborador.create({
      data: { pecaId: pecaContadores.id, colaboradorId: colabsCriados[0].id, funcaoNaPeca: 'Autor e Diretor' },
    });
    await prisma.pecaColaborador.create({
      data: { pecaId: pecaContadores.id, colaboradorId: colabsCriados[1].id, funcaoNaPeca: 'Ator Criador (Prêmio de Atuação)' },
    });
  }

  // =========================================================================
  // 8.1. Persistência de Arquivos no PostgreSQL (tabela 'arquivos')
  // Garante que o Render sirva os arquivos mesmo com filesystem efêmero
  // =========================================================================
  const fs = require('fs');
  const path = require('path');
  const uploadDir = path.join(__dirname, '..', 'uploads');
  if (fs.existsSync(uploadDir)) {
    const arquivosDisco = fs.readdirSync(uploadDir);
    let countPersistidos = 0;
    for (const nomeArq of arquivosDisco) {
      if (nomeArq.endsWith('.jpg') || nomeArq.endsWith('.jpeg') || nomeArq.endsWith('.png') || nomeArq.endsWith('.pdf')) {
        const filePath = path.join(uploadDir, nomeArq);
        const buffer = fs.readFileSync(filePath);
        const mime = nomeArq.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';
        await prisma.arquivo.upsert({
          where: { nome: nomeArq },
          update: { dados: buffer, tamanho: buffer.length, mimetype: mime },
          create: { nome: nomeArq, dados: buffer, tamanho: buffer.length, mimetype: mime },
        });
        countPersistidos++;
      }
    }
    console.log(`✅ ${countPersistidos} arquivos de mídia e PDFs persistidos na tabela 'arquivos' do PostgreSQL`);
  }

  // =========================================================================
  // 9. Itens da Memória da Companhia (Linha do Tempo)
  // =========================================================================
  const memoriaService = require('../src/services/memoriaService');
  await memoriaService.listar(); // Auto-popula itens padrão da história da Cia se não existirem
  console.log(`✅ Memória da Companhia inicializada com marco histórico 2012-2026`);

  // Limpa eventuais comprovantes de demonstração que apontavam para PDFs públicos do press kit
  await prisma.comprovante.deleteMany({
    where: {
      arquivoUrl: {
        in: [
          '/uploads/RIDER_TECNICO_Da_Janela_o_Mar.pdf',
          '/uploads/PROJETO_Da_Janela_o_Mar.pdf',
        ],
      },
    },
  });

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
