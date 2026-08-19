// =============================================================================
// Página Admin — Shell de roteamento (login vs dashboard)
// Refatorado: lógica extraída para componentes admin separados
// =============================================================================

import { useAuth } from '../context/AuthContext';
import AdminLogin from '../components/admin/AdminLogin';
import AdminDashboard from '../components/admin/AdminDashboard';
import { authAPI } from '../services/api';

export default function AdminPage() {
  const { usuario, login, logout } = useAuth();

  async function handleLogin(email, senha) {
    const res = await authAPI.login({ email, senha });
    login(res.data.token, res.data.usuario);
  }

  if (!usuario) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <AdminDashboard usuario={usuario} onLogout={logout} />;
}
