import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../server';
import User from '../src/models/User';

// Mock mongoose connect/disconnect
vi.mock('../src/config/db', () => ({
  default: vi.fn(),
  connectDB: vi.fn()
}));

const mockUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  role: 'attendee'
};

describe('Auth API Endpoints', () => {
  beforeAll(async () => {
    // In a real test setup, you would connect to an in-memory DB or test DB here
    // For this stub, we'll mock Mongoose methods
  });

  afterAll(async () => {
    // Clean up
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      // Mock User.findOne to return null (user doesn't exist)
      vi.spyOn(User, 'findOne').mockResolvedValue(null);
      // Mock User.create to return the new user with an ID
      vi.spyOn(User, 'create').mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        ...mockUser,
        save: vi.fn().mockResolvedValue(true)
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(mockUser);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user).toHaveProperty('email', mockUser.email);
    });

    it('should fail if user already exists', async () => {
      // Mock User.findOne to return an existing user
      vi.spyOn(User, 'findOne').mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(mockUser);

      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'User with this email already exists');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login an existing user successfully', async () => {
       const userDoc = {
        _id: new mongoose.Types.ObjectId(),
        ...mockUser,
        isVerified: true,
        comparePassword: vi.fn().mockResolvedValue(true), // Password matches
        save: vi.fn().mockResolvedValue(true)
      };

      // Mock User.findOne chaining
      const queryMock = { select: vi.fn().mockResolvedValue(userDoc) };
      vi.spyOn(User, 'findOne').mockReturnValue(queryMock);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: mockUser.email, password: mockUser.password });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('token');
    });

    it('should fail with invalid credentials (wrong password)', async () => {
        const userDoc = {
         _id: new mongoose.Types.ObjectId(),
         ...mockUser,
         isVerified: true,
         comparePassword: vi.fn().mockResolvedValue(false), // Password does NOT match
         save: vi.fn().mockResolvedValue(true)
       };
 
        const queryMock = { select: vi.fn().mockResolvedValue(userDoc) };
        vi.spyOn(User, 'findOne').mockReturnValue(queryMock);
 
        const res = await request(app)
          .post('/api/v1/auth/login')
          .send({ email: mockUser.email, password: 'wrongpassword' });
 
        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message', 'Invalid email or password');
      });
  });
});
