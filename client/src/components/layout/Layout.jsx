// =============================================================================
// Componente Layout — Wrapper com Header e Footer
// =============================================================================

import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import { configAPI } from '../../services/api';

export default function Layout({ children }) {
  const [config, setConfig] = useState({});

  useEffect(() => {
    let ativo = true;
    configAPI.listar()
      .then((res) => {
        if (ativo && res.data) {
          setConfig(res.data);
          if (res.data.titulo_site?.valor) {
            const subtitulo = res.data.subtitulo_site?.valor ? ` — ${res.data.subtitulo_site.valor}` : '';
            document.title = `${res.data.titulo_site.valor}${subtitulo}`;
          }
        }
      })
      .catch(() => {
        // Fallback silencioso preserva o estado canônico
      });
    return () => { ativo = false; };
  }, []);

  return (
    <>
      <Header />
      <main className="pagina">
        {children}
      </main>
      <Footer config={config} />
    </>
  );
}
