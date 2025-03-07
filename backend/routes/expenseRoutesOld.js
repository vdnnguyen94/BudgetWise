import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../controllers/expenseController.js';

const router = express.Router();

// Protected route - Get all expenses (only accessible to logged-in users)
router.get('/', authenticate, getExpenses);

// Protected route - Create a new expense
router.post('/', authenticate, createExpense);

// Protected route - Update an expense
router.put('/:expenseId', authenticate, updateExpense);

// Protected route - Delete an expense
router.delete('/:expenseId', authenticate, deleteExpense);

export default router;
