// Seul point de contact avec le backend : URL, token, erreurs et délai
import { translate } from '../i18n/i18n';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const TIMEOUT_MS = 10000;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

// Erreur renvoyée aux écrans : status 0 = serveur injoignable
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Token courant, fourni par l'AuthContext
let authToken: string | null = null;
// Action à lancer quand le token est refusé (déconnexion), fournie par l'AuthContext
let unauthorizedHandler: (() => void) | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

// Récupère le champ "message" des réponses d'erreur du backend
function extractMessage(data: unknown): string | null {
  if (typeof data === 'object' && data !== null && 'message' in data && typeof data.message === 'string') {
    return data.message;
  }
  return null;
}

async function request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
  if (!API_URL) {
    throw new ApiError(0, translate('api.missingUrl'));
  }

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  const sentToken = authToken;
  if (sentToken) {
    headers.Authorization = `Bearer ${sentToken}`;
  }

  // Coupe la requête si le serveur ne répond pas à temps
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(0, translate('api.unreachable'));
  } finally {
    clearTimeout(timeout);
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    // 401 avec un token = session expirée ou invalide ; sans token (login) = identifiants faux
    if (response.status === 401 && sentToken) {
      unauthorizedHandler?.();
    }
    throw new ApiError(response.status, extractMessage(data) ?? translate('api.generic'));
  }

  // Le backend respecte le contrat décrit dans src/types
  return data as T;
}

// Méthodes plutôt que fonctions fléchées : `<T>(...) =>` peut être lu comme une balise JSX
export const api = {
  get<T>(path: string): Promise<T> {
    return request<T>('GET', path);
  },
  post<T>(path: string, body: unknown): Promise<T> {
    return request<T>('POST', path, body);
  },
  put<T>(path: string, body: unknown): Promise<T> {
    return request<T>('PUT', path, body);
  },
  delete<T>(path: string): Promise<T> {
    return request<T>('DELETE', path);
  },
};
