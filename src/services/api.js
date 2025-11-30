import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[API] Token adicionado ao header');
    } else {
      console.warn('[API] Token não encontrado no localStorage');
    }
    
    return config;
  },
  (error) => {
    console.error('[API] Erro no interceptor de request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Se receber 401, o token expirou ou é inválido
    if (error.response?.status === 401) {
      console.error('[API] Token inválido ou expirado. Redirecionando para login...');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    console.error('[API] Erro na resposta:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    
    return Promise.reject(error);
  }
);

export default api;