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

export async function registerApi(username: string, password: string, confirmPassword: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password, confirmPassword }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create account.');
  }
  return data;
}

export async function loginApi(username: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Invalid username or password.');
  }
  return data;
}

export async function logoutApi(): Promise<void> {
  await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}

export async function getMeApi(): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    method: 'GET',
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Not authenticated');
  }
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
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to change password.');
  }
  return data;
}

export async function getAcademicDataApi(): Promise<Record<string, Record<string, number | null>>> {
  const res = await fetch(`${API_BASE}/academic`, {
    method: 'GET',
    credentials: 'include',
  });
  const data: AcademicDataResponse = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to load academic data.');
  }
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
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to save marks.');
  }
  return data;
}
