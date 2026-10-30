import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

describe('MediVault AI Backend API Tests', () => {
  const app = createApp();

  describe('GET /api/health', () => {
    it('should return 200 OK with proper health payload and no secrets exposed', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('status', 'ok');
      expect(response.body.data).toHaveProperty('service', 'medivault-backend');
      expect(response.body.data).toHaveProperty('version', '0.1.0');
      expect(response.body.data).toHaveProperty('uptimeSeconds');
      expect(response.body.data).toHaveProperty('environment');

      // Ensure no sensitive fields like passwords, secrets, or raw db connection strings are leaked
      expect(response.body.data).not.toHaveProperty('DATABASE_URL');
      expect(response.body.data).not.toHaveProperty('secret');
      expect(response.body.data).not.toHaveProperty('password');
    });
  });

  describe('404 Not Found Handler', () => {
    it('should return structured 404 response for unknown routes', async () => {
      const response = await request(app).get('/api/unknown-endpoint');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'ROUTE_NOT_FOUND');
    });
  });
});
