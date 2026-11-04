// =============================================================================
// Testes de Componente — AbaIdeias
// =============================================================================

import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AbaIdeias from '../../components/admin/AbaIdeias';
import { ideiasAPI } from '../../services/api';

vi.mock('../../services/api', () => ({
  ideiasAPI: {
    atualizarStatus: vi.fn(),
    deletar: vi.fn(),
  },
}));

describe('AbaIdeias Component', () => {
  const ideiasMock = [
    {
      id: 1,
      nome: 'Carlos Drummond',
      email: 'carlos@poesia.com',
      telefone: '(21) 98888-1234',
      titulo: 'Proposta de Temporada no Municipal',
      descricao: 'Gostaria de propor uma parceria para circulação da peça no interior do estado.',
      status: 'NOVA',
      criadoEm: '2026-10-08T14:30:00.000Z',
    },
    {
      id: 2,
      nome: 'Ana Cristina Cesar',
      email: 'ana@letras.com',
      telefone: null,
      titulo: 'Texto Dramatúrgico Inédito',
      descricao: 'Tenho um texto com três personagens que combina perfeitamente com a estética da companhia.',
      status: 'LIDA',
      criadoEm: '2026-10-09T10:00:00.000Z',
    },
  ];

  test('deve renderizar a listagem de propostas e informações de contato', () => {
    render(<AbaIdeias ideias={ideiasMock} onRecarregar={vi.fn()} />);

    expect(screen.getByText('Carlos Drummond')).toBeInTheDocument();
    expect(screen.getByText('Proposta de Temporada no Municipal')).toBeInTheDocument();
    expect(screen.getByText('Ana Cristina Cesar')).toBeInTheDocument();
    expect(screen.getByText('Nova Proposta')).toBeInTheDocument();
    expect(screen.getByText('Lida')).toBeInTheDocument();
  });

  test('deve filtrar as ideias ao digitar no campo de busca', async () => {
    const user = userEvent.setup();
    render(<AbaIdeias ideias={ideiasMock} onRecarregar={vi.fn()} />);

    const campoBusca = screen.getByPlaceholderText(/Buscar ideia por nome/i);
    await user.type(campoBusca, 'Drummond');

    expect(screen.getByText('Carlos Drummond')).toBeInTheDocument();
    expect(screen.queryByText('Ana Cristina Cesar')).not.toBeInTheDocument();
  });

  test('deve abrir modal ao clicar no botão de visualização e marcar como lida se nova', async () => {
    const user = userEvent.setup();
    const onRecarregar = vi.fn();
    ideiasAPI.atualizarStatus.mockResolvedValueOnce({});

    render(<AbaIdeias ideias={ideiasMock} onRecarregar={onRecarregar} />);

    const botoesOlho = screen.getAllByRole('button', { name: '👁️' });
    await user.click(botoesOlho[0]);

    expect(screen.getByText('💡 Proposta Recebida — Tem uma Ideia?')).toBeInTheDocument();
    expect(screen.getAllByText(/Gostaria de propor uma parceria/i).length).toBeGreaterThanOrEqual(2);
    expect(ideiasAPI.atualizarStatus).toHaveBeenCalledWith(1, 'LIDA');
  });
});
