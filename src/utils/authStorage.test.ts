// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAllUsers,
  registerUser,
  loginUser,
  setCurrentUser,
  getCurrentUser,
  logoutUser,
  saveUserAcademicData,
  getUserAcademicData,
} from './authStorage';

const mockStore: Record<string, string> = {};

const mockLocalStorage = {
  getItem: (key: string) => (key in mockStore ? mockStore[key] : null),
  setItem: (key: string, value: string) => {
    mockStore[key] = String(value);
  },
  removeItem: (key: string) => {
    delete mockStore[key];
  },
  clear: () => {
    Object.keys(mockStore).forEach((k) => delete mockStore[k]);
  },
};

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('STAR Framework Auth & User Isolation Tests', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it('initializes default student account', () => {
    const users = getAllUsers();
    expect(users.length).toBeGreaterThanOrEqual(1);
    expect(users[0].username).toBe('vishnupriya.28b24@kprcas.ac.in');
    expect(users[0].role).toBe('student');
  });

  it('allows logging in with default student account', () => {
    const res = loginUser({
      username: 'vishnupriya.28b24@kprcas.ac.in',
      password: 'password',
      role: 'student',
    });
    expect(res.success).toBe(true);
    expect(res.user?.name).toBe('Vishnu Priya C');
    expect(getCurrentUser()?.username).toBe('vishnupriya.28b24@kprcas.ac.in');
  });

  it('rejects wrong password', () => {
    const res = loginUser({
      username: 'vishnupriya.28b24@kprcas.ac.in',
      password: 'wrongpassword',
    });
    expect(res.success).toBe(false);
  });

  it('registers a new student account', () => {
    const res = registerUser({
      username: 'student2@kprcas.ac.in',
      name: 'John Doe',
      registerNo: '24UDA002',
      role: 'student',
      password: 'mypassword',
    });
    expect(res.success).toBe(true);
    expect(res.user?.name).toBe('John Doe');

    // Duplicate check
    const dup = registerUser({
      username: 'student2@kprcas.ac.in',
      name: 'Another Name',
      registerNo: '24UDA099',
      role: 'student',
      password: '123',
    });
    expect(dup.success).toBe(false);
  });

  it('strictly isolates academic marks between different users', () => {
    // User 1
    const user1 = registerUser({
      username: 'user1@kprcas.ac.in',
      name: 'User One',
      registerNo: '24UDA010',
      role: 'student',
      password: 'pass',
    }).user!;

    // User 2
    const user2 = registerUser({
      username: 'user2@kprcas.ac.in',
      name: 'User Two',
      registerNo: '24UDA020',
      role: 'student',
      password: 'pass',
    }).user!;

    // Save marks for User 1
    saveUserAcademicData(user1.id, {
      marksMap: { sem1_sub1: 95, sem1_sub2: 88 },
      inclusionsMap: { sem1_sub1: true, sem1_sub2: true },
      electivesMap: {},
      studentInfo: { name: 'User One', registerNo: '24UDA010' },
    });

    // Verify User 1 data
    const dataUser1 = getUserAcademicData(user1.id);
    expect(dataUser1?.marksMap['sem1_sub1']).toBe(95);

    // Verify User 2 cannot see User 1 marks
    const dataUser2 = getUserAcademicData(user2.id);
    expect(dataUser2).toBeNull();
  });

  it('logs out cleanly', () => {
    setCurrentUser({
      id: 'test_id',
      username: 'test@kprcas.ac.in',
      name: 'Test',
      registerNo: '24UDA001',
      role: 'student',
      createdAt: new Date().toISOString(),
    });
    expect(getCurrentUser()).not.toBeNull();

    logoutUser();
    expect(getCurrentUser()).toBeNull();
  });
});
