// =============================================================================
// Testes de Componente — HomePage (Página Inicial)
// =============================================================================

import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HomePage from '../../pages/HomePage';

// Mock dos serviços de API
vi.mock('../../services/api', () => ({
  pecasAPI: {
    listar: vi.fn(),
  },
  configAPI: {
    listar: vi.fn(),
  },
  propagandasAPI: {
    listar: vi.fn(),
  },
  getMediaUrl: (url) => url,
}));

// Mock do Carrossel para isolar o teste da HomePage
vi.mock('../../components/common/Carousel', () => ({
  default: ({ itens }) => (
    <div data-testid="carrossel-mock">
      {itens.map((item) => (
        <span key={item.id}>{item.titulo}</span>
      ))}
    </div>
  ),
}));

// Mock do PropagandasSection para isolar o teste
vi.mock('../../components/common/PropagandasSection', () => ({
  default: ({ propagandas }) => (
    <div data-testid="propagandas-mock">
      {propagandas.map((p) => (
        <span key={p.id}>{p.titulo}</span>
      ))}
    </div>
  ),
}));

// Importar os mocks para poder configurá-los
import { pecasAPI, configAPI, propagandasAPI } from '../../services/api';

describe('Página HomePage', () => {
  const pecasMock = [
    {
      id: 1,
      titulo: 'Hamlet',
      resumo: 'Tragédia de Shakespeare',
      status: 'EM_CARTAZ',
      fotos: [{ url: '/uploads/hamlet.jpg' }],
      _count: { colaboradores: 5 },
    },
    {
      id: 2,
      titulo: 'Romeu e Julieta',
      resumo: 'Romance trágico de Shakespeare',
      status: 'PROGRAMADA',
      fotos: [],
      _count: { colaboradores: 8 },
    },
  ];

  const configMock = {
    titulo_site: { valor: 'Theatrum' },
  };

  const propagandasMock = [
    {
      id: 10,
      titulo: 'Oficina de Teatro',
      descricao: 'Inscrições abertas',
      ativo: true,
      fotos: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    pecasAPI.listar.mockResolvedValue({ data: { pecas: pecasMock } });
    configAPI.listar.mockResolvedValue({ data: configMock });
    propagandasAPI.listar.mockResolvedValue({ data: { propagandas: propagandasMock } });
  });

  it('deve exibir estado de carregamento inicialmente', () => {
    // Nunca resolve a promise para manter o loading
    pecasAPI.listar.mockReturnValue(new Promise(() => {}));
    configAPI.listar.mockReturnValue(new Promise(() => {}));
    propagandasAPI.listar.mockReturnValue(new Promise(() => {}));

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Carregando espetáculos/i)).toBeInTheDocument();
  });

  it('deve renderizar a seção de Obras em Destaque com títulos das peças', async () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Obras em Destaque/i)).toBeInTheDocument();

      // Cada título aparece 2x: uma no Carrossel mock e outra no card da vitrine
      const hamletElements = screen.getAllByText('Hamlet');
      expect(hamletElements.length).toBe(2); // carrossel + card

      const romeuElements = screen.getAllByText('Romeu e Julieta');
      expect(romeuElements.length).toBe(2);

      // O card da vitrine usa <h3 class="card-titulo">
      const cardTitulos = screen.getAllByRole('heading', { level: 3 });
      const textos = cardTitulos.map((el) => el.textContent);
      expect(textos).toContain('Hamlet');
      expect(textos).toContain('Romeu e Julieta');
    });
  });

  it('os cards de obra devem ter links para /obras/:id', async () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Cada card da vitrine é um Link para /obras/:id
      const linksObra = screen.getAllByTitle(/Ver detalhes de/i);
      expect(linksObra.length).toBeGreaterThanOrEqual(2);
      expect(linksObra[0]).toHaveAttribute('href', '/obras/1');
      expect(linksObra[1]).toHaveAttribute('href', '/obras/2');
    });
  });

  it('deve exibir a contagem de integrantes e o CTA "Ver Obra →"', async () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/5 integrantes/i)).toBeInTheDocument();
      expect(screen.getByText(/8 integrantes/i)).toBeInTheDocument();
      // Os CTAs "Ver Obra →" dos cards
      const ctasVerObra = screen.getAllByText('Ver Obra →');
      expect(ctasVerObra.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('deve exibir os links de conversão do rodapé da seção', async () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const linkExplorar = screen.getByRole('link', { name: /Explorar Todas as Obras/i });
      expect(linkExplorar).toHaveAttribute('href', '/obras');

      const linkAgenda = screen.getByRole('link', { name: /Consultar Agenda Completa/i });
      expect(linkAgenda).toHaveAttribute('href', '/agenda');
    });
  });

  it('deve passar as peças para o componente Carrossel', async () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const carrossel = screen.getByTestId('carrossel-mock');
      expect(carrossel).toBeInTheDocument();
    });
  });

  it('deve passar as propagandas para o componente PropagandasSection', async () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const secaoProp = screen.getByTestId('propagandas-mock');
      expect(secaoProp).toBeInTheDocument();
      expect(screen.getByText('Oficina de Teatro')).toBeInTheDocument();
    });
  });
});
