// =============================================================================
// Componente Footer
// =============================================================================

import { Link } from 'react-router-dom';
import logoTheatrum from '../../assets/logo-theatrum.png';

export default function Footer({ config = {} }) {
  const email = config?.contato_email?.valor || 'ciatheatrum@gmail.com';
  const telefone = config?.contato_telefone?.valor || '+55 (21) 97309-2514';
  const telDigits = telefone.replace(/[^\d+]/g, '');
  const instagram = config?.instagram_oficial?.valor || '@theatrum.m';
  const instagramHandle = instagram.replace(/^@/, '');
  const endereco = config?.contato_endereco?.valor || config?.endereco?.valor || 'Silvana da Costa, 437, Itaipuaçú — Maricá/RJ';
  const rodapeTexto = config?.rodape_texto?.valor || `© ${new Date().getFullYear()} Theatrum — Todos os direitos reservados. Projeto acadêmico.`;

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="footer-logo">
            <img
              src={logoTheatrum}
              alt="Theatrum"
              className="footer-logo-img"
              onError={(e) => {
                e.target.style.display = 'none';
                const txt = e.target.parentElement?.querySelector('.footer-logo-texto');
                if (txt) txt.style.display = 'inline';
              }}
            />
            <span className="footer-logo-texto">Theatrum</span>
          </div>
          <p className="footer-desc">
            Plataforma de gestão e divulgação de peças de teatro. 
            Conectando artistas, técnicos e público. Companhia Theatrum Mundi — Pesquisa cênica desde 2012.
          </p>
        </div>

        <div>
          <h4 className="footer-titulo">Navegação</h4>
          <ul className="footer-links">
            <li><Link to="/">Início</Link></li>
            <li><Link to="/obras">Obras</Link></li>
            <li><Link to="/agenda">Agenda</Link></li>
            <li><Link to="/memoria">Memória</Link></li>
            <li><Link to="/colaborador">Seja Colaborador</Link></li>
            <li><Link to="/admin">Área Admin</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="footer-titulo">Contato & Sede</h4>
          <ul className="footer-links">
            <li><a href={`mailto:${email}`}>{email}</a></li>
            <li><a href={`tel:${telDigits}`}>{telefone}</a></li>
            <li>
              <a
                href={`https://instagram.com/${instagramHandle}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {instagram.startsWith('@') ? instagram : `@${instagram}`}
              </a>
            </li>
            <li><span className="footer-endereco">{endereco}</span></li>
          </ul>
        </div>
      </div>

      <div className="footer-rodape">
        {rodapeTexto}
      </div>
    </footer>
  );
}
