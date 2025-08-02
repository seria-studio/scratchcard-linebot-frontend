const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bc67fde3e514.ngrok-free.app';

interface ApiRequestOptions extends RequestInit {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

// Get access token from LIFF
async function getAccessToken(): Promise<string | null> {
  try {
    // Check if LIFF is available and initialized
    if (typeof window !== 'undefined' && window.liff) {
      const liff = window.liff;
      if (liff.isLoggedIn()) {
        return liff.getAccessToken();
      }
    }
    return null;
  } catch (error) {
    console.error('Failed to get access token:', error);
    return null;
  }
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

  const accessToken = await getAccessToken();
  if (accessToken) {
    defaultHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  const config: RequestInit = {
    method: 'GET',
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`API request failed: [${response.status}] ${data.message}`);
  }

  return data;
}

export function getApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}