// =============================================================================
// App.jsx — Roteamento principal do Theatrum
// =============================================================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import PecasPage from './pages/PecasPage';
import PecaDetalhesPage from './pages/PecaDetalhesPage';
import ColaboradorPage from './pages/ColaboradorPage';
import AdminPage from './pages/AdminPage';

// Importar estilos
import './styles/index.css';
import './styles/components.css';
import './styles/pages.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/pecas" element={<PecasPage />} />
            <Route path="/pecas/:id" element={<PecaDetalhesPage />} />
            <Route path="/colaborador" element={<ColaboradorPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
