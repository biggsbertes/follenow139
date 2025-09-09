// Configuração centralizada da API
export const API_CONFIG = {
  // URL base da API - será configurada automaticamente
  BASE_URL: (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3001',
  
  // Endpoints
  ENDPOINTS: {
    HEALTH: '/api/health',
    LEADS: '/api/leads',
    LEADS_BY_TRACKING: '/api/leads/by-tracking',
    LEADS_SEARCH: '/api/leads/search',
    LEADS_METRICS: '/api/leads/metrics',
    PAYMENTS: '/api/payments',
    PAYMENTS_PIX: '/api/payments/pix',
    PAYMENTS_RECENT: '/api/payments/recent',
    PAYMENTS_METRICS: '/api/payments/metrics',
    SECURE_IMPORT: '/api/secure/import-leads',
    SECURE_IMPORT_STATUS: '/api/secure/import-status',
    CONFIG: '/api/config',
    STATUS: '/api/status'
  }
};

// Função helper para construir URLs completas
export const buildApiUrl = (endpoint: string, params?: Record<string, string>): string => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }
  
  return url;
};

// Função helper para fazer requisições
export const apiRequest = async (endpoint: string, options?: RequestInit, params?: Record<string, string>) => {
  const url = buildApiUrl(endpoint, params);
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    ...options
  };
  
  return fetch(url, defaultOptions);
};

export default API_CONFIG;
