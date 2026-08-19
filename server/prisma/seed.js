// =============================================================================
// Seed — Dados iniciais do banco de dados
// Executa com: npx prisma db seed
// =============================================================================

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🎭 Iniciando seed do Theatrum...\n');

  // =========================================================================
  // 1. Criar admin padrão
  // =========================================================================
  const senhaHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@theatrum.com' },
    update: {},
    create: {
      email: 'admin@theatrum.com',
      senha: senhaHash,
      nome: 'Administrador',
      papel: 'ADMIN',
    },
  });
  console.log(`✅ Admin criado: ${admin.email} (senha: admin123)`);

  // =========================================================================
  // 2. Configurações iniciais do site
  // =========================================================================
  const configs = [
    { chave: 'titulo_site', valor: 'Theatrum', tipo: 'TEXT' },
    { chave: 'subtitulo_site', valor: 'Arte que transforma vidas', tipo: 'TEXT' },
    { chave: 'propaganda_titulo', valor: 'Aulas de Teatro', tipo: 'TEXT' },
    { chave: 'propaganda_texto', valor: 'Descubra o artista que existe em você! Nossas aulas de teatro são para todas as idades e níveis de experiência. Venha desenvolver sua expressão corporal, oratória e criatividade em um ambiente acolhedor e inspirador.', tipo: 'TEXT' },
    { chave: 'propaganda_botao_texto', valor: 'Saiba Mais', tipo: 'TEXT' },
    { chave: 'propaganda_botao_link', valor: '#contato', tipo: 'TEXT' },
    { chave: 'rodape_texto', valor: '© 2026 Theatrum — Todos os direitos reservados.', tipo: 'TEXT' },
    { chave: 'contato_email', valor: 'contato@theatrum.com', tipo: 'TEXT' },
    { chave: 'contato_telefone', valor: '(11) 99999-9999', tipo: 'TEXT' },
  ];

  for (const config of configs) {
    await prisma.configSite.upsert({
      where: { chave: config.chave },
      update: { valor: config.valor },
      create: config,
    });
  }
  console.log(`✅ ${configs.length} configurações do site criadas`);

  // =========================================================================
  // 3. Colaboradores de exemplo
  // =========================================================================
  const colaboradores = [
    {
      nome: 'Maria Silva',
      funcao: 'Atriz',
      idade: 28,
      celular: '(11) 91234-5678',
      email: 'maria.silva@email.com',
      endereco: 'Rua das Flores, 123 — São Paulo, SP',
      genero: 'Feminino',
    },
    {
      nome: 'João Santos',
      funcao: 'Ator',
      idade: 35,
      celular: '(11) 92345-6789',
      email: 'joao.santos@email.com',
      endereco: 'Av. Paulista, 456 — São Paulo, SP',
      genero: 'Masculino',
    },
    {
      nome: 'Ana Oliveira',
      funcao: 'Diretora',
      idade: 42,
      celular: '(11) 93456-7890',
      email: 'ana.oliveira@email.com',
      endereco: 'Rua Augusta, 789 — São Paulo, SP',
      genero: 'Feminino',
    },
    {
      nome: 'Carlos Pereira',
      funcao: 'Técnico de Iluminação',
      idade: 30,
      celular: '(11) 94567-8901',
      email: 'carlos.pereira@email.com',
      endereco: 'Rua Consolação, 321 — São Paulo, SP',
      genero: 'Masculino',
    },
    {
      nome: 'Fernanda Costa',
      funcao: 'Figurinista',
      idade: 26,
      celular: '(11) 95678-9012',
      email: 'fernanda.costa@email.com',
      endereco: 'Rua Oscar Freire, 654 — São Paulo, SP',
      genero: 'Feminino',
    },
  ];

  const colabsCriados = [];
  for (const colab of colaboradores) {
    const criado = await prisma.colaborador.upsert({
      where: { email: colab.email },
      update: {},
      create: colab,
    });
    colabsCriados.push(criado);
  }
  console.log(`✅ ${colabsCriados.length} colaboradores criados`);

  // =========================================================================
  // 4. Peças de exemplo
  // =========================================================================
  const pecas = [
    {
      titulo: 'Hamlet — O Príncipe da Dinamarca',
      resumo: 'Uma das mais célebres tragédias de Shakespeare. O príncipe Hamlet busca vingança após o assassinato de seu pai pelo próprio tio, que usurpou o trono e casou-se com sua mãe. Uma obra atemporal sobre traição, loucura e a condição humana.',
      endereco: 'Teatro Municipal — Praça Ramos de Azevedo, s/n — República, São Paulo, SP',
      latitude: -23.5453,
      longitude: -46.6385,
      dataEstreia: '2026-09-15',
      status: 'PROGRAMADA',
    },
    {
      titulo: 'Auto da Compadecida',
      resumo: 'A obra-prima de Ariano Suassuna ganha vida no palco! Acompanhe as aventuras de João Grilo e Chicó, dois nordestinos espertos que usam a criatividade para sobreviver. Uma comédia brilhante sobre a cultura brasileira, fé e justiça divina.',
      endereco: 'SESC Pinheiros — Rua Paes Leme, 195 — Pinheiros, São Paulo, SP',
      latitude: -23.5671,
      longitude: -46.6914,
      dataEstreia: '2026-08-01',
      status: 'EM_CARTAZ',
    },
    {
      titulo: 'O Fantasma da Ópera',
      resumo: 'O clássico musical que encanta plateias ao redor do mundo. Nos subterrâneos da Ópera de Paris, um gênio musical desfigurado vive obcecado por Christine, uma jovem soprano. Uma história de amor, obsessão e arte que transcende o tempo.',
      endereco: 'Teatro Renault — Av. Brigadeiro Luís Antônio, 411 — Bela Vista, São Paulo, SP',
      latitude: -23.5558,
      longitude: -46.6451,
      dataEstreia: '2026-06-10',
      status: 'ENCERRADA',
    },
  ];

  const pecasCriadas = [];
  for (const peca of pecas) {
    const criada = await prisma.peca.create({ data: peca });
    pecasCriadas.push(criada);
  }
  console.log(`✅ ${pecasCriadas.length} peças criadas`);

  // =========================================================================
  // 5. Locais e datas de apresentação (múltiplos por peça)
  // =========================================================================
  const locaisPecas = [
    // Hamlet — São Paulo e Rio de Janeiro
    {
      pecaId: pecasCriadas[0].id,
      nomeLocal: 'Theatro Municipal de São Paulo',
      cidade: 'São Paulo, SP',
      endereco: 'Praça Ramos de Azevedo, s/n — República, São Paulo, SP',
      latitude: -23.5453,
      longitude: -46.6385,
      dataEstreia: '2026-09-15',
      dataFim: '2026-10-15',
      horario: 'Quintas a Sábados às 20h, Domingos às 17h',
      status: 'PROGRAMADA',
    },
    {
      pecaId: pecasCriadas[0].id,
      nomeLocal: 'Teatro Riachuelo Rio',
      cidade: 'Rio de Janeiro, RJ',
      endereco: 'Rua do Passeio, 38/40 — Centro, Rio de Janeiro, RJ',
      latitude: -22.9126,
      longitude: -43.1768,
      dataEstreia: '2026-11-05',
      dataFim: '2026-11-28',
      horario: 'Sextas e Sábados às 20h30, Domingos às 18h',
      status: 'PROGRAMADA',
    },

    // Auto da Compadecida — São Paulo e Niterói
    {
      pecaId: pecasCriadas[1].id,
      nomeLocal: 'SESC Pinheiros',
      cidade: 'São Paulo, SP',
      endereco: 'Rua Paes Leme, 195 — Pinheiros, São Paulo, SP',
      latitude: -23.5671,
      longitude: -46.6914,
      dataEstreia: '2026-08-01',
      dataFim: '2026-09-30',
      horario: 'Quartas a Domingos às 19h30',
      status: 'EM_CARTAZ',
    },
    {
      pecaId: pecasCriadas[1].id,
      nomeLocal: 'Theatro Municipal de Niterói',
      cidade: 'Niterói, RJ',
      endereco: 'Rua Quinze de Novembro, 35 — Centro, Niterói, RJ',
      latitude: -22.8943,
      longitude: -43.1228,
      dataEstreia: '2026-10-10',
      dataFim: '2026-10-31',
      horario: 'Sextas e Sábados às 20h, Domingos às 19h',
      status: 'PROGRAMADA',
    },

    // O Fantasma da Ópera — São Paulo e Curitiba
    {
      pecaId: pecasCriadas[2].id,
      nomeLocal: 'Teatro Renault',
      cidade: 'São Paulo, SP',
      endereco: 'Av. Brigadeiro Luís Antônio, 411 — Bela Vista, São Paulo, SP',
      latitude: -23.5558,
      longitude: -46.6451,
      dataEstreia: '2026-06-10',
      dataFim: '2026-07-30',
      horario: 'Quintas a Domingos às 21h',
      status: 'ENCERRADA',
    },
    {
      pecaId: pecasCriadas[2].id,
      nomeLocal: 'Teatro Guaíra',
      cidade: 'Curitiba, PR',
      endereco: 'Rua XV de Novembro, 971 — Centro, Curitiba, PR',
      latitude: -25.4285,
      longitude: -49.2652,
      dataEstreia: '2026-12-01',
      dataFim: '2026-12-20',
      horario: 'Sextas e Sábados às 20h30',
      status: 'PROGRAMADA',
    },
  ];

  for (const local of locaisPecas) {
    await prisma.localPeca.create({ data: local });
  }
  console.log(`✅ ${locaisPecas.length} locais/datas de apresentação criados`);

  // =========================================================================
  // 6. Alocação de colaboradores às peças
  // =========================================================================
  const alocacoes = [
    // Hamlet
    { pecaId: pecasCriadas[0].id, colaboradorId: colabsCriados[0].id, funcaoNaPeca: 'Ofélia' },
    { pecaId: pecasCriadas[0].id, colaboradorId: colabsCriados[1].id, funcaoNaPeca: 'Hamlet' },
    { pecaId: pecasCriadas[0].id, colaboradorId: colabsCriados[2].id, funcaoNaPeca: 'Diretora' },
    { pecaId: pecasCriadas[0].id, colaboradorId: colabsCriados[3].id, funcaoNaPeca: 'Iluminação' },
    // Auto da Compadecida
    { pecaId: pecasCriadas[1].id, colaboradorId: colabsCriados[1].id, funcaoNaPeca: 'João Grilo' },
    { pecaId: pecasCriadas[1].id, colaboradorId: colabsCriados[0].id, funcaoNaPeca: 'Nossa Senhora' },
    { pecaId: pecasCriadas[1].id, colaboradorId: colabsCriados[4].id, funcaoNaPeca: 'Figurinista' },
    // Fantasma da Ópera
    { pecaId: pecasCriadas[2].id, colaboradorId: colabsCriados[0].id, funcaoNaPeca: 'Christine' },
    { pecaId: pecasCriadas[2].id, colaboradorId: colabsCriados[2].id, funcaoNaPeca: 'Diretora' },
    { pecaId: pecasCriadas[2].id, colaboradorId: colabsCriados[3].id, funcaoNaPeca: 'Iluminação' },
    { pecaId: pecasCriadas[2].id, colaboradorId: colabsCriados[4].id, funcaoNaPeca: 'Figurino' },
  ];

  for (const aloc of alocacoes) {
    await prisma.pecaColaborador.create({ data: aloc });
  }
  console.log(`✅ ${alocacoes.length} alocações criadas`);

  console.log('\n🎭 Seed concluído com sucesso!');
  console.log('   Admin: admin@theatrum.com / admin123\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
