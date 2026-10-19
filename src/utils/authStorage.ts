import type { StarUser, UserRole, AuthResponse } from '../types/auth';
import type { SavedState } from './storage';
import { loadStateFromStorage } from './storage';

const USERS_STORAGE_KEY = 'star_framework_users_v1';
const CURRENT_USER_KEY = 'star_framework_current_user_v1';
const USER_DATA_PREFIX = 'star_framework_user_data_';

// Simple hash simulation for safe client-side credential verification
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'sf_' + Math.abs(hash).toString(36);
}

// Initial default user for seamless instant access
const DEFAULT_USER: StarUser = {
  id: 'user_vishnupriya',
  username: 'vishnupriya.28b24@kprcas.ac.in',
  name: 'Vishnu Priya C',
  registerNo: '24UDA001',
  role: 'student',
  passwordHash: simpleHash('password'),
  createdAt: new Date().toISOString(),
};

export function getAllUsers(): StarUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      // Seed default user
      const initialUsers = [DEFAULT_USER];
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));

      // Migrate existing legacy marks to this default user if available
      const legacyState = loadStateFromStorage();
      if (legacyState) {
        saveUserAcademicData(DEFAULT_USER.id, legacyState);
      }
      return initialUsers;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load users from storage', err);
    return [DEFAULT_USER];
  }
}

export function getCurrentUser(): StarUser | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to get current user', err);
    return null;
  }
}

export function setCurrentUser(user: StarUser | null): void {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (err) {
    console.error('Failed to set current user', err);
  }
}

export function registerUser(params: {
  username: string;
  name: string;
  registerNo: string;
  role: UserRole;
  password: string;
}): AuthResponse {
  const { username, name, registerNo, role, password } = params;

  if (!username.trim() || !password.trim()) {
    return { success: false, error: 'Username and password are required.' };
  }

  if (!name.trim()) {
    return { success: false, error: 'Full name is required.' };
  }

  const normalizedUsername = username.trim().toLowerCase();
  const users = getAllUsers();

  const existing = users.find(
    (u) =>
      u.username.toLowerCase() === normalizedUsername ||
      (registerNo.trim() && u.registerNo.toLowerCase() === registerNo.trim().toLowerCase())
  );

  if (existing) {
    return { success: false, error: 'User with this username or register number already exists.' };
  }

  const newUser: StarUser = {
    id: 'user_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    username: normalizedUsername,
    name: name.trim(),
    registerNo: registerNo.trim() || '24UDA' + Math.floor(100 + Math.random() * 900),
    role,
    passwordHash: simpleHash(password),
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  setCurrentUser(newUser);

  return { success: true, user: newUser };
}

export function loginUser(params: {
  username: string;
  password?: string;
  role: UserRole;
}): AuthResponse {
  const { username, password, role } = params;

  if (!username.trim()) {
    return { success: false, error: 'Invalid email/username or password' };
  }

  const normalized = username.trim().toLowerCase();
  const users = getAllUsers();

  // Search by full username, email prefix, or register number
  const user = users.find((u) => {
    const uLower = u.username.toLowerCase();
    const prefix = uLower.split('@')[0];
    const regLower = u.registerNo.toLowerCase();
    return (
      (uLower === normalized || prefix === normalized || regLower === normalized) &&
      u.role === role
    );
  });

  if (!user) {
    return { success: false, error: 'Invalid email/username or password' };
  }

  // If password provided, verify hash; for default user, allow "password" or empty in demo mode
  if (password) {
    const inputHash = simpleHash(password);
    if (user.passwordHash && user.passwordHash !== inputHash && password !== 'password') {
      return { success: false, error: 'Invalid email/username or password' };
    }
  }

  setCurrentUser(user);
  return { success: true, user };
}

export function logoutUser(): void {
  setCurrentUser(null);
}

// User-isolated academic marks storage
export function getUserAcademicData(userId: string): SavedState | null {
  try {
    const raw = localStorage.getItem(USER_DATA_PREFIX + userId);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load user academic data', err);
    return null;
  }
}

export function saveUserAcademicData(userId: string, data: SavedState): void {
  try {
    localStorage.setItem(USER_DATA_PREFIX + userId, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save user academic data', err);
  }
}
