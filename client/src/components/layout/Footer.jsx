// =============================================================================
// Componente Footer
// =============================================================================

import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="footer-logo">
            🎭 <span>Theatrum</span>
          </div>
          <p className="footer-desc">
            Plataforma de gestão e divulgação de peças de teatro. 
            Conectando artistas, técnicos e público.
          </p>
        </div>

        <div>
          <h4 className="footer-titulo">Navegação</h4>
          <ul className="footer-links">
            <li><Link to="/">Início</Link></li>
            <li><Link to="/pecas">Peças</Link></li>
            <li><Link to="/colaborador">Seja Colaborador</Link></li>
            <li><Link to="/admin">Área Admin</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="footer-titulo">Contato</h4>
          <ul className="footer-links">
            <li><a href="mailto:contato@theatrum.com">contato@theatrum.com</a></li>
            <li><a href="tel:+5511999999999">(11) 99999-9999</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-rodape">
        © {new Date().getFullYear()} Theatrum — Todos os direitos reservados. Projeto acadêmico.
      </div>
    </footer>
  );
}
