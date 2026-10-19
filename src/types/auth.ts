export type UserRole = 'student' | 'faculty';

export interface UserProfile {
  id: string;
  name: string;
  registerNo: string;
  username: string;
  email?: string;
  role?: UserRole;
  passwordHash?: string;
  createdAt?: string;
}

export type StarUser = UserProfile;

export interface AuthResponse {
  success?: boolean;
  message?: string;
  token?: string;
  user?: UserProfile;
  error?: string;
}
