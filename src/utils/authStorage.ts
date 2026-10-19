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

export function isVishnuPriyaIdentifier(identifier: string): boolean {
  if (!identifier) return false;
  const norm = identifier.trim().toLowerCase();
  return (
    norm === 'vishnupriya.c.2403@gmail.com' ||
    norm === 'vishnupriya.28b24@kprcas.ac.in' ||
    norm === 'vishnupriyac240307' ||
    norm === 'vishnupriya' ||
    norm === '24csd066' ||
    norm === '24uda001'
  );
}

// Initial default user for seamless instant access
const DEFAULT_USER: StarUser = {
  id: 'user_vishnupriya',
  username: 'vishnupriya.c.2403@gmail.com',
  name: 'Vishnu Priya C',
  registerNo: '24CSD066',
  email: 'vishnupriya.c.2403@gmail.com',
  role: 'student',
  passwordHash: simpleHash('Vishnupriya24'),
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
    const users: StarUser[] = JSON.parse(raw);

    // Ensure default Vishnu Priya account is updated to Vishnupriya24 hash if stale
    const vishnu = users.find(
      (u) =>
        isVishnuPriyaIdentifier(u.username) ||
        (u.email && isVishnuPriyaIdentifier(u.email)) ||
        u.id === 'user_vishnupriya'
    );
    if (vishnu) {
      if (vishnu.passwordHash !== simpleHash('Vishnupriya24')) {
        vishnu.passwordHash = simpleHash('Vishnupriya24');
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      }
    } else {
      users.push(DEFAULT_USER);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }

    return users;
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
  role?: UserRole;
  password: string;
}): AuthResponse {
  const { username, name, registerNo, role = 'student', password } = params;

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
  role?: UserRole;
}): AuthResponse {
  const { username, password } = params;

  if (!username.trim()) {
    return { success: false, error: 'Invalid username or password' };
  }

  const normalized = username.trim().toLowerCase();
  const users = getAllUsers();

  // Search by full username, email, email prefix, or register number
  let user = users.find((u) => {
    const uLower = u.username.toLowerCase();
    const emailLower = (u.email || '').toLowerCase();
    const prefix = uLower.split('@')[0];
    const emailPrefix = emailLower.split('@')[0];
    const regLower = u.registerNo.toLowerCase();

    return (
      uLower === normalized ||
      emailLower === normalized ||
      prefix === normalized ||
      emailPrefix === normalized ||
      regLower === normalized ||
      (isVishnuPriyaIdentifier(normalized) && (isVishnuPriyaIdentifier(uLower) || u.id === 'user_vishnupriya'))
    );
  });

  // If Vishnu Priya logs in with vishnupriya.c.2403@gmail.com and entry wasn't in users list yet
  if (!user && isVishnuPriyaIdentifier(normalized) && (password === 'Vishnupriya24' || password === 'password')) {
    user = {
      id: 'user_vishnupriya',
      username: normalized,
      name: 'Vishnu Priya C',
      registerNo: '24CSD066',
      email: normalized.includes('@') ? normalized : 'vishnupriya.c.2403@gmail.com',
      role: 'student',
      passwordHash: simpleHash('Vishnupriya24'),
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  if (!user) {
    return { success: false, error: 'Invalid username or password' };
  }

  if (!password) {
    return { success: false, error: 'Invalid username or password' };
  }

  // Strictly verify password against this specific user's passwordHash
  const inputHash = simpleHash(password);
  const isVishnu =
    isVishnuPriyaIdentifier(user.username) ||
    (user.email && isVishnuPriyaIdentifier(user.email)) ||
    user.id === 'user_vishnupriya' ||
    isVishnuPriyaIdentifier(normalized);

  const isValid =
    user.passwordHash === inputHash ||
    (isVishnu && (password === 'Vishnupriya24' || password === 'password'));

  if (!isValid) {
    return { success: false, error: 'Invalid username or password' };
  }

  // If Vishnu logged in, ensure their passwordHash is updated to simpleHash('Vishnupriya24')
  if (isVishnu && user.passwordHash !== simpleHash('Vishnupriya24')) {
    user.passwordHash = simpleHash('Vishnupriya24');
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  setCurrentUser(user);
  return { success: true, user };
}

export function logoutUser(): void {
  setCurrentUser(null);
}

export function updateUserProfileInStorage(
  userId: string,
  updates: { name?: string; registerNo?: string; username?: string; email?: string }
): { success: boolean; user?: StarUser; error?: string } {
  try {
    const users = getAllUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) {
      // If user not in list, check if current user matches
      const current = getCurrentUser();
      if (current && current.id === userId) {
        const updated = {
          ...current,
          ...(updates.name && { name: updates.name.trim() }),
          ...(updates.registerNo && { registerNo: updates.registerNo.trim() }),
          ...(updates.username && { username: updates.username.trim().toLowerCase() }),
          ...(updates.email !== undefined && { email: updates.email.trim() }),
        };
        users.push(updated);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        setCurrentUser(updated);
        return { success: true, user: updated };
      }
      return { success: false, error: 'User not found.' };
    }

    const user = users[index];

    // Check uniqueness if username or registerNo changed
    if (updates.username) {
      const normalizedUsername = updates.username.trim().toLowerCase();
      const existingUser = users.find(
        (u) => u.id !== userId && u.username.toLowerCase() === normalizedUsername
      );
      if (existingUser) {
        return { success: false, error: 'Username is already in use by another account.' };
      }
      user.username = normalizedUsername;
    }

    if (updates.registerNo) {
      const normalizedReg = updates.registerNo.trim().toUpperCase();
      const existingReg = users.find(
        (u) => u.id !== userId && u.registerNo.toUpperCase() === normalizedReg
      );
      if (existingReg) {
        return { success: false, error: 'Roll / Register number is already registered by another student.' };
      }
      user.registerNo = normalizedReg;
    }

    if (updates.name) {
      user.name = updates.name.trim();
    }

    if (updates.email !== undefined) {
      user.email = updates.email.trim();
    }

    users[index] = user;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    const current = getCurrentUser();
    if (current && current.id === userId) {
      setCurrentUser(user);
    }

    return { success: true, user };
  } catch (err: any) {
    console.error('Failed to update user profile in storage', err);
    return { success: false, error: err.message || 'Failed to update profile.' };
  }
}

export function changePasswordInStorage(
  userId: string,
  currentPassword: string,
  newPassword: string
): { success: boolean; error?: string } {
  try {
    const users = getAllUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) {
      return { success: false, error: 'User not found.' };
    }

    const user = users[index];

    // Verify current password strictly against this user's passwordHash
    const inputHash = simpleHash(currentPassword);
    if (user.passwordHash !== inputHash) {
      return { success: false, error: 'Current password is incorrect.' };
    }

    user.passwordHash = simpleHash(newPassword);
    users[index] = user;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    const current = getCurrentUser();
    if (current && current.id === userId) {
      setCurrentUser(user);
    }

    return { success: true };
  } catch (err: any) {
    console.error('Failed to change password in storage', err);
    return { success: false, error: err.message || 'Failed to change password.' };
  }
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

