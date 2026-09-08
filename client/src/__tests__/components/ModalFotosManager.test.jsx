// =============================================================================
// Testes de Componente — ModalFotosManager (Upload e Diretrizes de Imagem)
// =============================================================================

import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ModalFotosManager from '../../components/admin/ModalFotosManager';
import { pecasAPI } from '../../services/api';

vi.mock('../../services/api', () => ({
  pecasAPI: {
    buscar: vi.fn(),
    adicionarFotos: vi.fn(),
    deletarFoto: vi.fn(),
    definirFotoCapa: vi.fn(),
    reordenarFotos: vi.fn(),
  },
  getMediaUrl: vi.fn((url) => url || ''),
}));

describe('ModalFotosManager', () => {
  const mockPeca = {
    id: 1,
    titulo: 'Hamlet',
    fotos: [
      { id: 101, url: '/uploads/foto1.jpg', ordem: 0, tipo: 'IMAGEM' },
      { id: 102, url: '/uploads/foto2.jpg', ordem: 1, tipo: 'IMAGEM' },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    pecasAPI.buscar.mockResolvedValue({ data: mockPeca });
  });

  it('deve exibir o aviso com as especificações recomendadas para imagens (16:9 e formatos aceitos)', async () => {
    render(
      <ModalFotosManager
        aberto={true}
        peca={mockPeca}
        onFechar={vi.fn()}
        onAtualizado={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Especificações Recomendadas para Imagens/i)).toBeInTheDocument();
    });

    expect(screen.getAllByText(/16:9/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Horizontal \/ Paisagem/i)).toBeInTheDocument();
    expect(screen.getByText(/JPG, PNG e WebP/i)).toBeInTheDocument();
    expect(screen.getByText(/50 MB/i)).toBeInTheDocument();
  });

  it('deve renderizar a área de upload com os tipos de arquivo e proporção ideal', async () => {
    render(
      <ModalFotosManager
        aberto={true}
        peca={mockPeca}
        onFechar={vi.fn()}
        onAtualizado={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Clique para selecionar fotos ou vídeos da peça/i)).toBeInTheDocument();
    });

    expect(screen.getAllByText(/Proporção ideal:/i).length).toBeGreaterThanOrEqual(1);
  });

  it('deve carregar e listar as mídias da peça identificando a primeira como Capa', async () => {
    render(
      <ModalFotosManager
        aberto={true}
        peca={mockPeca}
        onFechar={vi.fn()}
        onAtualizado={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Mídias Cadastradas \(2\)/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/⭐ Capa/i)).toBeInTheDocument();
  });
});
