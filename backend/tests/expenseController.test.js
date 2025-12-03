/// <reference types="jest" />
import { jest } from '@jest/globals';
import { createExpense, getExpenses, deleteExpense } from '../controllers/expenseController.js';
import Expense from '../models/Expense.js';
import BudgetCategory from '../models/BudgetCategory.js';
import User from '../models/user.js';

describe('Expense Controller Tests', () => {
  describe('createExpense', () => {
    it('should return 400 if expense date is in the future', async () => {
      const req = {
        body: {
          categoryId: 'c1',
          amount: 100,
          description: 'Test',
          date: '2999-12-31'
        },
        params: { userId: 'u1' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await createExpense(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Expense date cannot be in the future.'
      });
    });

    it('should save expense and return 201', async () => {
      const req = {
        body: {
          categoryId: 'cat123',
          amount: 100,
          description: 'Lunch',
          date: new Date(),
        },
        params: { userId: 'u1' }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock BudgetCategory
      jest.spyOn(BudgetCategory, 'findById').mockResolvedValue(true);
      
      // Mock User with select chain
      // @ts-ignore
      const mockSelect = jest.fn().mockResolvedValue({
        role: 'Parent',
        spendingLimit: 0,
        monthlyBudget: 0
      });
      // @ts-ignore
      jest.spyOn(User, 'findById').mockReturnValue({ select: mockSelect });
      
      // Mock Expense save
      const saveMock = jest.spyOn(Expense.prototype, 'save').mockResolvedValue({});

      await createExpense(req, res);

      expect(BudgetCategory.findById).toHaveBeenCalledWith('cat123');
      expect(User.findById).toHaveBeenCalledWith('u1');
      expect(saveMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();

      // Cleanup
      saveMock.mockRestore();
      jest.restoreAllMocks();
    });
  });

  describe('getExpenses', () => {
    it('should return list of expenses for user', async () => {
      const mockExpenses = [
        {
          toObject: () => ({ amount: 100, description: 'Groceries', paymentMethod: 'Cash' })
        },
        {
          toObject: () => ({ amount: 200, description: 'Books', paymentMethod: 'Debit Card' })
        }
      ];
  
      const mockSelect = jest.fn().mockReturnValue(mockExpenses);
      const mockPopulate = jest.fn().mockReturnValue({ select: mockSelect });
      // @ts-ignore
      const mockFind = jest.spyOn(Expense, 'find').mockReturnValue({ populate: mockPopulate });
  
      const req = {
        params: { userId: 'u1' },
        query: {}
      };
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      await getExpenses(req, res);
  
      expect(mockFind).toHaveBeenCalledWith({ userId: 'u1' });
      expect(mockPopulate).toHaveBeenCalledWith('categoryId');
      expect(mockSelect).toHaveBeenCalledWith('+paymentMethod');
      expect(res.json).toHaveBeenCalledWith([
        { amount: 100, description: 'Groceries', paymentMethod: 'Cash' },
        { amount: 200, description: 'Books', paymentMethod: 'Debit Card' }
      ]);
      
      jest.restoreAllMocks();
    });
  });

  describe('deleteExpense', () => {
    it('should delete expense and return success message', async () => {
      const req = {
        params: { userId: 'u1', expenseId: 'e1' }
      };
      const res = {
        json: jest.fn()
      };

      jest.spyOn(Expense, 'findOneAndDelete').mockResolvedValue(true);

      await deleteExpense(req, res);

      expect(Expense.findOneAndDelete).toHaveBeenCalledWith({ _id: 'e1', userId: 'u1' });
      expect(res.json).toHaveBeenCalledWith({ message: 'Expense deleted successfully' });
      
      jest.restoreAllMocks();
    });
  });
});