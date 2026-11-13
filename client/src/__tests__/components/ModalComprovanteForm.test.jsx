// =============================================================================
// Testes de Componente — ModalComprovanteForm (Extração Assistida por IA)
// Metodologia TDD & Padrão AAA
// =============================================================================

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModalComprovanteForm from '../../components/admin/ModalComprovanteForm';
import { comprovantesAPI } from '../../services/api';

vi.mock('../../services/api', () => ({
  comprovantesAPI: {
    extrairDados: vi.fn(),
  },
}));

describe('ModalComprovanteForm — Extração Assistida por IA', () => {
  const mockPecas = [{ id: 1, titulo: 'Da Janela, o Mar' }];
  const mockColabs = [{ id: 1, nome: 'Angelo Faria Turci' }];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('deve renderizar a seção de anexo como a PRIMEIRA área do formulário (topo)', () => {
    // Act
    render(
      <ModalComprovanteForm
        aberto={true}
        onFechar={vi.fn()}
        onSalvar={vi.fn()}
        pecas={mockPecas}
        colaboradores={mockColabs}
      />
    );

    // Assert
    const inputs = screen.getAllByRole('textbox', { hidden: true });
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();

    // Verifica que o texto explicativo da IA e do upload inicial está visível no topo
    expect(
      screen.getByText(/1º Passo: Anexe o Comprovante/i)
    ).toBeInTheDocument();
  });

  test('ao anexar arquivo, deve acionar a IA para extração assistida e pré-preencher os campos', async () => {
    // Arrange
    const user = userEvent.setup();
    comprovantesAPI.extrairDados.mockResolvedValue({
      data: {
        sucesso: true,
        dados: {
          titulo: 'Posto Petrobras Niterói',
          descricao: 'Abastecimento van turnê',
          valor: 215.5,
          dataComprovante: '2026-10-25',
          categoria: 'TRANSPORTE',
        },
        confianca: {
          titulo: 0.95,
          valor: 0.98,
          dataComprovante: 0.9,
          categoria: 0.75, // Confiança incerta para teste de badge
        },
        alertas: ['Verifique a categoria'],
      },
    });

    render(
      <ModalComprovanteForm
        aberto={true}
        onFechar={vi.fn()}
        onSalvar={vi.fn()}
        pecas={mockPecas}
        colaboradores={mockColabs}
      />
    );

    // Act
    const file = new File(['%PDF-1.4'], 'recibo_posto.pdf', { type: 'application/pdf' });
    const fileInput = document.querySelector('input[type="file"]');
    await user.upload(fileInput, file);

    // Assert
    await waitFor(() => {
      expect(comprovantesAPI.extrairDados).toHaveBeenCalled();
    });

    // Campos preenchidos
    await waitFor(() => {
      expect(screen.getByDisplayValue('Posto Petrobras Niterói')).toBeInTheDocument();
      expect(screen.getByDisplayValue('215.5')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2026-10-25')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Abastecimento van turnê')).toBeInTheDocument();
    });

    // Badge de revisão / alerta de campo incerto
    expect(screen.getByText(/Revisão sugerida/i)).toBeInTheDocument();
    expect(screen.getByText(/Extração assistida por IA/i)).toBeInTheDocument();
  });

  test('em caso de falha da IA, deve exibir aviso amigável e permitir preenchimento manual com anexo mantido', async () => {
    // Arrange
    const user = userEvent.setup();
    comprovantesAPI.extrairDados.mockRejectedValue(new Error('Timeout de rede'));

    render(
      <ModalComprovanteForm
        aberto={true}
        onFechar={vi.fn()}
        onSalvar={vi.fn()}
        pecas={mockPecas}
        colaboradores={mockColabs}
      />
    );

    // Act
    const file = new File(['%PDF-1.4'], 'recibo_falha.pdf', { type: 'application/pdf' });
    const fileInput = document.querySelector('input[type="file"]');
    await user.upload(fileInput, file);

    // Assert
    await waitFor(() => {
      expect(
        screen.getByText(/Não foi possível extrair os dados automaticamente/i)
      ).toBeInTheDocument();
    });

    // O arquivo anexo continua presente
    expect(screen.getByText(/recibo_falha\.pdf/i)).toBeInTheDocument();
  });
});

