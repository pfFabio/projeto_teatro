// =============================================================================
// Componente Header — Barra de navegação fixa
// =============================================================================

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const [menuAberto, setMenuAberto] = useState(false);
  const location = useLocation();
  const { ehAdmin, logout } = useAuth();

  const ehAtivo = (caminho) => location.pathname === caminho ? 'ativo' : '';

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="header-logo">
          <span className="header-logo-icone">🎭</span>
          <span>Theatrum</span>
        </Link>

        <button
          className="header-menu-btn"
          onClick={() => setMenuAberto(!menuAberto)}
          aria-label="Abrir menu"
        >
          {menuAberto ? '✕' : '☰'}
        </button>

        <nav className={`header-nav ${menuAberto ? 'aberto' : ''}`}>
          <Link
            to="/"
            className={`header-link ${ehAtivo('/')}`}
            onClick={() => setMenuAberto(false)}
          >
            Início
          </Link>
          <Link
            to="/obras"
            className={`header-link ${ehAtivo('/obras') || ehAtivo('/pecas')}`}
            onClick={() => setMenuAberto(false)}
          >
            Obras
          </Link>
          <Link
            to="/agenda"
            className={`header-link ${ehAtivo('/agenda')}`}
            onClick={() => setMenuAberto(false)}
          >
            Agenda
          </Link>

          {ehAdmin && (
            <>
              <Link
                to="/admin"
                className={`header-link ${ehAtivo('/admin')}`}
                onClick={() => setMenuAberto(false)}
              >
                ⚙ Painel Admin
              </Link>
              <button
                className="btn btn-fantasma btn-sm"
                onClick={() => { logout(); setMenuAberto(false); }}
              >
                Sair
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
