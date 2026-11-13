// =============================================================================
// Testes de Componente — AbaConfig
// =============================================================================

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AbaConfig from '../../components/admin/AbaConfig';
import { configAPI, authAPI } from '../../services/api';

vi.mock('../../services/api', () => ({
  configAPI: {
    atualizar: vi.fn(),
  },
  authAPI: {
    perfil: vi.fn(),
    atualizarPerfil: vi.fn(),
    alterarSenha: vi.fn(),
  },
}));

describe('AbaConfig Component', () => {
  const configsMock = {
    titulo_site: { valor: 'Theatrum Oficial' },
    subtitulo_site: { valor: 'Pesquisa Cênica' },
    instagram_oficial: { valor: '@theatrum.m' },
    contato_email: { valor: 'contato@theatrum.com' },
    contato_telefone: { valor: '+55 21 97309-2514' },
    contato_endereco: { valor: 'Silvana da Costa, 437' },
    rodape_texto: { valor: '© 2026 Theatrum' },
    propaganda_titulo: { valor: 'Destaque Padrão' },
  };

  const usuarioMock = {
    id: 1,
    nome: 'Angelo Faria Turci',
    email: 'admin@theatrum.com',
    papel: 'ADMIN',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('deve renderizar os 4 blocos temáticos organizados', () => {
    render(<AbaConfig configs={configsMock} usuario={usuarioMock} onRecarregar={vi.fn()} />);

    expect(screen.getByText(/Identidade do Site/i)).toBeInTheDocument();
    expect(screen.getByText(/Contato Público & Rodapé/i)).toBeInTheDocument();
    expect(screen.getByText(/Fallback da Página Inicial/i)).toBeInTheDocument();
    expect(screen.getByText(/Conta & Segurança do Administrador/i)).toBeInTheDocument();

    expect(screen.getByDisplayValue('Theatrum Oficial')).toBeInTheDocument();
    expect(screen.getByDisplayValue('contato@theatrum.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Angelo Faria Turci')).toBeInTheDocument();
  });

  test('deve permitir editar e salvar uma configuração do site', async () => {
    const user = userEvent.setup();
    const onRecarregar = vi.fn();
    configAPI.atualizar.mockResolvedValueOnce({ data: { status: 'ok' } });

    render(<AbaConfig configs={configsMock} usuario={usuarioMock} onRecarregar={onRecarregar} />);

    const inputTitulo = screen.getByDisplayValue('Theatrum Oficial');
    await user.clear(inputTitulo);
    await user.type(inputTitulo, 'Novo Theatrum');

    // Botão de salvar específico do título
    const botaoSalvarTitulo = screen.getByRole('button', { name: /Salvar Nome da Companhia/i });
    await user.click(botaoSalvarTitulo);

    expect(configAPI.atualizar).toHaveBeenCalledWith('titulo_site', { valor: 'Novo Theatrum' });
    expect(onRecarregar).toHaveBeenCalled();
  });

  test('deve permitir atualizar os dados de perfil do administrador', async () => {
    const user = userEvent.setup();
    authAPI.atualizarPerfil.mockResolvedValueOnce({
      data: { id: 1, nome: 'Diretor Angelo', email: 'diretoria@theatrum.com' },
    });

    render(<AbaConfig configs={configsMock} usuario={usuarioMock} onRecarregar={vi.fn()} />);

    const inputNomeAdmin = screen.getByDisplayValue('Angelo Faria Turci');
    await user.clear(inputNomeAdmin);
    await user.type(inputNomeAdmin, 'Diretor Angelo');

    const botaoSalvarPerfil = screen.getByRole('button', { name: /Salvar Dados do Perfil/i });
    await user.click(botaoSalvarPerfil);

    expect(authAPI.atualizarPerfil).toHaveBeenCalledWith({
      nome: 'Diretor Angelo',
      email: 'admin@theatrum.com',
    });
  });

  test('deve validar formato de email antes de salvar contato_email', async () => {
    const user = userEvent.setup();
    render(<AbaConfig configs={configsMock} usuario={usuarioMock} onRecarregar={vi.fn()} />);

    const inputEmail = screen.getByDisplayValue('contato@theatrum.com');
    await user.clear(inputEmail);
    await user.type(inputEmail, 'email-invalido-sem-arroba');

    const botaoSalvarEmail = screen.getByRole('button', { name: /Salvar E-mail de Contato/i });
    await user.click(botaoSalvarEmail);

    expect(configAPI.atualizar).not.toHaveBeenCalled();
    expect(screen.getByText(/Formato de e-mail inválido/i)).toBeInTheDocument();
  });
});
