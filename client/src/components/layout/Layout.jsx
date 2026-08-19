// =============================================================================
// Componente Layout — Wrapper com Header e Footer
// =============================================================================

import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <main className="pagina">
        {children}
      </main>
      <Footer />
    </>
  );
}
