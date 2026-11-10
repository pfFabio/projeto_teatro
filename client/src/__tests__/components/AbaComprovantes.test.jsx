// =============================================================================
// Testes de Componente — AbaComprovantes
// Test-Driven Development (TDD) & Padrão AAA
// =============================================================================

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AbaComprovantes from '../../components/admin/AbaComprovantes';
import { comprovantesAPI } from '../../services/api';

vi.mock('../../services/api', () => ({
  comprovantesAPI: {
    listar: vi.fn(),
    baixarArquivo: vi.fn(),
    criar: vi.fn(),
    atualizar: vi.fn(),
    deletar: vi.fn(),
  },
  getMediaUrl: (url) => url,
}));

describe('AbaComprovantes Component', () => {
  const mockPecas = [
    { id: 1, titulo: 'Da Janela, o Mar' },
    { id: 2, titulo: 'YARA' },
  ];

  const mockColabs = [
    { id: 1, nome: 'Angelo Faria Turci', funcao: 'Diretor' },
  ];

  const mockRespostaAPI = {
    data: {
      comprovantes: [
        {
          id: 1,
          titulo: 'Combustível Van Turnê',
          descricao: 'Ida e volta para Niterói',
          valor: 350.0,
          dataComprovante: '2026-10-15',
          categoria: 'TRANSPORTE',
          arquivoUrl: '/uploads/comprovante-van.pdf',
          arquivoNome: 'recibo_van.pdf',
          mimetype: 'application/pdf',
          pecaId: 1,
          peca: { id: 1, titulo: 'Da Janela, o Mar' },
          colaboradorId: null,
          colaborador: null,
        },
        {
          id: 2,
          titulo: 'Tecidos para Figurino',
          descricao: 'Linho e algodão cru',
          valor: 820.5,
          dataComprovante: '2026-10-16',
          categoria: 'CENOGRAFIA_FIGURINO',
          arquivoUrl: '/uploads/comprovante-tecido.jpg',
          arquivoNome: 'nf_tecido.jpg',
          mimetype: 'image/jpeg',
          pecaId: 1,
          peca: { id: 1, titulo: 'Da Janela, o Mar' },
          colaboradorId: null,
          colaborador: null,
        },
      ],
      total: 2,
      valorTotal: 1170.5,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    comprovantesAPI.listar.mockResolvedValue(mockRespostaAPI);
  });

  test('deve renderizar a listagem de comprovantes e os cards de métricas financeiras', async () => {
    // Act
    render(
      <AbaComprovantes pecas={mockPecas} colaboradores={mockColabs} />
    );

    // Assert
    expect(await screen.findByText('Combustível Van Turnê')).toBeInTheDocument();
    expect(screen.getByText('Tecidos para Figurino')).toBeInTheDocument();
    expect(screen.getByText(/1\.170,50/)).toBeInTheDocument();
    expect(screen.getByText('Transporte')).toBeInTheDocument();
  });

  test('deve abrir o modal de cadastro ao clicar no botão "Novo Comprovante"', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <AbaComprovantes pecas={mockPecas} colaboradores={mockColabs} />
    );

    // Act
    const btnNovo = await screen.findByRole('button', { name: /novo comprovante/i });
    await user.click(btnNovo);

    // Assert
    expect(screen.getByRole('heading', { name: /cadastrar comprovante/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/título do comprovante/i)).toBeInTheDocument();
  });

  test('deve acionar download/visualização segura ao clicar no botão de anexo', async () => {
    // Arrange
    const user = userEvent.setup();
    const fakeBlob = new Blob(['%PDF'], { type: 'application/pdf' });
    comprovantesAPI.baixarArquivo.mockResolvedValue({ data: fakeBlob });
    window.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/123');
    window.open = vi.fn();

    render(
      <AbaComprovantes pecas={mockPecas} colaboradores={mockColabs} />
    );

    // Act
    const botoesAnexo = await screen.findAllByRole('button', { name: /ver anexo|abrir anexo|recibo_van\.pdf/i });
    await user.click(botoesAnexo[0]);

    // Assert
    await waitFor(() => {
      expect(comprovantesAPI.baixarArquivo).toHaveBeenCalledWith(1);
    });
  });
});
