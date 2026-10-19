import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { connectDB, disconnectDB } from './config/db';
import app from './app';

describe('Full-Stack Authentication, Profile & Academic Isolation Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  let tokenUser1 = '';
  let tokenUser2 = '';

  it('1. Registers new student (User 1 - Vishnu Priya C)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Vishnu Priya C',
        registerNo: '24UDA001',
        username: 'vishnupriya.28b24@kprcas.ac.in',
        password: 'Vishnupriya24',
        confirmPassword: 'Vishnupriya24',
      });

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.name).toBe('Vishnu Priya C');
    expect(res.body.user.registerNo).toBe('24UDA001');
    expect(res.body.user.username).toBe('vishnupriya.28b24@kprcas.ac.in');
    expect(res.body.user.passwordHash).toBeUndefined(); // Never exposed!
    expect(res.body.token).toBeDefined();
    tokenUser1 = res.body.token;
  });

  it('2. Prevents duplicate username registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Another Student',
        registerNo: '24UDA999',
        username: 'vishnupriya.28b24@kprcas.ac.in',
        password: 'Password123',
        confirmPassword: 'Password123',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('already registered');
  });

  it('3. Prevents duplicate roll number registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Another Student',
        registerNo: '24UDA001',
        username: 'different.user@kprcas.ac.in',
        password: 'Password123',
        confirmPassword: 'Password123',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('already registered');
  });

  it('4. Logs in User 1 with username or register number', async () => {
    // Via username
    const resUser = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'vishnupriya.28b24@kprcas.ac.in',
        password: 'Vishnupriya24',
      });

    expect(resUser.status).toBe(200);
    expect(resUser.body.user.name).toBe('Vishnu Priya C');

    // Via roll number
    const resReg = await request(app)
      .post('/api/auth/login')
      .send({
        username: '24UDA001',
        password: 'Vishnupriya24',
      });

    expect(resReg.status).toBe(200);
    expect(resReg.body.user.username).toBe('vishnupriya.28b24@kprcas.ac.in');
  });

  it('5. Rejects invalid password login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'vishnupriya.28b24@kprcas.ac.in',
        password: 'wrong_password',
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid username or password.');
  });

  it('6. Fetches profile for authenticated user via /api/auth/me', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${tokenUser1}`);

    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('Vishnu Priya C');
    expect(res.body.user.registerNo).toBe('24UDA001');
  });

  it('7. Updates user profile via /api/auth/profile', async () => {
    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({
        name: 'Vishnu Priya Chinnasamy',
        registerNo: '24UDA001',
        username: 'vishnupriyac@kprcas.ac.in',
        email: 'vishnupriyac@kprcas.ac.in',
      });

    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('Vishnu Priya Chinnasamy');
    expect(res.body.user.username).toBe('vishnupriyac@kprcas.ac.in');
  });

  it('8. Changes password via /api/auth/change-password', async () => {
    // Attempt with incorrect current password
    const failRes = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({
        currentPassword: 'wrong_current_password',
        newPassword: 'NewSecurePass123',
        confirmNewPassword: 'NewSecurePass123',
      });

    expect(failRes.status).toBe(400);
    expect(failRes.body.error).toBe('Current password is incorrect.');

    // Correct change
    const passRes = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({
        currentPassword: 'Vishnupriya24',
        newPassword: 'NewSecurePass123',
        confirmNewPassword: 'NewSecurePass123',
      });

    expect(passRes.status).toBe(200);
    expect(passRes.body.message).toBe('Password updated successfully.');

    // Verify login with new password
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'vishnupriyac@kprcas.ac.in',
        password: 'NewSecurePass123',
      });

    expect(loginRes.status).toBe(200);
    tokenUser1 = loginRes.body.token;
  });

  it('9. Saves academic marks for User 1', async () => {
    const res = await request(app)
      .put('/api/academic')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({
        marksMap: { s1_c1: 92, s1_c2: 88 },
        inclusionsMap: { s1_c1: true, s1_c2: true },
        electivesMap: {},
      });

    expect(res.status).toBe(200);
    expect(res.body.marksMap.s1_c1).toBe(92);
  });

  it('10. Registers User 2 (Kavya Varsini)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Kavya Varsini S',
        registerNo: '24UDA002',
        username: 'kavyavarsini@kprcas.ac.in',
        password: 'KavyaPass123',
        confirmPassword: 'KavyaPass123',
      });

    expect(res.status).toBe(201);
    expect(res.body.user.name).toBe('Kavya Varsini S');
    tokenUser2 = res.body.token;
  });

  it('11. Verifies Strict User Isolation: User 2 cannot access User 1 marks', async () => {
    const resUser2 = await request(app)
      .get('/api/academic')
      .set('Authorization', `Bearer ${tokenUser2}`);

    expect(resUser2.status).toBe(200);
    // User 2 should have empty marks, not User 1 marks
    expect(resUser2.body.marksMap.s1_c1).toBeUndefined();

    // User 1 still has their marks
    const resUser1 = await request(app)
      .get('/api/academic')
      .set('Authorization', `Bearer ${tokenUser1}`);

    expect(resUser1.status).toBe(200);
    expect(resUser1.body.marksMap.s1_c1).toBe(92);
  });

  it('12. Rejects unauthenticated requests to protected academic endpoints', async () => {
    const res = await request(app).get('/api/academic');
    expect(res.status).toBe(401);
  });
});
