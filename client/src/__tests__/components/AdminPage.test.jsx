// =============================================================================
// Testes de Componente — AdminPage
// =============================================================================

import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminPage from '../../pages/AdminPage';
import * as AuthContextModule from '../../context/AuthContext';

vi.mock('../../components/admin/AdminDashboard', () => ({
  default: ({ usuario, onLogout }) => (
    <div data-testid="admin-dashboard">
      <span>Bem-vindo, {usuario.nome}</span>
      <button onClick={onLogout}>Sair</button>
    </div>
  ),
}));

describe('AdminPage Component', () => {
  test('deve exibir AdminLogin quando não há usuário logado', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      usuario: null,
      login: vi.fn(),
      logout: vi.fn(),
      ehAdmin: false,
    });

    render(<AdminPage />);

    expect(screen.getByText('Área Administrativa')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  test('deve exibir AdminDashboard quando o usuário estiver logado', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      usuario: { id: 1, nome: 'Administrador Theatrum', email: 'admin@theatrum.com', papel: 'ADMIN' },
      login: vi.fn(),
      logout: vi.fn(),
      ehAdmin: true,
    });

    render(<AdminPage />);

    expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
    expect(screen.getByText('Bem-vindo, Administrador Theatrum')).toBeInTheDocument();
  });
});
