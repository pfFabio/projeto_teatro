// =============================================================================
// Testes de Componente — AdminLogin
// =============================================================================

import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminLogin from '../../components/admin/AdminLogin';

describe('AdminLogin Component', () => {
  test('deve renderizar os campos de email, senha e botão de entrar', () => {
    render(<AdminLogin onLogin={vi.fn()} />);

    expect(screen.getByText('Área Administrativa')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('admin@theatrum.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  test('deve exibir mensagem de erro se submeter sem email ou senha', async () => {
    const user = userEvent.setup();
    const handleLogin = vi.fn();

    render(<AdminLogin onLogin={handleLogin} />);

    const botaoEntrar = screen.getByRole('button', { name: /entrar/i });
    await user.click(botaoEntrar);

    expect(screen.getByText(/Preencha email e senha/i)).toBeInTheDocument();
    expect(handleLogin).not.toHaveBeenCalled();
  });

  test('deve chamar onLogin com os valores corretos quando o formulário for preenchido', async () => {
    const user = userEvent.setup();
    const handleLogin = vi.fn().mockResolvedValueOnce({});

    render(<AdminLogin onLogin={handleLogin} />);

    const campoEmail = screen.getByPlaceholderText('admin@theatrum.com');
    const campoSenha = screen.getByPlaceholderText('••••••••');
    const botaoEntrar = screen.getByRole('button', { name: /entrar/i });

    await user.type(campoEmail, 'admin@theatrum.com');
    await user.type(campoSenha, 'senha123');
    await user.click(botaoEntrar);

    expect(handleLogin).toHaveBeenCalledWith('admin@theatrum.com', 'senha123');
  });

  test('deve exibir mensagem de erro se onLogin falhar', async () => {
    const user = userEvent.setup();
    const handleLogin = vi.fn().mockRejectedValueOnce({
      response: { data: { mensagem: 'Credenciais inválidas' } },
    });

    render(<AdminLogin onLogin={handleLogin} />);

    const campoEmail = screen.getByPlaceholderText('admin@theatrum.com');
    const campoSenha = screen.getByPlaceholderText('••••••••');
    const botaoEntrar = screen.getByRole('button', { name: /entrar/i });

    await user.type(campoEmail, 'admin@theatrum.com');
    await user.type(campoSenha, 'senha123');
    await user.click(botaoEntrar);

    expect(await screen.findByText(/Credenciais inválidas/i)).toBeInTheDocument();
  });
});
