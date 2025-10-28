/// <reference types="jest" />
import { jest } from '@jest/globals';
import {
  addChild,
  getChildren,
  removeChild
} from '../controllers/parentController.js';
import User from '../models/user.js';
import bcrypt from 'bcryptjs';

describe('Parent Controller Tests', () => {
  
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ========================================
  // TEST 1: Add Child - Non-Parent User
  // ========================================
  describe('addChild - Authorization', () => {
    it('should return 403 if user is not a parent', async () => {
      const mockUser = {
        _id: 'user123',
        role: 'Student'
      };

      const req = {
        user: { id: 'user123' },
        body: {
          username: 'johndoe',
          email: 'john@example.com',
          password: 'password123'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      jest.spyOn(User, 'findById').mockResolvedValue(mockUser);

      await addChild(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Only parent accounts can add children'
      });
    });
  });

  // ========================================
  // TEST 2: Add Child - Email Already Exists
  // ========================================
  describe('addChild - Validation', () => {
    it('should return 400 if email already exists', async () => {
      const mockParent = {
        _id: 'parent123',
        role: 'Parent'
      };

      const mockExistingUser = {
        _id: 'existing123',
        email: 'john@example.com'
      };

      const req = {
        user: { id: 'parent123' },
        body: {
          username: 'johndoe',
          email: 'john@example.com',
          password: 'password123'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      jest.spyOn(User, 'findById').mockResolvedValue(mockParent);
      jest.spyOn(User, 'findOne').mockResolvedValue(mockExistingUser);

      await addChild(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email already in use'
      });
    });
  });

  // ========================================
  // TEST 3: Get Children - Non-Parent User
  // ========================================
  describe('getChildren - Authorization', () => {
    it('should return 403 if user is not a parent', async () => {
      const mockUser = {
        _id: 'user123',
        role: 'Student'
      };

      const req = {
        user: { id: 'user123' }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const populateMock = jest.fn().mockResolvedValue(mockUser);
      jest.spyOn(User, 'findById').mockReturnValue({
        populate: populateMock
      });

      await getChildren(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Only parent accounts can view children'
      });
    });
  });

  // ========================================
  // TEST 4: Remove Child - Child Not Belong to Parent
  // ========================================
  describe('removeChild - Authorization', () => {
    it('should return 403 if child does not belong to parent', async () => {
      const mockParent = {
        _id: 'parent123',
        role: 'Parent',
        children: ['child456'] // different child
      };

      const req = {
        user: { id: 'parent123' },
        params: { childId: 'child123' }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      jest.spyOn(User, 'findById').mockResolvedValue(mockParent);

      await removeChild(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'This child does not belong to your account'
      });
    });
  });

  // ========================================
  // TEST 5: Remove Child - Child Not Found
  // ========================================
  describe('removeChild - Validation', () => {
    it('should return 404 if child account not found', async () => {
      const mockParent = {
        _id: 'parent123',
        role: 'Parent',
        children: ['child123']
      };

      const req = {
        user: { id: 'parent123' },
        params: { childId: 'child123' }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const findByIdSpy = jest.spyOn(User, 'findById');
      findByIdSpy.mockResolvedValueOnce(mockParent);
      findByIdSpy.mockResolvedValueOnce(null); // child not found

      await removeChild(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Child account not found'
      });
    });
  });
});