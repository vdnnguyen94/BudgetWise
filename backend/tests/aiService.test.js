/// <reference types="jest" />
import { jest } from '@jest/globals';

// Create mock function for chatCompletion
const mockChatCompletion = jest.fn();

// Mock HfInference BEFORE importing aiService
jest.unstable_mockModule('@huggingface/inference', () => ({
  HfInference: jest.fn().mockImplementation(() => ({
    chatCompletion: mockChatCompletion
  }))
}));

// Import AFTER mocking
// @ts-ignore
const { getFinancialInsights, getFinancialTips, testGeminiConnection } = await import('../services/aiService.js');

// Suppress console errors/logs for cleaner output
const originalError = console.error;
const originalLog = console.log;
beforeAll(() => {
  console.error = jest.fn();
  console.log = jest.fn();
});
afterAll(() => {
  console.error = originalError;
  console.log = originalLog;
});

describe('AI Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockChatCompletion.mockReset();
    process.env.HUGGINGFACE_API_KEY = 'test-key';
  });

  afterEach(() => {
    delete process.env.HUGGINGFACE_API_KEY;
  });

  describe('getFinancialInsights', () => {
    const mockData = {
      totalIncome: 5000,
      totalExpenses: 3000,
      expensesByCategory: { 'Food': 800, 'Transportation': 500 },
      recentExpenses: [{ description: 'Grocery', amount: 150 }],
      budget: 4000,
      savingsGoals: [],
      monthlyAverage: 3200
    };

    it('should return AI response for valid input', async () => {
      // @ts-ignore
      mockChatCompletion.mockResolvedValue({
        choices: [
          {
            message: {
              content: 'You are doing well with your budget.'
            }
          }
        ]
      });

      const result = await getFinancialInsights('How am I doing?', mockData);

      expect(result).toBe('You are doing well with your budget.');
      expect(mockChatCompletion).toHaveBeenCalled();
    });

    it('should include financial data in prompt', async () => {
      // @ts-ignore
      mockChatCompletion.mockResolvedValue({
        choices: [{ message: { content: 'Response' } }]
      });

      await getFinancialInsights('Test', mockData);

      const callArgs = mockChatCompletion.mock.calls[0][0];
      // @ts-ignore
      expect(callArgs.messages[0].content).toContain('$5000.00');
      // @ts-ignore
      expect(callArgs.messages[0].content).toContain('Food');
    });

    it('should handle errors gracefully', async () => {
      // @ts-ignore
      mockChatCompletion.mockRejectedValue(new Error('API Error'));

      await expect(
        getFinancialInsights('Test', mockData)
      ).rejects.toThrow('Failed to get AI insights');
    });
  });

  describe('getFinancialTips', () => {
    const mockData = {
      totalIncome: 5000,
      totalExpenses: 3000,
      expensesByCategory: { 'Food': 800 }
    };

    it('should return financial tips', async () => {
      // @ts-ignore
      mockChatCompletion.mockResolvedValue({
        choices: [
          {
            message: {
              content: '1. Reduce food spending'
            }
          }
        ]
      });

      const result = await getFinancialTips(mockData);

      expect(result).toBe('1. Reduce food spending');
      expect(mockChatCompletion).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      // @ts-ignore
      mockChatCompletion.mockRejectedValue(new Error('API Error'));

      await expect(
        getFinancialTips(mockData)
      ).rejects.toThrow('Failed to get tips');
    });
  });

  describe('testGeminiConnection', () => {
    it('should return true when connection succeeds', async () => {
      // @ts-ignore
      mockChatCompletion.mockResolvedValue({
        choices: [{ message: { content: 'Hello!' } }]
      });

      const result = await testGeminiConnection();

      expect(result).toBe(true);
    });

    it('should return false when connection fails', async () => {
      // @ts-ignore
      mockChatCompletion.mockRejectedValue(new Error('Failed'));

      const result = await testGeminiConnection();

      expect(result).toBe(false);
    });
  });
});