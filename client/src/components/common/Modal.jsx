// =============================================================================
// Componente Modal — Diálogo modal reutilizável
// =============================================================================

import { useEffect } from 'react';

export default function Modal({ aberto, onFechar, titulo, children, rodape }) {
  // Fechar com ESC
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onFechar();
    };

    if (aberto) {
      document.addEventListener('keydown', handler);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [aberto, onFechar]);

  if (!aberto) return null;

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-conteudo" onClick={(e) => e.stopPropagation()}>
        <div className="modal-cabecalho">
          <h3>{titulo}</h3>
          <button className="modal-fechar" onClick={onFechar}>✕</button>
        </div>
        <div className="modal-corpo">
          {children}
        </div>
        {rodape && (
          <div className="modal-rodape">
            {rodape}
          </div>
        )}
      </div>
    </div>
  );
}
