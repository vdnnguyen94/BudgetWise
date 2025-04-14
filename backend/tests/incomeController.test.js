/// <reference types="jest" />
import { jest } from '@jest/globals';
import { createIncome, getIncome } from '../controllers/incomeController.js';
import Income from '../models/Income.js';

describe('Income Controller Tests', () => {
  describe('createIncome', () => {
    it('should return 400 if source or amount is invalid', async () => {
      const req = {
        body: { source: '', amount: -100 },
        params: { userId: 'u1' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await createIncome(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Valid Source and Amount are required."
      });
    });

    it('should save income and return 201', async () => {
      // Income.prototype.save method
      const saveMock = jest.spyOn(Income.prototype, 'save').mockResolvedValue();

      const req = {
        body: {
          source: 'Salary',
          amount: 2000,
          date: new Date(),
          description: '',
          recurrence: 'monthly'
        },
        params: { userId: 'u1' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await createIncome(req, res);

      expect(saveMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();

      saveMock.mockRestore(); // clean up after test
    });
  });

  describe('getIncome', () => {
    it('should return list of incomes for a user', async () => {
      const mockIncomes = [
        { source: 'Job', amount: 2000 },
        { source: 'Freelancing', amount: 1000 }
      ];

      // Mock Income.find()
      jest.spyOn(Income, 'find').mockResolvedValue(mockIncomes);

      const req = {
        params: { userId: 'u1' },
        query: {}
      };
      const res = {
        json: jest.fn()
      };

      await getIncome(req, res);

      expect(Income.find).toHaveBeenCalledWith({ userId: 'u1' });
      expect(res.json).toHaveBeenCalledWith(mockIncomes);
    });
  });
});
