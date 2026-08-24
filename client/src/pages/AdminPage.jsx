// =============================================================================
// Página Admin — Shell de roteamento (login vs dashboard)
// Refatorado: lógica extraída para componentes admin separados
// =============================================================================

import { useAuth } from '../context/AuthContext';
import AdminLogin from '../components/admin/AdminLogin';
import AdminDashboard from '../components/admin/AdminDashboard';

export default function AdminPage() {
  const { usuario, login, logout } = useAuth();

  if (!usuario) {
    return <AdminLogin onLogin={login} />;
  }

  return <AdminDashboard usuario={usuario} onLogout={logout} />;
}
