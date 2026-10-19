import type { UserProfile, AuthResponse } from '../types/auth';
import {
  getCurrentUser,
  registerUser,
  loginUser,
  logoutUser,
  updateUserProfileInStorage,
  changePasswordInStorage,
  getUserAcademicData,
  saveUserAcademicData,
} from '../utils/authStorage';

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
  const currentUser = getCurrentUser();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (currentUser) {
    headers['X-User-Id'] = currentUser.id;
    headers['X-Username'] = currentUser.username;
    headers['X-Register-No'] = currentUser.registerNo;
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Includes HTTP-only cookies
  });

  const newToken = response.headers.get('X-New-Token');
  if (newToken) {
    setStoredToken(newToken);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg) as any;
    err.status = response.status;
    throw err;
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
  try {
    const data = await request<{ message: string; user: UserProfile; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (data.token) {
      setStoredToken(data.token);
    }

    return { success: true, message: data.message, user: data.user, token: data.token };
  } catch (err: any) {
    // If backend is unavailable or 404, fall back to persistent local storage
    if (err.status === 404 || err.name === 'TypeError' || !err.status) {
      const fallback = registerUser({
        name: payload.name,
        registerNo: payload.registerNo,
        username: payload.username,
        password: payload.password,
      });
      if (!fallback.success || !fallback.user) {
        throw new Error(fallback.error || 'Failed to register account');
      }
      return { success: true, message: 'Account created successfully', user: fallback.user };
    }
    throw err;
  }
}

export async function loginApi(payload: {
  username: string;
  password: string;
}): Promise<AuthResponse> {
  // Check local storage credentials first
  const localRes = loginUser({
    username: payload.username,
    password: payload.password,
  });

  try {
    const data = await request<{ message: string; user: UserProfile; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (data.token) {
      setStoredToken(data.token);
    }

    return { success: true, message: data.message, user: data.user, token: data.token };
  } catch (err: any) {
    // If local login succeeded, grant login smoothly!
    if (localRes.success && localRes.user) {
      return { success: true, message: 'Logged in successfully', user: localRes.user };
    }

    // Both failed: return clear error
    throw new Error(err.message || localRes.error || 'Invalid username or password');
  }
}

export async function logoutApi(): Promise<void> {
  try {
    await request('/auth/logout', { method: 'POST' });
  } catch {
    // Ignore logout network errors
  } finally {
    setStoredToken(null);
    logoutUser();
  }
}

export async function getMeApi(): Promise<UserProfile | null> {
  try {
    const data = await request<{ user: UserProfile }>('/auth/me', { method: 'GET' });
    return data.user || null;
  } catch {
    return getCurrentUser();
  }
}

export async function updateProfileApi(
  payload: {
    name?: string;
    registerNo?: string;
    username?: string;
    email?: string;
  },
  userId?: string
): Promise<{ message: string; user: UserProfile }> {
  const activeUser = getCurrentUser();
  const targetId = userId || activeUser?.id;

  try {
    const res = await request<{ message: string; user: UserProfile }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    if (targetId) {
      updateUserProfileInStorage(targetId, payload);
    }
    return res;
  } catch (err: any) {
    // If backend 404, 401, or offline, apply changes to local store seamlessly
    if (!targetId) {
      throw new Error('User session not found.');
    }
    const res = updateUserProfileInStorage(targetId, payload);
    if (!res.success || !res.user) {
      throw new Error(res.error || 'Failed to update profile.');
    }
    return { message: 'Profile updated successfully!', user: res.user };
  }
}

export async function changePasswordApi(
  payload: {
    currentPassword: string;
    newPassword: string;
    confirmPassword?: string;
  },
  userId?: string
): Promise<{ message: string }> {
  const activeUser = getCurrentUser();
  const targetId = userId || activeUser?.id;

  try {
    const res = await request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (targetId) {
      changePasswordInStorage(targetId, payload.currentPassword, payload.newPassword);
    }
    return res;
  } catch (err: any) {
    if (!targetId) {
      throw new Error('User session not found.');
    }
    const res = changePasswordInStorage(targetId, payload.currentPassword, payload.newPassword);
    if (!res.success) {
      throw new Error(res.error || 'Failed to change password.');
    }
    return { message: 'Password changed successfully!' };
  }
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
    const res = await request<any>('/academic', { method: 'GET' });
    if (res?.academicData?.marksMap) {
      return res.academicData;
    }
    if (res?.marksMap) {
      return {
        userId: res.userId || '',
        marksMap: res.marksMap,
        inclusionsMap: res.inclusionsMap || {},
        electivesMap: res.electivesMap || {},
        updatedAt: res.updatedAt,
      };
    }
    return null;
  } catch {
    const active = getCurrentUser();
    if (active) {
      const saved = getUserAcademicData(active.id);
      if (saved) {
        return {
          userId: active.id,
          marksMap: saved.marksMap || {},
          inclusionsMap: saved.inclusionsMap || {},
          electivesMap: saved.electivesMap || {},
        };
      }
    }
    return null;
  }
}

export async function saveAcademicDataApi(payload: {
  marksMap: Record<string, number | null>;
  inclusionsMap: Record<string, boolean>;
  electivesMap: Record<string, string>;
}): Promise<void> {
  try {
    await request('/academic', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch {
    const active = getCurrentUser();
    if (active) {
      saveUserAcademicData(active.id, {
        marksMap: payload.marksMap,
        inclusionsMap: payload.inclusionsMap,
        electivesMap: payload.electivesMap,
        studentInfo: {
          name: active.name,
          registerNo: active.registerNo,
        },
      });
    }
  }
}
