import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { getBudgets, createBudget, updateBudget, deleteBudget } from '../controllers/budgetController.js';

const router = express.Router();

// Protected route - Get all budgets (only accessible to logged-in users)
router.get('/', authenticate, getBudgets);

// Protected route - Create a new budget
router.post('/', authenticate, createBudget);

// Protected route - Update a budget
router.put('/:budgetId', authenticate, updateBudget);

// Protected route - Delete a budget
router.delete('/:budgetId', authenticate, deleteBudget);

export default router;
