import type { UserProfile, AuthResponse } from '../types/auth';

const TOKEN_KEY = 'csda_calculator_jwt_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Includes HTTP-only cookies
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export async function registerApi(payload: {
  name: string;
  registerNo: string;
  username: string;
  password: string;
  confirmPassword?: string;
  email?: string;
}): Promise<AuthResponse> {
  const data = await request<{ message: string; user: UserProfile; token: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (data.token) {
    setStoredToken(data.token);
  }

  return { success: true, message: data.message, user: data.user, token: data.token };
}

export async function loginApi(payload: {
  username: string;
  password: string;
}): Promise<AuthResponse> {
  const data = await request<{ message: string; user: UserProfile; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (data.token) {
    setStoredToken(data.token);
  }

  return { success: true, message: data.message, user: data.user, token: data.token };
}

export async function logoutApi(): Promise<void> {
  try {
    await request('/auth/logout', { method: 'POST' });
  } catch {
    // Ignore logout network errors
  } finally {
    setStoredToken(null);
  }
}

export async function getMeApi(): Promise<UserProfile | null> {
  try {
    const data = await request<{ user: UserProfile }>('/auth/me', { method: 'GET' });
    return data.user || null;
  } catch {
    return null;
  }
}

export async function updateProfileApi(payload: {
  name?: string;
  registerNo?: string;
  username?: string;
  email?: string;
}): Promise<{ message: string; user: UserProfile }> {
  return request<{ message: string; user: UserProfile }>('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function changePasswordApi(payload: {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}): Promise<{ message: string }> {
  return request<{ message: string }>('/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export interface AcademicRecordResponse {
  academicData: {
    userId: string;
    marksMap: Record<string, number | null>;
    inclusionsMap: Record<string, boolean>;
    electivesMap: Record<string, string>;
    updatedAt?: string;
  };
}

export async function getAcademicDataApi(): Promise<AcademicRecordResponse['academicData'] | null> {
  try {
    const res = await request<AcademicRecordResponse>('/academic', { method: 'GET' });
    return res.academicData;
  } catch (err) {
    console.warn('Could not fetch remote academic data:', err);
    return null;
  }
}

export async function saveAcademicDataApi(payload: {
  marksMap: Record<string, number | null>;
  inclusionsMap: Record<string, boolean>;
  electivesMap: Record<string, string>;
}): Promise<void> {
  await request('/academic', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
