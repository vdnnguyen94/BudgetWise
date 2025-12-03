/// <reference types="jest" />
import { jest } from '@jest/globals';

// Mock functions
const mockExpenseFind = jest.fn();
const mockIncomeFind = jest.fn();
const mockBudgetFindOne = jest.fn();
const mockSavingGoalFind = jest.fn();
const mockGetFinancialInsights = jest.fn();
const mockGetFinancialTips = jest.fn();

// Mock modules BEFORE import
jest.unstable_mockModule('../models/expense.js', () => ({
  default: { find: mockExpenseFind }
}));

jest.unstable_mockModule('../models/income.js', () => ({
  default: { find: mockIncomeFind }
}));

jest.unstable_mockModule('../models/budget.js', () => ({
  default: { findOne: mockBudgetFindOne }
}));

jest.unstable_mockModule('../models/savingGoal.js', () => ({
  default: { find: mockSavingGoalFind }
}));

jest.unstable_mockModule('../services/aiService.js', () => ({
  getFinancialInsights: mockGetFinancialInsights,
  getFinancialTips: mockGetFinancialTips
}));

// @ts-ignore
const chatControllerModule = await import('../controllers/chatController.js');
const chatController = chatControllerModule.default;

// Suppress console
const originalError = console.error;
beforeAll(() => { console.error = jest.fn(); });
afterAll(() => { console.error = originalError; });

describe('Chat Controller Tests', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      user: { id: 'user123' },
      body: { message: 'Test message' }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockExpenseFind.mockReturnValue({
      // @ts-ignore
      populate: jest.fn().mockResolvedValue([
        { amount: 100, categoryId: { name: 'Food' }, description: 'Test', date: new Date() }
      ])
    });

    // @ts-ignore
    mockIncomeFind.mockResolvedValue([
      { amount: 5000, source: 'Salary', date: new Date() }
    ]);

    // @ts-ignore
    mockBudgetFindOne.mockResolvedValue({ amount: 4000 });
    // @ts-ignore
    mockSavingGoalFind.mockResolvedValue([]);
    // @ts-ignore
    mockGetFinancialInsights.mockResolvedValue('AI Response');
  });

  it('should have sendChatMessage function', () => {
    expect(typeof chatController.sendChatMessage).toBe('function');
  });

  it('should have getFinancialSummary function', () => {
    expect(typeof chatController.getFinancialSummary).toBe('function');
  });

  it('should return 400 for empty message', async () => {
    mockReq.body.message = '';
    await chatController.sendChatMessage(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it('should handle errors gracefully', async () => {
    mockExpenseFind.mockReturnValue({
      // @ts-ignore
      populate: jest.fn().mockRejectedValue(new Error('DB Error'))
    });
    
    await chatController.sendChatMessage(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });
});