const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://scratchcard-linebot-backend.seria.moe'
  : 'https://b08b5a763e8a.ngrok-free.app';

interface ApiRequestOptions extends RequestInit {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  };

  const config: RequestInit = {
    method: 'GET',
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export function getApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}