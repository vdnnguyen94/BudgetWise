import express from 'express';
import { createOrUpdateLoan, getUserLoans, deleteLoan, } from '../controllers/loanController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

//Routes to create or update a loan
router.post('/', authenticate, createOrUpdateLoan);

//Routes to get user loans
router.get('/', authenticate, getUserLoans);

//Routes to delete a loan
router.delete('/:loanId', authenticate, deleteLoan);

export default router;