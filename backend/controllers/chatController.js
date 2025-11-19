// backend/controllers/chatController.js
import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import Budget from '../models/budget.js';
import SavingGoal from '../models/SavingGoal.js';
import BudgetCategory from '../models/BudgetCategory.js';
import { getFinancialInsights, getFinancialTips } from '../services/aiService.js';

/**
 * Get user's financial data summary
 */
const getFinancialData = async (userId) => {
  try {
    // Get all expenses for the user
    const expenses = await Expense.find({ userId }).populate('categoryId');
    
    // Get all income for the user
    const incomes = await Income.find({ userId });
    
    // Get budget
    const budget = await Budget.findOne({ userId });
    
    // Get savings goals
    const savingsGoals = await SavingGoal.find({ userId });

    // Calculate totals
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);

    // Group expenses by category
    const expensesByCategory = {};
    expenses.forEach(exp => {
      // @ts-ignore
      const categoryName = exp.categoryId?.name || 'Uncategorized';
      expensesByCategory[categoryName] = (expensesByCategory[categoryName] || 0) + exp.amount;
    });

    // Get recent expenses (last 5)
    const recentExpenses = expenses
      // @ts-ignore
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map(exp => ({
        description: exp.description || 'No description',
        amount: exp.amount,
        // @ts-ignore
        category: exp.categoryId?.name || 'Uncategorized',
        date: exp.date
      }));

    // Calculate monthly average
    const monthlyAverage = expenses.length > 0 ? totalExpenses / Math.max(1, getMonthsCount(expenses)) : 0;

    return {
      totalExpenses,
      totalIncome,
      expensesByCategory,
      recentExpenses,
      // @ts-ignore
      budget: budget?.amount || null,
      savingsGoals: savingsGoals.map(g => ({
        // @ts-ignore
        name: g.name,
        // @ts-ignore
        target: g.targetAmount,
        // @ts-ignore
        current: g.currentAmount || 0
      })),
      monthlyAverage
    };
  } catch (error) {
    console.error('Error fetching financial data:', error);
    throw error;
  }
};

/**
 * Helper function to calculate number of months in expense data
 */
const getMonthsCount = (expenses) => {
  if (expenses.length === 0) return 1;
  
  const dates = expenses.map(e => new Date(e.date));
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  
  const months = (maxDate.getFullYear() - minDate.getFullYear()) * 12 
                 + (maxDate.getMonth() - minDate.getMonth()) + 1;
  
  return Math.max(1, months);
};

/**
 * Handle chat message from user
 * POST /api/chat/message
 */
export const sendChatMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get user's financial data
    const financialData = await getFinancialData(userId);

    // Get AI response
    const aiResponse = await getFinancialInsights(message, financialData);

    res.json({
      success: true,
      userMessage: message,
      aiResponse,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ 
      error: 'Failed to process your message. Please try again.',
      details: error.message 
    });
  }
};

/**
 * Get financial tips
 * GET /api/chat/tips
 */
export const getFinancialTipsEndpoint = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's financial data
    const financialData = await getFinancialData(userId);

    // Get AI tips
    const tips = await getFinancialTips(financialData);

    res.json({
      success: true,
      tips,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error getting tips:', error);
    res.status(500).json({ 
      error: 'Failed to get financial tips. Please try again.',
      details: error.message 
    });
  }
};

/**
 * Get financial summary for chat context
 * GET /api/chat/summary
 */
export const getFinancialSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const financialData = await getFinancialData(userId);

    res.json({
      success: true,
      summary: {
        totalIncome: financialData.totalIncome,
        totalExpenses: financialData.totalExpenses,
        netBalance: financialData.totalIncome - financialData.totalExpenses,
        expensesByCategory: financialData.expensesByCategory,
        savingsGoals: financialData.savingsGoals,
        recentExpenses: financialData.recentExpenses
      }
    });
  } catch (error) {
    console.error('Error getting summary:', error);
    res.status(500).json({ 
      error: 'Failed to get financial summary.',
      details: error.message 
    });
  }
};

export default {
  sendChatMessage,
  getFinancialTipsEndpoint,
  getFinancialSummary
};