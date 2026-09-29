import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { connectDB, disconnectDB } from './config/db';
import authRoutes from './routes/auth';
import academicRoutes from './routes/academic';
import dashboardRoutes from './routes/dashboard';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/dashboard', dashboardRoutes);

describe('Backend API & User Isolation Integration Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  let tokenUser1 = '';
  let tokenUser2 = '';

  it('1. Registers new user (User 1 - vishnu)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'vishnu', password: 'password123', confirmPassword: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.username).toBe('vishnu');
    expect(res.body.user.passwordHash).toBeUndefined(); // Password hash NEVER exposed
    expect(res.body.token).toBeDefined();
    tokenUser1 = res.body.token;
  });

  it('2. Prevents duplicate username registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'Vishnu', password: 'differentpassword', confirmPassword: 'differentpassword' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Username already exists.');
  });

  it('3. Logs in User 1 with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'vishnu', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe('vishnu');
  });

  it('4. Rejects invalid password login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'vishnu', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid username or password.');
  });

  it('5. Saves academic marks for User 1', async () => {
    const marksData = {
      '1': { s1_1: 85, s1_2: 90 },
      '2': { s2_1: 88, s2_2: 92 },
    };

    const res = await request(app)
      .put('/api/academic')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({ marks: marksData });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Marks saved successfully.');
    expect(res.body.marks['1'].s1_1).toBe(85);
  });

  it('6. Fetches saved academic data for User 1', async () => {
    const res = await request(app)
      .get('/api/academic')
      .set('Authorization', `Bearer ${tokenUser1}`);

    expect(res.status).toBe(200);
    expect(res.body.marks['1'].s1_1).toBe(85);
  });

  it('7. Registers User 2 (sarah)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'sarah', password: 'password456', confirmPassword: 'password456' });

    expect(res.status).toBe(201);
    expect(res.body.user.username).toBe('sarah');
    tokenUser2 = res.body.token;
  });

  it('8. Verifies Strict User Data Isolation: User 2 cannot see User 1 marks', async () => {
    const res = await request(app)
      .get('/api/academic')
      .set('Authorization', `Bearer ${tokenUser2}`);

    expect(res.status).toBe(200);
    // User 2 should have empty marks, NOT User 1's marks
    expect(res.body.marks['1']).toBeUndefined();
  });

  it('9. Rejects unauthenticated requests to protected routes', async () => {
    const res = await request(app).get('/api/academic');
    expect(res.status).toBe(401);
  });

  it('10. Changes password successfully for User 1', async () => {
    const res = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({
        currentPassword: 'password123',
        newPassword: 'newsecurepassword',
        confirmNewPassword: 'newsecurepassword',
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Password updated successfully.');

    // Verify login with new password
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'vishnu', password: 'newsecurepassword' });

    expect(loginRes.status).toBe(200);
  });
});
