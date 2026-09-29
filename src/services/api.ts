import type { User } from '../types/auth';

const API_BASE = '/api';

interface AuthResponse {
  message?: string;
  token?: string;
  user?: User;
  error?: string;
}

interface AcademicDataResponse {
  marks: Record<string, Record<string, number | null>>;
  message?: string;
  error?: string;
}

/**
 * Safely parses response and throws friendly error messages if response is non-JSON or HTML.
 */
async function handleResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Server error (${res.status})`);
    }
    return data as T;
  }

  // Handle non-JSON HTML error responses (e.g. 404/500 from proxy or static server)
  const text = await res.text();
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('API server endpoint not found (404). Please verify backend server is running.');
    }
    if (res.status === 502 || res.status === 503) {
      throw new Error('Backend server unavailable. Please try again in a moment.');
    }
    throw new Error(text.substring(0, 100) || `Server error (${res.status})`);
  }

  throw new Error('Unexpected non-JSON response from server.');
}

export async function registerApi(username: string, password: string, confirmPassword: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password, confirmPassword }),
  });
  return handleResponse<AuthResponse>(res);
}

export async function loginApi(username: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });
  return handleResponse<AuthResponse>(res);
}

export async function logoutApi(): Promise<void> {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (err) {
    console.error('Logout error:', err);
  }
}

export async function getMeApi(): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    method: 'GET',
    credentials: 'include',
  });
  const data = await handleResponse<{ user: User }>(res);
  return data.user;
}

export async function changePasswordApi(
  currentPassword: string,
  newPassword: string,
  confirmNewPassword: string
): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/auth/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
  });
  return handleResponse<{ message: string }>(res);
}

export async function getAcademicDataApi(): Promise<Record<string, Record<string, number | null>>> {
  const res = await fetch(`${API_BASE}/academic`, {
    method: 'GET',
    credentials: 'include',
  });
  const data = await handleResponse<AcademicDataResponse>(res);
  return data.marks || {};
}

export async function saveAcademicDataApi(
  marks: Record<string, Record<string, number | null>>
): Promise<{ message: string; marks: Record<string, Record<string, number | null>> }> {
  const res = await fetch(`${API_BASE}/academic`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ marks }),
  });
  return handleResponse<{ message: string; marks: Record<string, Record<string, number | null>> }>(res);
}
