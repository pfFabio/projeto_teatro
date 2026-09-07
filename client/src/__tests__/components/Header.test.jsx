// =============================================================================
// Testes de Componente — Header (Navegação com Obras e Agenda)
// =============================================================================

import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Header from '../../components/layout/Header';

// Variável de controle para alterar o retorno do mock por teste
let mockAuthValue;

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockAuthValue,
}));

describe('Componente Header', () => {
  describe('quando o visitante NÃO está logado', () => {
    beforeEach(() => {
      mockAuthValue = {
        usuario: null,
        ehAdmin: false,
        logout: vi.fn(),
      };
    });

    it('deve renderizar a logo e os links principais: Início, Obras e Agenda', () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );

      expect(screen.getByText('Theatrum')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /início/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /^obras$/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /^agenda$/i })).toBeInTheDocument();
    });

    it('o link de Obras deve apontar para /obras e o de Agenda para /agenda', () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );

      const linkObras = screen.getByRole('link', { name: /^obras$/i });
      expect(linkObras).toHaveAttribute('href', '/obras');

      const linkAgenda = screen.getByRole('link', { name: /^agenda$/i });
      expect(linkAgenda).toHaveAttribute('href', '/agenda');
    });

    it('NÃO deve exibir links de Colaborador, Admin ou botão Sair para visitantes', () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );

      // Esses links foram removidos do header público
      expect(screen.queryByText(/colaborador/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/painel admin/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /sair/i })).not.toBeInTheDocument();
    });
  });

  describe('quando o admin ESTÁ logado', () => {
    const mockLogout = vi.fn();

    beforeEach(() => {
      mockLogout.mockClear();
      mockAuthValue = {
        usuario: { id: 1, nome: 'Admin', email: 'admin@theatrum.com', papel: 'ADMIN' },
        ehAdmin: true,
        logout: mockLogout,
      };
    });

    it('deve exibir o link do Painel Admin e o botão Sair', () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );

      expect(screen.getByRole('link', { name: /painel admin/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /painel admin/i })).toHaveAttribute('href', '/admin');
      expect(screen.getByRole('button', { name: /sair/i })).toBeInTheDocument();
    });

    it('deve continuar exibindo os links públicos mesmo quando admin logado', () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );

      expect(screen.getByRole('link', { name: /início/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /^obras$/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /^agenda$/i })).toBeInTheDocument();
    });
  });
});
