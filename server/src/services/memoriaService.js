// =============================================================================
// Theatrum — Service de Memória da Companhia
// Histórico cronológico, trajetória artística, premiações e acervo
// =============================================================================

const prisma = require('../lib/prisma');
const AppError = require('../errors/AppError');

// Trajetória artística oficial documentada no Portfólio TM 2026
const MARCOS_HISTORICOS_PADRAO = [
  {
    ano: '2012',
    titulo: 'Os Contadores',
    categoria: 'ESPETACULO',
    descricao: 'Criação voltada ao público infantojuvenil que discute o ciclo da vida e da morte por meio de fábulas universais. Acumulou mais de 20 premiações nacionais, incluindo o Prêmio Zilka Salaberry de Teatro Infantil e premiações em festivais como FENATA, FESTE de Pindamonhangaba, Festival de Chapecó e Festival de Guaçuí.',
    local: 'Teatros e festivais pelo Brasil (Circulação Nacional)',
    destaque: true,
    ordem: 1,
  },
  {
    ano: '2014–2017',
    titulo: 'Francisco, do tempo em que se nascia bufão',
    categoria: 'ESPETACULO',
    descricao: 'Investigação do universo medieval e da tradição do teatro mambembe para refletir sobre espiritualidade, humanidade e marginalidade a partir de laboratórios cênicos corporais.',
    local: 'Temporadas no Rio de Janeiro e Circuito SESC em múltiplos estados',
    destaque: false,
    ordem: 2,
  },
  {
    ano: '2017–2018',
    titulo: 'Romeu e Julieta',
    categoria: 'ESPETACULO',
    descricao: 'Adaptação popular e pulsante da tragédia de William Shakespeare combinando teatro físico, música ao vivo e teatro de bonecos.',
    local: 'Centro de Artes da UFF, Circuitos SESC/RJ e SESI/SP',
    destaque: false,
    ordem: 3,
  },
  {
    ano: '2021–2024',
    titulo: 'YARA',
    categoria: 'ESPETACULO',
    descricao: 'Revisita o mito da Mãe D’Água a partir de uma perspectiva indígena e contemporânea, refletindo sobre o apagamento cultural e a relação entre humanidade e natureza. Contemplado por editais públicos, com mini-documentário sobre o processo criativo.',
    local: 'Temporadas no Rio de Janeiro e audiovisual',
    destaque: true,
    ordem: 4,
  },
  {
    ano: '2024–2026',
    titulo: 'Da Janela, o Mar',
    categoria: 'ESPETACULO',
    descricao: 'Dramaturgia poética de Angelo Faria Turci abordando sensibilidade, imaginação e neurodiversidade por meio de teatro de animação e atuação física. Contemplado pelo Edital Fluxos Fluminenses da SECEC/RJ.',
    local: 'Centro de Artes da UFF, Casa de Cultura Laura Alvim, Circulação 2026',
    destaque: true,
    ordem: 5,
  },
  {
    ano: 'Trajetória',
    titulo: 'Ações Formativas e Pesquisa Cênica',
    categoria: 'FORMACAO',
    descricao: 'Oficinas "Por uma Teatralidade Física" e a série de debates "Encontros com o Theatrum", articulando treinamento do ator, dramaturgia do corpo, Rasaboxes e princípios do Natyasastra.',
    local: 'Centro de Artes Calouste Gulbenkian, Escola Paulo Freire e centros culturais',
    destaque: false,
    ordem: 6,
  },
  {
    ano: 'Reconhecimento',
    titulo: 'Premiações Nacionais e Editais',
    categoria: 'PREMIO',
    descricao: 'Prêmio Zilka Salaberry de Teatro Infantil, Prêmios CBTIJ, Prêmio CENYM Brasil, além de fomento via Lei Aldir Blanc, Lei Paulo Gustavo e PNAB.',
    local: 'Nacional',
    destaque: true,
    ordem: 7,
  },
];

class MemoriaService {
  /**
   * Lista itens da memória cronológica
   */
  static async listar() {
    let itens = await prisma.memoriaItem.findMany({
      orderBy: [{ ordem: 'asc' }, { ano: 'asc' }],
    });

    // Se ainda não houver itens cadastrados no banco, inicializa com o portfólio oficial
    if (itens.length === 0) {
      for (const item of MARCOS_HISTORICOS_PADRAO) {
        await prisma.memoriaItem.create({ data: item });
      }
      itens = await prisma.memoriaItem.findMany({
        orderBy: [{ ordem: 'asc' }, { ano: 'asc' }],
      });
    }

    return {
      companhia: {
        nome: 'Theatrum Mundi',
        diretor: 'Angelo Faria Turci',
        fundacao: '2012',
        cidade: 'Maricá / Rio de Janeiro, RJ',
        curriculoPdfUrl: '/downloads/PORTFOLIO_CURRICULO_THEATRUM_2026.pdf',
        contato: {
          email: 'ciatheatrum@gmail.com',
          telefone: '+55 21 97309-2514',
          endereco: 'Silvana da Costa, 437, Itaipuaçú - Maricá/RJ, CEP 24936-600',
          instagram: '@theatrum.m',
        },
      },
      itens,
    };
  }

  static async criar(dados) {
    if (!dados.titulo || !dados.ano || !dados.descricao) {
      throw AppError.badRequest('Ano, título e descrição são obrigatórios');
    }

    const item = await prisma.memoriaItem.create({
      data: {
        ano: dados.ano.trim(),
        titulo: dados.titulo.trim(),
        categoria: dados.categoria || 'ESPETACULO',
        descricao: dados.descricao.trim(),
        local: dados.local ? dados.local.trim() : null,
        imagemUrl: dados.imagemUrl ? dados.imagemUrl.trim() : null,
        destaque: Boolean(dados.destaque),
        ordem: dados.ordem ? parseInt(dados.ordem, 10) : 0,
      },
    });

    return item;
  }

  static async atualizar(id, dados) {
    const item = await prisma.memoriaItem.findUnique({ where: { id } });
    if (!item) {
      throw AppError.notFound(`Item de memória ${id} não encontrado`);
    }

    const itemAtualizado = await prisma.memoriaItem.update({
      where: { id },
      data: dados,
    });

    return itemAtualizado;
  }

  static async deletar(id) {
    const item = await prisma.memoriaItem.findUnique({ where: { id } });
    if (!item) {
      throw AppError.notFound(`Item de memória ${id} não encontrado`);
    }

    await prisma.memoriaItem.delete({ where: { id } });
    return { mensagem: 'Item de memória removido com sucesso' };
  }
}

module.exports = MemoriaService;

