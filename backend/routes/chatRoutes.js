// backend/routes/chatRoutes.js
import express from 'express';
import { 
  sendChatMessage, 
  getFinancialTipsEndpoint, 
  getFinancialSummary 
} from '../controllers/chatController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// POST /api/chat/message - Send a message to AI
router.post('/message', sendChatMessage);

// GET /api/chat/tips - Get financial tips
router.get('/tips', getFinancialTipsEndpoint);

// GET /api/chat/summary - Get financial summary
router.get('/summary', getFinancialSummary);

export default router;