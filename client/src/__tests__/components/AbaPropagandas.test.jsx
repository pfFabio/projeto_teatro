// =============================================================================
// Testes de Componente — AbaPropagandas
// =============================================================================

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AbaPropagandas from '../../components/admin/AbaPropagandas';
import { propagandasAPI } from '../../services/api';

vi.mock('../../services/api', () => ({
  propagandasAPI: {
    listar: vi.fn(),
    buscar: vi.fn(),
    criar: vi.fn(),
    atualizar: vi.fn(),
    deletar: vi.fn(),
    adicionarFotos: vi.fn(),
    deletarFoto: vi.fn(),
    reordenarFotos: vi.fn(),
  },
  getMediaUrl: (url) => url || '',
}));

describe('AbaPropagandas Component', () => {
  const mockPropagandas = [
    {
      id: 1,
      titulo: 'Aulas de Teatro 2026',
      descricao: 'Matrículas abertas para o curso regular de teatro.',
      link: '#contato',
      textoBotao: 'Inscrever-se',
      ativo: true,
      fotos: [
        { id: 10, url: '/uploads/prop-1.jpg', ordem: 0 },
      ],
    },
    {
      id: 2,
      titulo: 'Workshop de Voz',
      descricao: 'Desenvolvimento vocal para atores e oradores.',
      link: '/pecas',
      textoBotao: 'Ver Mais',
      ativo: false,
      fotos: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    propagandasAPI.listar.mockResolvedValue({
      data: {
        propagandas: mockPropagandas,
        total: 2,
      },
    });
  });

  test('deve renderizar a listagem de propagandas e o botão de nova propaganda', async () => {
    render(<AbaPropagandas />);

    expect(screen.getByText('Carregando publicações de propaganda...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Aulas de Teatro 2026')).toBeInTheDocument();
      expect(screen.getByText('Workshop de Voz')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Nova Propaganda/i })).toBeInTheDocument();
    expect(screen.getByText(/● Ativa na Home/i)).toBeInTheDocument();
    expect(screen.getByText(/○ Inativa/i)).toBeInTheDocument();
  });

  test('deve abrir o modal de criação ao clicar em Nova Propaganda', async () => {
    const user = userEvent.setup();
    render(<AbaPropagandas />);

    await waitFor(() => {
      expect(screen.getByText('Aulas de Teatro 2026')).toBeInTheDocument();
    });

    const btnNova = screen.getByRole('button', { name: /Nova Propaganda/i });
    await user.click(btnNova);

    expect(screen.getByText('📢 Nova Publicação de Propaganda')).toBeInTheDocument();
    expect(screen.getByLabelText(/Título da Propaganda/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Texto \/ Descrição da Propaganda/i)).toBeInTheDocument();
  });

  test('deve permitir alternar o status ativo/inativo de uma propaganda', async () => {
    const user = userEvent.setup();
    propagandasAPI.atualizar.mockResolvedValueOnce({ data: { id: 1, ativo: false } });

    render(<AbaPropagandas />);

    await waitFor(() => {
      expect(screen.getByText('Aulas de Teatro 2026')).toBeInTheDocument();
    });

    const btnPausar = screen.getByRole('button', { name: /⏸ Pausar/i });
    await user.click(btnPausar);

    expect(propagandasAPI.atualizar).toHaveBeenCalledWith(1, { ativo: false });
  });
});
