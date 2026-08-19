// =============================================================================
// Contexto de Autenticação
// Gerencia estado de login do admin em toda a aplicação
// =============================================================================

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Verificar token salvo ao carregar
  useEffect(() => {
    const token = localStorage.getItem('theatrum_token');
    const usuarioSalvo = localStorage.getItem('theatrum_usuario');

    if (token && usuarioSalvo) {
      try {
        setUsuario(JSON.parse(usuarioSalvo));
      } catch {
        localStorage.removeItem('theatrum_token');
        localStorage.removeItem('theatrum_usuario');
      }
    }
    setCarregando(false);
  }, []);

  // Fazer login
  const login = async (email, senha) => {
    const resposta = await authAPI.login(email, senha);
    const { token, usuario: dadosUsuario } = resposta.data;

    localStorage.setItem('theatrum_token', token);
    localStorage.setItem('theatrum_usuario', JSON.stringify(dadosUsuario));
    setUsuario(dadosUsuario);

    return dadosUsuario;
  };

  // Fazer logout
  const logout = () => {
    localStorage.removeItem('theatrum_token');
    localStorage.removeItem('theatrum_usuario');
    setUsuario(null);
  };

  // Verificar se é admin
  const ehAdmin = usuario?.papel === 'ADMIN';

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, logout, ehAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

export default AuthContext;
