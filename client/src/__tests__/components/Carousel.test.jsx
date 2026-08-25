// =============================================================================
// Testes de Componente — Carousel
// =============================================================================

import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Carrossel from '../../components/common/Carousel';

describe('Componente Carrossel', () => {
  it('renderiza placeholder quando lista de itens está vazia', () => {
    render(<Carrossel itens={[]} />);
    expect(screen.getByText('🎭')).toBeInTheDocument();
  });

  it('renderiza título e status de peça no slide', () => {
    const itens = [
      {
        id: 1,
        titulo: 'Hamlet',
        resumo: 'Tragédia de Shakespeare',
        status: 'EM_CARTAZ',
        fotos: [{ url: '/uploads/hamlet.jpg' }],
      },
    ];

    render(
      <BrowserRouter>
        <Carrossel itens={itens} autoPlay={false} />
      </BrowserRouter>
    );

    expect(screen.getByText('Hamlet')).toBeInTheDocument();
    expect(screen.getByText('Tragédia de Shakespeare')).toBeInTheDocument();
    expect(screen.getByText('Em Cartaz')).toBeInTheDocument();
  });
});
