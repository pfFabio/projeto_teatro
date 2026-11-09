// =============================================================================
// Componente Header — Barra de navegação fixa com logo Theatrum e Memória
// =============================================================================

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoTheatrum from '../../assets/logo-theatrum.png';

export default function Header() {
  const [menuAberto, setMenuAberto] = useState(false);
  const location = useLocation();
  const { ehAdmin, logout } = useAuth();

  const ehAtivo = (caminho) => location.pathname === caminho ? 'ativo' : '';

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="header-logo" title="Theatrum Mundi">
          <img
            src={logoTheatrum}
            alt="Theatrum"
            className="header-logo-img"
            onError={(e) => {
              e.target.style.display = 'none';
              const txt = e.target.parentElement?.querySelector('.header-logo-texto');
              if (txt) txt.style.display = 'inline';
            }}
          />
          <span className="header-logo-texto">Theatrum</span>
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
          <Link
            to="/memoria"
            className={`header-link ${ehAtivo('/memoria')}`}
            onClick={() => setMenuAberto(false)}
          >
            Memória
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
