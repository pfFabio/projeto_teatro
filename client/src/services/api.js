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
 * Converte URLs relativas (/uploads/...) em URLs absolutas quando em produção
 */
export function getMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (!backendUrl) return url;
  return `${backendUrl}${url.startsWith('/') ? '' : '/'}${url}`;
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
// Autenticação
// =============================================================================
export const authAPI = {
  login: (dadosOuEmail, senha) =>
    typeof dadosOuEmail === 'object'
      ? api.post('/auth/login', dadosOuEmail)
      : api.post('/auth/login', { email: dadosOuEmail, senha }),
  perfil: () => api.get('/auth/me'),
};

// =============================================================================
// Peças
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
