// =============================================================================
// Testes de Componente — AgendaPage
// =============================================================================

import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AgendaPage from '../../pages/AgendaPage';
import { pecasAPI } from '../../services/api';

// Mock do serviço de API
vi.mock('../../services/api', () => ({
  pecasAPI: {
    listar: vi.fn(),
  },
  getMediaUrl: (url) => url,
}));

// Mock do componente MapView para evitar carregar o Leaflet nos testes unitários
vi.mock('../../components/common/MapView', () => ({
  default: () => <div data-testid="mapview-mock">Mapa Mock</div>,
}));

describe('Página AgendaPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o título da agenda e as sessões cadastradas com data, horário e local', async () => {
    pecasAPI.listar.mockResolvedValueOnce({
      data: {
        pecas: [
          {
            id: 1,
            titulo: 'O Auto da Compadecida',
            resumo: 'Peça de Ariano Suassuna',
            status: 'EM_CARTAZ',
            fotos: [{ url: '/uploads/auto.jpg' }],
            locais: [
              {
                id: 10,
                nomeLocal: 'Teatro Municipal',
                cidade: 'Niterói',
                endereco: 'Rua das Flores, 123',
                dataEstreia: '2026-10-10',
                dataFim: '2026-10-25',
                horario: 'Sexta e Sábado às 20h',
                status: 'EM_CARTAZ',
              },
            ],
          },
        ],
      },
    });

    render(
      <MemoryRouter>
        <AgendaPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Agenda de Apresentações/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('O Auto da Compadecida')).toBeInTheDocument();
      expect(screen.getByText('Teatro Municipal')).toBeInTheDocument();
      expect(screen.getByText('Sexta e Sábado às 20h')).toBeInTheDocument();
      expect(screen.getByText(/10\/10\/2026/)).toBeInTheDocument();
      expect(screen.getByText('Rua das Flores, 123')).toBeInTheDocument();
    });
  });

  it('deve exibir estado vazio quando não há sessões cadastradas', async () => {
    pecasAPI.listar.mockResolvedValueOnce({
      data: {
        pecas: [],
      },
    });

    render(
      <MemoryRouter>
        <AgendaPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Nenhuma apresentação encontrada/i)).toBeInTheDocument();
    });
  });

  it('deve exibir estado vazio para peças sem locais nem endereço legado', async () => {
    pecasAPI.listar.mockResolvedValueOnce({
      data: {
        pecas: [
          {
            id: 2,
            titulo: 'Peça Sem Local',
            resumo: 'Sem sessões agendadas',
            status: 'PROGRAMADA',
            fotos: [],
            locais: [],
            // Sem endereco ou dataEstreia legado
          },
        ],
      },
    });

    render(
      <MemoryRouter>
        <AgendaPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // A peça existe mas não gera nenhuma sessão, então o estado deve ser vazio
      expect(screen.getByText(/Nenhuma apresentação encontrada/i)).toBeInTheDocument();
    });
  });

  it('deve inicializar a busca com o parâmetro ?busca= da URL', async () => {
    pecasAPI.listar.mockResolvedValueOnce({
      data: {
        pecas: [
          {
            id: 1,
            titulo: 'Hamlet',
            resumo: 'Tragédia de Shakespeare',
            status: 'EM_CARTAZ',
            fotos: [],
            locais: [
              {
                id: 20,
                nomeLocal: 'Teatro Shakespeare',
                cidade: 'São Paulo',
                endereco: 'Av. Paulista, 1000',
                dataEstreia: '2026-11-01',
                dataFim: '2026-11-30',
                horario: 'Quinta às 21h',
                status: 'EM_CARTAZ',
              },
            ],
          },
          {
            id: 2,
            titulo: 'Romeu e Julieta',
            resumo: 'Outra tragédia',
            status: 'EM_CARTAZ',
            fotos: [],
            locais: [
              {
                id: 21,
                nomeLocal: 'Teatro ABC',
                cidade: 'Rio de Janeiro',
                endereco: 'Rua Copacabana, 50',
                dataEstreia: '2026-12-01',
                dataFim: '2026-12-15',
                horario: 'Sábado às 19h',
                status: 'EM_CARTAZ',
              },
            ],
          },
        ],
      },
    });

    // Simula navegação vinda de /obras/:id com ?busca=Hamlet
    render(
      <MemoryRouter initialEntries={['/agenda?busca=Hamlet']}>
        <AgendaPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Hamlet deve aparecer pois corresponde ao filtro de busca
      expect(screen.getByText('Hamlet')).toBeInTheDocument();
      expect(screen.getByText('Teatro Shakespeare')).toBeInTheDocument();
    });

    // Romeu e Julieta NÃO deve aparecer porque o filtro de busca é "Hamlet"
    expect(screen.queryByText('Romeu e Julieta')).not.toBeInTheDocument();
  });

  it('deve exibir link "Ver Obra" para cada sessão', async () => {
    pecasAPI.listar.mockResolvedValueOnce({
      data: {
        pecas: [
          {
            id: 7,
            titulo: 'Macbeth',
            resumo: 'Tragédia de Shakespeare',
            status: 'EM_CARTAZ',
            fotos: [],
            locais: [
              {
                id: 30,
                nomeLocal: 'Globe Theatre',
                cidade: 'Londres',
                endereco: 'Bankside',
                dataEstreia: '2026-09-01',
                dataFim: '2026-09-30',
                horario: 'Diário às 19h',
                status: 'EM_CARTAZ',
              },
            ],
          },
        ],
      },
    });

    render(
      <MemoryRouter>
        <AgendaPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const linkVerObra = screen.getByRole('link', { name: /ver obra/i });
      expect(linkVerObra).toBeInTheDocument();
      expect(linkVerObra).toHaveAttribute('href', '/obras/7');
    });
  });
});
