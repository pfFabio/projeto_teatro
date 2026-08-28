// =============================================================================
// Testes de Componente — PropagandasSection (5 Mais Recentes na Home)
// =============================================================================

import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PropagandasSection from '../../components/common/PropagandasSection';

describe('PropagandasSection Component', () => {
  const propagandasMock = [
    {
      id: 1,
      titulo: 'Oficina de Expressão Cênica',
      descricao: 'Participe da nossa oficina intensiva de teatro.',
      link: '/pecas',
      textoBotao: 'Ver Espetáculos',
      ativo: true,
      fotos: [{ id: 1, url: '/uploads/oficina.jpg', ordem: 0 }],
    },
    {
      id: 2,
      titulo: 'Matrículas 2026',
      descricao: 'Cursos regulares de atuação.',
      link: '#contato',
      textoBotao: 'Fale Conosco',
      ativo: true,
      fotos: [],
    },
  ];

  test('deve renderizar a propaganda atual com título, descrição e botão CTA', () => {
    render(
      <BrowserRouter>
        <PropagandasSection propagandas={propagandasMock} />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /Oficina de Expressão Cênica/i })).toBeInTheDocument();
    expect(screen.getByText(/Participe da nossa oficina intensiva/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ver Espetáculos/i })).toBeInTheDocument();
    expect(screen.getByText(/Novidade \(1\/2\)/i)).toBeInTheDocument();
  });

  test('deve renderizar o fallback quando não houver propagandas', () => {
    const configMock = {
      propaganda_titulo: { valor: 'Aulas Fixas' },
      propaganda_texto: { valor: 'Texto institucional fixo' },
      propaganda_botao_texto: { valor: 'Conhecer' },
      propaganda_botao_link: { valor: '#contato' },
    };

    render(
      <BrowserRouter>
        <PropagandasSection propagandas={[]} config={configMock} />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /Aulas Fixas/i })).toBeInTheDocument();
    expect(screen.getByText(/Texto institucional fixo/i)).toBeInTheDocument();
  });
});
