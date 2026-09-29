import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import authPlugin from '../src/plugins/auth.js';
import { authRoutes } from '../src/modules/auth/routes.js';
import { userRoutes } from '../src/modules/users/routes.js';

describe('Auth & User Modules', () => {
  let app: FastifyInstance;
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'securePassword123',
    name: 'Test Explorer'
  };
  let authToken: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-jwt-secret-minimum-32-characters-required';
    process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

    app = Fastify();
    await app.register(authPlugin);
    await app.register(authRoutes, { prefix: '/api/auth' });
    await app.register(userRoutes, { prefix: '/api/users' });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects registration with invalid email', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: 'invalid-email', password: 'password123', name: 'Test' }
    });
    expect(res.statusCode).toBe(400);
  });

  it('registers a new user successfully', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: testUser
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.user.email).toBe(testUser.email);
    expect(body.user.name).toBe(testUser.name);
    expect(body.token).toBeDefined();
    authToken = body.token;
  });

  it('rejects duplicate email registration', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: testUser
    });
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.error).toContain('already exists');
  });

  it('authenticates user with valid credentials', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: testUser.email, password: testUser.password }
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.user.email).toBe(testUser.email);
    expect(body.token).toBeDefined();
  });

  it('rejects login with invalid password', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: testUser.email, password: 'wrongpassword' }
    });
    expect(res.statusCode).toBe(401);
  });

  it('rejects profile request without authorization token', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/users/profile'
    });
    expect(res.statusCode).toBe(401);
  });

  it('retrieves user profile and saves/removes custom API key', async () => {
    const profileRes = await app.inject({
      method: 'GET',
      url: '/api/users/profile',
      headers: { authorization: `Bearer ${authToken}` }
    });
    expect(profileRes.statusCode).toBe(200);
    const profile = JSON.parse(profileRes.body);
    expect(profile.hasCustomKey).toBe(false);
    expect(profile.freeGenerationsRemaining).toBe(2);

    const saveKeyRes = await app.inject({
      method: 'PUT',
      url: '/api/users/api-key',
      headers: { authorization: `Bearer ${authToken}` },
      payload: { apiKey: 'AIzaSyFakeKeyForTesting12345' }
    });
    expect(saveKeyRes.statusCode).toBe(200);

    const updatedProfileRes = await app.inject({
      method: 'GET',
      url: '/api/users/profile',
      headers: { authorization: `Bearer ${authToken}` }
    });
    const updatedProfile = JSON.parse(updatedProfileRes.body);
    expect(updatedProfile.hasCustomKey).toBe(true);

    const deleteKeyRes = await app.inject({
      method: 'DELETE',
      url: '/api/users/api-key',
      headers: { authorization: `Bearer ${authToken}` }
    });
    expect(deleteKeyRes.statusCode).toBe(200);

    const clearedProfileRes = await app.inject({
      method: 'GET',
      url: '/api/users/profile',
      headers: { authorization: `Bearer ${authToken}` }
    });
    const clearedProfile = JSON.parse(clearedProfileRes.body);
    expect(clearedProfile.hasCustomKey).toBe(false);
  });
});
