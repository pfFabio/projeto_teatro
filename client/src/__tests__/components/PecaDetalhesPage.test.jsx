// =============================================================================
// Testes de Componente — PecaDetalhesPage (Página de Detalhes da Obra)
// =============================================================================

import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PecaDetalhesPage from '../../pages/PecaDetalhesPage';

// Mock dos serviços de API
vi.mock('../../services/api', () => ({
  pecasAPI: {
    buscar: vi.fn(),
  },
  getMediaUrl: (url) => url,
}));

import { pecasAPI } from '../../services/api';

// Helper para renderizar a página com rota parametrizada
function renderComRota(id = '1') {
  return render(
    <MemoryRouter initialEntries={[`/obras/${id}`]}>
      <Routes>
        <Route path="/obras/:id" element={<PecaDetalhesPage />} />
        <Route path="/obras" element={<div>Página de Obras</div>} />
        <Route path="/agenda" element={<div>Página da Agenda</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Página PecaDetalhesPage', () => {
  const pecaMock = {
    id: 1,
    titulo: 'O Auto da Compadecida',
    resumo: 'Uma adaptação cômica e emocionante da obra de Ariano Suassuna.',
    status: 'EM_CARTAZ',
    fotos: [
      { id: 1, url: '/uploads/auto-01.jpg', tipo: 'IMAGEM', descricao: 'Cena principal' },
      { id: 2, url: '/uploads/auto-02.jpg', tipo: 'IMAGEM', descricao: 'Bastidores' },
    ],
    colaboradores: [
      {
        id: 10,
        funcaoNaPeca: 'Diretor',
        colaborador: { id: 100, nome: 'João Silva', fotoUrl: null },
      },
      {
        id: 11,
        funcaoNaPeca: 'Ator Principal',
        colaborador: { id: 101, nome: 'Maria Oliveira', fotoUrl: '/uploads/maria.jpg' },
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve exibir estado de carregamento enquanto busca a obra', () => {
    pecasAPI.buscar.mockReturnValue(new Promise(() => {}));

    renderComRota('1');

    expect(screen.getByText(/Carregando detalhes da obra/i)).toBeInTheDocument();
  });

  it('deve renderizar o título da obra, status e badge de equipe', async () => {
    pecasAPI.buscar.mockResolvedValueOnce({ data: pecaMock });

    renderComRota('1');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'O Auto da Compadecida' })).toBeInTheDocument();
      expect(screen.getByText('Em Cartaz')).toBeInTheDocument();
      expect(screen.getByText(/2 integrantes/i)).toBeInTheDocument();
    });
  });

  it('deve exibir a sinopse da obra na seção correspondente', async () => {
    pecasAPI.buscar.mockResolvedValueOnce({ data: pecaMock });

    renderComRota('1');

    await waitFor(() => {
      expect(screen.getByText('Sinopse')).toBeInTheDocument();
      expect(
        screen.getByText(/Uma adaptação cômica e emocionante/)
      ).toBeInTheDocument();
    });
  });

  it('deve listar todos os membros da equipe com nome e função', async () => {
    pecasAPI.buscar.mockResolvedValueOnce({ data: pecaMock });

    renderComRota('1');

    await waitFor(() => {
      expect(screen.getByText('Equipe & Elenco')).toBeInTheDocument();
      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.getByText('Diretor')).toBeInTheDocument();
      expect(screen.getByText('Maria Oliveira')).toBeInTheDocument();
      expect(screen.getByText('Ator Principal')).toBeInTheDocument();
    });
  });

  it('deve gerar iniciais corretamente para avatars sem foto', async () => {
    pecasAPI.buscar.mockResolvedValueOnce({ data: pecaMock });

    renderComRota('1');

    await waitFor(() => {
      // João Silva -> "JS" como iniciais
      expect(screen.getByText('JS')).toBeInTheDocument();
    });
  });

  it('deve exibir o botão "Ver Programação na Agenda" com link correto', async () => {
    pecasAPI.buscar.mockResolvedValueOnce({ data: pecaMock });

    renderComRota('1');

    await waitFor(() => {
      const linkAgenda = screen.getByRole('link', { name: /Ver Programação na Agenda/i });
      expect(linkAgenda).toBeInTheDocument();
      expect(linkAgenda).toHaveAttribute(
        'href',
        `/agenda?busca=${encodeURIComponent('O Auto da Compadecida')}`
      );
    });
  });

  it('deve exibir o link "Voltar para Obras" apontando para /obras', async () => {
    pecasAPI.buscar.mockResolvedValueOnce({ data: pecaMock });

    renderComRota('1');

    await waitFor(() => {
      const linkVoltar = screen.getByRole('link', { name: /Voltar para Obras/i });
      expect(linkVoltar).toBeInTheDocument();
      expect(linkVoltar).toHaveAttribute('href', '/obras');
    });
  });

  it('deve exibir "Obra não encontrada" quando a API retorna null', async () => {
    pecasAPI.buscar.mockResolvedValueOnce({ data: null });

    renderComRota('999');

    await waitFor(() => {
      expect(screen.getByText('Obra não encontrada')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Voltar às Obras/i })).toBeInTheDocument();
    });
  });

  it('deve exibir imagem padrão com legenda quando a obra não tem fotos', async () => {
    const pecaSemFotos = {
      ...pecaMock,
      fotos: [],
      colaboradores: [],
    };
    pecasAPI.buscar.mockResolvedValueOnce({ data: pecaSemFotos });

    renderComRota('1');

    await waitFor(() => {
      expect(screen.getByText(/Imagem de divulgação/i)).toBeInTheDocument();
    });
  });

  it('deve exibir miniaturas quando a obra tem múltiplas fotos', async () => {
    pecasAPI.buscar.mockResolvedValueOnce({ data: pecaMock });

    renderComRota('1');

    await waitFor(() => {
      // Deve haver botões de miniaturas para as 2 fotos
      const thumbBtns = screen.getAllByRole('button', { name: /Foto|Cena|Bastidores/i });
      expect(thumbBtns.length).toBe(2);
    });
  });

  it('deve exibir mensagem quando a equipe está vazia', async () => {
    const pecaSemEquipe = {
      ...pecaMock,
      colaboradores: [],
    };
    pecasAPI.buscar.mockResolvedValueOnce({ data: pecaSemEquipe });

    renderComRota('1');

    await waitFor(() => {
      expect(screen.getByText(/Ficha técnica e elenco em processo/i)).toBeInTheDocument();
    });
  });
});
