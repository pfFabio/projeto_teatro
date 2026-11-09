// =============================================================================
// Serviço de API — Centraliza todas as chamadas ao backend
// =============================================================================

import axios from 'axios';

// Base URL da API (usa VITE_API_URL apenas em produção no build, em dev usa o proxy do Vite)
const backendUrl = import.meta.env.PROD && import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
  : '';

const api = axios.create({
  baseURL: backendUrl ? `${backendUrl}/api` : '/api',
  timeout: 60000,
});

/**
 * Converte URLs relativas (/uploads/..., /downloads/...) em URLs adequadas ao ambiente.
 * Para arquivos estáticos empacotados com a aplicação (fotos oficiais das peças e downloads),
 * prioriza o carregamento direto do host da SPA (GitHub Pages CDN), garantindo
 * renderização imediata, sem 404 e sem latência de cold start do Render.
 */
export function getMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  const cleanPath = url.startsWith('/') ? url.slice(1) : url;
  const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

  // 1. Arquivos estáticos oficiais empacotados no client/public (uploads oficiais e downloads)
  if (
    cleanPath.startsWith('uploads/da_janela_') ||
    cleanPath.startsWith('uploads/obra_') ||
    cleanPath.startsWith('downloads/') ||
    cleanPath.startsWith('images/')
  ) {
    return `${baseUrl}/${cleanPath}`;
  }

  // 2. Uploads dinâmicos de runtime enviados via painel administrativo
  if (backendUrl) {
    return `${backendUrl}/${cleanPath}`;
  }

  return `${baseUrl}/${cleanPath}`;
}

// Interceptor — adiciona token JWT se existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('theatrum_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor — trata erros de autenticação
api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    if (erro.response?.status === 401) {
      localStorage.removeItem('theatrum_token');
      localStorage.removeItem('theatrum_usuario');
    }
    return Promise.reject(erro);
  }
);

// =============================================================================
// Autenticação e Segurança
// =============================================================================
export const authAPI = {
  login: (dadosOuEmail, senha) =>
    typeof dadosOuEmail === 'object'
      ? api.post('/auth/login', dadosOuEmail)
      : api.post('/auth/login', { email: dadosOuEmail, senha }),
  perfil: () => api.get('/auth/me'),
  alterarSenha: (dados) => api.post('/auth/alterar-senha', dados),
  esqueciSenha: (dados) => api.post('/auth/esqueci-senha', dados),
  redefinirSenha: (dados) => api.post('/auth/redefinir-senha', dados),
};

// =============================================================================
// Peças de Teatro
// =============================================================================
export const pecasAPI = {
  listar: (params = {}) => api.get('/pecas', { params }),
  buscar: (id) => api.get(`/pecas/${id}`),
  criar: (dados) => api.post('/pecas', dados),
  atualizar: (id, dados) => api.put(`/pecas/${id}`, dados),
  deletar: (id) => api.delete(`/pecas/${id}`),

  // Fotos e ordenação/capa
  adicionarFotos: (id, formData) => api.post(`/pecas/${id}/fotos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deletarFoto: (pecaId, fotoId) => api.delete(`/pecas/${pecaId}/fotos/${fotoId}`),
  reordenarFotos: (id, fotosIds) => api.put(`/pecas/${id}/fotos/reordenar`, { fotosIds }),
  definirFotoCapa: (id, fotoId) => api.put(`/pecas/${id}/fotos/${fotoId}/capa`),

  // Alocação
  alocarColaborador: (pecaId, dados) => api.post(`/pecas/${pecaId}/colaboradores`, dados),
  removerColaborador: (pecaId, colabId) => api.delete(`/pecas/${pecaId}/colaboradores/${colabId}`),

  // Locais e apresentações por cidade
  adicionarLocal: (pecaId, dados) => api.post(`/pecas/${pecaId}/locais`, dados),
  atualizarLocal: (pecaId, localId, dados) => api.put(`/pecas/${pecaId}/locais/${localId}`, dados),
  deletarLocal: (pecaId, localId) => api.delete(`/pecas/${pecaId}/locais/${localId}`),

  // Downloads técnicos (press kit)
  adicionarDownload: (pecaId, dados) => api.post(`/pecas/${pecaId}/downloads`, dados),
  removerDownload: (downloadId) => api.delete(`/pecas/downloads/${downloadId}`),
};

// =============================================================================
// Colaboradores
// =============================================================================
export const colaboradoresAPI = {
  listar: (params = {}) => api.get('/colaboradores', { params }),
  buscar: (id) => api.get(`/colaboradores/${id}`),
  criar: (formData) => api.post('/colaboradores', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  atualizar: (id, formData) => api.put(`/colaboradores/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deletar: (id) => api.delete(`/colaboradores/${id}`),
};

// =============================================================================
// Memória da Companhia (Linha do Tempo e Acervo)
// =============================================================================
export const memoriaAPI = {
  listar: () => api.get('/memoria'),
  criar: (dados) => api.post('/memoria', dados),
  atualizar: (id, dados) => api.put(`/memoria/${id}`, dados),
  deletar: (id) => api.delete(`/memoria/${id}`),
};

// =============================================================================
// Ideias e Propostas de Parcerias ("Tem uma ideia?")
// =============================================================================
export const ideiasAPI = {
  enviar: (dados) => api.post('/ideias', dados),
  listar: (params = {}) => api.get('/ideias', { params }),
  atualizarStatus: (id, status) => api.patch(`/ideias/${id}/status`, { status }),
  deletar: (id) => api.delete(`/ideias/${id}`),
};

// =============================================================================
// Configurações do Site
// =============================================================================
export const configAPI = {
  listar: () => api.get('/config'),
  atualizar: (chave, dados) => api.put(`/config/${chave}`, dados),
};

// =============================================================================
// Propagandas / Anúncios
// =============================================================================
export const propagandasAPI = {
  listar: (params = {}) => api.get('/propagandas', { params }),
  buscar: (id) => api.get(`/propagandas/${id}`),
  criar: (dados) => {
    if (dados instanceof FormData) {
      return api.post('/propagandas', dados, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.post('/propagandas', dados);
  },
  atualizar: (id, dados) => api.put(`/propagandas/${id}`, dados),
  deletar: (id) => api.delete(`/propagandas/${id}`),

  // Fotos da propaganda
  adicionarFotos: (id, formData) => api.post(`/propagandas/${id}/fotos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deletarFoto: (propagandaId, fotoId) => api.delete(`/propagandas/${propagandaId}/fotos/${fotoId}`),
  reordenarFotos: (id, fotosIds) => api.put(`/propagandas/${id}/fotos/reordenar`, { fotosIds }),
};

// =============================================================================
// Upload genérico
// =============================================================================
export const uploadAPI = {
  enviar: (formData) => api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export default api;
