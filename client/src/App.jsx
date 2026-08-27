// =============================================================================
// App.jsx — Roteamento principal do Theatrum
// =============================================================================

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';

// Divisão de código por rota (Lazy Loading)
const HomePage = lazy(() => import('./pages/HomePage'));
const PecasPage = lazy(() => import('./pages/PecasPage'));
const PecaDetalhesPage = lazy(() => import('./pages/PecaDetalhesPage'));
const ColaboradorPage = lazy(() => import('./pages/ColaboradorPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

// Importar estilos
import './styles/index.css';
import './styles/components.css';
import './styles/pages.css';

function PageLoader() {
  return (
    <div className="pagina-conteudo" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
      <div className="carregando-container">
        <div className="spinner" />
        <p>Carregando...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Layout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/pecas" element={<PecasPage />} />
              <Route path="/pecas/:id" element={<PecaDetalhesPage />} />
              <Route path="/colaborador" element={<ColaboradorPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
