// =============================================================================
// Peças Oficiais — Theatrum Mundi
// Dados canônicos do repertório oficial da companhia para renderização e fallback resiliente
// =============================================================================

export const PECAS_OFICIAIS = [
  {
    id: 1,
    titulo: 'Da Janela, o Mar',
    resumo:
      'Obra poética e sensível voltada ao público infantojuvenil que investiga sensibilidade, imaginação e neurodiversidade por meio de uma dramaturgia que articula teatro de animação, visualidade contemporânea e atuação física. Contemplado pelo Edital Fluxos Fluminenses da SECEC/RJ.',
    status: 'EM_CARTAZ',
    dataEstreia: '2026-09-01',
    endereco: 'Centro de Artes da UFF — Rua Miguel de Frias, 9 — Icaraí, Niterói, RJ',
    latitude: -22.9056,
    longitude: -43.1189,
    linkIngresso: 'https://sympla.com.br/theatrum-mundi-da-janela-o-mar',
    fotos: [
      { id: 1, url: '/uploads/da_janela_01.jpg', descricao: 'Da Janela, o Mar — Foto: Renato Mangolin (Capa Oficial)', ordem: 0 },
      { id: 2, url: '/uploads/da_janela_02.jpg', descricao: 'Da Janela, o Mar — Cena de Teatro de Animação (Renato Mangolin)', ordem: 1 },
      { id: 3, url: '/uploads/da_janela_03.jpg', descricao: 'Da Janela, o Mar — Visualidade Cênica e Corpo (Renato Mangolin)', ordem: 2 },
      { id: 4, url: '/uploads/da_janela_04.jpg', descricao: 'Da Janela, o Mar — Poesia e Luz (Renato Mangolin)', ordem: 3 },
      { id: 5, url: '/uploads/da_janela_05.jpg', descricao: 'Da Janela, o Mar — O Mar no Palco (Renato Mangolin)', ordem: 4 },
      { id: 6, url: '/uploads/da_janela_06.jpg', descricao: 'Da Janela, o Mar — Cenografia Panorâmica Widescreen', ordem: 5 },
    ],
    _count: { colaboradores: 16 },
    colaboradores: [
      { id: 1, funcaoPeca: 'Dramaturgia e Direção', colaborador: { nome: 'Angelo Faria Turci', nomeArtistico: 'Angelo Faria Turci' } },
      { id: 2, funcaoPeca: 'Direção de Movimento e Ator', colaborador: { nome: 'Rodrigo Patriota', nomeArtistico: 'Rodrigo Patriota' } },
      { id: 3, funcaoPeca: 'Ator (Jota)', colaborador: { nome: 'Gustavo Martinez', nomeArtistico: 'Gustavo Martinez' } },
      { id: 4, funcaoPeca: 'Atriz (Mãe)', colaborador: { nome: 'Camila Mendonça', nomeArtistico: 'Camila Mendonça' } },
      { id: 5, funcaoPeca: 'Atriz', colaborador: { nome: 'Shirley Guimarães', nomeArtistico: 'Shirley Guimarães' } },
      { id: 6, funcaoPeca: 'Atriz', colaborador: { nome: 'Élide Pessoa', nomeArtistico: 'Élide Pessoa' } },
      { id: 7, funcaoPeca: 'Ator', colaborador: { nome: 'Maike Damasceno', nomeArtistico: 'Maike Damasceno' } },
      { id: 8, funcaoPeca: 'Compositor e Direção Musical', colaborador: { nome: 'Marco Aureh', nomeArtistico: 'Marco Aureh' } },
      { id: 9, funcaoPeca: 'Bonecos e Design Gráfico', colaborador: { nome: 'Dante', nomeArtistico: 'Dante' } },
      { id: 10, funcaoPeca: 'Cenografia e Animação', colaborador: { nome: 'Diirr', nomeArtistico: 'Diirr' } },
      { id: 11, funcaoPeca: 'Figurinos', colaborador: { nome: 'Arlete Rua', nomeArtistico: 'Arlete Rua' } },
      { id: 12, funcaoPeca: 'Iluminação Cênica', colaborador: { nome: 'Raphael Grampola', nomeArtistico: 'Raphael Grampola' } },
      { id: 13, funcaoPeca: 'Visagismo', colaborador: { nome: 'Cléber de Oliveira', nomeArtistico: 'Cléber de Oliveira' } },
      { id: 14, funcaoPeca: 'Fotografia Oficial', colaborador: { nome: 'Renato Mangolin', nomeArtistico: 'Renato Mangolin' } },
      { id: 15, funcaoPeca: 'Assistência de Cenografia', colaborador: { nome: 'Fábio Figueiredo', nomeArtistico: 'Fábio Figueiredo' } },
      { id: 16, funcaoPeca: 'Produção Executiva', colaborador: { nome: 'Flávia Mendonça', nomeArtistico: 'Flávia Mendonça' } },
    ],
  },
  {
    id: 2,
    titulo: 'YARA',
    resumo:
      'Espetáculo que revisita o mito da Mãe D’Água a partir de uma perspectiva indígena e contemporânea, refletindo sobre o apagamento cultural e a conexão visceral entre humanidade e natureza. Contemplado por editais públicos, com mini-documentário e potente trabalho cênico.',
    status: 'EM_REPERTORIO',
    dataEstreia: '2024-04-12',
    endereco: 'Teatro Gláucio Gill — Praça Cardeal Arcoverde, s/n — Copacabana, Rio de Janeiro, RJ',
    latitude: -22.9667,
    longitude: -43.1788,
    linkIngresso: null,
    fotos: [
      { id: 7, url: '/uploads/obra_yara_01.jpg', descricao: 'YARA — Mito da Mãe D’Água e Ancestralidade (Theatrum Mundi)', ordem: 0 },
    ],
    _count: { colaboradores: 8 },
  },
  {
    id: 3,
    titulo: 'Romeu e Julieta',
    resumo:
      'Adaptação popular e vibrante da tragédia de William Shakespeare combinando teatro físico, música ao vivo e teatro de bonecos. Montagem com circulação no Centro de Artes da UFF e pelos circuitos culturais SESC/RJ e SESI/SP.',
    status: 'EM_REPERTORIO',
    dataEstreia: '2017-08-10',
    endereco: 'Teatro Ipanema — Rua Prudente de Morais, 824 — Ipanema, Rio de Janeiro, RJ',
    latitude: -22.9846,
    longitude: -43.2039,
    linkIngresso: null,
    fotos: [
      { id: 8, url: '/uploads/obra_romeu_01.jpg', descricao: 'Romeu e Julieta — Tragédia Popular e Teatro Físico (Theatrum Mundi)', ordem: 0 },
    ],
    _count: { colaboradores: 10 },
  },
  {
    id: 4,
    titulo: 'Os Contadores',
    resumo:
      'Espetáculo marco na história do Theatrum Mundi. Criação voltada ao público infantojuvenil sobre o ciclo da vida e da morte por meio de fábulas universais. Acumulou mais de 20 premiações nacionais, incluindo o Prêmio Zilka Salaberry de Teatro Infantil e FENATA.',
    status: 'ENCERRADA',
    dataEstreia: '2012-05-15',
    endereco: 'Teatro Municipal de Niterói — Rua Quinze de Novembro, 35 — Centro, Niterói, RJ',
    latitude: -22.8953,
    longitude: -43.1235,
    linkIngresso: null,
    fotos: [
      { id: 9, url: '/uploads/obra_contadores_01.jpg', descricao: 'Os Contadores — Mais de 20 Premiações Nacionais (Theatrum Mundi)', ordem: 0 },
    ],
    _count: { colaboradores: 9 },
  },
  {
    id: 5,
    titulo: 'Quarto do Joca',
    resumo:
      'Próxima criação autoral da Theatrum Mundi. Uma imersão lúdica e sensorial no universo das descobertas, medos e fascínios da infância, combinando dramaturgia de objetos, luz expressiva e interação performática.',
    status: 'PROJETO_FUTURO',
    dataEstreia: '2027-03-20',
    endereco: 'Espaço Theatrum — Itaipuaçú, Maricá, RJ',
    latitude: -22.9288,
    longitude: -42.8193,
    linkIngresso: null,
    fotos: [
      { id: 10, url: '/uploads/obra_quarto_joca_01.jpg', descricao: 'Quarto do Joca — Universo Lúdico de Objetos e Descobertas', ordem: 0 },
    ],
    _count: { colaboradores: 6 },
  },
];

