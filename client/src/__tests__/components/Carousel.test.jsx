// =============================================================================
// Testes de Componente — Carousel (Slideshow Cinematográfico)
// =============================================================================

import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Carrossel from '../../components/common/Carousel';

// Mock do serviço de API para getMediaUrl
vi.mock('../../services/api', () => ({
  getMediaUrl: (url) => url,
}));

describe('Componente Carrossel', () => {
  it('renderiza placeholder quando lista de itens está vazia', () => {
    render(<Carrossel itens={[]} />);
    expect(screen.getByText('🎭')).toBeInTheDocument();
  });

  it('renderiza título, resumo e status de peça no slide', () => {
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

  it('deve renderizar os CTAs "Ver Obra" e "Ver Datas na Agenda" com links corretos', () => {
    const itens = [
      {
        id: 42,
        titulo: 'O Auto da Compadecida',
        resumo: 'Peça de Ariano Suassuna',
        status: 'EM_CARTAZ',
        fotos: [{ url: '/uploads/auto.jpg' }],
      },
    ];

    render(
      <BrowserRouter>
        <Carrossel itens={itens} autoPlay={false} />
      </BrowserRouter>
    );

    // CTA principal: Ver Obra deve apontar para /obras/:id
    const linkVerObra = screen.getByRole('link', { name: /ver obra/i });
    expect(linkVerObra).toBeInTheDocument();
    expect(linkVerObra).toHaveAttribute('href', '/obras/42');

    // CTA secundário: Ver Datas na Agenda deve apontar para /agenda?busca=...
    const linkAgenda = screen.getByRole('link', { name: /ver datas na agenda/i });
    expect(linkAgenda).toBeInTheDocument();
    expect(linkAgenda).toHaveAttribute(
      'href',
      `/agenda?busca=${encodeURIComponent('O Auto da Compadecida')}`
    );
  });

  it('deve usar imagem padrão quando a peça não possui fotos', () => {
    const itens = [
      {
        id: 5,
        titulo: 'Peça Sem Foto',
        resumo: 'Uma peça sem imagem cadastrada',
        status: 'PROGRAMADA',
        fotos: [],
      },
    ];

    render(
      <BrowserRouter>
        <Carrossel itens={itens} autoPlay={false} />
      </BrowserRouter>
    );

    // A imagem deve ter o alt correto e usar o fallback (defaultCover)
    const imagem = screen.getByAltText('Peça Sem Foto');
    expect(imagem).toBeInTheDocument();
    // A src não deve ser vazia/undefined — deve ser o fallback
    expect(imagem.getAttribute('src')).toBeTruthy();
  });

  it('deve exibir controles de navegação quando há múltiplos slides', () => {
    const itens = [
      { id: 1, titulo: 'Peça A', resumo: 'Resumo A', status: 'EM_CARTAZ', fotos: [] },
      { id: 2, titulo: 'Peça B', resumo: 'Resumo B', status: 'PROGRAMADA', fotos: [] },
    ];

    render(
      <BrowserRouter>
        <Carrossel itens={itens} autoPlay={false} />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /slide anterior/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /próximo slide/i })).toBeInTheDocument();
    // Dois indicadores (um por slide)
    expect(screen.getByRole('button', { name: /ir para slide 1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ir para slide 2/i })).toBeInTheDocument();
  });

  it('NÃO deve exibir controles de navegação quando há apenas 1 slide', () => {
    const itens = [
      { id: 1, titulo: 'Peça Única', resumo: 'Só uma', status: 'EM_CARTAZ', fotos: [] },
    ];

    render(
      <BrowserRouter>
        <Carrossel itens={itens} autoPlay={false} />
      </BrowserRouter>
    );

    expect(screen.queryByRole('button', { name: /slide anterior/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /próximo slide/i })).not.toBeInTheDocument();
  });
});
