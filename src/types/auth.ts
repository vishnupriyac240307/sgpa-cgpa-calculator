export type UserRole = 'student' | 'faculty';

export interface StarUser {
  id: string;
  username: string; // e.g. vishnupriya.28b24@kprcas.ac.in
  name: string; // e.g. Vishnu Priya C
  registerNo: string; // e.g. 24UDA001
  role: UserRole;
  passwordHash?: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: StarUser;
}
