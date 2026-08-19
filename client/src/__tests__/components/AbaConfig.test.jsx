// =============================================================================
// Testes de Componente — AbaConfig
// =============================================================================

import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AbaConfig from '../../components/admin/AbaConfig';
import { configAPI } from '../../services/api';

vi.mock('../../services/api', () => ({
  configAPI: {
    atualizar: vi.fn(),
  },
}));

describe('AbaConfig Component', () => {
  const configsMock = {
    titulo_site: { valor: 'Theatrum Oficial' },
    contato_email: { valor: 'contato@theatrum.com' },
  };

  test('deve renderizar os itens de configuração com valores iniciais', () => {
    render(<AbaConfig configs={configsMock} onRecarregar={vi.fn()} />);

    expect(screen.getByText('⚙ Configurações do Site')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Theatrum Oficial')).toBeInTheDocument();
    expect(screen.getByDisplayValue('contato@theatrum.com')).toBeInTheDocument();
  });

  test('deve permitir editar e salvar uma configuração', async () => {
    const user = userEvent.setup();
    const onRecarregar = vi.fn();
    configAPI.atualizar.mockResolvedValueOnce({ data: { status: 'ok' } });

    render(<AbaConfig configs={configsMock} onRecarregar={onRecarregar} />);

    const inputTitulo = screen.getByDisplayValue('Theatrum Oficial');
    await user.clear(inputTitulo);
    await user.type(inputTitulo, 'Novo Theatrum');

    // Botões de salvar (💾)
    const botoesSalvar = screen.getAllByRole('button', { name: '💾' });
    // O primeiro botão é do título
    await user.click(botoesSalvar[0]);

    expect(configAPI.atualizar).toHaveBeenCalledWith('titulo_site', { valor: 'Novo Theatrum' });
    expect(onRecarregar).toHaveBeenCalled();
  });
});
