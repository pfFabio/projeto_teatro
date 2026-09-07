// =============================================================================
// Testes de Componente — Footer
// =============================================================================

import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Footer from '../../components/layout/Footer';

describe('Componente Footer', () => {
  it('deve renderizar a logo Theatrum e a descrição do projeto', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    expect(screen.getByText('Theatrum')).toBeInTheDocument();
    expect(screen.getByText(/Plataforma de gestão e divulgação/i)).toBeInTheDocument();
  });

  it('deve conter todos os links de navegação com URLs corretas', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    const linkInicio = screen.getByRole('link', { name: 'Início' });
    expect(linkInicio).toHaveAttribute('href', '/');

    const linkObras = screen.getByRole('link', { name: 'Obras' });
    expect(linkObras).toHaveAttribute('href', '/obras');

    const linkAgenda = screen.getByRole('link', { name: 'Agenda' });
    expect(linkAgenda).toHaveAttribute('href', '/agenda');

    const linkColaborador = screen.getByRole('link', { name: 'Seja Colaborador' });
    expect(linkColaborador).toHaveAttribute('href', '/colaborador');

    const linkAdmin = screen.getByRole('link', { name: 'Área Admin' });
    expect(linkAdmin).toHaveAttribute('href', '/admin');
  });

  it('deve conter os links de contato (email e telefone)', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    const linkEmail = screen.getByRole('link', { name: 'contato@theatrum.com' });
    expect(linkEmail).toHaveAttribute('href', 'mailto:contato@theatrum.com');

    const linkTelefone = screen.getByRole('link', { name: '(11) 99999-9999' });
    expect(linkTelefone).toHaveAttribute('href', 'tel:+5511999999999');
  });

  it('deve exibir o aviso de copyright com o ano corrente', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    const anoAtual = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(`© ${anoAtual}`))).toBeInTheDocument();
    expect(screen.getByText(/Todos os direitos reservados/i)).toBeInTheDocument();
  });
});
